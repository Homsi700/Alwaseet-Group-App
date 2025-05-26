// src/app/api/categories/[categoryId]/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Category } from '@/types';

// Mock data - same as in /api/categories/route.ts for consistency in this example
let mockCategories: Category[] = [
  { categoryId: 1, id: 'cat1', name: 'فواكه', description: 'فواكه طازجة ومتنوعة', companyId: 1 },
  { categoryId: 2, id: 'cat2', name: 'مخبوزات', description: 'خبز ومعجنات طازجة', companyId: 1 },
  { categoryId: 3, id: 'cat3', name: 'ألبان', description: 'منتجات الألبان والحليب', companyId: 1 },
  { categoryId: 4, id: 'cat4', name: 'خضروات', description: 'خضروات طازجة', companyId: 1 },
  { categoryId: 5, id: 'cat5', name: 'مشروبات', description: 'مشروبات غازية وعصائر', companyId: 1 },
];

// GET /api/categories/{categoryId} - Fetch a single category by ID
export async function GET(request: Request, { params }: { params: { categoryId: string } }) {
  const categoryId = parseInt(params.categoryId);
  try {
    // TODO: Replace with actual database query
    const category = mockCategories.find(c => c.categoryId === categoryId);
    if (!category) {
      return NextResponse.json({ message: "الفئة غير موجودة" }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    console.error(`Failed to fetch category ${categoryId}:`, error);
    return NextResponse.json({ message: "خطأ في جلب الفئة" }, { status: 500 });
  }
}

// PUT /api/categories/{categoryId} - Update an existing category
export async function PUT(request: Request, { params }: { params: { categoryId: string } }) {
  const categoryId = parseInt(params.categoryId);
  try {
    const body = await request.json() as Partial<Omit<Category, 'id' | 'categoryId'>>;

    // TODO: Add validation
    // TODO: Implement actual database update
    const categoryIndex = mockCategories.findIndex(c => c.categoryId === categoryId);
    if (categoryIndex === -1) {
      return NextResponse.json({ message: "الفئة غير موجودة" }, { status: 404 });
    }
    mockCategories[categoryIndex] = { ...mockCategories[categoryIndex], ...body };

    return NextResponse.json(mockCategories[categoryIndex]);
  } catch (error) {
    console.error(`Failed to update category ${categoryId}:`, error);
    return NextResponse.json({ message: "خطأ في تحديث الفئة" }, { status: 500 });
  }
}

// DELETE /api/categories/{categoryId} - Delete a category
export async function DELETE(request: Request, { params }: { params: { categoryId: string } }) {
  const categoryId = parseInt(params.categoryId);
  try {
    // TODO: Implement actual database deletion
    // Consider what happens to products in this category - disassociate or prevent deletion if products exist.
    const categoryIndex = mockCategories.findIndex(c => c.categoryId === categoryId);
    if (categoryIndex === -1) {
      return NextResponse.json({ message: "الفئة غير موجودة" }, { status: 404 });
    }
    mockCategories.splice(categoryIndex, 1);

    return NextResponse.json({ message: "تم حذف الفئة بنجاح" });
  } catch (error) {
    console.error(`Failed to delete category ${categoryId}:`, error);
    return NextResponse.json({ message: "خطأ في حذف الفئة" }, { status: 500 });
  }
}
