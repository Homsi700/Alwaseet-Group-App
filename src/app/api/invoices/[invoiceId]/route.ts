// src/app/api/invoices/[invoiceId]/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Invoice, InvoiceItem } from '@/types';

// GET /api/invoices/{invoiceId} - Fetch a single invoice by ID with its items
export async function GET(request: Request, { params }: { params: { invoiceId: string } }) {
  const invoiceId = parseInt(params.invoiceId);
  const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
  
  try {
    console.log(`[invoices/[invoiceId]/route.ts] Received GET request for invoice ID: ${invoiceId}`);
    
    // استعلام لجلب الفاتورة وعناصرها
    const query = `
      -- جلب بيانات الفاتورة
      SELECT 
        i.InvoiceId as invoiceId,
        i.InvoiceNumber as invoiceNumber,
        i.InvoiceDate as invoiceDate,
        i.CustomerId as customerId,
        c.Name as customerName,
        c.PhoneNumber as customerPhone,
        c.Email as customerEmail,
        c.Address as customerAddress,
        c.TaxNumber as customerTaxNumber,
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
        u.Username as createdByUsername,
        u.FirstName as createdByFirstName,
        u.LastName as createdByLastName,
        comp.Name as companyName,
        comp.Address as companyAddress,
        comp.PhoneNumber as companyPhone,
        comp.Email as companyEmail,
        comp.TaxNumber as companyTaxNumber
      FROM sales.Invoices i
      LEFT JOIN sales.Customers c ON i.CustomerId = c.CustomerId
      LEFT JOIN settings.Users u ON i.CreatedBy = u.UserId
      LEFT JOIN settings.Companies comp ON i.CompanyId = comp.CompanyId
      WHERE i.InvoiceId = @invoiceId AND i.CompanyId = @companyId;
      
      -- جلب عناصر الفاتورة
      SELECT 
        ii.InvoiceItemId as invoiceItemId,
        ii.InvoiceId as invoiceId,
        ii.ProductId as productId,
        p.Name as productName,
        p.Barcode as productBarcode,
        ii.Quantity as quantity,
        p.UnitOfMeasure as unitOfMeasure,
        ii.UnitPrice as unitPrice,
        ii.DiscountPercent as discountPercent,
        ii.DiscountAmount as discountAmount,
        ii.TaxPercent as taxPercent,
        ii.TaxAmount as taxAmount,
        ii.LineTotal as lineTotal
      FROM sales.InvoiceItems ii
      LEFT JOIN inventory.Products p ON ii.ProductId = p.ProductId
      WHERE ii.InvoiceId = @invoiceId
      ORDER BY ii.InvoiceItemId;
    `;
    
    console.log(`[invoices/[invoiceId]/route.ts] Executing SQL query for invoice ID: ${invoiceId}`);
    const results = await executeQuery<any[]>(query, { invoiceId, companyId });
    
    if (!results || results.length === 0) {
      console.log(`[invoices/[invoiceId]/route.ts] Invoice with ID ${invoiceId} not found in database`);
      return NextResponse.json({ message: "الفاتورة غير موجودة" }, { status: 404 });
    }
    
    // تقسيم النتائج إلى مجموعتين: الفاتورة وعناصرها
    // الفاتورة هي النتيجة الأولى من المجموعة الأولى
    const invoice = results[0] as Invoice;
    
    // عناصر الفاتورة هي نتائج المجموعة الثانية
    const items = results.slice(1) as InvoiceItem[];
    
    console.log(`[invoices/[invoiceId]/route.ts] Found invoice in database:`, invoice);
    console.log(`[invoices/[invoiceId]/route.ts] Invoice items count:`, items.length);
    
    return NextResponse.json({
      invoice,
      items
    });
  } catch (error) {
    console.error(`[invoices/[invoiceId]/route.ts] Failed to fetch invoice ${invoiceId}:`, error);
    return NextResponse.json({ message: "خطأ في جلب الفاتورة" }, { status: 500 });
  }
}

