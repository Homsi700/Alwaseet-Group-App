// src/app/api/categories/[categoryId]/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Category } from '@/types';

// GET /api/categories/{categoryId} - Fetch a single category by ID
export async function GET(request: Request, { params }: { params: { categoryId: string } }) {
  const categoryId = parseInt(params.categoryId);
  const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
  
  try {
    console.log(`[categories/[categoryId]/route.ts] Received GET request for category ID: ${categoryId}`);
    
    // استعلام قاعدة البيانات للحصول على الفئة
    const query = `
      SELECT 
        CategoryId as categoryId,
        'cat_' + CAST(CategoryId AS NVARCHAR) as id,
        Name as name,
        Description as description,
        ParentCategoryId as parentCategoryId,
        CompanyId as companyId,
        IsActive as isActive
      FROM inventory.Categories
      WHERE CategoryId = @categoryId AND CompanyId = @companyId AND IsActive = 1
    `;
    
    console.log(`[categories/[categoryId]/route.ts] Executing SQL query for category ID: ${categoryId}`);
    const categories = await executeQuery<Category[]>(query, { categoryId, companyId });
    
    if (!categories || categories.length === 0) {
      console.log(`[categories/[categoryId]/route.ts] Category with ID ${categoryId} not found in database`);
      return NextResponse.json({ message: "الفئة غير موجودة" }, { status: 404 });
    }
    
    const category = categories[0];
    console.log(`[categories/[categoryId]/route.ts] Found category in database:`, category);
    return NextResponse.json(category);
  } catch (error) {
    console.error(`[categories/[categoryId]/route.ts] Failed to fetch category ${categoryId}:`, error);
    return NextResponse.json({ message: "خطأ في جلب الفئة" }, { status: 500 });
  }
}

// PUT /api/categories/{categoryId} - Update an existing category
export async function PUT(request: Request, { params }: { params: { categoryId: string } }) {
  const categoryId = parseInt(params.categoryId);
  const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
  
  try {
    console.log(`[categories/[categoryId]/route.ts] Received PUT request for category ID: ${categoryId}`);
    
    // Parse request body
    const bodyText = await request.text();
    console.log("[categories/[categoryId]/route.ts] Request body:", bodyText);
    
    let body;
    try {
      body = JSON.parse(bodyText) as Partial<Omit<Category, 'id' | 'categoryId'>>;
    } catch (e) {
      console.error("[categories/[categoryId]/route.ts] Error parsing JSON:", e);
      return NextResponse.json({ message: "خطأ في تنسيق البيانات" }, { status: 400 });
    }
    
    // التحقق من وجود الفئة قبل التحديث
    const checkQuery = `
      SELECT CategoryId FROM inventory.Categories 
      WHERE CategoryId = @categoryId AND CompanyId = @companyId AND IsActive = 1
    `;
    
    const existingCategories = await executeQuery<any[]>(checkQuery, { categoryId, companyId });
    
    if (!existingCategories || existingCategories.length === 0) {
      console.log(`[categories/[categoryId]/route.ts] Category with ID ${categoryId} not found in database`);
      return NextResponse.json({ message: "الفئة غير موجودة" }, { status: 404 });
    }
    
    // بناء استعلام التحديث ديناميكياً بناءً على الحقول المتوفرة في الطلب
    let updateFields = [];
    let params: Record<string, any> = { categoryId, companyId };
    
    if (body.name !== undefined) {
      updateFields.push("Name = @name");
      params.name = body.name;
    }
    
    if (body.description !== undefined) {
      updateFields.push("Description = @description");
      params.description = body.description;
    }
    
    if (body.parentCategoryId !== undefined) {
      updateFields.push("ParentCategoryId = @parentCategoryId");
      params.parentCategoryId = body.parentCategoryId;
    }
    
    // إضافة حقول التحديث الإلزامية
    updateFields.push("UpdatedAt = GETDATE()");
    
    // إذا لم تكن هناك حقول للتحديث، فلا داعي للاستمرار
    if (updateFields.length === 0) {
      return NextResponse.json({ message: "لم يتم تحديد أي حقول للتحديث" }, { status: 400 });
    }
    
    // تنفيذ استعلام التحديث
    const updateQuery = `
      UPDATE inventory.Categories 
      SET ${updateFields.join(", ")} 
      WHERE CategoryId = @categoryId AND CompanyId = @companyId;
      
      -- إرجاع الفئة المحدثة
      SELECT 
        CategoryId as categoryId,
        'cat_' + CAST(CategoryId AS NVARCHAR) as id,
        Name as name,
        Description as description,
        ParentCategoryId as parentCategoryId,
        CompanyId as companyId,
        IsActive as isActive
      FROM inventory.Categories
      WHERE CategoryId = @categoryId AND CompanyId = @companyId;
    `;
    
    console.log(`[categories/[categoryId]/route.ts] Executing SQL update query for category ID: ${categoryId}`);
    console.log(`[categories/[categoryId]/route.ts] Update fields: ${updateFields.join(", ")}`);
    
    const updatedCategories = await executeQuery<Category[]>(updateQuery, params);
    
    if (!updatedCategories || updatedCategories.length === 0) {
      throw new Error("فشل في استرجاع الفئة المحدثة من قاعدة البيانات");
    }
    
    const updatedCategory = updatedCategories[0];
    console.log(`[categories/[categoryId]/route.ts] Category updated successfully in database:`, updatedCategory);
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error(`[categories/[categoryId]/route.ts] Failed to update category ${categoryId}:`, error);
    return NextResponse.json({ message: "خطأ في تحديث الفئة" }, { status: 500 });
  }
}

