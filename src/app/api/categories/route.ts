// src/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Category } from '@/types';

// Default mock data
const defaultCategories: Category[] = [
  { categoryId: 1, id: 'cat_1', name: 'فواكه', description: 'فواكه طازجة ومتنوعة', companyId: 1 },
  { categoryId: 2, id: 'cat_2', name: 'مخبوزات', description: 'خبز ومعجنات طازجة', companyId: 1 },
  { categoryId: 3, id: 'cat_3', name: 'ألبان', description: 'منتجات الألبان والحليب', companyId: 1 },
  { categoryId: 4, id: 'cat_4', name: 'خضروات', description: 'خضروات طازجة', companyId: 1 },
  { categoryId: 5, id: 'cat_5', name: 'مشروبات', description: 'مشروبات غازية وعصائر', companyId: 1 },
];

// Global variable to store categories in memory on the server
let globalCategories: Category[] | null = null;

// Function to get categories from localStorage or use default
const getCategories = (): Category[] => {
  // If we already have categories in memory, use those
  if (globalCategories !== null) {
    return [...globalCategories];
  }
  
  // For client-side, try to get from localStorage
  if (typeof window !== 'undefined') {
    try {
      const storedCategories = localStorage.getItem('mockCategories');
      if (storedCategories) {
        const parsedCategories = JSON.parse(storedCategories);
        globalCategories = parsedCategories; // Cache in memory
        return parsedCategories;
      }
    } catch (error) {
      console.error("Error reading categories from localStorage:", error);
    }
  }
  
  // Default fallback
  globalCategories = [...defaultCategories];
  return [...defaultCategories]; // Return a copy of default categories
};

// Function to save categories to localStorage
const saveCategories = (categories: Category[]) => {
  // Update in-memory cache
  globalCategories = [...categories];
  
  // For client-side, save to localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('mockCategories', JSON.stringify(categories));
      console.log("[categories/route.ts] Saved categories to localStorage, count:", categories.length);
    } catch (error) {
      console.error("Error saving categories to localStorage:", error);
    }
  }
};

// Initialize categories from localStorage or defaults
let mockCategories: Category[] = getCategories();

// GET /api/categories - Fetch all categories
export async function GET(request: Request) {
  try {
    // Log request for debugging
    console.log("[categories/route.ts] Received GET request for categories");
    
    // Check for auth header (optional since we made this a public route)
    const authHeader = request.headers.get('Authorization');
    console.log("[categories/route.ts] Auth header:", authHeader ? "Present" : "Not present");
    
    const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    
    // استعلام قاعدة البيانات للحصول على الفئات
    const query = `
      SELECT 
        CategoryId as categoryId,
        'cat_' + CAST(CategoryId AS NVARCHAR) as id,
        Name as name,
        Description as description,
        CompanyId as companyId,
        IsActive as isActive
      FROM inventory.Categories
      WHERE CompanyId = @companyId AND IsActive = 1
      ORDER BY Name
    `;
    
    console.log("[categories/route.ts] Executing SQL query for categories");
    const categories = await executeQuery<Category[]>(query, { companyId });
    console.log("[categories/route.ts] Categories fetched from database, count:", categories.length);
    
    // تخزين الفئات في الذاكرة للاستخدام المستقبلي (اختياري)
    globalCategories = [...categories];
    
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Failed to fetch categories from database:", error);
    
    // في حالة فشل الاتصال بقاعدة البيانات، استخدم البيانات المخزنة محلياً كنسخة احتياطية
    console.log("[categories/route.ts] Falling back to local data due to database error");
    mockCategories = getCategories();
    return NextResponse.json(mockCategories);
  }
}

// POST /api/categories - Create a new category
export async function POST(request: Request) {
  console.log("[categories/route.ts] Received POST request for new category");
  
  try {
    // Parse request body
    const bodyText = await request.text();
    console.log("[categories/route.ts] Request body:", bodyText);
    
    let body;
    try {
      body = JSON.parse(bodyText) as Omit<Category, 'id' | 'categoryId'>;
    } catch (e) {
      console.error("[categories/route.ts] Error parsing JSON:", e);
      return NextResponse.json({ message: "خطأ في تنسيق البيانات" }, { status: 400 });
    }
    
    // Validate required fields
    if (!body.name) {
      return NextResponse.json({ message: "اسم الفئة مطلوب" }, { status: 400 });
    }

    // إدخال الفئة الجديدة في قاعدة البيانات
    try {
      const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
      const createdBy = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
      
      const insertQuery = `
        INSERT INTO inventory.Categories (
          Name, 
          Description, 
          CompanyId, 
          CreatedBy, 
          CreatedAt, 
          IsActive
        )
        VALUES (
          @name, 
          @description, 
          @companyId, 
          @createdBy, 
          GETDATE(), 
          1
        );
        
        SELECT SCOPE_IDENTITY() AS categoryId;
      `;
      
      const result = await executeQuery<any[]>(insertQuery, {
        name: body.name,
        description: body.description || null,
        companyId,
        createdBy
      });
      
      console.log("[categories/route.ts] Database insert result:", result);
      
      // الحصول على معرف الفئة الجديدة
      const newCategoryId = result && result.length > 0 ? result[0].categoryId : null;
      
      if (!newCategoryId) {
        throw new Error("لم يتم إرجاع معرف الفئة الجديدة من قاعدة البيانات");
      }
      
      // جلب الفئة الجديدة من قاعدة البيانات للتأكد من أنها تم إنشاؤها بنجاح
      const newCategoryQuery = `
        SELECT 
          CategoryId as categoryId,
          'cat_' + CAST(CategoryId AS NVARCHAR) as id,
          Name as name,
          Description as description,
          CompanyId as companyId,
          IsActive as isActive
        FROM inventory.Categories
        WHERE CategoryId = @categoryId
      `;
      
      const newCategories = await executeQuery<Category[]>(newCategoryQuery, { categoryId: newCategoryId });
      
      if (!newCategories || newCategories.length === 0) {
        throw new Error("لم يتم العثور على الفئة الجديدة بعد إنشائها");
      }
      
      const newCategory = newCategories[0];
      console.log("[categories/route.ts] Created new category in database:", newCategory);
      
      // تحديث البيانات المخزنة محلياً (اختياري)
      mockCategories.push(newCategory);
      saveCategories(mockCategories);
      
      return NextResponse.json(newCategory, { status: 201 });
    } catch (dbError) {
      console.error("[categories/route.ts] Database error:", dbError);
      
      // في حالة فشل الإدخال في قاعدة البيانات، يمكن استخدام الطريقة القديمة كنسخة احتياطية
      console.log("[categories/route.ts] Falling back to local storage due to database error");
      
      const newCategoryId = Math.max(0, ...mockCategories.map(c => c.categoryId)) + 1;
      const newCategory: Category = { 
        ...body, 
        id: `cat_${newCategoryId}`, 
        categoryId: newCategoryId,
        companyId: 1,
      };
      
      mockCategories.push(newCategory);
      saveCategories(mockCategories);
      
      // إرجاع الفئة مع رسالة تحذير
      return NextResponse.json({
        ...newCategory,
        _warning: "تم حفظ الفئة محلياً فقط بسبب خطأ في قاعدة البيانات"
      }, { status: 201 });
    }
  } catch (error) {
    console.error("[categories/route.ts] Failed to create category:", error);
    return NextResponse.json({ message: "خطأ في إنشاء الفئة" }, { status: 500 });
  }
}
