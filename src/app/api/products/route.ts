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

  try {
    console.log("[products/route.ts] Received GET request for products");
    console.log("[products/route.ts] Search term:", searchTerm);
    console.log("[products/route.ts] Category ID:", categoryId);
    
    // Refresh products from memory/storage
    mockProducts = getProducts();
    console.log("[products/route.ts] Loaded products count:", mockProducts.length);
    
    // TODO: Replace with actual database query
    // const products = await executeQuery<Product[]>("SELECT * FROM Products WHERE CompanyId = @companyId AND IsActive = 1", { companyId: 1 /* Get from user session */ });
    
    let filteredProducts = mockProducts;

    if (searchTerm) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.barcode.toLowerCase().includes(searchTerm) ||
        (p.categoryName && p.categoryName.toLowerCase().includes(searchTerm)) ||
        (p.supplier && p.supplier.toLowerCase().includes(searchTerm))
      );
      console.log("[products/route.ts] Filtered by search term, count:", filteredProducts.length);
    }

    if (categoryId) {
      filteredProducts = filteredProducts.filter(p => p.categoryId === parseInt(categoryId));
      console.log("[products/route.ts] Filtered by category ID, count:", filteredProducts.length);
    }

    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ message: "خطأ في جلب المنتجات" }, { status: 500 });
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

    // TODO: Implement actual database insertion
    // const result = await executeQuery(
    //   "INSERT INTO Products (Name, Barcode, ...) VALUES (@Name, @Barcode, ...); SELECT SCOPE_IDENTITY() AS productId;",
    //   { Name: body.name, Barcode: body.barcode, ... }
    // );
    // const newProductId = result[0].productId;

    const newProductId = Math.max(0, ...mockProducts.map(p => p.productId)) + 1;
    const newProduct: Product = { 
      ...body, 
      id: `prod_${newProductId}`, 
      productId: newProductId,
      companyId: 1, // Example companyId
      isActive: true,
    };
    
    console.log("[products/route.ts] Created new product:", newProduct);
    mockProducts.push(newProduct);
    
    // Save to file
    saveProducts(mockProducts);
    console.log("[products/route.ts] Saved products to file, total count:", mockProducts.length);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("[products/route.ts] Failed to create product:", error);
    return NextResponse.json({ message: "خطأ في إنشاء المنتج" }, { status: 500 });
  }
}
