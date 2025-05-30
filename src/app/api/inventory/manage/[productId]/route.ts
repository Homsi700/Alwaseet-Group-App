// src/app/api/inventory/manage/[productId]/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Product } from '@/types';

// تعريف نوع البيانات لحركة المخزون
interface StockMovement {
  movementId: number;
  productId: number;
  type: string;
  quantity: number;
  date: string;
  reference?: string;
  notes?: string;
  userId: number;
  userName?: string;
  createdAt: string;
}

// GET /api/inventory/manage/{productId} - Fetch product inventory details
export async function GET(request: Request, { params }: { params: { productId: string } }) {
  const productId = parseInt(params.productId);
  const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
  
  try {
    console.log(`[inventory/manage/[productId]/route.ts] Received GET request for product ID: ${productId}`);
    
    // جلب تفاصيل المنتج
    const productQuery = `
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
        p.MaximumQuantity as maximumQuantity,
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
      WHERE p.ProductId = @productId AND p.CompanyId = @companyId AND p.IsActive = 1
    `;
    
    // جلب حركات المخزون للمنتج
    const movementsQuery = `
      SELECT TOP 10
        sm.MovementId as movementId,
        sm.ProductId as productId,
        sm.Type as type,
        sm.Quantity as quantity,
        sm.Date as date,
        sm.Reference as reference,
        sm.Notes as notes,
        sm.UserId as userId,
        u.FirstName + ' ' + u.LastName as userName,
        sm.CreatedAt as createdAt
      FROM inventory.StockMovements sm
      LEFT JOIN settings.Users u ON sm.UserId = u.UserId
      WHERE sm.ProductId = @productId
      ORDER BY sm.Date DESC, sm.MovementId DESC
    `;
    
    // جلب إحصائيات المخزون للمنتج
    const statsQuery = `
      SELECT
        SUM(CASE WHEN sm.Quantity > 0 THEN sm.Quantity ELSE 0 END) as totalIn,
        SUM(CASE WHEN sm.Quantity < 0 THEN ABS(sm.Quantity) ELSE 0 END) as totalOut,
        SUM(sm.Quantity) as netChange,
        COUNT(sm.MovementId) as totalMovements,
        MAX(sm.Date) as lastMovementDate
      FROM inventory.StockMovements sm
      WHERE sm.ProductId = @productId
    `;
    
    // تنفيذ الاستعلامات
    const [products, movements, statsResult] = await Promise.all([
      executeQuery<Product[]>(productQuery, { productId, companyId }),
      executeQuery<StockMovement[]>(movementsQuery, { productId }),
      executeQuery<[{
        totalIn: number;
        totalOut: number;
        netChange: number;
        totalMovements: number;
        lastMovementDate: string;
      }]>(statsQuery, { productId })
    ]);
    
    if (!products || products.length === 0) {
      console.log(`[inventory/manage/[productId]/route.ts] Product with ID ${productId} not found`);
      return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
    }
    
    const product = products[0];
    
    const stats = statsResult[0] || {
      totalIn: 0,
      totalOut: 0,
      netChange: 0,
      totalMovements: 0,
      lastMovementDate: null
    };
    
    console.log(`[inventory/manage/[productId]/route.ts] Found product with ${movements.length} recent movements`);
    
    return NextResponse.json({
      product,
      movements,
      stats
    });
  } catch (error) {
    console.error(`[inventory/manage/[productId]/route.ts] Failed to fetch product inventory details ${productId}:`, error);
    return NextResponse.json({ message: "خطأ في جلب تفاصيل المخزون للمنتج" }, { status: 500 });
  }
}

// PUT /api/inventory/manage/{productId} - Update product inventory settings
export async function PUT(request: Request, { params }: { params: { productId: string } }) {
  const productId = parseInt(params.productId);
  const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
  
  try {
    console.log(`[inventory/manage/[productId]/route.ts] Received PUT request for product ID: ${productId}`);
    
    // Parse request body
    const bodyText = await request.text();
    console.log("[inventory/manage/[productId]/route.ts] Request body:", bodyText);
    
    let body;
    try {
      body = JSON.parse(bodyText) as {
        minimumQuantity?: number;
        maximumQuantity?: number;
        unitOfMeasure?: string;
      };
    } catch (e) {
      console.error("[inventory/manage/[productId]/route.ts] Error parsing JSON:", e);
      return NextResponse.json({ message: "خطأ في تنسيق البيانات" }, { status: 400 });
    }
    
    // التحقق من وجود المنتج
    const checkProductQuery = `
      SELECT ProductId FROM inventory.Products 
      WHERE ProductId = @productId AND CompanyId = @companyId AND IsActive = 1
    `;
    
    const existingProducts = await executeQuery<any[]>(checkProductQuery, { productId, companyId });
    
    if (!existingProducts || existingProducts.length === 0) {
      console.log(`[inventory/manage/[productId]/route.ts] Product with ID ${productId} not found`);
      return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
    }
    
    // بناء استعلام التحديث ديناميكياً بناءً على الحقول المتوفرة في الطلب
    let updateFields = [];
    let params: Record<string, any> = { productId, companyId };
    
    if (body.minimumQuantity !== undefined) {
      updateFields.push("MinimumQuantity = @minimumQuantity");
      params.minimumQuantity = body.minimumQuantity;
    }
    
    if (body.maximumQuantity !== undefined) {
      updateFields.push("MaximumQuantity = @maximumQuantity");
      params.maximumQuantity = body.maximumQuantity;
    }
    
    if (body.unitOfMeasure !== undefined) {
      updateFields.push("UnitOfMeasure = @unitOfMeasure");
      params.unitOfMeasure = body.unitOfMeasure;
    }
    
    // إضافة حقول التحديث الإلزامية
    updateFields.push("UpdatedAt = GETDATE()");
    
    // إذا لم تكن هناك حقول للتحديث، فلا داعي للاستمرار
    if (updateFields.length === 0) {
      return NextResponse.json({ message: "لم يتم تحديد أي حقول للتحديث" }, { status: 400 });
    }
    
    // تنفيذ استعلام التحديث
    const updateQuery = `
      UPDATE inventory.Products 
      SET ${updateFields.join(", ")} 
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
        p.MaximumQuantity as maximumQuantity,
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
    
    console.log(`[inventory/manage/[productId]/route.ts] Executing SQL update query for product ID: ${productId}`);
    console.log(`[inventory/manage/[productId]/route.ts] Update fields: ${updateFields.join(", ")}`);
    
    const updatedProducts = await executeQuery<Product[]>(updateQuery, params);
    
    if (!updatedProducts || updatedProducts.length === 0) {
      throw new Error("فشل في استرجاع المنتج المحدث من قاعدة البيانات");
    }
    
    const updatedProduct = updatedProducts[0];
    console.log(`[inventory/manage/[productId]/route.ts] Product inventory settings updated successfully:`, updatedProduct);
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(`[inventory/manage/[productId]/route.ts] Failed to update product inventory settings ${productId}:`, error);
    return NextResponse.json({ message: "خطأ في تحديث إعدادات المخزون للمنتج" }, { status: 500 });
  }
}