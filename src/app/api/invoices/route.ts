// src/app/api/invoices/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Invoice, InvoiceItem } from '@/types';

// GET /api/invoices - Fetch all invoices (with potential search)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('searchTerm')?.toLowerCase() || "";
  const customerId = searchParams.get('customerId');
  const status = searchParams.get('status');
  const fromDate = searchParams.get('fromDate');
  const toDate = searchParams.get('toDate');
  const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم

  try {
    console.log("[invoices/route.ts] Received GET request for invoices");
    console.log("[invoices/route.ts] Search parameters:", { searchTerm, customerId, status, fromDate, toDate });
    
    // بناء استعلام SQL
    let query = `
      SELECT 
        i.InvoiceId as invoiceId,
        i.InvoiceNumber as invoiceNumber,
        i.InvoiceDate as invoiceDate,
        i.CustomerId as customerId,
        c.Name as customerName,
        i.PaymentMethod as paymentMethod,
        i.SubTotal as subTotal,
        i.DiscountPercent as discountPercent,
        i.DiscountAmount as discountAmount,
        i.TaxPercent as taxPercent,
        i.TaxAmount as taxAmount,
        i.TotalAmount as totalAmount,
        i.AmountPaid as amountPaid,
        i.AmountDue as amountDue,
        i.Status as status,
        i.Notes as notes,
        i.CompanyId as companyId,
        i.CreatedAt as createdAt,
        i.UpdatedAt as updatedAt,
        i.CreatedBy as createdBy
      FROM sales.Invoices i
      LEFT JOIN sales.Customers c ON i.CustomerId = c.CustomerId
      WHERE i.CompanyId = @companyId
    `;
    
    const queryParams: Record<string, any> = { companyId };
    
    // إضافة شروط البحث إذا كانت موجودة
    if (searchTerm) {
      query += ` AND (
        i.InvoiceNumber LIKE '%' + @searchTerm + '%' OR
        c.Name LIKE '%' + @searchTerm + '%'
      )`;
      queryParams.searchTerm = searchTerm;
    }
    
    if (customerId) {
      query += ` AND i.CustomerId = @customerId`;
      queryParams.customerId = parseInt(customerId);
    }
    
    if (status) {
      query += ` AND i.Status = @status`;
      queryParams.status = status;
    }
    
    if (fromDate) {
      query += ` AND i.InvoiceDate >= @fromDate`;
      queryParams.fromDate = fromDate;
    }
    
    if (toDate) {
      query += ` AND i.InvoiceDate <= @toDate`;
      queryParams.toDate = toDate;
    }
    
    // ترتيب النتائج
    query += ` ORDER BY i.InvoiceDate DESC`;
    
    const invoices = await executeQuery<any[]>(query, queryParams);
    
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("[invoices/route.ts] Error fetching invoices:", error);
    return NextResponse.json({ message: "خطأ في جلب الفواتير" }, { status: 500 });
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: Request) {
  console.log("[invoices/route.ts] Received POST request for new invoice");
  
  try {
    // Check for auth header (optional)
    const authHeader = request.headers.get('Authorization');
    console.log("[invoices/route.ts] Auth header:", authHeader ? "Present" : "Not present");
    
    // Parse request body
    let body;
    try {
      body = await request.json() as {
        invoice: Omit<Invoice, 'invoiceId'>,
        items: Omit<InvoiceItem, 'invoiceItemId' | 'invoiceId'>[]
      };
      console.log("[invoices/route.ts] Request body parsed successfully");
    } catch (e) {
      console.error("[invoices/route.ts] Error parsing JSON:", e);
      return NextResponse.json({ message: "خطأ في تنسيق البيانات" }, { status: 400 });
    }
    
    // Validate required fields
    const { invoice, items } = body;
    
    if (!invoice.customerId || !items || items.length === 0) {
      return NextResponse.json({ message: "البيانات المطلوبة غير مكتملة" }, { status: 400 });
    }
    
    // إنشاء فاتورة مبيعات جديدة
    const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    const createdBy = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    
    // حساب إجماليات الفاتورة
    let subTotal = 0;
    let totalDiscountAmount = 0;
    let totalTaxAmount = 0;
    
    items.forEach(item => {
      const lineTotal = item.quantity * item.unitPrice;
      const discountAmount = (lineTotal * (item.discountPercent || 0)) / 100;
      const taxAmount = ((lineTotal - discountAmount) * (item.taxPercent || 0)) / 100;
      
      subTotal += lineTotal;
      totalDiscountAmount += discountAmount;
      totalTaxAmount += taxAmount;
    });
    
    // حساب الإجمالي النهائي
    const totalAmount = subTotal - totalDiscountAmount + totalTaxAmount;
    
    // إنشاء رقم فاتورة فريد
    const invoiceNumber = `INV-${Date.now().toString().substring(6)}`;
    
    console.log("[invoices/route.ts] بدء إنشاء الفاتورة مع العناصر:", items);
    
    try {
      // استخدام المعاملة (Transaction) لضمان تنفيذ جميع العمليات بنجاح أو التراجع عنها جميعًا
      await executeQuery(`BEGIN TRANSACTION;`);
      
      // إدراج الفاتورة مباشرة في جدول الفواتير
      const insertInvoiceQuery = `
        INSERT INTO sales.Invoices (
          InvoiceNumber, InvoiceDate, CustomerId, PaymentMethod,
          SubTotal, DiscountPercent, DiscountAmount, TaxPercent,
          TaxAmount, TotalAmount, AmountPaid, AmountDue,
          Status, Notes, CompanyId, CreatedBy
        )
        VALUES (
          @invoiceNumber, GETDATE(), @customerId, @paymentMethod,
          @subTotal, @discountPercent, @discountAmount, @taxPercent,
          @taxAmount, @totalAmount, @amountPaid, (@totalAmount - @amountPaid),
          'Unpaid',
          @notes, @companyId, @createdBy
        );
        
        SELECT SCOPE_IDENTITY() AS invoiceId;
      `;
      
      const invoiceResult = await executeQuery<any[]>(insertInvoiceQuery, {
        invoiceNumber,
        customerId: invoice.customerId,
        paymentMethod: invoice.paymentMethod || 'نقدي',
        subTotal,
        discountPercent: invoice.discountPercent || 0,
        discountAmount: totalDiscountAmount,
        taxPercent: 0, // يمكن تعديله لاحقًا
        taxAmount: totalTaxAmount,
        totalAmount,
        amountPaid: 0, // يمكن تعديله لاحقًا
        notes: invoice.notes || null,
        companyId,
        createdBy
      });
      
      console.log("[invoices/route.ts] تم إدراج الفاتورة:", invoiceResult);
      
      // الحصول على معرف الفاتورة الجديدة
      const newInvoiceId = invoiceResult && invoiceResult.length > 0 ? invoiceResult[0].invoiceId : null;
      
      if (!newInvoiceId) {
        throw new Error("لم يتم إرجاع معرف الفاتورة الجديدة من قاعدة البيانات");
      }
      
      // إدراج عناصر الفاتورة
      for (const item of items) {
        const lineTotal = item.quantity * item.unitPrice;
        const discountPercent = item.discountPercent || 0;
        const discountAmount = (lineTotal * discountPercent) / 100;
        const taxPercent = item.taxPercent || 0;
        const taxAmount = ((lineTotal - discountAmount) * taxPercent) / 100;
        
        const insertItemQuery = `
          INSERT INTO sales.InvoiceItems (
            InvoiceId, ProductId, Quantity, UnitPrice,
            DiscountPercent, DiscountAmount, TaxPercent,
            TaxAmount, LineTotal
          )
          VALUES (
            @invoiceId, @productId, @quantity, @unitPrice,
            @discountPercent, @discountAmount, @taxPercent,
            @taxAmount, @lineTotal
          );
        `;
        
        await executeQuery(insertItemQuery, {
          invoiceId: newInvoiceId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent,
          discountAmount,
          taxPercent,
          taxAmount,
          lineTotal
        });
      }
      
      console.log("[invoices/route.ts] تم إدراج عناصر الفاتورة بنجاح");
      
      // تحديث كميات المنتجات
      for (const item of items) {
        const updateProductQuery = `
          UPDATE inventory.Products
          SET Quantity = Quantity - @quantity,
              UpdatedAt = GETDATE()
          WHERE ProductId = @productId;
        `;
        
        await executeQuery(updateProductQuery, {
          productId: item.productId,
          quantity: item.quantity
        });
      }
      
      console.log("[invoices/route.ts] تم تحديث كميات المنتجات بنجاح");
      
      // تأكيد المعاملة
      await executeQuery(`COMMIT TRANSACTION;`);
      console.log("[invoices/route.ts] تم تأكيد المعاملة بنجاح");
      
      // جلب الفاتورة الجديدة من قاعدة البيانات
      const newInvoiceQuery = `
        SELECT 
          i.InvoiceId as invoiceId,
          i.InvoiceNumber as invoiceNumber,
          i.InvoiceDate as invoiceDate,
          i.CustomerId as customerId,
          c.Name as customerName,
          i.PaymentMethod as paymentMethod,
          i.SubTotal as subTotal,
          i.DiscountPercent as discountPercent,
          i.DiscountAmount as discountAmount,
          i.TaxPercent as taxPercent,
          i.TaxAmount as taxAmount,
          i.TotalAmount as totalAmount,
          i.AmountPaid as amountPaid,
          i.AmountDue as amountDue,
          i.Status as status,
          i.Notes as notes,
          i.CompanyId as companyId,
          i.CreatedAt as createdAt,
          i.UpdatedAt as updatedAt,
          i.CreatedBy as createdBy
        FROM sales.Invoices i
        LEFT JOIN sales.Customers c ON i.CustomerId = c.CustomerId
        WHERE i.InvoiceId = @invoiceId;
      `;
      
      const newInvoice = await executeQuery<any[]>(newInvoiceQuery, { invoiceId: newInvoiceId });
      
      if (!newInvoice || newInvoice.length === 0) {
        throw new Error("لم يتم العثور على الفاتورة الجديدة بعد إنشائها");
      }
      
      // جلب عناصر الفاتورة
      const invoiceItemsQuery = `
        SELECT 
          ii.InvoiceItemId as invoiceItemId,
          ii.InvoiceId as invoiceId,
          ii.ProductId as productId,
          p.Name as productName,
          ii.Quantity as quantity,
          ii.UnitPrice as unitPrice,
          ii.DiscountPercent as discountPercent,
          ii.DiscountAmount as discountAmount,
          ii.TaxPercent as taxPercent,
          ii.TaxAmount as taxAmount,
          ii.LineTotal as lineTotal
        FROM sales.InvoiceItems ii
        LEFT JOIN inventory.Products p ON ii.ProductId = p.ProductId
        WHERE ii.InvoiceId = @invoiceId;
      `;
      
      const invoiceItems = await executeQuery<any[]>(invoiceItemsQuery, { invoiceId: newInvoiceId });
      
      console.log("[invoices/route.ts] Created new invoice in database:", newInvoice[0]);
      console.log("[invoices/route.ts] Invoice items:", invoiceItems);
      
      // إرجاع الفاتورة الجديدة مع عناصرها
      return NextResponse.json({
        invoice: newInvoice[0],
        items: invoiceItems
      }, { status: 201 });
      
    } catch (error) {
      console.error("[invoices/route.ts] خطأ في إنشاء الفاتورة:", error);
      
      // التراجع عن المعاملة في حالة حدوث خطأ
      try {
        await executeQuery(`ROLLBACK TRANSACTION;`);
        console.log("[invoices/route.ts] تم التراجع عن المعاملة بسبب خطأ");
      } catch (rollbackError) {
        console.error("[invoices/route.ts] خطأ في التراجع عن المعاملة:", rollbackError);
      }
      
      return NextResponse.json({ 
        message: "خطأ في إنشاء الفاتورة: " + ((error as Error).message || "خطأ غير معروف"),
        error: (error as Error).stack
      }, { status: 500 });
    }
  } catch (error) {
    console.error("[invoices/route.ts] Failed to create invoice:", error);
    return NextResponse.json({ 
      message: "خطأ في إنشاء الفاتورة: " + ((error as Error).message || "خطأ غير معروف"),
      error: (error as Error).stack
    }, { status: 500 });
  }
}