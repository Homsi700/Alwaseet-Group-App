// src/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Category } from '@/types';

// Mock data for now - replace with DB calls
let mockCategories: Category[] = [
  { categoryId: 1, id: 'cat1', name: 'فواكه', description: 'فواكه طازجة ومتنوعة', companyId: 1 },
  { categoryId: 2, id: 'cat2', name: 'مخبوزات', description: 'خبز ومعجنات طازجة', companyId: 1 },
  { categoryId: 3, id: 'cat3', name: 'ألبان', description: 'منتجات الألبان والحليب', companyId: 1 },
  { categoryId: 4, id: 'cat4', name: 'خضروات', description: 'خضروات طازجة', companyId: 1 },
  { categoryId: 5, id: 'cat5', name: 'مشروبات', description: 'مشروبات غازية وعصائر', companyId: 1 },
];

// GET /api/categories - Fetch all categories
export async function GET(request: Request) {
  try {
    // TODO: Replace with actual database query
    // const categories = await executeQuery<Category[]>("SELECT * FROM Categories WHERE CompanyId = @companyId", { companyId: 1 /* Get from user session */ });
    return NextResponse.json(mockCategories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ message: "خطأ في جلب الفئات" }, { status: 500 });
  }
}

// POST /api/categories - Create a new category
export async function POST(request: Request) {
  try {
    const body = await request.json() as Omit<Category, 'id' | 'categoryId'>;
    
    if (!body.name) {
      return NextResponse.json({ message: "اسم الفئة مطلوب" }, { status: 400 });
    }

    // TODO: Implement actual database insertion
    const newCategoryId = Math.max(0, ...mockCategories.map(c => c.categoryId)) + 1;
    const newCategory: Category = { 
      ...body, 
      id: `cat_${newCategoryId}`, 
      categoryId: newCategoryId,
      companyId: 1, // Example companyId
    };
    mockCategories.push(newCategory);

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ message: "خطأ في إنشاء الفئة" }, { status: 500 });
  }
}
