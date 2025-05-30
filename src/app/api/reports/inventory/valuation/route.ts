// src/app/api/reports/inventory/valuation/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Product } from '@/types';

// تعريف نوع البيانات للمنتج مع معلومات التقييم
interface ProductValuation extends Product {
  totalCost: number;
  potentialRevenue: number;
  potentialProfit: number;
  profitMargin: number;
  recentPurchasePrices?: string; // JSON string of recent purchase prices
}

// تعريف نوع البيانات لتقرير تقييم المخزون
interface InventoryValuationReport {
  products: ProductValuation[];
  summary: {
    totalProducts: number;
    totalItems: number;
    totalCost: number;
    potentialRevenue: number;
    potentialProfit: number;
    averageProfitMargin: number;
  };
  valuationMethod: string;
}

// GET /api/reports/inventory/valuation - Fetch inventory valuation report
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const valuationMethod = searchParams.get('valuationMethod') || 'FIFO'; // FIFO, LIFO, AVERAGE, STANDARD
    
    const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    
    console.log('[reports/inventory/valuation/route.ts] Received GET request with params:', {
      categoryId, search, valuationMethod
    });
    
    // بناء استعلام جلب المنتجات مع معلومات التقييم
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
        p.Quantity * p.PurchasePrice as totalCost,
        p.Quantity * p.SalePrice as potentialRevenue,
        p.Quantity * (p.SalePrice - p.PurchasePrice) as potentialProfit,
        CASE 
          WHEN p.PurchasePrice = 0 THEN 0
          ELSE ((p.SalePrice - p.PurchasePrice) / p.PurchasePrice) * 100
        END as profitMargin,
        (
          SELECT TOP 10 pi.UnitPrice
          FROM sales.InvoiceItems pi
          JOIN sales.Invoices i ON pi.InvoiceId = i.InvoiceId
          WHERE pi.ProductId = p.ProductId
          ORDER BY i.InvoiceDate DESC
          FOR JSON PATH
        ) as recentPurchasePrices
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
    
    // استعلام لحساب الملخص
    let summaryQuery = `
      SELECT 
        COUNT(p.ProductId) as totalProducts,
        SUM(p.Quantity) as totalItems,
        SUM(p.Quantity * p.PurchasePrice) as totalCost,
        SUM(p.Quantity * p.SalePrice) as potentialRevenue,
        SUM(p.Quantity * (p.SalePrice - p.PurchasePrice)) as potentialProfit,
        CASE 
          WHEN SUM(p.Quantity * p.PurchasePrice) = 0 THEN 0
          ELSE (SUM(p.Quantity * (p.SalePrice - p.PurchasePrice)) / SUM(p.Quantity * p.PurchasePrice)) * 100
        END as averageProfitMargin
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
    
    console.log('[reports/inventory/valuation/route.ts] Executing SQL queries for inventory valuation report');
    
    // تنفيذ الاستعلامات
    const [products, summaryResult] = await Promise.all([
      executeQuery<ProductValuation[]>(productsQuery, params),
      executeQuery<[{
        totalProducts: number;
        totalItems: number;
        totalCost: number;
        potentialRevenue: number;
        potentialProfit: number;
        averageProfitMargin: number;
      }]>(summaryQuery, params)
    ]);
    
    const summary = summaryResult[0] || {
      totalProducts: 0,
      totalItems: 0,
      totalCost: 0,
      potentialRevenue: 0,
      potentialProfit: 0,
      averageProfitMargin: 0
    };
    
    // تعديل قيم المنتجات بناءً على طريقة التقييم المختارة
    // ملاحظة: هذا مجرد مثال، في الواقع يجب تنفيذ منطق أكثر تعقيدًا لطرق التقييم المختلفة
    if (valuationMethod !== 'FIFO') {
      for (const product of products) {
        // تحليل أسعار الشراء الأخيرة (إذا كانت متوفرة)
        let recentPrices: number[] = [];
        if (product.recentPurchasePrices) {
          try {
            recentPrices = JSON.parse(product.recentPurchasePrices).map((item: any) => item.UnitPrice);
          } catch (e) {
            console.error(`Error parsing recent purchase prices for product ${product.productId}:`, e);
          }
        }
        
        // تعديل سعر الشراء وإعادة حساب القيم بناءً على طريقة التقييم
        let adjustedPurchasePrice = product.purchasePrice;
        
        switch (valuationMethod) {
          case 'LIFO':
            // استخدام آخر سعر شراء (إذا كان متوفرًا)
            if (recentPrices.length > 0) {
              adjustedPurchasePrice = recentPrices[0];
            }
            break;
          case 'AVERAGE':
            // استخدام متوسط أسعار الشراء (إذا كانت متوفرة)
            if (recentPrices.length > 0) {
              adjustedPurchasePrice = recentPrices.reduce((sum, price) => sum + price, 0) / recentPrices.length;
            }
            break;
          case 'STANDARD':
            // استخدام سعر الشراء الحالي (لا تغيير)
            break;
        }
        
        // إعادة حساب القيم
        product.purchasePrice = adjustedPurchasePrice;
        product.totalCost = product.quantity * adjustedPurchasePrice;
        product.potentialProfit = product.potentialRevenue - product.totalCost;
        product.profitMargin = adjustedPurchasePrice === 0 ? 0 : (product.potentialProfit / product.totalCost) * 100;
      }
      
      // إعادة حساب الملخص
      summary.totalCost = products.reduce((sum, product) => sum + product.totalCost, 0);
      summary.potentialProfit = summary.potentialRevenue - summary.totalCost;
      summary.averageProfitMargin = summary.totalCost === 0 ? 0 : (summary.potentialProfit / summary.totalCost) * 100;
    }
    
    console.log(`[reports/inventory/valuation/route.ts] Report generated with ${products.length} products using ${valuationMethod} method`);
    
    const report: InventoryValuationReport = {
      products,
      summary,
      valuationMethod
    };
    
    return NextResponse.json(report);
  } catch (error) {
    console.error("Failed to generate inventory valuation report:", error);
    return NextResponse.json({ message: "خطأ في إنشاء تقرير تقييم المخزون" }, { status: 500 });
  }
}