// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Product } from '@/types';
import fs from 'fs';
import path from 'path';

// Default mock data
const defaultProducts: Product[] = [
  { productId: 1, id: "prod_1", name: "تفاح عضوي (1 كجم)", barcode: "APL001", purchasePrice: 0.5, salePrice: 1.0, quantity: 100, expirationDate: "2024-12-31", categoryId: 1, categoryName: "فواكه", supplier: "مزارع خضراء", companyId: 1, isActive: true, unitOfMeasure: "كجم" },
  { productId: 2, id: "prod_2", name: "رغيف خبز قمح كامل", barcode: "BRD002", purchasePrice: 1.2, salePrice: 2.5, quantity: 50, categoryId: 2, categoryName: "مخبوزات", supplier: "مخابز صحية", companyId: 1, isActive: true, unitOfMeasure: "رغيف" },
  { productId: 3, id: "prod_3", name: "حليب طازج (1 لتر)", barcode: "MLK003", purchasePrice: 0.8, salePrice: 1.5, quantity: 75, expirationDate: "2024-10-15", categoryId: 3, categoryName: "ألبان", supplier: "مزرعة فريش", companyId: 1, isActive: true, unitOfMeasure: "لتر" },
];

// Global variable to store products in memory on the server
let globalProducts: Product[] | null = null;

// Path to the JSON file for storing products
const dataFilePath = path.join(process.cwd(), 'data', 'products.json');

// Ensure the data directory exists
try {
  if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
    fs.mkdirSync(path.join(process.cwd(), 'data'), { recursive: true });
  }
} catch (error) {
  console.error("Error creating data directory:", error);
}

// Function to get products from file or use default
const getProducts = (): Product[] => {
  // If we already have products in memory, use those
  if (globalProducts !== null) {
    return [...globalProducts];
  }
  
  try {
    // Check if the file exists
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf8');
      const parsedProducts = JSON.parse(fileData);
      globalProducts = parsedProducts; // Cache in memory
      console.log("[products/route.ts] Loaded products from file, count:", parsedProducts.length);
      return parsedProducts;
    }
  } catch (error) {
    console.error("Error reading products from file:", error);
  }
  
  // Default fallback
  globalProducts = [...defaultProducts];
  
  // Save default products to file
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(defaultProducts, null, 2), 'utf8');
    console.log("[products/route.ts] Saved default products to file");
  } catch (error) {
    console.error("Error saving default products to file:", error);
  }
  
  return [...defaultProducts]; // Return a copy of default products
};

// Function to save products to file
const saveProducts = (products: Product[]) => {
  // Update in-memory cache
  globalProducts = [...products];
  
  // Save to file
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(products, null, 2), 'utf8');
    console.log("[products/route.ts] Saved products to file, count:", products.length);
  } catch (error) {
    console.error("Error saving products to file:", error);
  }
};

// Initialize products from file or defaults
let mockProducts: Product[] = getProducts();

// GET /api/products - Fetch all products (with potential search)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('searchTerm')?.toLowerCase() || "";
  const categoryId = searchParams.get('categoryId');
  const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم

  try {
    console.log("[products/route.ts] Received GET request for products");
    console.log("[products/route.ts] Search term:", searchTerm);
    console.log("[products/route.ts] Category ID:", categoryId);
    
    // بناء استعلام SQL
    let query = `
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
        p.IsActive as isActive
      FROM inventory.Products p
      LEFT JOIN inventory.Categories c ON p.CategoryId = c.CategoryId
      WHERE p.CompanyId = @companyId AND p.IsActive = 1
    `;
    
    const params: Record<string, any> = { companyId };
    
    // إضافة شروط البحث إذا كانت موجودة
    if (searchTerm) {
      query += ` AND (
        p.Name LIKE @searchPattern OR
        p.Barcode LIKE @searchPattern OR
        c.Name LIKE @searchPattern
      )`;
      params.searchPattern = `%${searchTerm}%`;
    }
    
    // إضافة تصفية حسب الفئة إذا كانت موجودة
    if (categoryId) {
      query += ` AND p.CategoryId = @categoryId`;
      params.categoryId = parseInt(categoryId);
    }
    
    console.log("[products/route.ts] Executing SQL query:", query);
    console.log("[products/route.ts] With parameters:", params);
    
    // تنفيذ الاستعلام
    const products = await executeQuery<Product[]>(query, params);
    console.log("[products/route.ts] Products fetched from database, count:", products.length);
    
    // تخزين المنتجات في الذاكرة للاستخدام المستقبلي (اختياري)
    globalProducts = [...products];
    
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    
    // في حالة فشل الاتصال بقاعدة البيانات، استخدم البيانات المخزنة محلياً كنسخة احتياطية
    console.log("[products/route.ts] Falling back to local data due to database error");
    mockProducts = getProducts();
    return NextResponse.json(mockProducts);
  }
}

