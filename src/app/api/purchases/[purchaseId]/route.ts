import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/db';

// الحصول على مشتراة محددة
export async function GET(
  req: NextRequest,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const purchaseId = params.purchaseId;
    const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    
    console.log(`[purchases/[purchaseId]/route.ts] Received GET request for purchase ID: ${purchaseId}`);
    
    // استعلام للحصول على بيانات المشتراة
    const purchaseQuery = `
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
      WHERE p.PurchaseId = @purchaseId AND p.CompanyId = @companyId
    `;
    
    const purchases = await executeQuery<any[]>(purchaseQuery, { purchaseId, companyId });
    
    if (!purchases || purchases.length === 0) {
      console.log(`[purchases/[purchaseId]/route.ts] Purchase not found: ${purchaseId}`);
      return NextResponse.json({ error: 'المشتراة غير موجودة' }, { status: 404 });
    }
    
    const purchase = purchases[0];
    
    // استعلام للحصول على عناصر المشتراة
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
    
    const items = await executeQuery<any[]>(itemsQuery, { purchaseId });
    
    // تنسيق البيانات للإرجاع
    const purchaseWithItems = {
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
      items: items.map((item) => ({
        ...item,
        product: {
          id: item.productId,
          name: item.productName,
          barcode: item.productBarcode
        }
      }))
    };
    
    console.log(`[purchases/[purchaseId]/route.ts] Purchase fetched successfully with ${items.length} items`);
    
    return NextResponse.json(purchaseWithItems);
  } catch (error) {
    console.error('خطأ في الحصول على المشتراة:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء الحصول على المشتراة' }, { status: 500 });
  }
}

// تحديث مشتراة محددة
export async function PUT(
  req: NextRequest,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const purchaseId = params.purchaseId;
    const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    const userId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    const data = await req.json();
    
    console.log(`[purchases/[purchaseId]/route.ts] Received PUT request for purchase ID: ${purchaseId}`);
    console.log(`[purchases/[purchaseId]/route.ts] Update data:`, data);
    
    // التحقق من وجود المشتراة
    const checkQuery = `
      SELECT PurchaseId, Status
      FROM inventory.Purchases
      WHERE PurchaseId = @purchaseId AND CompanyId = @companyId
    `;
    
    const existingPurchases = await executeQuery<any[]>(checkQuery, { purchaseId, companyId });
    
    if (!existingPurchases || existingPurchases.length === 0) {
      console.log(`[purchases/[purchaseId]/route.ts] Purchase not found: ${purchaseId}`);
      return NextResponse.json({ error: 'المشتراة غير موجودة' }, { status: 404 });
    }
    
    const existingPurchase = existingPurchases[0];
    
    // التحقق من إمكانية تحديث المشتراة (لا يمكن تحديث المشتراة المكتملة إلا إذا كانت معلقة)
    if (existingPurchase.Status === 'COMPLETED' && data.status !== 'CANCELLED' && data.status !== 'RETURNED') {
      console.log(`[purchases/[purchaseId]/route.ts] Cannot update completed purchase: ${purchaseId}`);
      return NextResponse.json({ error: 'لا يمكن تحديث المشتراة المكتملة' }, { status: 400 });
    }
    
    // تحديث بيانات المشتراة
    const updateQuery = `
      UPDATE inventory.Purchases
      SET 
        InvoiceNumber = @invoiceNumber,
        PurchaseDate = @purchaseDate,
        Notes = @notes,
        Status = @status,
        PaymentMethod = @paymentMethod,
        SupplierId = @supplierId,
        UpdatedAt = GETDATE()
      WHERE PurchaseId = @purchaseId AND CompanyId = @companyId;
    `;
    
    await executeQuery(updateQuery, {
      purchaseId,
      companyId,
      invoiceNumber: data.invoiceNumber,
      purchaseDate: data.date ? new Date(data.date) : new Date(),
      notes: data.notes,
      status: data.status,
      paymentMethod: data.paymentMethod,
      supplierId: data.supplierId
    });
    
    console.log(`[purchases/[purchaseId]/route.ts] Purchase updated successfully: ${purchaseId}`);
    
    // إذا تم تغيير الحالة إلى ملغية أو مرتجعة، قم بتحديث المخزون
    if ((data.status === 'CANCELLED' || data.status === 'RETURNED') && existingPurchase.Status === 'COMPLETED') {
      // الحصول على عناصر المشتراة
      const itemsQuery = `
        SELECT ProductId, Quantity
        FROM inventory.PurchaseItems
        WHERE PurchaseId = @purchaseId
      `;
      
      const items = await executeQuery<any[]>(itemsQuery, { purchaseId });
      
      // إنشاء استعلامات لتحديث المخزون
      const itemQueries = [];
      
      for (const item of items) {
        const updateProductQuery = `
          UPDATE inventory.Products
          SET Quantity = Quantity - @quantity, UpdatedAt = GETDATE()
          WHERE ProductId = @productId
        `;
        
        itemQueries.push({
          query: updateProductQuery,
          params: {
            productId: item.ProductId,
            quantity: item.Quantity
          }
        });
      }
      
      // تنفيذ استعلامات تحديث المخزون في معاملة واحدة
      if (itemQueries.length > 0) {
        await executeTransaction(itemQueries);
        console.log(`[purchases/[purchaseId]/route.ts] Inventory updated for cancelled/returned purchase: ${purchaseId}`);
      }
    }
    
    // الحصول على المشتراة المحدثة مع بياناتها الكاملة
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
    
    return NextResponse.json(purchase);
  } catch (error) {
    console.error('خطأ في تحديث المشتراة:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث المشتراة' }, { status: 500 });
  }
}

