// src/app/api/reports/inventory/performance/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Product } from '@/types';

// تعريف نوع البيانات لأداء المنتج
interface ProductPerformance {
  productId: number;
  name: string;
  barcode: string;
  categoryId: number;
  categoryName: string;
  salesCount: number;
  quantitySold: number;
  salesValue: number;
  costValue: number;
  profit: number;
  profitMargin: number;
  returnCount: number;
  returnRate: number;
  stockTurnover: number;
  currentStock: number;
}

// تعريف نوع البيانات لتقرير أداء المنتجات
interface ProductPerformanceReport {
  products: ProductPerformance[];
  topSellers: ProductPerformance[];
  topProfitable: ProductPerformance[];
  summary: {
    totalSales: number;
    totalProfit: number;
    averageProfitMargin: number;
    totalUnitsSold: number;
    totalReturns: number;
    averageReturnRate: number;
  };
}

// GET /api/reports/inventory/performance - Fetch product performance report
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    
    const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    
    console.log('[reports/inventory/performance/route.ts] Received GET request with params:', {
      categoryId, fromDate, toDate
    });
    
    // بناء استعلام جلب أداء المنتجات
    let performanceQuery = `
      SELECT
        p.ProductId as productId,
        p.Name as name,
        p.Barcode as barcode,
        p.CategoryId as categoryId,
        c.Name as categoryName,
        COUNT(si.InvoiceItemId) as salesCount,
        SUM(si.Quantity) as quantitySold,
        SUM(si.LineTotal) as salesValue,
        SUM(si.Quantity * p.PurchasePrice) as costValue,
        SUM(si.LineTotal) - SUM(si.Quantity * p.PurchasePrice) as profit,
        CASE
          WHEN SUM(si.Quantity * p.PurchasePrice) = 0 THEN 0
          ELSE (SUM(si.LineTotal) - SUM(si.Quantity * p.PurchasePrice)) / SUM(si.Quantity * p.PurchasePrice) * 100
        END as profitMargin,
        (
          SELECT COUNT(*) FROM sales.InvoiceItems si2
          JOIN sales.Invoices s ON si2.InvoiceId = s.InvoiceId
          WHERE si2.ProductId = p.ProductId AND s.Status = 'RETURNED'
          AND (@FromDate IS NULL OR s.InvoiceDate >= @fromDate)
          AND (@ToDate IS NULL OR s.InvoiceDate <= @toDate)
        ) as returnCount,
        CASE
          WHEN SUM(si.Quantity) = 0 THEN 0
          ELSE (
            SELECT COUNT(*) FROM sales.InvoiceItems si2
            JOIN sales.Invoices s ON si2.InvoiceId = s.InvoiceId
            WHERE si2.ProductId = p.ProductId AND s.Status = 'RETURNED'
            AND (@FromDate IS NULL OR s.InvoiceDate >= @fromDate)
            AND (@ToDate IS NULL OR s.InvoiceDate <= @toDate)
          ) / SUM(si.Quantity) * 100
        END as returnRate,
        CASE
          WHEN p.Quantity = 0 THEN 0
          ELSE SUM(si.Quantity) / p.Quantity
        END as stockTurnover,
        p.Quantity as currentStock
      FROM inventory.Products p
      LEFT JOIN sales.InvoiceItems si ON p.ProductId = si.ProductId
      LEFT JOIN sales.Invoices s ON si.InvoiceId = s.InvoiceId
      LEFT JOIN inventory.Categories c ON p.CategoryId = c.CategoryId
      WHERE p.CompanyId = @companyId AND p.IsActive = 1
    `;
    
    const params: Record<string, any> = { companyId };
    
    // إضافة الفلاتر إلى الاستعلام
    if (categoryId) {
      performanceQuery += ` AND p.CategoryId = @categoryId`;
      params.categoryId = parseInt(categoryId);
    }
    
    if (fromDate) {
      performanceQuery += ` AND (s.InvoiceDate IS NULL OR s.InvoiceDate >= @fromDate)`;
      params.fromDate = fromDate;
    }
    
    if (toDate) {
      performanceQuery += ` AND (s.InvoiceDate IS NULL OR s.InvoiceDate <= @toDate)`;
      params.toDate = toDate;
    }
    
    // إضافة التجميع والترتيب
    performanceQuery += `
      GROUP BY p.ProductId, p.Name, p.Barcode, p.CategoryId, c.Name, p.Quantity
      ORDER BY SUM(si.LineTotal) DESC
    `;
    
    // استعلام لحساب الملخص
    let summaryQuery = `
      SELECT 
        SUM(si.LineTotal) as totalSales,
        SUM(si.LineTotal) - SUM(si.Quantity * p.PurchasePrice) as totalProfit,
        CASE
          WHEN SUM(si.Quantity * p.PurchasePrice) = 0 THEN 0
          ELSE (SUM(si.LineTotal) - SUM(si.Quantity * p.PurchasePrice)) / SUM(si.Quantity * p.PurchasePrice) * 100
        END as averageProfitMargin,
        SUM(si.Quantity) as totalUnitsSold,
        (
          SELECT COUNT(*) FROM sales.InvoiceItems si2
          JOIN sales.Invoices s ON si2.InvoiceId = s.InvoiceId
          WHERE s.Status = 'RETURNED'
          AND (@FromDate IS NULL OR s.InvoiceDate >= @fromDate)
          AND (@ToDate IS NULL OR s.InvoiceDate <= @toDate)
          AND s.CompanyId = @companyId
        ) as totalReturns,
        CASE
          WHEN SUM(si.Quantity) = 0 THEN 0
          ELSE (
            SELECT COUNT(*) FROM sales.InvoiceItems si2
            JOIN sales.Invoices s ON si2.InvoiceId = s.InvoiceId
            WHERE s.Status = 'RETURNED'
            AND (@FromDate IS NULL OR s.InvoiceDate >= @fromDate)
            AND (@ToDate IS NULL OR s.InvoiceDate <= @toDate)
            AND s.CompanyId = @companyId
          ) / SUM(si.Quantity) * 100
        END as averageReturnRate
      FROM inventory.Products p
      LEFT JOIN sales.InvoiceItems si ON p.ProductId = si.ProductId
      LEFT JOIN sales.Invoices s ON si.InvoiceId = s.InvoiceId
      WHERE p.CompanyId = @companyId AND p.IsActive = 1
    `;
    
    // إضافة الفلاتر إلى استعلام الملخص
    if (categoryId) {
      summaryQuery += ` AND p.CategoryId = @categoryId`;
    }
    
    if (fromDate) {
      summaryQuery += ` AND (s.InvoiceDate IS NULL OR s.InvoiceDate >= @fromDate)`;
    }
    
    if (toDate) {
      summaryQuery += ` AND (s.InvoiceDate IS NULL OR s.InvoiceDate <= @toDate)`;
    }
    
    console.log('[reports/inventory/performance/route.ts] Executing SQL queries for product performance report');
    
    // تنفيذ الاستعلامات
    const [products, summaryResult] = await Promise.all([
      executeQuery<ProductPerformance[]>(performanceQuery, params),
      executeQuery<[{
        totalSales: number;
        totalProfit: number;
        averageProfitMargin: number;
        totalUnitsSold: number;
        totalReturns: number;
        averageReturnRate: number;
      }]>(summaryQuery, params)
    ]);
    
    const summary = summaryResult[0] || {
      totalSales: 0,
      totalProfit: 0,
      averageProfitMargin: 0,
      totalUnitsSold: 0,
      totalReturns: 0,
      averageReturnRate: 0
    };
    
    // استخراج أفضل المنتجات مبيعًا وأكثرها ربحية
    const topSellers = [...products]
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);
    
    const topProfitable = [...products]
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);
    
    console.log(`[reports/inventory/performance/route.ts] Report generated with ${products.length} products`);
    
    const report: ProductPerformanceReport = {
      products,
      topSellers,
      topProfitable,
      summary
    };
    
    return NextResponse.json(report);
  } catch (error) {
    console.error("Failed to generate product performance report:", error);
    return NextResponse.json({ message: "خطأ في إنشاء تقرير أداء المنتجات" }, { status: 500 });
  }
}