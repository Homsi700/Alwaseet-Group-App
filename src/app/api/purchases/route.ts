import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/db';

// الحصول على قائمة المشتريات
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('searchTerm') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const supplierId = searchParams.get('supplierId');
    const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    
    console.log("[purchases/route.ts] Received GET request for purchases");
    console.log("[purchases/route.ts] Search params:", { searchTerm, startDate, endDate, status, supplierId });
    
    // بناء استعلام SQL للحصول على المشتريات
    let sqlQuery = `
      SELECT 
        p.PurchaseId as id,
        p.InvoiceNumber as invoiceNumber,
        p.PurchaseDate as date,
        p.TotalAmount as total,
        p.Discount as discount,
        p.Tax as tax,
        p.Notes as notes,
        p.Status as status,
        p.PaymentMethod as paymentMethod,
        p.CreatedAt as createdAt,
        p.UpdatedAt as updatedAt,
        s.SupplierId as supplierId,
        s.Name as supplierName,
        s.PhoneNumber as supplierPhone,
        s.Email as supplierEmail,
        u.UserId as userId,
        u.FirstName + ' ' + u.LastName as userName
      FROM inventory.Purchases p
      LEFT JOIN inventory.Suppliers s ON p.SupplierId = s.SupplierId
      LEFT JOIN settings.Users u ON p.CreatedBy = u.UserId
      WHERE p.CompanyId = @companyId
    `;
    
    // إضافة شروط البحث إلى الاستعلام
    const queryParams: Record<string, any> = { companyId };
    
    if (searchTerm) {
      sqlQuery += ` AND (
        p.InvoiceNumber LIKE @searchTerm
        OR p.Notes LIKE @searchTerm
        OR s.Name LIKE @searchTerm
      )`;
      queryParams.searchTerm = `%${searchTerm}%`;
    }
    
    if (startDate) {
      sqlQuery += ` AND p.PurchaseDate >= @startDate`;
      queryParams.startDate = new Date(startDate);
    }
    
    if (endDate) {
      sqlQuery += ` AND p.PurchaseDate <= @endDate`;
      queryParams.endDate = new Date(endDate);
    }
    
    if (status) {
      sqlQuery += ` AND p.Status = @status`;
      queryParams.status = status;
    }
    
    if (supplierId) {
      sqlQuery += ` AND p.SupplierId = @supplierId`;
      queryParams.supplierId = supplierId;
    }
    
    sqlQuery += ` ORDER BY p.PurchaseDate DESC`;
    
    console.log("[purchases/route.ts] Executing SQL query:", sqlQuery);
    console.log("[purchases/route.ts] With parameters:", queryParams);
    
    // تنفيذ الاستعلام
    const purchasesResult = await executeQuery<any[]>(sqlQuery, queryParams);
    
    // الحصول على عناصر المشتريات
    const purchasesWithItems = await Promise.all(purchasesResult.map(async (purchase: any) => {
      const itemsQuery = `
        SELECT 
          pi.PurchaseItemId as id,
          pi.Quantity as quantity,
          pi.UnitPrice as price,
          pi.Discount as discount,
          pi.LineTotal as total,
          p.ProductId as productId,
          p.Name as productName,
          p.Barcode as productBarcode
        FROM inventory.PurchaseItems pi
        JOIN inventory.Products p ON pi.ProductId = p.ProductId
        WHERE pi.PurchaseId = @purchaseId
      `;
      
      const items = await executeQuery(itemsQuery, { purchaseId: purchase.id });
      
      return {
        ...purchase,
        supplier: purchase.supplierId ? {
          id: purchase.supplierId,
          name: purchase.supplierName,
          phone: purchase.supplierPhone,
          email: purchase.supplierEmail
        } : null,
        user: purchase.userId ? {
          id: purchase.userId,
          name: purchase.userName
        } : null,
        items: items.map((item: any) => ({
          ...item,
          product: {
            id: item.productId,
            name: item.productName,
            barcode: item.productBarcode
          }
        }))
      };
    }));
    
    const purchases = purchasesWithItems;
    
    // حساب الإحصائيات
    const totalPurchases = purchases.reduce((sum, purchase) => sum + (purchase.total || 0), 0);
    const totalInvoices = purchases.length;
    const averageInvoiceValue = totalInvoices > 0 ? totalPurchases / totalInvoices : 0;
    
    // تصنيف المشتريات حسب الحالة
    const completedPurchases = purchases.filter(purchase => purchase.status === 'COMPLETED').length;
    const pendingPurchases = purchases.filter(purchase => purchase.status === 'PENDING').length;
    const cancelledPurchases = purchases.filter(purchase => purchase.status === 'CANCELLED').length;
    const returnedPurchases = purchases.filter(purchase => purchase.status === 'RETURNED').length;
    
    console.log(`[purchases/route.ts] Fetched ${purchases.length} purchases`);
    
    // إرجاع البيانات مع الإحصائيات
    return NextResponse.json({
      purchases,
      summary: {
        totalPurchases,
        totalInvoices,
        averageInvoiceValue,
        completedPurchases,
        pendingPurchases,
        cancelledPurchases,
        returnedPurchases
      }
    });
  } catch (error) {
    console.error('خطأ في الحصول على المشتريات:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء الحصول على المشتريات' }, { status: 500 });
  }
}

