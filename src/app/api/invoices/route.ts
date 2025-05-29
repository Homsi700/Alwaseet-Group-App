// src/app/api/invoices/route.ts
import { NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/db';
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
    const { invoice } = body;
    let { items } = body;
    
    console.log("[invoices/route.ts] Received invoice data:", invoice);
    console.log("[invoices/route.ts] Received items data:", items);
    
    if (!invoice.customerId || !items || items.length === 0) {
      return NextResponse.json({ message: "البيانات المطلوبة غير مكتملة" }, { status: 400 });
    }
    
    // تحقق من وجود العميل في قاعدة البيانات
    try {
      const checkCustomerQuery = `SELECT CustomerId FROM sales.Customers WHERE CustomerId = @customerId`;
      const customerResult = await executeQuery<any[]>(checkCustomerQuery, { customerId: invoice.customerId });
      
      if (!customerResult || customerResult.length === 0) {
        console.error(`[invoices/route.ts] العميل بالمعرف ${invoice.customerId} غير موجود في قاعدة البيانات`);
        
        // إذا كان العميل غير موجود، نستخدم العميل النقدي (معرف 2)
        console.log(`[invoices/route.ts] سيتم استخدام العميل النقدي (معرف 2) بدلاً من ذلك`);
        invoice.customerId = 2;
      } else {
        console.log(`[invoices/route.ts] تم التحقق من وجود العميل بالمعرف ${invoice.customerId}`);
      }
    } catch (error) {
      console.error("[invoices/route.ts] خطأ في التحقق من وجود العميل:", error);
      // في حالة حدوث خطأ، نستخدم العميل النقدي (معرف 2)
      console.log(`[invoices/route.ts] سيتم استخدام العميل النقدي (معرف 2) بدلاً من ذلك`);
      invoice.customerId = 2;
    }
    
    // تحقق من وجود المنتجات في قاعدة البيانات وإزالة المنتجات غير الموجودة
    const validItems = [];
    
    // طباعة جميع معرفات المنتجات المستلمة
    console.log("[invoices/route.ts] معرفات المنتجات المستلمة:", items.map(item => item.productId));
    
    for (const item of items) {
      try {
        // التأكد من أن معرف المنتج هو رقم صحيح
        const productId = typeof item.productId === 'string' ? parseInt(item.productId) : item.productId;
        
        if (isNaN(productId)) {
          console.error(`[invoices/route.ts] معرف المنتج غير صالح: ${item.productId}`);
          continue;
        }
        
        const checkProductQuery = `SELECT ProductId FROM inventory.Products WHERE ProductId = @productId`;
        const productResult = await executeQuery<any[]>(checkProductQuery, { productId });
        
        if (!productResult || productResult.length === 0) {
          console.error(`[invoices/route.ts] المنتج بالمعرف ${productId} غير موجود في قاعدة البيانات وسيتم تخطيه`);
        } else {
          console.log(`[invoices/route.ts] تم التحقق من وجود المنتج بالمعرف ${productId}`);
          // استخدام معرف المنتج كرقم صحيح
          validItems.push({
            ...item,
            productId
          });
        }
      } catch (error) {
        console.error(`[invoices/route.ts] خطأ في التحقق من وجود المنتج بالمعرف ${item.productId}:`, error);
      }
    }
    
    // إذا لم تكن هناك منتجات صالحة، نرجع خطأ
    if (validItems.length === 0) {
      return NextResponse.json({ 
        message: `لا توجد منتجات صالحة في الفاتورة. تحقق من معرفات المنتجات.`
      }, { status: 400 });
    }
    
    // استبدال قائمة المنتجات بالمنتجات الصالحة فقط
    items = validItems;
    
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
      // إعداد استعلامات المعاملة
      const transactionQueries = [];
      
      // إدراج الفاتورة مباشرة في جدول الفواتير
      const insertInvoiceQuery = `
        INSERT INTO sales.Invoices (
          InvoiceNumber, InvoiceDate, CustomerId, PaymentMethod,
          SubTotal, DiscountPercent, DiscountAmount, TaxPercent,
          TaxAmount, TotalAmount, AmountPaid, AmountDue,
          Status, Notes, CompanyId, CreatedBy
        )
        OUTPUT INSERTED.InvoiceId as invoiceId, INSERTED.InvoiceNumber as invoiceNumber
        VALUES (
          @invoiceNumber, GETDATE(), @customerId, @paymentMethod,
          @subTotal, @discountPercent, @discountAmount, @taxPercent,
          @taxAmount, @totalAmount, @amountPaid, (@totalAmount - @amountPaid),
          @status,
          @notes, @companyId, @createdBy
        );
      `;
      
      const invoiceParams = {
        invoiceNumber,
        customerId: invoice.customerId,
        paymentMethod: invoice.paymentMethod || 'نقدي',
        subTotal,
        discountPercent: invoice.discountPercent || 0,
        discountAmount: totalDiscountAmount,
        taxPercent: invoice.taxPercent || 0,
        taxAmount: totalTaxAmount,
        totalAmount,
        amountPaid: invoice.amountPaid || 0,
        status: invoice.status || 'Unpaid',
        notes: invoice.notes || null,
        companyId,
        createdBy
      };
      
      // إضافة استعلام إنشاء الفاتورة إلى المعاملة
      transactionQueries.push({ query: insertInvoiceQuery, params: invoiceParams });
      
      // تنفيذ المعاملة لإنشاء الفاتورة
      const transactionResults = await executeTransaction(transactionQueries);
      console.log("[invoices/route.ts] نتائج المعاملة:", transactionResults);
      
      // التحقق من وجود نتائج
      if (!transactionResults || !transactionResults.length) {
        throw new Error("لم يتم إرجاع أي نتائج من قاعدة البيانات");
      }
      
      console.log("[invoices/route.ts] نتيجة إدراج الفاتورة:", transactionResults[0]);
      
      // الحصول على معرف الفاتورة الجديدة
      let newInvoiceId;
      
      try {
        // التحقق من شكل البيانات المرجعة
        if (Array.isArray(transactionResults[0]) && transactionResults[0].length > 0) {
          // إذا كانت النتيجة مصفوفة من السجلات
          newInvoiceId = transactionResults[0][0]?.invoiceId;
          console.log("[invoices/route.ts] معرف الفاتورة من المصفوفة:", newInvoiceId);
        } else if (transactionResults[0] && typeof transactionResults[0] === 'object') {
          // إذا كانت النتيجة كائن واحد
          const firstResult = transactionResults[0] as any;
          // البحث عن خاصية تحتوي على معرف الفاتورة
          newInvoiceId = firstResult.invoiceId || firstResult.InvoiceId || firstResult.id || firstResult.Id;
          console.log("[invoices/route.ts] معرف الفاتورة من الكائن:", newInvoiceId);
        }
        
        // محاولة أخرى للحصول على معرف الفاتورة إذا لم يتم العثور عليه
        if (!newInvoiceId && transactionResults[0]) {
          console.log("[invoices/route.ts] محاولة استخراج معرف الفاتورة من:", JSON.stringify(transactionResults[0]));
          
          // محاولة البحث عن أي خاصية تحتوي على كلمة "id" أو "Id"
          const firstResultStr = JSON.stringify(transactionResults[0]);
          const idMatch = firstResultStr.match(/"([^"]*[iI]d)":\s*(\d+)/);
          if (idMatch && idMatch.length >= 3) {
            newInvoiceId = parseInt(idMatch[2]);
            console.log("[invoices/route.ts] تم استخراج معرف الفاتورة من النص:", newInvoiceId);
          }
        }
      } catch (error) {
        console.error("[invoices/route.ts] خطأ في استخراج معرف الفاتورة:", error);
      }
      
      console.log("[invoices/route.ts] معرف الفاتورة الجديدة:", newInvoiceId);
      
      if (!newInvoiceId) {
        throw new Error("لم يتم إرجاع معرف الفاتورة الجديدة من قاعدة البيانات");
      }
      
      // إعداد استعلامات لعناصر الفاتورة وتحديث المخزون
      const itemsQueries = [];
      
      // إدراج عناصر الفاتورة
      for (const item of items) {
        // التأكد من أن معرف المنتج هو رقم صحيح
        const productId = typeof item.productId === 'string' ? parseInt(item.productId) : item.productId;
        
        if (isNaN(productId) || productId <= 0) {
          console.error(`[invoices/route.ts] تخطي المنتج بسبب معرف غير صالح: ${item.productId}`);
          continue;
        }
        
        // التحقق من وجود المنتج في قاعدة البيانات
        try {
          const checkProductQuery = `SELECT ProductId FROM inventory.Products WHERE ProductId = @productId`;
          const productResult = await executeQuery<any[]>(checkProductQuery, { productId });
          
          if (!productResult || productResult.length === 0) {
            console.error(`[invoices/route.ts] المنتج بالمعرف ${productId} غير موجود في قاعدة البيانات وسيتم تخطيه`);
            continue;
          }
        } catch (error) {
          console.error(`[invoices/route.ts] خطأ في التحقق من وجود المنتج بالمعرف ${productId}:`, error);
          continue;
        }
        
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
        
        console.log(`[invoices/route.ts] إضافة المنتج بالمعرف ${productId} إلى الفاتورة`);
        
        itemsQueries.push({
          query: insertItemQuery,
          params: {
            invoiceId: newInvoiceId,
            productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPercent,
            discountAmount,
            taxPercent,
            taxAmount,
            lineTotal
          }
        });
        
        // تحديث كميات المنتجات
        const updateProductQuery = `
          UPDATE inventory.Products
          SET Quantity = Quantity - @quantity,
              UpdatedAt = GETDATE()
          WHERE ProductId = @productId;
        `;
        
        console.log(`[invoices/route.ts] تحديث كمية المنتج بالمعرف: ${productId}`);
        
        itemsQueries.push({
          query: updateProductQuery,
          params: {
            productId,
            quantity: item.quantity
          }
        });
      }
      
      // تنفيذ استعلامات العناصر وتحديث المخزون في معاملة واحدة
      if (itemsQueries.length > 0) {
        await executeTransaction(itemsQueries);
      }
      
      console.log("[invoices/route.ts] تم إدراج عناصر الفاتورة وتحديث المخزون بنجاح");
      
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
      
      // لا حاجة للتراجع عن المعاملة يدويًا، فالدالة executeTransaction تتعامل مع ذلك تلقائيًا
      
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