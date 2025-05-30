// src/app/api/reports/inventory/low-stock/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Product } from '@/types';

// تعريف نوع البيانات للمنتج منخفض المخزون
interface LowStockProduct extends Product {
  recommendedPurchase: number;
  status: 'LOW_STOCK' | 'OUT_OF_STOCK';
}

// تعريف نوع البيانات لتقرير المنتجات منخفضة المخزون
interface LowStockReport {
  products: LowStockProduct[];
  summary: {
    totalLowStockProducts: number;
    totalOutOfStockProducts: number;
    totalRecommendedPurchase: number;
    estimatedPurchaseCost: number;
  };
}

// GET /api/reports/inventory/low-stock - Fetch low stock products report
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status'); // 'LOW_STOCK' or 'OUT_OF_STOCK' or null for both
    
    const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    
    console.log('[reports/inventory/low-stock/route.ts] Received GET request with params:', {
      categoryId, status
    });
    
    // بناء استعلام جلب المنتجات منخفضة المخزون
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
        END as status,
        CASE
          WHEN p.Quantity <= 0 THEN p.MaximumQuantity
          ELSE p.MaximumQuantity - p.Quantity
        END as recommendedPurchase
      FROM inventory.Products p
      JOIN inventory.Categories c ON p.CategoryId = c.CategoryId
      WHERE p.CompanyId = @companyId AND p.IsActive = 1
        AND (p.Quantity <= p.MinimumQuantity OR p.Quantity <= 0)
    `;
    
    const params: Record<string, any> = { companyId };
    
    // إضافة الفلاتر إلى الاستعلام
    if (categoryId) {
      productsQuery += ` AND p.CategoryId = @categoryId`;
      params.categoryId = parseInt(categoryId);
    }
    
    if (status) {
      if (status === 'LOW_STOCK') {
        productsQuery += ` AND p.Quantity > 0 AND p.Quantity <= p.MinimumQuantity`;
      } else if (status === 'OUT_OF_STOCK') {
        productsQuery += ` AND p.Quantity <= 0`;
      }
    }
    
    // إضافة الترتيب
    productsQuery += ` ORDER BY p.Quantity ASC, p.Name ASC`;
    
    // استعلام لحساب الملخص
    let summaryQuery = `
      SELECT 
        SUM(CASE WHEN p.Quantity > 0 AND p.Quantity <= p.MinimumQuantity THEN 1 ELSE 0 END) as totalLowStockProducts,
        SUM(CASE WHEN p.Quantity <= 0 THEN 1 ELSE 0 END) as totalOutOfStockProducts,
        SUM(CASE
          WHEN p.Quantity <= 0 THEN p.MaximumQuantity
          ELSE p.MaximumQuantity - p.Quantity
        END) as totalRecommendedPurchase,
        SUM(CASE
          WHEN p.Quantity <= 0 THEN p.MaximumQuantity * p.PurchasePrice
          ELSE (p.MaximumQuantity - p.Quantity) * p.PurchasePrice
        END) as estimatedPurchaseCost
      FROM inventory.Products p
      WHERE p.CompanyId = @companyId AND p.IsActive = 1
        AND (p.Quantity <= p.MinimumQuantity OR p.Quantity <= 0)
    `;
    
    // إضافة الفلاتر إلى استعلام الملخص
    if (categoryId) {
      summaryQuery += ` AND p.CategoryId = @categoryId`;
    }
    
    if (status) {
      if (status === 'LOW_STOCK') {
        summaryQuery += ` AND p.Quantity > 0 AND p.Quantity <= p.MinimumQuantity`;
      } else if (status === 'OUT_OF_STOCK') {
        summaryQuery += ` AND p.Quantity <= 0`;
      }
    }
    
    console.log('[reports/inventory/low-stock/route.ts] Executing SQL queries for low stock report');
    
    // تنفيذ الاستعلامات
    const [products, summaryResult] = await Promise.all([
      executeQuery<LowStockProduct[]>(productsQuery, params),
      executeQuery<[{
        totalLowStockProducts: number;
        totalOutOfStockProducts: number;
        totalRecommendedPurchase: number;
        estimatedPurchaseCost: number;
      }]>(summaryQuery, params)
    ]);
    
    const summary = summaryResult[0] || {
      totalLowStockProducts: 0,
      totalOutOfStockProducts: 0,
      totalRecommendedPurchase: 0,
      estimatedPurchaseCost: 0
    };
    
    console.log(`[reports/inventory/low-stock/route.ts] Report generated with ${products.length} low stock products`);
    
    const report: LowStockReport = {
      products,
      summary
    };
    
    return NextResponse.json(report);
  } catch (error) {
    console.error("Failed to generate low stock report:", error);
    return NextResponse.json({ message: "خطأ في إنشاء تقرير المنتجات منخفضة المخزون" }, { status: 500 });
  }
}