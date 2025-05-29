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
  try {
    console.log(`[products/[productId]/route.ts] Received GET request for product ID: ${productId}`);
    
    // Refresh products from memory/storage
    mockProducts = getProducts();
    console.log(`[products/[productId]/route.ts] Loaded products count: ${mockProducts.length}`);
    
    // TODO: Replace with actual database query
    // const product = await executeQuery<Product[]>("SELECT * FROM Products WHERE ProductId = @productId AND CompanyId = @companyId", { productId, companyId: 1 });
    // if (product.length === 0) {
    //   return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
    // }
    const product = mockProducts.find(p => p.productId === productId);
    
    if (!product) {
      console.log(`[products/[productId]/route.ts] Product with ID ${productId} not found`);
      return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
    }
    
    console.log(`[products/[productId]/route.ts] Found product:`, product);
    return NextResponse.json(product);
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    return NextResponse.json({ message: "خطأ في جلب المنتج" }, { status: 500 });
  }
}

// PUT /api/products/{productId} - Update an existing product
export async function PUT(request: Request, { params }: { params: { productId: string } }) {
  console.log(`[products/[productId]/route.ts] Received PUT request for product ID: ${params.productId}`);
  
  const productId = parseInt(params.productId);
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

    // TODO: Add validation
    // TODO: Implement actual database update
    // await executeQuery("UPDATE Products SET Name = @Name, ... WHERE ProductId = @productId AND CompanyId = @companyId", { ...body, productId, companyId: 1 });
    
    const productIndex = mockProducts.findIndex(p => p.productId === productId);
    console.log(`[products/[productId]/route.ts] Product index: ${productIndex}`);
    
    if (productIndex === -1) {
      console.log(`[products/[productId]/route.ts] Product with ID ${productId} not found`);
      return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
    }
    
    const updatedProduct = { ...mockProducts[productIndex], ...body };
    console.log("[products/[productId]/route.ts] Updated product:", updatedProduct);
    
    mockProducts[productIndex] = updatedProduct;
    
    // Save to file
    saveProducts(mockProducts);
    console.log(`[products/[productId]/route.ts] Saved updated product to file, ID: ${productId}`);

    return NextResponse.json(mockProducts[productIndex]);
  } catch (error) {
    console.error(`[products/[productId]/route.ts] Failed to update product ${productId}:`, error);
    return NextResponse.json({ message: "خطأ في تحديث المنتج" }, { status: 500 });
  }
}

// DELETE /api/products/{productId} - Delete a product
export async function DELETE(request: Request, { params }: { params: { productId: string } }) {
  const productId = parseInt(params.productId);
  try {
    // TODO: Implement actual database deletion (soft delete by setting IsActive = 0 or hard delete)
    // await executeQuery("UPDATE Products SET IsActive = 0 WHERE ProductId = @productId AND CompanyId = @companyId", { productId, companyId: 1 });
    
    const productIndex = mockProducts.findIndex(p => p.productId === productId);
    if (productIndex === -1) {
      return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
    }
    mockProducts.splice(productIndex, 1);
    
    // Save to file
    saveProducts(mockProducts);
    console.log(`[products/[productId]/route.ts] Saved products to file after deleting product ID: ${productId}`);

    return NextResponse.json({ message: "تم حذف المنتج بنجاح" });
  } catch (error) {
    console.error(`Failed to delete product ${productId}:`, error);
    return NextResponse.json({ message: "خطأ في حذف المنتج" }, { status: 500 });
  }
}