// إنشاء مشتراة جديدة
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    const userId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    
    console.log("[purchases/route.ts] Received POST request for new purchase");
    console.log("[purchases/route.ts] Request body:", data);
    
    // التحقق من البيانات المطلوبة
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: 'يجب تحديد عناصر المشتراة' }, { status: 400 });
    }
    
    // إنشاء رقم فاتورة فريد إذا لم يتم توفيره
    if (!data.invoiceNumber) {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      data.invoiceNumber = `PO-${year}${month}${day}-${random}`;
    }
    
    // حساب إجمالي المشتراة
    let total = 0;
    let tax = 0;
    let discount = 0;
    
    // تحضير عناصر المشتراة
    const items = data.items.map((item: any) => {
      const itemTotal = (item.price * item.quantity) - (item.discount || 0);
      total += itemTotal;
      discount += item.discount || 0;
      
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        discount: item.discount || 0,
        lineTotal: itemTotal,
      };
    });
    
    // حساب الضريبة إذا تم توفيرها
    if (data.tax) {
      tax = data.tax;
    } else if (data.taxRate) {
      tax = total * (data.taxRate / 100);
    }
    
    // إنشاء المشتراة باستخدام المعاملات (Transactions)
    const insertPurchaseQuery = `
      INSERT INTO inventory.Purchases (
        InvoiceNumber, PurchaseDate, TotalAmount, Discount, Tax, Notes, Status, PaymentMethod, SupplierId, CompanyId, CreatedAt, CreatedBy, UpdatedAt
      )
      OUTPUT INSERTED.PurchaseId
      VALUES (
        @invoiceNumber, @purchaseDate, @totalAmount, @discount, @tax, @notes, @status, @paymentMethod, @supplierId, @companyId, GETDATE(), @createdBy, GETDATE()
      )
    `;
    
    const purchaseParams = {
      invoiceNumber: data.invoiceNumber,
      purchaseDate: data.date ? new Date(data.date) : new Date(),
      totalAmount: total + tax,
      discount: discount,
      tax: tax,
      notes: data.notes,
      status: data.status || 'COMPLETED',
      paymentMethod: data.paymentMethod || 'CASH',
      supplierId: data.supplierId,
      companyId,
      createdBy: userId
    };
    
    // إعداد قائمة الاستعلامات للمعاملة
    const transactionQueries = [
      { query: insertPurchaseQuery, params: purchaseParams }
    ];
    
    // تنفيذ المعاملة
    const transactionResults = await executeTransaction(transactionQueries);
    const purchaseId = transactionResults[0][0].PurchaseId;
    
    console.log(`[purchases/route.ts] Created new purchase with ID: ${purchaseId}`);
    
    // إنشاء استعلامات لعناصر المشتراة وتحديث المخزون
    const itemQueries = [];
    
    // إضافة استعلامات عناصر المشتراة
    for (const item of items) {
      const insertItemQuery = `
        INSERT INTO inventory.PurchaseItems (
          PurchaseId, ProductId, Quantity, UnitPrice, Discount, LineTotal, CreatedAt, UpdatedAt
        )
        VALUES (
          @purchaseId, @productId, @quantity, @unitPrice, @discount, @lineTotal, GETDATE(), GETDATE()
        )
      `;
      
      itemQueries.push({
        query: insertItemQuery,
        params: {
          purchaseId,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          lineTotal: item.lineTotal
        }
      });
    }
    
    // إضافة استعلامات تحديث المخزون
    for (const item of data.items) {
      const updateProductQuery = `
        UPDATE inventory.Products
        SET Quantity = Quantity + @quantity, UpdatedAt = GETDATE()
        WHERE ProductId = @productId
      `;
      
      itemQueries.push({
        query: updateProductQuery,
        params: {
          productId: item.productId,
          quantity: item.quantity
        }
      });
    }
    
    // تنفيذ استعلامات العناصر وتحديث المخزون في معاملة واحدة
    await executeTransaction(itemQueries);
    
    console.log(`[purchases/route.ts] Added ${items.length} items to purchase and updated inventory`);
    
    // الحصول على المشتراة المنشأة مع بياناتها الكاملة
    const getPurchaseQuery = `
      SELECT 
        p.PurchaseId as id,
        p.InvoiceNumber as invoiceNumber,
        p.PurchaseDate as date,
        p.TotalAmount as total,
        p.Discount as discount,
        p.Tax as tax,
        p.Notes as notes,
        p.Status as status,
        p.PaymentMethod as paymentMethod,
        p.CreatedAt as createdAt,
        p.UpdatedAt as updatedAt,
        s.SupplierId as supplierId,
        s.Name as supplierName,
        s.PhoneNumber as supplierPhone,
        s.Email as supplierEmail,
        u.UserId as userId,
        u.FirstName + ' ' + u.LastName as userName
      FROM inventory.Purchases p
      LEFT JOIN inventory.Suppliers s ON p.SupplierId = s.SupplierId
      LEFT JOIN settings.Users u ON p.CreatedBy = u.UserId
      WHERE p.PurchaseId = @purchaseId
    `;
    
    // الحصول على عناصر المشتراة
    const getItemsQuery = `
      SELECT 
        pi.PurchaseItemId as id,
        pi.Quantity as quantity,
        pi.UnitPrice as price,
        pi.Discount as discount,
        pi.LineTotal as total,
        p.ProductId as productId,
        p.Name as productName,
        p.Barcode as productBarcode
      FROM inventory.PurchaseItems pi
      JOIN inventory.Products p ON pi.ProductId = p.ProductId
      WHERE pi.PurchaseId = @purchaseId
    `;
    
    // استخدام استعلامات منفصلة للحصول على البيانات بعد إتمام المعاملات
    const purchaseData = await executeQuery<any[]>(getPurchaseQuery, { purchaseId });
    const itemsData = await executeQuery<any[]>(getItemsQuery, { purchaseId });
    
    // تنسيق البيانات للإرجاع
    const purchase = {
      ...purchaseData[0],
      supplier: purchaseData[0].supplierId ? {
        id: purchaseData[0].supplierId,
        name: purchaseData[0].supplierName,
        phone: purchaseData[0].supplierPhone,
        email: purchaseData[0].supplierEmail
      } : null,
      user: purchaseData[0].userId ? {
        id: purchaseData[0].userId,
        name: purchaseData[0].userName
      } : null,
      items: itemsData.map((item) => ({
        ...item,
        product: {
          id: item.productId,
          name: item.productName,
          barcode: item.productBarcode
        }
      }))
    };
    
    console.log(`[purchases/route.ts] Returning complete purchase data`);
    
    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error('خطأ في إنشاء المشتراة:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء المشتراة' }, { status: 500 });
  }
}