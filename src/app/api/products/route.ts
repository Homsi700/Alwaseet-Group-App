// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Product } from '@/types';

// Mock data for now - replace with DB calls
let mockProducts: Product[] = [
  { productId: 1, id: "prod_1", name: "تفاح عضوي (1 كجم)", barcode: "APL001", purchasePrice: 0.5, salePrice: 1.0, quantity: 100, expirationDate: "2024-12-31", categoryId: 1, categoryName: "فواكه", supplier: "مزارع خضراء", companyId: 1, isActive: true, unitOfMeasure: "كجم" },
  { productId: 2, id: "prod_2", name: "رغيف خبز قمح كامل", barcode: "BRD002", purchasePrice: 1.2, salePrice: 2.5, quantity: 50, categoryId: 2, categoryName: "مخبوزات", supplier: "مخابز صحية", companyId: 1, isActive: true, unitOfMeasure: "رغيف" },
  { productId: 3, id: "prod_3", name: "حليب طازج (1 لتر)", barcode: "MLK003", purchasePrice: 0.8, salePrice: 1.5, quantity: 75, expirationDate: "2024-10-15", categoryId: 3, categoryName: "ألبان", supplier: "مزرعة فريش", companyId: 1, isActive: true, unitOfMeasure: "لتر" },
];

// GET /api/products - Fetch all products (with potential search)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('searchTerm')?.toLowerCase() || "";
  const categoryId = searchParams.get('categoryId');

  try {
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
    }

    if (categoryId) {
      filteredProducts = filteredProducts.filter(p => p.categoryId === parseInt(categoryId));
    }

    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ message: "خطأ في جلب المنتجات" }, { status: 500 });
  }
}

// POST /api/products - Create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json() as Omit<Product, 'id' | 'productId'>;
    
    // TODO: Add validation (e.g., using Zod)
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
    mockProducts.push(newProduct);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ message: "خطأ في إنشاء المنتج" }, { status: 500 });
  }
}
