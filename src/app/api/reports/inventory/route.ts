import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// تعريف نوع البيانات لتقرير المخزون العام
interface InventoryReport {
  summary: {
    totalItems: number;
    totalQuantity: number;
    totalValue: number;
    lowStock: number;
    outOfStock: number;
  };
  categories: {
    categoryId: number;
    name: string;
    count: number;
    quantity: number;
    value: number;
  }[];
  lowStockItems: {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    minQuantity: number;
    category: string;
  }[];
  topItems: {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    category: string;
    value: number;
  }[];
}

// الحصول على تقرير المخزون
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    
    const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    
    console.log('[reports/inventory/route.ts] Received GET request for general inventory report');
    
    // بناء الاستعلامات مع مراعاة فلتر الفئة
    const params: Record<string, any> = { companyId };
    
    let categoryFilter = '';
    if (categoryId) {
      categoryFilter = ' AND p.CategoryId = @categoryId';
      params.categoryId = parseInt(categoryId);
    }
    
    // استعلام لحساب ملخص المخزون
    const summaryQuery = `
      SELECT 
        COUNT(p.ProductId) as totalItems,
        SUM(p.Quantity) as totalQuantity,
        SUM(p.Quantity * p.PurchasePrice) as totalValue,
        SUM(CASE WHEN p.Quantity > 0 AND p.Quantity <= p.MinimumQuantity THEN 1 ELSE 0 END) as lowStock,
        SUM(CASE WHEN p.Quantity <= 0 THEN 1 ELSE 0 END) as outOfStock
      FROM inventory.Products p
      WHERE p.CompanyId = @companyId AND p.IsActive = 1${categoryFilter}
    `;
    
    // استعلام لحساب المخزون حسب الفئة
    const categoriesQuery = `
      SELECT 
        c.CategoryId as categoryId,
        c.Name as name,
        COUNT(p.ProductId) as count,
        SUM(p.Quantity) as quantity,
        SUM(p.Quantity * p.PurchasePrice) as value
      FROM inventory.Categories c
      LEFT JOIN inventory.Products p ON c.CategoryId = p.CategoryId
      WHERE c.CompanyId = @companyId AND c.IsActive = 1 AND p.IsActive = 1${categoryFilter}
      GROUP BY c.CategoryId, c.Name
      HAVING COUNT(p.ProductId) > 0
      ORDER BY SUM(p.Quantity * p.PurchasePrice) DESC
    `;
    
    // استعلام للحصول على المنتجات منخفضة المخزون
    const lowStockQuery = `
      SELECT 
        'prod_' + CAST(p.ProductId AS NVARCHAR) as id,
        p.Name as name,
        p.Barcode as sku,
        p.Quantity as quantity,
        p.MinimumQuantity as minQuantity,
        c.Name as category
      FROM inventory.Products p
      LEFT JOIN inventory.Categories c ON p.CategoryId = c.CategoryId
      WHERE p.CompanyId = @companyId AND p.IsActive = 1
        AND p.Quantity > 0 AND p.Quantity <= p.MinimumQuantity${categoryFilter}
      ORDER BY p.Quantity ASC
    `;
    
    // استعلام للحصول على المنتجات الأعلى قيمة
    const topItemsQuery = `
      SELECT TOP 10
        'prod_' + CAST(p.ProductId AS NVARCHAR) as id,
        p.Name as name,
        p.Barcode as sku,
        p.Quantity as quantity,
        c.Name as category,
        p.Quantity * p.PurchasePrice as value
      FROM inventory.Products p
      LEFT JOIN inventory.Categories c ON p.CategoryId = c.CategoryId
      WHERE p.CompanyId = @companyId AND p.IsActive = 1${categoryFilter}
      ORDER BY p.Quantity * p.PurchasePrice DESC, p.Quantity DESC
    `;
    
    console.log('[reports/inventory/route.ts] Executing SQL queries for general inventory report');
    
    // تنفيذ الاستعلامات
    const [summaryResult, categories, lowStockItems, topItems] = await Promise.all([
      executeQuery(summaryQuery, params),
      executeQuery(categoriesQuery, params),
      executeQuery(lowStockQuery, params),
      executeQuery(topItemsQuery, params)
    ]);
    
    const summary = summaryResult[0] || {
      totalItems: 0,
      totalQuantity: 0,
      totalValue: 0,
      lowStock: 0,
      outOfStock: 0
    };
    
    console.log(`[reports/inventory/route.ts] Report generated with ${summary.totalItems} products`);
    
    const report: InventoryReport = {
      summary,
      categories,
      lowStockItems,
      topItems
    };
    
    return NextResponse.json(report);
  } catch (error) {
    console.error('خطأ في الحصول على تقرير المخزون:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء الحصول على تقرير المخزون' }, { status: 500 });
  }
}