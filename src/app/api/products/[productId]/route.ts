// src/app/api/products/[productId]/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Product } from '@/types';
import fs from 'fs';
import path from 'path';

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

// Default mock data
const defaultProducts: Product[] = [
  { productId: 1, id: "prod_1", name: "تفاح عضوي (1 كجم)", barcode: "APL001", purchasePrice: 0.5, salePrice: 1.0, quantity: 100, expirationDate: "2024-12-31", categoryId: 1, categoryName: "فواكه", supplier: "مزارع خضراء", companyId: 1, isActive: true, unitOfMeasure: "كجم" },
  { productId: 2, id: "prod_2", name: "رغيف خبز قمح كامل", barcode: "BRD002", purchasePrice: 1.2, salePrice: 2.5, quantity: 50, categoryId: 2, categoryName: "مخبوزات", supplier: "مخابز صحية", companyId: 1, isActive: true, unitOfMeasure: "رغيف" },
  { productId: 3, id: "prod_3", name: "حليب طازج (1 لتر)", barcode: "MLK003", purchasePrice: 0.8, salePrice: 1.5, quantity: 75, expirationDate: "2024-10-15", categoryId: 3, categoryName: "ألبان", supplier: "مزرعة فريش", companyId: 1, isActive: true, unitOfMeasure: "لتر" },
];

// Function to get products from file or use default
const getProducts = (): Product[] => {
  try {
    // Check if the file exists
    if (fs.existsSync(dataFilePath)) {
      const fileData = fs.readFileSync(dataFilePath, 'utf8');
      const parsedProducts = JSON.parse(fileData);
      console.log("[products/[productId]/route.ts] Loaded products from file, count:", parsedProducts.length);
      return parsedProducts;
    }
  } catch (error) {
    console.error("Error reading products from file:", error);
  }
  
  // Default fallback
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(defaultProducts, null, 2), 'utf8');
    console.log("[products/[productId]/route.ts] Saved default products to file");
  } catch (error) {
    console.error("Error saving default products to file:", error);
  }
  
  return [...defaultProducts]; // Return a copy of default products
};

// Function to save products to file
const saveProducts = (products: Product[]) => {
  // Save to file
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(products, null, 2), 'utf8');
    console.log("[products/[productId]/route.ts] Saved products to file, count:", products.length);
  } catch (error) {
    console.error("Error saving products to file:", error);
  }
};

// Initialize products from file or defaults
let mockProducts: Product[] = getProducts();


// GET /api/products/{productId} - Fetch a single product by ID
export async function GET(request: Request, { params }: { params: { productId: string } }) {
  const productId = parseInt(params.productId);
  const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
  
  try {
    console.log(`[products/[productId]/route.ts] Received GET request for product ID: ${productId}`);
    
    // استعلام قاعدة البيانات للحصول على المنتج
    const query = `
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
      WHERE p.ProductId = @productId AND p.CompanyId = @companyId AND p.IsActive = 1
    `;
    
    console.log(`[products/[productId]/route.ts] Executing SQL query for product ID: ${productId}`);
    const products = await executeQuery<Product[]>(query, { productId, companyId });
    
    if (!products || products.length === 0) {
      console.log(`[products/[productId]/route.ts] Product with ID ${productId} not found in database`);
      
      // في حالة فشل الاستعلام، يمكن البحث في البيانات المحلية كنسخة احتياطية
      mockProducts = getProducts();
      const product = mockProducts.find(p => p.productId === productId);
      
      if (!product) {
        return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
      }
      
      console.log(`[products/[productId]/route.ts] Found product in local storage:`, product);
      return NextResponse.json(product);
    }
    
    const product = products[0];
    console.log(`[products/[productId]/route.ts] Found product in database:`, product);
    return NextResponse.json(product);
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    
    // في حالة فشل الاتصال بقاعدة البيانات، يمكن البحث في البيانات المحلية كنسخة احتياطية
    try {
      mockProducts = getProducts();
      const product = mockProducts.find(p => p.productId === productId);
      
      if (!product) {
        return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
      }
      
      console.log(`[products/[productId]/route.ts] Found product in local storage after database error:`, product);
      return NextResponse.json({
        ...product,
        _warning: "تم استرجاع المنتج من التخزين المحلي بسبب خطأ في قاعدة البيانات"
      });
    } catch (localError) {
      return NextResponse.json({ message: "خطأ في جلب المنتج" }, { status: 500 });
    }
  }
}

