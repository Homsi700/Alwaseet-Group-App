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
    
    // Refresh categories from memory/storage
    mockCategories = getCategories();
    
    // TODO: Replace with actual database query
    // const categories = await executeQuery<Category[]>("SELECT * FROM Categories WHERE CompanyId = @companyId", { companyId: 1 /* Get from user session */ });
    
    console.log("[categories/route.ts] Returning mock categories:", mockCategories);
    return NextResponse.json(mockCategories);
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ message: "خطأ في جلب الفئات" }, { status: 500 });
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

    const newCategoryId = Math.max(0, ...mockCategories.map(c => c.categoryId)) + 1;
    const newCategory: Category = { 
      ...body, 
      id: `cat_${newCategoryId}`, 
      categoryId: newCategoryId,
      companyId: 1, // Example companyId
    };
    
    console.log("[categories/route.ts] Created new category:", newCategory);
    mockCategories.push(newCategory);
    
    // Save to localStorage
    saveCategories(mockCategories);
    console.log("[categories/route.ts] Saved categories to localStorage, total count:", mockCategories.length);

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error("[categories/route.ts] Failed to create category:", error);
    return NextResponse.json({ message: "خطأ في إنشاء الفئة" }, { status: 500 });
  }
}
