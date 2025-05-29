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
        i.CreatedBy as createdBy,
        u.Username as createdByUsername
      FROM sales.Invoices i
      LEFT JOIN sales.Customers c ON i.CustomerId = c.CustomerId
      LEFT JOIN settings.Users u ON i.CreatedBy = u.UserId
      WHERE i.CompanyId = @companyId
    `;
    
    const params: Record<string, any> = { companyId };
    
    // إضافة شروط البحث إذا كانت موجودة
    if (searchTerm) {
      query += ` AND (
        i.InvoiceNumber LIKE @searchPattern OR
        c.Name LIKE @searchPattern OR
        i.Notes LIKE @searchPattern
      )`;
      params.searchPattern = `%${searchTerm}%`;
    }
    
    // إضافة تصفية حسب العميل إذا كانت موجودة
    if (customerId) {
      query += ` AND i.CustomerId = @customerId`;
      params.customerId = parseInt(customerId);
    }
    
    // إضافة تصفية حسب الحالة إذا كانت موجودة
    if (status) {
      query += ` AND i.Status = @status`;
      params.status = status;
    }
    
    // إضافة تصفية حسب التاريخ إذا كانت موجودة
    if (fromDate) {
      query += ` AND i.InvoiceDate >= @fromDate`;
      params.fromDate = fromDate;
    }
    
    if (toDate) {
      query += ` AND i.InvoiceDate <= @toDate`;
      params.toDate = toDate;
    }
    
    // إضافة ترتيب النتائج
    query += ` ORDER BY i.InvoiceDate DESC, i.InvoiceId DESC`;
    
    console.log("[invoices/route.ts] Executing SQL query:", query);
    console.log("[invoices/route.ts] With parameters:", params);
    
    // تنفيذ الاستعلام
    const invoices = await executeQuery<Invoice[]>(query, params);
    console.log("[invoices/route.ts] Invoices fetched from database, count:", invoices.length);
    
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Failed to fetch invoices:", error);
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
    const bodyText = await request.text();
    console.log("[invoices/route.ts] Request body:", bodyText);
    
    let body;
    try {
      body = JSON.parse(bodyText) as {
        invoice: Omit<Invoice, 'invoiceId'>,
        items: Omit<InvoiceItem, 'invoiceItemId' | 'invoiceId'>[]
      };
    } catch (e) {
      console.error("[invoices/route.ts] Error parsing JSON:", e);
      return NextResponse.json({ message: "خطأ في تنسيق البيانات" }, { status: 400 });
    }
    
    // Validate required fields
    const { invoice, items } = body;
    
    if (!invoice.customerId || !items || items.length === 0) {
      return NextResponse.json({ message: "البيانات المطلوبة غير مكتملة" }, { status: 400 });
    }
    
    // استخدام الإجراء المخزن لإنشاء فاتورة مبيعات جديدة
    try {
      const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
      const createdBy = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
      
      // تم استبدال تنسيق XML بجدول مؤقت
      
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
      
      // إنشاء جدول مؤقت لعناصر الفاتورة
      const invoiceItemsTable = await executeQuery<any[]>(`
        -- إنشاء جدول مؤقت لعناصر الفاتورة
        CREATE TABLE #TempInvoiceItems (
          ProductId INT,
          Quantity DECIMAL(18,2),
          UnitPrice DECIMAL(18,2),
          DiscountPercent DECIMAL(5,2),
          DiscountAmount DECIMAL(18,2),
          TaxPercent DECIMAL(5,2),
          TaxAmount DECIMAL(18,2),
          LineTotal DECIMAL(18,2)
        );
        
        -- إدراج عناصر الفاتورة في الجدول المؤقت
        ${items.map((item, index) => {
          const lineTotal = item.quantity * item.unitPrice;
          const discountPercent = item.discountPercent || 0;
          const discountAmount = (lineTotal * discountPercent) / 100;
          const taxPercent = item.taxPercent || 0;
          const taxAmount = ((lineTotal - discountAmount) * taxPercent) / 100;
          
          return `
          INSERT INTO #TempInvoiceItems (ProductId, Quantity, UnitPrice, DiscountPercent, DiscountAmount, TaxPercent, TaxAmount, LineTotal)
          VALUES (
            ${item.productId},
            ${item.quantity},
            ${item.unitPrice},
            ${discountPercent},
            ${discountAmount},
            ${taxPercent},
            ${taxAmount},
            ${lineTotal}
          );`;
        }).join('\n')}
        
        -- إنشاء متغير من نوع InvoiceItemType
        DECLARE @InvoiceItems sales.InvoiceItemType;
        
        -- نسخ البيانات من الجدول المؤقت إلى المتغير
        INSERT INTO @InvoiceItems
        SELECT * FROM #TempInvoiceItems;
        
        -- استدعاء الإجراء المخزن
        EXEC sales.sp_CreateSalesInvoice
          @InvoiceNumber = @invoiceNumber,
          @CustomerId = @customerId,
          @PaymentMethod = @paymentMethod,
          @SubTotal = @subTotal,
          @DiscountPercent = @discountPercent,
          @DiscountAmount = @discountAmount,
          @TaxPercent = @taxPercent,
          @TaxAmount = @taxAmount,
          @TotalAmount = @totalAmount,
          @AmountPaid = @amountPaid,
          @Notes = @notes,
          @CompanyId = @companyId,
          @CreatedBy = @createdBy,
          @InvoiceItems = @InvoiceItems;
        
        -- حذف الجدول المؤقت
        DROP TABLE #TempInvoiceItems;
        
        -- إرجاع معرف الفاتورة الجديدة
        SELECT SCOPE_IDENTITY() AS invoiceId;
      `, {
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
      
      console.log("[invoices/route.ts] Database insert result:", result);
      
      // الحصول على معرف الفاتورة الجديدة
      const newInvoiceId = result && result.length > 0 ? result[0].invoiceId : null;
      
      if (!newInvoiceId) {
        throw new Error("لم يتم إرجاع معرف الفاتورة الجديدة من قاعدة البيانات");
      }
      
      // جلب الفاتورة الجديدة من قاعدة البيانات للتأكد من أنها تم إنشاؤها بنجاح
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
      
      const newInvoiceResults = await executeQuery<any[]>(newInvoiceQuery, { invoiceId: newInvoiceId });
      
      if (!newInvoiceResults || newInvoiceResults.length === 0) {
        throw new Error("لم يتم العثور على الفاتورة الجديدة بعد إنشائها");
      }
      
      // الفاتورة الجديدة هي النتيجة الأولى من الاستعلام
      const newInvoice = newInvoiceResults[0];
      
      // عناصر الفاتورة هي النتائج التالية من الاستعلام
      const invoiceItems = newInvoiceResults.slice(1);
      
      console.log("[invoices/route.ts] Created new invoice in database:", newInvoice);
      console.log("[invoices/route.ts] Invoice items:", invoiceItems);
      
      // إرجاع الفاتورة الجديدة مع عناصرها
      return NextResponse.json({
        invoice: newInvoice,
        items: invoiceItems
      }, { status: 201 });
    } catch (dbError) {
      console.error("[invoices/route.ts] Database error:", dbError);
      return NextResponse.json({ message: "خطأ في إنشاء الفاتورة: " + (dbError as Error).message }, { status: 500 });
    }
  } catch (error) {
    console.error("[invoices/route.ts] Failed to create invoice:", error);
    return NextResponse.json({ message: "خطأ في إنشاء الفاتورة" }, { status: 500 });
  }
}