// PUT /api/products/{productId} - Update an existing product
export async function PUT(request: Request, { params }: { params: { productId: string } }) {
  console.log(`[products/[productId]/route.ts] Received PUT request for product ID: ${params.productId}`);
  
  const productId = parseInt(params.productId);
  const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
  const userId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
  
  try {
    // Check for auth header (optional)
    const authHeader = request.headers.get('Authorization');
    console.log("[products/[productId]/route.ts] Auth header:", authHeader ? "Present" : "Not present");
    
    // Parse request body
    const bodyText = await request.text();
    console.log("[products/[productId]/route.ts] Request body:", bodyText);
    
    let body;
    try {
      body = JSON.parse(bodyText) as Partial<Omit<Product, 'id' | 'productId'>>;
    } catch (e) {
      console.error("[products/[productId]/route.ts] Error parsing JSON:", e);
      return NextResponse.json({ message: "خطأ في تنسيق البيانات" }, { status: 400 });
    }

    // التحقق من وجود المنتج قبل التحديث
    const checkQuery = `
      SELECT ProductId FROM inventory.Products 
      WHERE ProductId = @productId AND CompanyId = @companyId AND IsActive = 1
    `;
    
    const existingProducts = await executeQuery<any[]>(checkQuery, { productId, companyId });
    
    if (!existingProducts || existingProducts.length === 0) {
      console.log(`[products/[productId]/route.ts] Product with ID ${productId} not found in database`);
      return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
    }
    
    // بناء استعلام التحديث ديناميكياً بناءً على الحقول المتوفرة في الطلب
    let updateFields = [];
    let params: Record<string, any> = { productId, companyId };
    
    if (body.name !== undefined) {
      updateFields.push("Name = @name");
      params.name = body.name;
    }
    
    if (body.barcode !== undefined) {
      updateFields.push("Barcode = @barcode");
      params.barcode = body.barcode;
    }
    
    if (body.description !== undefined) {
      updateFields.push("Description = @description");
      params.description = body.description;
    }
    
    if (body.categoryId !== undefined) {
      updateFields.push("CategoryId = @categoryId");
      params.categoryId = body.categoryId;
    }
    
    if (body.purchasePrice !== undefined) {
      updateFields.push("PurchasePrice = @purchasePrice");
      params.purchasePrice = body.purchasePrice;
    }
    
    if (body.salePrice !== undefined) {
      updateFields.push("SalePrice = @salePrice");
      params.salePrice = body.salePrice;
    }
    
    if (body.quantity !== undefined) {
      updateFields.push("Quantity = @quantity");
      params.quantity = body.quantity;
    }
    
    if (body.unitOfMeasure !== undefined) {
      updateFields.push("UnitOfMeasure = @unitOfMeasure");
      params.unitOfMeasure = body.unitOfMeasure;
    }
    
    if (body.minimumQuantity !== undefined) {
      updateFields.push("MinimumQuantity = @minimumQuantity");
      params.minimumQuantity = body.minimumQuantity;
    }
    
    if (body.imageUrl !== undefined) {
      updateFields.push("ImageUrl = @imageUrl");
      params.imageUrl = body.imageUrl;
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
        p.ImageUrl as imageUrl,
        p.CompanyId as companyId,
        p.IsActive as isActive
      FROM inventory.Products p
      LEFT JOIN inventory.Categories c ON p.CategoryId = c.CategoryId
      WHERE p.ProductId = @productId AND p.CompanyId = @companyId;
    `;
    
    console.log(`[products/[productId]/route.ts] Executing SQL update query for product ID: ${productId}`);
    console.log(`[products/[productId]/route.ts] Update fields: ${updateFields.join(", ")}`);
    
    const updatedProducts = await executeQuery<Product[]>(updateQuery, params);
    
    if (!updatedProducts || updatedProducts.length === 0) {
      throw new Error("فشل في استرجاع المنتج المحدث من قاعدة البيانات");
    }
    
    const updatedProduct = updatedProducts[0];
    console.log(`[products/[productId]/route.ts] Product updated successfully in database:`, updatedProduct);
    
    // تحديث البيانات المحلية أيضاً (اختياري)
    const productIndex = mockProducts.findIndex(p => p.productId === productId);
    if (productIndex !== -1) {
      mockProducts[productIndex] = updatedProduct;
      saveProducts(mockProducts);
    }
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(`[products/[productId]/route.ts] Failed to update product ${productId}:`, error);
    
    // في حالة فشل الاتصال بقاعدة البيانات، يمكن استخدام الطريقة القديمة كنسخة احتياطية
    try {
      const productIndex = mockProducts.findIndex(p => p.productId === productId);
      
      if (productIndex === -1) {
        return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
      }
      
      const body = JSON.parse(await request.text()) as Partial<Omit<Product, 'id' | 'productId'>>;
      const updatedProduct = { ...mockProducts[productIndex], ...body };
      
      mockProducts[productIndex] = updatedProduct;
      saveProducts(mockProducts);
      
      return NextResponse.json({
        ...updatedProduct,
        _warning: "تم تحديث المنتج محلياً فقط بسبب خطأ في قاعدة البيانات"
      });
    } catch (localError) {
      return NextResponse.json({ message: "خطأ في تحديث المنتج" }, { status: 500 });
    }
  }
}

// DELETE /api/products/{productId} - Delete a product
export async function DELETE(request: Request, { params }: { params: { productId: string } }) {
  const productId = parseInt(params.productId);
  const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
  
  try {
    console.log(`[products/[productId]/route.ts] Received DELETE request for product ID: ${productId}`);
    
    // التحقق من وجود المنتج قبل الحذف
    const checkQuery = `
      SELECT ProductId FROM inventory.Products 
      WHERE ProductId = @productId AND CompanyId = @companyId AND IsActive = 1
    `;
    
    const existingProducts = await executeQuery<any[]>(checkQuery, { productId, companyId });
    
    if (!existingProducts || existingProducts.length === 0) {
      console.log(`[products/[productId]/route.ts] Product with ID ${productId} not found in database`);
      return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
    }
    
    // تنفيذ حذف ناعم (soft delete) عن طريق تعيين IsActive = 0
    const deleteQuery = `
      UPDATE inventory.Products 
      SET IsActive = 0, UpdatedAt = GETDATE() 
      WHERE ProductId = @productId AND CompanyId = @companyId
    `;
    
    console.log(`[products/[productId]/route.ts] Executing SQL soft delete query for product ID: ${productId}`);
    await executeQuery(deleteQuery, { productId, companyId });
    
    console.log(`[products/[productId]/route.ts] Product soft deleted successfully in database: ${productId}`);
    
    // تحديث البيانات المحلية أيضاً (اختياري)
    const productIndex = mockProducts.findIndex(p => p.productId === productId);
    if (productIndex !== -1) {
      mockProducts.splice(productIndex, 1);
      saveProducts(mockProducts);
    }
    
    return NextResponse.json({ message: "تم حذف المنتج بنجاح" });
  } catch (error) {
    console.error(`[products/[productId]/route.ts] Failed to delete product ${productId}:`, error);
    
    // في حالة فشل الاتصال بقاعدة البيانات، يمكن استخدام الطريقة القديمة كنسخة احتياطية
    try {
      const productIndex = mockProducts.findIndex(p => p.productId === productId);
      
      if (productIndex === -1) {
        return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
      }
      
      mockProducts.splice(productIndex, 1);
      saveProducts(mockProducts);
      
      return NextResponse.json({ 
        message: "تم حذف المنتج محلياً فقط بسبب خطأ في قاعدة البيانات" 
      });
    } catch (localError) {
      return NextResponse.json({ message: "خطأ في حذف المنتج" }, { status: 500 });
    }
  }
}
