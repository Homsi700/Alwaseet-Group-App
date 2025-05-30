// src/app/api/reports/inventory/status/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Product } from '@/types';

// تعريف نوع البيانات لإحصائيات الفئات
interface CategoryStats {
  categoryId: number;
  name: string;
  productCount: number;
  totalItems: number;
  totalValue: number;
}

// تعريف نوع البيانات لتقرير حالة المخزون
interface InventoryStatusReport {
  products: Product[];
  categoryStats: CategoryStats[];
  summary: {
    totalProducts: number;
    totalItems: number;
    totalValue: number;
    lowStockProducts: number;
    outOfStockProducts: number;
  };
}

// GET /api/reports/inventory/status - Fetch inventory status report
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    
    const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    
    console.log('[reports/inventory/status/route.ts] Received GET request with params:', {
      categoryId, search
    });
    
    // بناء استعلام جلب المنتجات
    let productsQuery = `
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
      JOIN inventory.Categories c ON p.CategoryId = c.CategoryId
      WHERE p.CompanyId = @companyId AND p.IsActive = 1
    `;
    
    const params: Record<string, any> = { companyId };
    
    // إضافة الفلاتر إلى الاستعلام
    if (categoryId) {
      productsQuery += ` AND p.CategoryId = @categoryId`;
      params.categoryId = parseInt(categoryId);
    }
    
    if (search) {
      productsQuery += ` AND (
        p.Name LIKE @search OR 
        p.Barcode LIKE @search OR 
        p.Description LIKE @search
      )`;
      params.search = `%${search}%`;
    }
    
    // إضافة الترتيب
    productsQuery += ` ORDER BY p.Name`;
    
    // استعلام لحساب إحصائيات الفئات
    let categoryStatsQuery = `
      SELECT 
        c.CategoryId as categoryId, 
        c.Name as name, 
        COUNT(p.ProductId) as productCount,
        SUM(p.Quantity) as totalItems, 
        SUM(p.Quantity * p.PurchasePrice) as totalValue
      FROM inventory.Categories c
      LEFT JOIN inventory.Products p ON c.CategoryId = p.CategoryId
      WHERE c.CompanyId = @companyId AND c.IsActive = 1 AND p.IsActive = 1
    `;
    
    // إضافة الفلاتر إلى استعلام الإحصائيات
    if (categoryId) {
      categoryStatsQuery += ` AND c.CategoryId = @categoryId`;
    }
    
    if (search) {
      categoryStatsQuery += ` AND (
        p.Name LIKE @search OR 
        p.Barcode LIKE @search OR 
        p.Description LIKE @search
      )`;
    }
    
    // إضافة التجميع والترتيب
    categoryStatsQuery += `
      GROUP BY c.CategoryId, c.Name
      HAVING COUNT(p.ProductId) > 0
      ORDER BY c.Name
    `;
    
    // استعلام لحساب الملخص
    let summaryQuery = `
      SELECT 
        COUNT(p.ProductId) as totalProducts,
        SUM(p.Quantity) as totalItems,
        SUM(p.Quantity * p.PurchasePrice) as totalValue,
        SUM(CASE WHEN p.Quantity <= p.MinimumQuantity AND p.Quantity > 0 THEN 1 ELSE 0 END) as lowStockProducts,
        SUM(CASE WHEN p.Quantity <= 0 THEN 1 ELSE 0 END) as outOfStockProducts
      FROM inventory.Products p
      WHERE p.CompanyId = @companyId AND p.IsActive = 1
    `;
    
    // إضافة الفلاتر إلى استعلام الملخص
    if (categoryId) {
      summaryQuery += ` AND p.CategoryId = @categoryId`;
    }
    
    if (search) {
      summaryQuery += ` AND (
        p.Name LIKE @search OR 
        p.Barcode LIKE @search OR 
        p.Description LIKE @search
      )`;
    }
    
    console.log('[reports/inventory/status/route.ts] Executing SQL queries for inventory status report');
    
    // تنفيذ الاستعلامات
    const [products, categoryStats, summaryResult] = await Promise.all([
      executeQuery<Product[]>(productsQuery, params),
      executeQuery<CategoryStats[]>(categoryStatsQuery, params),
      executeQuery<[{
        totalProducts: number;
        totalItems: number;
        totalValue: number;
        lowStockProducts: number;
        outOfStockProducts: number;
      }]>(summaryQuery, params)
    ]);
    
    const summary = summaryResult[0] || {
      totalProducts: 0,
      totalItems: 0,
      totalValue: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0
    };
    
    console.log(`[reports/inventory/status/route.ts] Report generated with ${products.length} products and ${categoryStats.length} categories`);
    
    const report: InventoryStatusReport = {
      products,
      categoryStats,
      summary
    };
    
    return NextResponse.json(report);
  } catch (error) {
    console.error("Failed to generate inventory status report:", error);
    return NextResponse.json({ message: "خطأ في إنشاء تقرير حالة المخزون" }, { status: 500 });
  }
}