// حذف مشتراة محددة
export async function DELETE(
  req: NextRequest,
  { params }: { params: { purchaseId: string } }
) {
  try {
    const purchaseId = params.purchaseId;
    const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    
    console.log(`[purchases/[purchaseId]/route.ts] Received DELETE request for purchase ID: ${purchaseId}`);
    
    // التحقق من وجود المشتراة
    const checkQuery = `
      SELECT PurchaseId, Status
      FROM inventory.Purchases
      WHERE PurchaseId = @purchaseId AND CompanyId = @companyId
    `;
    
    const existingPurchases = await executeQuery<any[]>(checkQuery, { purchaseId, companyId });
    
    if (!existingPurchases || existingPurchases.length === 0) {
      console.log(`[purchases/[purchaseId]/route.ts] Purchase not found: ${purchaseId}`);
      return NextResponse.json({ error: 'المشتراة غير موجودة' }, { status: 404 });
    }
    
    const existingPurchase = existingPurchases[0];
    
    // التحقق من إمكانية حذف المشتراة (لا يمكن حذف المشتراة المكتملة)
    if (existingPurchase.Status === 'COMPLETED') {
      console.log(`[purchases/[purchaseId]/route.ts] Cannot delete completed purchase: ${purchaseId}`);
      return NextResponse.json({ error: 'لا يمكن حذف المشتراة المكتملة، يمكن تغيير حالتها إلى ملغية بدلاً من ذلك' }, { status: 400 });
    }
    
    // الحصول على عناصر المشتراة قبل الحذف (للمشتريات المعلقة التي قد تكون قد أثرت على المخزون)
    const itemsQuery = `
      SELECT ProductId, Quantity
      FROM inventory.PurchaseItems
      WHERE PurchaseId = @purchaseId
    `;
    
    const items = await executeQuery<any[]>(itemsQuery, { purchaseId });
    
    // حذف عناصر المشتراة
    const deleteItemsQuery = `
      DELETE FROM inventory.PurchaseItems
      WHERE PurchaseId = @purchaseId
    `;
    
    await executeQuery(deleteItemsQuery, { purchaseId });
    
    // حذف المشتراة
    const deletePurchaseQuery = `
      DELETE FROM inventory.Purchases
      WHERE PurchaseId = @purchaseId AND CompanyId = @companyId
    `;
    
    await executeQuery(deletePurchaseQuery, { purchaseId, companyId });
    
    console.log(`[purchases/[purchaseId]/route.ts] Purchase deleted successfully: ${purchaseId}`);
    
    // إذا كانت المشتراة معلقة وتم تحديث المخزون، قم بإعادة المخزون
    if (existingPurchase.Status === 'PENDING' && items.length > 0) {
      // إنشاء استعلامات لتحديث المخزون
      const itemQueries = [];
      
      for (const item of items) {
        const updateProductQuery = `
          UPDATE inventory.Products
          SET Quantity = Quantity - @quantity, UpdatedAt = GETDATE()
          WHERE ProductId = @productId
        `;
        
        itemQueries.push({
          query: updateProductQuery,
          params: {
            productId: item.ProductId,
            quantity: item.Quantity
          }
        });
      }
      
      // تنفيذ استعلامات تحديث المخزون في معاملة واحدة
      if (itemQueries.length > 0) {
        await executeTransaction(itemQueries);
        console.log(`[purchases/[purchaseId]/route.ts] Inventory updated after deleting purchase: ${purchaseId}`);
      }
    }
    
    return NextResponse.json({ message: 'تم حذف المشتراة بنجاح' });
  } catch (error) {
    console.error('خطأ في حذف المشتراة:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف المشتراة' }, { status: 500 });
  }
}