// PUT /api/invoices/{invoiceId} - Update an existing invoice
export async function PUT(request: Request, { params }: { params: { invoiceId: string } }) {
  console.log(`[invoices/[invoiceId]/route.ts] Received PUT request for invoice ID: ${params.invoiceId}`);
  
  const invoiceId = parseInt(params.invoiceId);
  const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
  
  try {
    // Parse request body
    const bodyText = await request.text();
    console.log("[invoices/[invoiceId]/route.ts] Request body:", bodyText);
    
    let body;
    try {
      body = JSON.parse(bodyText) as Partial<Invoice>;
    } catch (e) {
      console.error("[invoices/[invoiceId]/route.ts] Error parsing JSON:", e);
      return NextResponse.json({ message: "خطأ في تنسيق البيانات" }, { status: 400 });
    }

    // التحقق من وجود الفاتورة قبل التحديث
    const checkQuery = `
      SELECT InvoiceId FROM sales.Invoices 
      WHERE InvoiceId = @invoiceId AND CompanyId = @companyId
    `;
    
    const existingInvoices = await executeQuery<any[]>(checkQuery, { invoiceId, companyId });
    
    if (!existingInvoices || existingInvoices.length === 0) {
      console.log(`[invoices/[invoiceId]/route.ts] Invoice with ID ${invoiceId} not found in database`);
      return NextResponse.json({ message: "الفاتورة غير موجودة" }, { status: 404 });
    }
    
    // بناء استعلام التحديث ديناميكياً بناءً على الحقول المتوفرة في الطلب
    let updateFields = [];
    let params: Record<string, any> = { invoiceId, companyId };
    
    if (body.status !== undefined) {
      updateFields.push("Status = @status");
      params.status = body.status;
    }
    
    if (body.amountPaid !== undefined) {
      updateFields.push("AmountPaid = @amountPaid");
      params.amountPaid = body.amountPaid;
      
      // تحديث المبلغ المتبقي تلقائياً
      updateFields.push("AmountDue = TotalAmount - @amountPaid");
    }
    
    if (body.notes !== undefined) {
      updateFields.push("Notes = @notes");
      params.notes = body.notes;
    }
    
    // إضافة حقول التحديث الإلزامية
    updateFields.push("UpdatedAt = GETDATE()");
    
    // إذا لم تكن هناك حقول للتحديث، فلا داعي للاستمرار
    if (updateFields.length === 0) {
      return NextResponse.json({ message: "لم يتم تحديد أي حقول للتحديث" }, { status: 400 });
    }
    
    // تنفيذ استعلام التحديث
    const updateQuery = `
      UPDATE sales.Invoices 
      SET ${updateFields.join(", ")} 
      WHERE InvoiceId = @invoiceId AND CompanyId = @companyId;
      
      -- إرجاع الفاتورة المحدثة
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
      WHERE i.InvoiceId = @invoiceId AND i.CompanyId = @companyId;
    `;
    
    console.log(`[invoices/[invoiceId]/route.ts] Executing SQL update query for invoice ID: ${invoiceId}`);
    console.log(`[invoices/[invoiceId]/route.ts] Update fields: ${updateFields.join(", ")}`);
    
    const updatedInvoices = await executeQuery<Invoice[]>(updateQuery, params);
    
    if (!updatedInvoices || updatedInvoices.length === 0) {
      throw new Error("فشل في استرجاع الفاتورة المحدثة من قاعدة البيانات");
    }
    
    const updatedInvoice = updatedInvoices[0];
    console.log(`[invoices/[invoiceId]/route.ts] Invoice updated successfully in database:`, updatedInvoice);
    
    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error(`[invoices/[invoiceId]/route.ts] Failed to update invoice ${invoiceId}:`, error);
    return NextResponse.json({ message: "خطأ في تحديث الفاتورة" }, { status: 500 });
  }
}

// DELETE /api/invoices/{invoiceId} - Delete an invoice (soft delete or cancel)
export async function DELETE(request: Request, { params }: { params: { invoiceId: string } }) {
  const invoiceId = parseInt(params.invoiceId);
  const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
  
  try {
    console.log(`[invoices/[invoiceId]/route.ts] Received DELETE request for invoice ID: ${invoiceId}`);
    
    // التحقق من وجود الفاتورة قبل الإلغاء
    const checkQuery = `
      SELECT InvoiceId, Status FROM sales.Invoices 
      WHERE InvoiceId = @invoiceId AND CompanyId = @companyId
    `;
    
    const existingInvoices = await executeQuery<any[]>(checkQuery, { invoiceId, companyId });
    
    if (!existingInvoices || existingInvoices.length === 0) {
      console.log(`[invoices/[invoiceId]/route.ts] Invoice with ID ${invoiceId} not found in database`);
      return NextResponse.json({ message: "الفاتورة غير موجودة" }, { status: 404 });
    }
    
    // التحقق من حالة الفاتورة (لا يمكن إلغاء الفواتير المدفوعة بالكامل)
    const existingInvoice = existingInvoices[0];
    if (existingInvoice.Status === 'مدفوعة') {
      return NextResponse.json({ message: "لا يمكن إلغاء فاتورة مدفوعة بالكامل" }, { status: 400 });
    }
    
    // تنفيذ إلغاء الفاتورة (تغيير الحالة إلى "ملغاة")
    const cancelQuery = `
      UPDATE sales.Invoices 
      SET Status = 'ملغاة', UpdatedAt = GETDATE() 
      WHERE InvoiceId = @invoiceId AND CompanyId = @companyId
    `;
    
    console.log(`[invoices/[invoiceId]/route.ts] Executing SQL cancel query for invoice ID: ${invoiceId}`);
    await executeQuery(cancelQuery, { invoiceId, companyId });
    
    console.log(`[invoices/[invoiceId]/route.ts] Invoice cancelled successfully in database: ${invoiceId}`);
    
    return NextResponse.json({ message: "تم إلغاء الفاتورة بنجاح" });
  } catch (error) {
    console.error(`[invoices/[invoiceId]/route.ts] Failed to cancel invoice ${invoiceId}:`, error);
    return NextResponse.json({ message: "خطأ في إلغاء الفاتورة" }, { status: 500 });
  }
}