// DELETE /api/categories/{categoryId} - Delete a category (soft delete)
export async function DELETE(request: Request, { params }: { params: { categoryId: string } }) {
  const categoryId = parseInt(params.categoryId);
  const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
  
  try {
    console.log(`[categories/[categoryId]/route.ts] Received DELETE request for category ID: ${categoryId}`);
    
    // التحقق من وجود الفئة قبل الحذف
    const checkQuery = `
      SELECT CategoryId FROM inventory.Categories 
      WHERE CategoryId = @categoryId AND CompanyId = @companyId AND IsActive = 1
    `;
    
    const existingCategories = await executeQuery<any[]>(checkQuery, { categoryId, companyId });
    
    if (!existingCategories || existingCategories.length === 0) {
      console.log(`[categories/[categoryId]/route.ts] Category with ID ${categoryId} not found in database`);
      return NextResponse.json({ message: "الفئة غير موجودة" }, { status: 404 });
    }
    
    // التحقق من وجود منتجات مرتبطة بهذه الفئة
    const checkProductsQuery = `
      SELECT COUNT(*) as productCount
      FROM inventory.Products
      WHERE CategoryId = @categoryId AND CompanyId = @companyId AND IsActive = 1
    `;
    
    const productsResult = await executeQuery<[{ productCount: number }]>(checkProductsQuery, { categoryId, companyId });
    const productCount = productsResult[0]?.productCount || 0;
    
    if (productCount > 0) {
      console.log(`[categories/[categoryId]/route.ts] Cannot delete category ${categoryId} because it has ${productCount} associated products`);
      return NextResponse.json({ 
        message: "لا يمكن حذف الفئة لأنها تحتوي على منتجات مرتبطة بها",
        productCount
      }, { status: 400 });
    }
    
    // تنفيذ حذف ناعم (soft delete) عن طريق تعيين IsActive = 0
    const deleteQuery = `
      UPDATE inventory.Categories 
      SET IsActive = 0, UpdatedAt = GETDATE() 
      WHERE CategoryId = @categoryId AND CompanyId = @companyId
    `;
    
    console.log(`[categories/[categoryId]/route.ts] Executing SQL soft delete query for category ID: ${categoryId}`);
    await executeQuery(deleteQuery, { categoryId, companyId });
    
    return NextResponse.json({ message: "تم حذف الفئة بنجاح" });
  } catch (error) {
    console.error(`[categories/[categoryId]/route.ts] Failed to delete category ${categoryId}:`, error);
    return NextResponse.json({ message: "خطأ في حذف الفئة" }, { status: 500 });
  }
}
