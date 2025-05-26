// src/app/api/products/[productId]/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Product } from '@/types';

// Mock data - same as in /api/products/route.ts for consistency in this example
let mockProducts: Product[] = [
  { productId: 1, id: "prod_1", name: "تفاح عضوي (1 كجم)", barcode: "APL001", purchasePrice: 0.5, salePrice: 1.0, quantity: 100, expirationDate: "2024-12-31", categoryId: 1, categoryName: "فواكه", supplier: "مزارع خضراء", companyId: 1, isActive: true, unitOfMeasure: "كجم" },
  { productId: 2, id: "prod_2", name: "رغيف خبز قمح كامل", barcode: "BRD002", purchasePrice: 1.2, salePrice: 2.5, quantity: 50, categoryId: 2, categoryName: "مخبوزات", supplier: "مخابز صحية", companyId: 1, isActive: true, unitOfMeasure: "رغيف" },
  { productId: 3, id: "prod_3", name: "حليب طازج (1 لتر)", barcode: "MLK003", purchasePrice: 0.8, salePrice: 1.5, quantity: 75, expirationDate: "2024-10-15", categoryId: 3, categoryName: "ألبان", supplier: "مزرعة فريش", companyId: 1, isActive: true, unitOfMeasure: "لتر" },
];


// GET /api/products/{productId} - Fetch a single product by ID
export async function GET(request: Request, { params }: { params: { productId: string } }) {
  const productId = parseInt(params.productId);
  try {
    // TODO: Replace with actual database query
    // const product = await executeQuery<Product[]>("SELECT * FROM Products WHERE ProductId = @productId AND CompanyId = @companyId", { productId, companyId: 1 });
    // if (product.length === 0) {
    //   return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
    // }
    const product = mockProducts.find(p => p.productId === productId);
    if (!product) {
      return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error) {
    console.error(`Failed to fetch product ${productId}:`, error);
    return NextResponse.json({ message: "خطأ في جلب المنتج" }, { status: 500 });
  }
}

// PUT /api/products/{productId} - Update an existing product
export async function PUT(request: Request, { params }: { params: { productId: string } }) {
  const productId = parseInt(params.productId);
  try {
    const body = await request.json() as Partial<Omit<Product, 'id' | 'productId'>>;

    // TODO: Add validation
    // TODO: Implement actual database update
    // await executeQuery("UPDATE Products SET Name = @Name, ... WHERE ProductId = @productId AND CompanyId = @companyId", { ...body, productId, companyId: 1 });
    
    const productIndex = mockProducts.findIndex(p => p.productId === productId);
    if (productIndex === -1) {
      return NextResponse.json({ message: "المنتج غير موجود" }, { status: 404 });
    }
    mockProducts[productIndex] = { ...mockProducts[productIndex], ...body };

    return NextResponse.json(mockProducts[productIndex]);
  } catch (error) {
    console.error(`Failed to update product ${productId}:`, error);
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

    return NextResponse.json({ message: "تم حذف المنتج بنجاح" });
  } catch (error) {
    console.error(`Failed to delete product ${productId}:`, error);
    return NextResponse.json({ message: "خطأ في حذف المنتج" }, { status: 500 });
  }
}
