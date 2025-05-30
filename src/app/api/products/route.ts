// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Product } from '@/types';

// الاستعلام لجلب المنتجات
const GET_PRODUCTS_QUERY = `
  SELECT 
    p.ProductId as productId,
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
    p.CreatedAt as createdAt,
    p.UpdatedAt as updatedAt,
    p.CreatedBy as createdBy,
    p.IsActive as isActive
  FROM inventory.Products p
  LEFT JOIN inventory.Categories c ON p.CategoryId = c.CategoryId
  WHERE p.IsActive = 1
`;

// GET /api/products - Fetch all products (with potential search)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('searchTerm')?.toLowerCase() || "";
  const categoryId = searchParams.get('categoryId');

  try {
    let query = GET_PRODUCTS_QUERY;
    const params: any = {};

    if (searchTerm) {
      query += ` AND (LOWER(p.Name) LIKE @searchTerm 
                  OR LOWER(p.Barcode) LIKE @searchTerm 
                  OR LOWER(p.Description) LIKE @searchTerm)`;
      params.searchTerm = `%${searchTerm}%`;
    }

    if (categoryId) {
      query += ` AND p.CategoryId = @categoryId`;
      params.categoryId = parseInt(categoryId);
    }

    query += ` ORDER BY p.Name`;

    const products = await executeQuery<Product[]>(query, params);
    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ message: "خطأ في جلب المنتجات" }, { status: 500 });
  }
}

// POST /api/products - Create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // التحقق من البيانات المطلوبة
    if (!body.name || !body.purchasePrice == null || !body.salePrice == null) {
      return NextResponse.json(
        { message: "البيانات المطلوبة غير مكتملة" },
        { status: 400 }
      );
    }

    // إدخال المنتج الجديد
    const result = await executeQuery<[{ productId: number }]>(`
      INSERT INTO inventory.Products (
        Name, Barcode, Description, CategoryId,
        PurchasePrice, SalePrice, Quantity,
        UnitOfMeasure, MinimumQuantity, ImageUrl,
        CompanyId, CreatedBy, IsActive
      )
      VALUES (
        @name, @barcode, @description, @categoryId,
        @purchasePrice, @salePrice, @quantity,
        @unitOfMeasure, @minimumQuantity, @imageUrl,
        @companyId, @createdBy, 1
      );
      
      SELECT SCOPE_IDENTITY() as productId;
    `, {
      ...body,
      companyId: 1, // سيتم أخذها من الجلسة لاحقاً
      createdBy: 1, // سيتم أخذها من الجلسة لاحقاً
      quantity: body.quantity || 0,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ message: "خطأ في إنشاء المنتج" }, { status: 500 });
  }
}
