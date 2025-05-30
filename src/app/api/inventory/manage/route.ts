// src/app/api/inventory/manage/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Product } from '@/types';

// تعريف نوع البيانات لعملية تعديل المخزون
interface InventoryAdjustment {
  productId: number;
  quantity: number;
  operation: 'ADD' | 'SUBTRACT' | 'SET';
  reason: string;
  notes?: string;
  reference?: string;
}

// POST /api/inventory/manage - Adjust inventory quantity
export async function POST(request: Request) {
  try {
    const body = await request.json() as InventoryAdjustment;
    
    // التحقق من البيانات المطلوبة
    if (!body.productId || body.quantity === undefined || !body.operation || !body.reason) {
      return NextResponse.json(
        { message: "البيانات المطلوبة غير مكتملة" },
        { status: 400 }
      );
    }
    
    const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    const userId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    
    console.log('[inventory/manage/route.ts] Received POST request for inventory adjustment:', body);
    
    // التحقق من وجود المنتج
    const checkProductQuery = `
      SELECT ProductId, Quantity, MinimumQuantity
      FROM inventory.Products
      WHERE ProductId = @productId AND CompanyId = @companyId AND IsActive = 1
    `;
    
    const products = await executeQuery<[{ ProductId: number, Quantity: number, MinimumQuantity: number }]>(
      checkProductQuery, 
      { productId: body.productId, companyId }
    );
    
    if (!products || products.length === 0) {
      return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
    }
    
    const currentQuantity = products[0].Quantity;
    const minimumQuantity = products[0].MinimumQuantity || 0;
    
    // حساب الكمية الجديدة بناءً على نوع العملية
    let newQuantity = currentQuantity;
    let movementQuantity = body.quantity;
    
    switch (body.operation) {
      case 'ADD':
        newQuantity += body.quantity;
        break;
      case 'SUBTRACT':
        newQuantity -= body.quantity;
        movementQuantity = -body.quantity; // تحويل الكمية إلى سالبة للحركة
        break;
      case 'SET':
        movementQuantity = body.quantity - currentQuantity; // الفرق بين الكمية الجديدة والحالية
        newQuantity = body.quantity;
        break;
    }
    
    // التحقق من أن الكمية الجديدة ليست سالبة (إلا إذا كان مسموحًا بذلك)
    if (newQuantity < 0) {
      return NextResponse.json({ 
        message: "لا يمكن أن تكون الكمية سالبة",
        currentQuantity,
        requestedChange: movementQuantity
      }, { status: 400 });
    }
    
    // تحديد حالة المنتج بناءً على الكمية الجديدة
    let status = 'ACTIVE';
    if (newQuantity <= 0) {
      status = 'OUT_OF_STOCK';
    } else if (newQuantity <= minimumQuantity) {
      status = 'LOW_STOCK';
    }
    
    // بدء معاملة لضمان تحديث المخزون وإضافة الحركة معًا
    
    // إضافة حركة المخزون
    const insertMovementQuery = `
      INSERT INTO inventory.StockMovements (
        ProductId, Type, Quantity, Date, Reference, Notes, UserId, CreatedAt
      )
      VALUES (
        @productId, 'ADJUSTMENT', @quantity, GETDATE(), @reference, @notes, @userId, GETDATE()
      );
      
      SELECT SCOPE_IDENTITY() as movementId;
    `;
    
    const movementResult = await executeQuery<[{ movementId: number }]>(insertMovementQuery, {
      productId: body.productId,
      quantity: movementQuantity,
      reference: body.reference || `Adjustment: ${body.operation}`,
      notes: body.notes || body.reason,
      userId
    });
    
    if (!movementResult || movementResult.length === 0) {
      throw new Error("فشل في إنشاء حركة المخزون");
    }
    
    const movementId = movementResult[0].movementId;
    
    // تحديث المنتج
    const updateProductQuery = `
      UPDATE inventory.Products
      SET 
        Quantity = @newQuantity,
        Status = @status,
        UpdatedAt = GETDATE()
      WHERE ProductId = @productId AND CompanyId = @companyId;
      
      -- إرجاع المنتج المحدث
      SELECT 
        p.ProductId as productId,
        'prod_' + CAST(p.ProductId AS NVARCHAR) as id,
        p.Name as name,
        p.Barcode as barcode,
        p.Description as description,
        p.CategoryId as categoryId,
        c.Name as categoryName,
        p.PurchasePrice as purchasePrice,
        p.SalePrice as salePrice,
        p.Quantity as quantity,
        p.UnitOfMeasure as unitOfMeasure,
        p.MinimumQuantity as minimumQuantity,
        p.ImageUrl as imageUrl,
        p.CompanyId as companyId,
        p.IsActive as isActive,
        CASE 
          WHEN p.Quantity <= 0 THEN 'OUT_OF_STOCK'
          WHEN p.Quantity <= p.MinimumQuantity THEN 'LOW_STOCK'
          ELSE 'ACTIVE'
        END as status
      FROM inventory.Products p
      LEFT JOIN inventory.Categories c ON p.CategoryId = c.CategoryId
      WHERE p.ProductId = @productId AND p.CompanyId = @companyId;
    `;
    
    const updatedProducts = await executeQuery<Product[]>(updateProductQuery, {
      productId: body.productId,
      newQuantity,
      status,
      companyId
    });
    
    if (!updatedProducts || updatedProducts.length === 0) {
      throw new Error("فشل في تحديث المنتج");
    }
    
    const updatedProduct = updatedProducts[0];
    
    console.log('[inventory/manage/route.ts] Inventory adjusted successfully:', {
      productId: body.productId,
      oldQuantity: currentQuantity,
      newQuantity,
      change: movementQuantity,
      movementId
    });
    
    return NextResponse.json({
      product: updatedProduct,
      adjustment: {
        movementId,
        oldQuantity: currentQuantity,
        newQuantity,
        change: movementQuantity,
        operation: body.operation,
        reason: body.reason,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Failed to adjust inventory:", error);
    return NextResponse.json({ message: "خطأ في تعديل المخزون" }, { status: 500 });
  }
}