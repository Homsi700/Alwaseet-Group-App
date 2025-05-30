// src/app/api/inventory/stock-movements/route.ts
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

// GET /api/inventory/stock-movements - Fetch stock movements with filtering
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const type = searchParams.get('type');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    
    console.log('[stock-movements/route.ts] Received GET request with params:', {
      productId, type, fromDate, toDate, categoryId, search, page, limit
    });
    
    // بناء استعلام جلب حركات المخزون
    let query = `
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
      WHERE p.CompanyId = @companyId
    `;
    
    const params: Record<string, any> = { companyId, offset, limit };
    
    // إضافة الفلاتر إلى الاستعلام
    if (productId) {
      query += ` AND sm.ProductId = @productId`;
      params.productId = parseInt(productId);
    }
    
    if (type) {
      query += ` AND sm.Type = @type`;
      params.type = type;
    }
    
    if (fromDate) {
      query += ` AND sm.Date >= @fromDate`;
      params.fromDate = fromDate;
    }
    
    if (toDate) {
      query += ` AND sm.Date <= @toDate`;
      params.toDate = toDate;
    }
    
    if (categoryId) {
      query += ` AND p.CategoryId = @categoryId`;
      params.categoryId = parseInt(categoryId);
    }
    
    if (search) {
      query += ` AND (
        p.Name LIKE @search OR 
        p.Barcode LIKE @search OR 
        sm.Reference LIKE @search OR 
        sm.Notes LIKE @search
      )`;
      params.search = `%${search}%`;
    }
    
    // إضافة الترتيب والصفحات
    query += `
      ORDER BY sm.Date DESC, sm.MovementId DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;
    
    // استعلام لحساب إجمالي عدد السجلات (للصفحات)
    let countQuery = `
      SELECT COUNT(*) as totalCount
      FROM inventory.StockMovements sm
      JOIN inventory.Products p ON sm.ProductId = p.ProductId
      LEFT JOIN inventory.Categories c ON p.CategoryId = c.CategoryId
      WHERE p.CompanyId = @companyId
    `;
    
    // إضافة نفس الفلاتر إلى استعلام العدد
    if (productId) {
      countQuery += ` AND sm.ProductId = @productId`;
    }
    
    if (type) {
      countQuery += ` AND sm.Type = @type`;
    }
    
    if (fromDate) {
      countQuery += ` AND sm.Date >= @fromDate`;
    }
    
    if (toDate) {
      countQuery += ` AND sm.Date <= @toDate`;
    }
    
    if (categoryId) {
      countQuery += ` AND p.CategoryId = @categoryId`;
    }
    
    if (search) {
      countQuery += ` AND (
        p.Name LIKE @search OR 
        p.Barcode LIKE @search OR 
        sm.Reference LIKE @search OR 
        sm.Notes LIKE @search
      )`;
    }
    
    console.log('[stock-movements/route.ts] Executing SQL query for stock movements');
    
    // تنفيذ الاستعلامات
    const [movements, countResult] = await Promise.all([
      executeQuery<StockMovement[]>(query, params),
      executeQuery<[{ totalCount: number }]>(countQuery, params)
    ]);
    
    const totalCount = countResult[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    console.log(`[stock-movements/route.ts] Found ${movements.length} stock movements, total: ${totalCount}`);
    
    return NextResponse.json({
      items: movements,
      totalItems: totalCount,
      totalPages,
      currentPage: page
    });
  } catch (error) {
    console.error("Failed to fetch stock movements:", error);
    return NextResponse.json({ message: "خطأ في جلب حركات المخزون" }, { status: 500 });
  }
}

// POST /api/inventory/stock-movements - Create a new stock movement
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // التحقق من البيانات المطلوبة
    if (!body.productId || !body.type || body.quantity === undefined) {
      return NextResponse.json(
        { message: "البيانات المطلوبة غير مكتملة" },
        { status: 400 }
      );
    }
    
    const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    const userId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    
    console.log('[stock-movements/route.ts] Received POST request for new stock movement:', body);
    
    // التحقق من وجود المنتج
    const checkProductQuery = `
      SELECT ProductId, Quantity
      FROM inventory.Products
      WHERE ProductId = @productId AND CompanyId = @companyId AND IsActive = 1
    `;
    
    const products = await executeQuery<[{ ProductId: number, Quantity: number }]>(
      checkProductQuery, 
      { productId: body.productId, companyId }
    );
    
    if (!products || products.length === 0) {
      return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
    }
    
    const currentQuantity = products[0].Quantity;
    
    // بدء معاملة لضمان تحديث المخزون وإضافة الحركة معًا
    // ملاحظة: في الإنتاج، يجب استخدام معاملات قاعدة البيانات الحقيقية
    
    // إضافة حركة المخزون
    const insertMovementQuery = `
      INSERT INTO inventory.StockMovements (
        ProductId, Type, Quantity, Date, Reference, Notes, UserId, CreatedAt
      )
      VALUES (
        @productId, @type, @quantity, @date, @reference, @notes, @userId, GETDATE()
      );
      
      SELECT SCOPE_IDENTITY() as movementId;
    `;
    
    const movementResult = await executeQuery<[{ movementId: number }]>(insertMovementQuery, {
      productId: body.productId,
      type: body.type,
      quantity: body.quantity,
      date: body.date || new Date().toISOString(),
      reference: body.reference || null,
      notes: body.notes || null,
      userId
    });
    
    if (!movementResult || movementResult.length === 0) {
      throw new Error("فشل في إنشاء حركة المخزون");
    }
    
    const movementId = movementResult[0].movementId;
    
    // تحديث كمية المنتج
    let newQuantity = currentQuantity;
    
    // تحديث الكمية بناءً على نوع الحركة
    switch (body.type) {
      case 'PURCHASE':
      case 'RETURN':
        newQuantity += body.quantity;
        break;
      case 'SALE':
        newQuantity -= body.quantity;
        break;
      case 'ADJUSTMENT':
        newQuantity = body.quantity; // تعيين الكمية مباشرة للتعديل
        break;
    }
    
    // تحديث حالة المنتج بناءً على الكمية الجديدة
    let status = 'ACTIVE';
    if (newQuantity <= 0) {
      status = 'OUT_OF_STOCK';
    } else if (products[0].MinimumQuantity && newQuantity <= products[0].MinimumQuantity) {
      status = 'LOW_STOCK';
    }
    
    // تحديث المنتج
    const updateProductQuery = `
      UPDATE inventory.Products
      SET 
        Quantity = @newQuantity,
        Status = @status,
        UpdatedAt = GETDATE()
      WHERE ProductId = @productId AND CompanyId = @companyId;
    `;
    
    await executeQuery(updateProductQuery, {
      productId: body.productId,
      newQuantity,
      status,
      companyId
    });
    
    // جلب حركة المخزون المضافة مع معلومات المنتج
    const getMovementQuery = `
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
    
    const movements = await executeQuery<StockMovement[]>(getMovementQuery, { movementId });
    
    if (!movements || movements.length === 0) {
      throw new Error("فشل في استرجاع حركة المخزون المضافة");
    }
    
    const newMovement = movements[0];
    
    console.log('[stock-movements/route.ts] Stock movement created successfully:', newMovement);
    
    return NextResponse.json(newMovement, { status: 201 });
  } catch (error) {
    console.error("Failed to create stock movement:", error);
    return NextResponse.json({ message: "خطأ في إنشاء حركة المخزون" }, { status: 500 });
  }
}