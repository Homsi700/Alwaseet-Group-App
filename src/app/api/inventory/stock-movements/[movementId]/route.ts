// src/app/api/inventory/stock-movements/[movementId]/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// تعريف نوع البيانات لحركة المخزون
interface StockMovement {
  movementId: number;
  productId: number;
  productName?: string;
  productSku?: string;
  categoryId?: number;
  categoryName?: string;
  type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN';
  quantity: number;
  date: string;
  reference?: string;
  notes?: string;
  userId: number;
  userName?: string;
  createdAt: string;
}

// GET /api/inventory/stock-movements/{movementId} - Fetch a single stock movement
export async function GET(request: Request, { params }: { params: { movementId: string } }) {
  const movementId = parseInt(params.movementId);
  
  try {
    console.log(`[stock-movements/[movementId]/route.ts] Received GET request for movement ID: ${movementId}`);
    
    // استعلام جلب حركة المخزون
    const query = `
      SELECT 
        sm.MovementId as movementId,
        sm.ProductId as productId,
        p.Name as productName,
        p.Barcode as productSku,
        p.CategoryId as categoryId,
        c.Name as categoryName,
        sm.Type as type,
        sm.Quantity as quantity,
        sm.Date as date,
        sm.Reference as reference,
        sm.Notes as notes,
        sm.UserId as userId,
        u.FirstName + ' ' + u.LastName as userName,
        sm.CreatedAt as createdAt
      FROM inventory.StockMovements sm
      JOIN inventory.Products p ON sm.ProductId = p.ProductId
      LEFT JOIN inventory.Categories c ON p.CategoryId = c.CategoryId
      LEFT JOIN settings.Users u ON sm.UserId = u.UserId
      WHERE sm.MovementId = @movementId
    `;
    
    const movements = await executeQuery<StockMovement[]>(query, { movementId });
    
    if (!movements || movements.length === 0) {
      console.log(`[stock-movements/[movementId]/route.ts] Movement with ID ${movementId} not found`);
      return NextResponse.json({ message: "حركة المخزون غير موجودة" }, { status: 404 });
    }
    
    const movement = movements[0];
    console.log(`[stock-movements/[movementId]/route.ts] Found movement:`, movement);
    
    return NextResponse.json(movement);
  } catch (error) {
    console.error(`[stock-movements/[movementId]/route.ts] Failed to fetch movement ${movementId}:`, error);
    return NextResponse.json({ message: "خطأ في جلب حركة المخزون" }, { status: 500 });
  }
}

// DELETE /api/inventory/stock-movements/{movementId} - Delete a stock movement and revert inventory
export async function DELETE(request: Request, { params }: { params: { movementId: string } }) {
  const movementId = parseInt(params.movementId);
  const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
  
  try {
    console.log(`[stock-movements/[movementId]/route.ts] Received DELETE request for movement ID: ${movementId}`);
    
    // جلب معلومات الحركة قبل الحذف
    const getMovementQuery = `
      SELECT 
        sm.MovementId as movementId,
        sm.ProductId as productId,
        sm.Type as type,
        sm.Quantity as quantity,
        p.Quantity as currentProductQuantity,
        p.MinimumQuantity as minimumQuantity
      FROM inventory.StockMovements sm
      JOIN inventory.Products p ON sm.ProductId = p.ProductId
      WHERE sm.MovementId = @movementId AND p.CompanyId = @companyId
    `;
    
    const movements = await executeQuery<[{
      movementId: number;
      productId: number;
      type: string;
      quantity: number;
      currentProductQuantity: number;
      minimumQuantity: number;
    }]>(getMovementQuery, { movementId, companyId });
    
    if (!movements || movements.length === 0) {
      console.log(`[stock-movements/[movementId]/route.ts] Movement with ID ${movementId} not found`);
      return NextResponse.json({ message: "حركة المخزون غير موجودة" }, { status: 404 });
    }
    
    const movement = movements[0];
    
    // حساب الكمية الجديدة بعد إلغاء الحركة
    let newQuantity = movement.currentProductQuantity;
    
    // عكس تأثير الحركة على المخزون
    switch (movement.type) {
      case 'PURCHASE':
      case 'RETURN':
        newQuantity -= movement.quantity; // إلغاء الإضافة
        break;
      case 'SALE':
        newQuantity += movement.quantity; // إلغاء الخصم
        break;
      case 'ADJUSTMENT':
        // في حالة التعديل، يصعب العودة للقيمة السابقة بدون تتبع التاريخ
        // يمكن إضافة حقل للقيمة السابقة في جدول الحركات
        console.log(`[stock-movements/[movementId]/route.ts] Warning: Reverting ADJUSTMENT type may not be accurate`);
        break;
    }
    
    // تحديث حالة المنتج بناءً على الكمية الجديدة
    let status = 'ACTIVE';
    if (newQuantity <= 0) {
      status = 'OUT_OF_STOCK';
    } else if (movement.minimumQuantity && newQuantity <= movement.minimumQuantity) {
      status = 'LOW_STOCK';
    }
    
    // بدء معاملة لضمان حذف الحركة وتحديث المخزون معًا
    
    // حذف حركة المخزون
    const deleteMovementQuery = `
      DELETE FROM inventory.StockMovements
      WHERE MovementId = @movementId
    `;
    
    await executeQuery(deleteMovementQuery, { movementId });
    
    // تحديث كمية المنتج
    const updateProductQuery = `
      UPDATE inventory.Products
      SET 
        Quantity = @newQuantity,
        Status = @status,
        UpdatedAt = GETDATE()
      WHERE ProductId = @productId AND CompanyId = @companyId
    `;
    
    await executeQuery(updateProductQuery, {
      productId: movement.productId,
      newQuantity,
      status,
      companyId
    });
    
    console.log(`[stock-movements/[movementId]/route.ts] Movement deleted and inventory updated. New quantity: ${newQuantity}`);
    
    return NextResponse.json({ 
      message: "تم حذف حركة المخزون وتحديث الكمية بنجاح",
      productId: movement.productId,
      newQuantity,
      status
    });
  } catch (error) {
    console.error(`[stock-movements/[movementId]/route.ts] Failed to delete movement ${movementId}:`, error);
    return NextResponse.json({ message: "خطأ في حذف حركة المخزون" }, { status: 500 });
  }
}