// POST /api/products - Create a new product
export async function POST(request: Request) {
  console.log("[products/route.ts] Received POST request for new product");
  
  try {
    // Check for auth header (optional)
    const authHeader = request.headers.get('Authorization');
    console.log("[products/route.ts] Auth header:", authHeader ? "Present" : "Not present");
    
    // Parse request body
    const bodyText = await request.text();
    console.log("[products/route.ts] Request body:", bodyText);
    
    let body;
    try {
      body = JSON.parse(bodyText) as Omit<Product, 'id' | 'productId'>;
    } catch (e) {
      console.error("[products/route.ts] Error parsing JSON:", e);
      return NextResponse.json({ message: "خطأ في تنسيق البيانات" }, { status: 400 });
    }
    
    // Validate required fields
    console.log("[products/route.ts] Validating product data:", {
      name: !!body.name,
      barcode: !!body.barcode,
      purchasePrice: body.purchasePrice,
      salePrice: body.salePrice,
      quantity: body.quantity
    });
    
    if (!body.name || !body.barcode || body.purchasePrice == null || body.salePrice == null || body.quantity == null) {
      return NextResponse.json({ message: "البيانات المطلوبة غير مكتملة" }, { status: 400 });
    }

    // استخدام الإجراء المخزن لإضافة منتج جديد
    try {
      // يمكن استخدام الإجراء المخزن المعرف في init.sql
      const result = await executeQuery<any[]>(`
        EXEC inventory.sp_AddProduct
          @Name = @name,
          @Barcode = @barcode,
          @Description = @description,
          @CategoryId = @categoryId,
          @PurchasePrice = @purchasePrice,
          @SalePrice = @salePrice,
          @Quantity = @quantity,
          @UnitOfMeasure = @unitOfMeasure,
          @MinimumQuantity = @minimumQuantity,
          @ImageUrl = @imageUrl,
          @CompanyId = @companyId,
          @CreatedBy = @createdBy;
          
        SELECT SCOPE_IDENTITY() AS productId;
      `, {
        name: body.name,
        barcode: body.barcode,
        description: body.description || null,
        categoryId: body.categoryId || null,
        purchasePrice: body.purchasePrice,
        salePrice: body.salePrice,
        quantity: body.quantity,
        unitOfMeasure: body.unitOfMeasure || null,
        minimumQuantity: body.minimumQuantity || 0,
        imageUrl: body.imageUrl || null,
        companyId: 1, // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
        createdBy: 1 // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
      });

      console.log("[products/route.ts] Database insert result:", result);
      
      // الحصول على معرف المنتج الجديد
      const newProductId = result && result.length > 0 ? result[0].productId : null;
      
      if (!newProductId) {
        throw new Error("لم يتم إرجاع معرف المنتج الجديد من قاعدة البيانات");
      }
      
      // جلب المنتج الجديد من قاعدة البيانات للتأكد من أنه تم إنشاؤه بنجاح
      const newProductQuery = `
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
          p.IsActive as isActive
        FROM inventory.Products p
        LEFT JOIN inventory.Categories c ON p.CategoryId = c.CategoryId
        WHERE p.ProductId = @productId
      `;
      
      const newProducts = await executeQuery<Product[]>(newProductQuery, { productId: newProductId });
      
      if (!newProducts || newProducts.length === 0) {
        throw new Error("لم يتم العثور على المنتج الجديد بعد إنشائه");
      }
      
      const newProduct = newProducts[0];
      console.log("[products/route.ts] Created new product in database:", newProduct);
      
      // تحديث البيانات المخزنة محلياً (اختياري)
      mockProducts.push(newProduct);
      saveProducts(mockProducts);
      
      return NextResponse.json(newProduct, { status: 201 });
    } catch (dbError) {
      console.error("[products/route.ts] Database error:", dbError);
      
      // في حالة فشل الإدخال في قاعدة البيانات، يمكن استخدام الطريقة القديمة كنسخة احتياطية
      console.log("[products/route.ts] Falling back to local storage due to database error");
      
      const newProductId = Math.max(0, ...mockProducts.map(p => p.productId)) + 1;
      const newProduct: Product = { 
        ...body, 
        id: `prod_${newProductId}`, 
        productId: newProductId,
        companyId: 1,
        isActive: true,
      };
      
      mockProducts.push(newProduct);
      saveProducts(mockProducts);
      
      // إرجاع المنتج مع رسالة تحذير
      return NextResponse.json({
        ...newProduct,
        _warning: "تم حفظ المنتج محلياً فقط بسبب خطأ في قاعدة البيانات"
      }, { status: 201 });
    }
  } catch (error) {
    console.error("[products/route.ts] Failed to create product:", error);
    return NextResponse.json({ message: "خطأ في إنشاء المنتج" }, { status: 500 });
  }
}
