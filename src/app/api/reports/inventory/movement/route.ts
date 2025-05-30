// src/app/api/reports/inventory/movement/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// تعريف نوع البيانات لحركة المخزون
interface StockMovement {
  movementId: number;
  productId: number;
  productName: string;
  productSku: string;
  categoryId: number;
  categoryName: string;
  type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN';
  quantity: number;
  date: string;
  reference?: string;
  notes?: string;
  userId: number;
  userName: string;
  createdAt: string;
}

// تعريف نوع البيانات لإحصائيات الحركة
interface MovementStats {
  totalIn: number;
  totalOut: number;
  netChange: number;
  totalMovements: number;
}

// تعريف نوع البيانات لحركة المخزون حسب الفترات الزمنية
interface MovementByDate {
  date: string;
  totalIn: number;
  totalOut: number;
}

// تعريف نوع البيانات لتقرير حركة المخزون
interface StockMovementReport {
  movements: StockMovement[];
  stats: MovementStats;
  movementsByDate: MovementByDate[];
}

// GET /api/reports/inventory/movement - Fetch stock movement report
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const categoryId = searchParams.get('categoryId');
    const productId = searchParams.get('productId');
    const type = searchParams.get('type');
    
    const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    
    console.log('[reports/inventory/movement/route.ts] Received GET request with params:', {
      fromDate, toDate, categoryId, productId, type
    });
    
    // بناء استعلام جلب حركات المخزون
    let movementsQuery = `
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
    
    const params: Record<string, any> = { companyId };
    
    // إضافة الفلاتر إلى الاستعلام
    if (fromDate) {
      movementsQuery += ` AND sm.Date >= @fromDate`;
      params.fromDate = fromDate;
    }
    
    if (toDate) {
      movementsQuery += ` AND sm.Date <= @toDate`;
      params.toDate = toDate;
    }
    
    if (categoryId) {
      movementsQuery += ` AND p.CategoryId = @categoryId`;
      params.categoryId = parseInt(categoryId);
    }
    
    if (productId) {
      movementsQuery += ` AND sm.ProductId = @productId`;
      params.productId = parseInt(productId);
    }
    
    if (type) {
      movementsQuery += ` AND sm.Type = @type`;
      params.type = type;
    }
    
    // إضافة الترتيب
    movementsQuery += ` ORDER BY sm.Date DESC, sm.MovementId DESC`;
    
    // استعلام لحساب إحصائيات الحركة
    let statsQuery = `
      SELECT
        SUM(CASE WHEN sm.Quantity > 0 THEN sm.Quantity ELSE 0 END) as totalIn,
        SUM(CASE WHEN sm.Quantity < 0 THEN ABS(sm.Quantity) ELSE 0 END) as totalOut,
        SUM(sm.Quantity) as netChange,
        COUNT(sm.MovementId) as totalMovements
      FROM inventory.StockMovements sm
      JOIN inventory.Products p ON sm.ProductId = p.ProductId
      WHERE p.CompanyId = @companyId
    `;
    
    // إضافة الفلاتر إلى استعلام الإحصائيات
    if (fromDate) {
      statsQuery += ` AND sm.Date >= @fromDate`;
    }
    
    if (toDate) {
      statsQuery += ` AND sm.Date <= @toDate`;
    }
    
    if (categoryId) {
      statsQuery += ` AND p.CategoryId = @categoryId`;
    }
    
    if (productId) {
      statsQuery += ` AND sm.ProductId = @productId`;
    }
    
    if (type) {
      statsQuery += ` AND sm.Type = @type`;
    }
    
    // استعلام لحساب حركة المخزون حسب الفترات الزمنية
    let movementsByDateQuery = `
      SELECT
        CONVERT(DATE, sm.Date) as date,
        SUM(CASE WHEN sm.Quantity > 0 THEN sm.Quantity ELSE 0 END) as totalIn,
        SUM(CASE WHEN sm.Quantity < 0 THEN ABS(sm.Quantity) ELSE 0 END) as totalOut
      FROM inventory.StockMovements sm
      JOIN inventory.Products p ON sm.ProductId = p.ProductId
      WHERE p.CompanyId = @companyId
    `;
    
    // إضافة الفلاتر إلى استعلام الحركة حسب التاريخ
    if (fromDate) {
      movementsByDateQuery += ` AND sm.Date >= @fromDate`;
    }
    
    if (toDate) {
      movementsByDateQuery += ` AND sm.Date <= @toDate`;
    }
    
    if (categoryId) {
      movementsByDateQuery += ` AND p.CategoryId = @categoryId`;
    }
    
    if (productId) {
      movementsByDateQuery += ` AND sm.ProductId = @productId`;
    }
    
    if (type) {
      movementsByDateQuery += ` AND sm.Type = @type`;
    }
    
    // إضافة التجميع والترتيب
    movementsByDateQuery += `
      GROUP BY CONVERT(DATE, sm.Date)
      ORDER BY CONVERT(DATE, sm.Date)
    `;
    
    console.log('[reports/inventory/movement/route.ts] Executing SQL queries for stock movement report');
    
    // تنفيذ الاستعلامات
    const [movements, statsResult, movementsByDate] = await Promise.all([
      executeQuery<StockMovement[]>(movementsQuery, params),
      executeQuery<[MovementStats]>(statsQuery, params),
      executeQuery<MovementByDate[]>(movementsByDateQuery, params)
    ]);
    
    const stats = statsResult[0] || {
      totalIn: 0,
      totalOut: 0,
      netChange: 0,
      totalMovements: 0
    };
    
    console.log(`[reports/inventory/movement/route.ts] Report generated with ${movements.length} movements and ${movementsByDate.length} date periods`);
    
    const report: StockMovementReport = {
      movements,
      stats,
      movementsByDate
    };
    
    return NextResponse.json(report);
  } catch (error) {
    console.error("Failed to generate stock movement report:", error);
    return NextResponse.json({ message: "خطأ في إنشاء تقرير حركة المخزون" }, { status: 500 });
  }
}