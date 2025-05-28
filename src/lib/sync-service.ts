// src/lib/sync-service.ts
import type { Product, Category } from '@/types';

// Function to load all data from localStorage to memory
export const loadDataFromStorage = () => {
  if (typeof window === 'undefined') return;
  
  console.log("[sync-service] Loading data from localStorage");
  
  try {
    // Load products
    const storedProducts = localStorage.getItem('mockProducts');
    if (storedProducts) {
      console.log("[sync-service] Found products in localStorage");
    } else {
      console.log("[sync-service] No products found in localStorage");
    }
    
    // Load categories
    const storedCategories = localStorage.getItem('mockCategories');
    if (storedCategories) {
      console.log("[sync-service] Found categories in localStorage");
    } else {
      console.log("[sync-service] No categories found in localStorage");
    }
  } catch (error) {
    console.error("[sync-service] Error loading data from localStorage:", error);
  }
};

// Function to save product to localStorage
export const saveProductToStorage = (product: Product) => {
  if (typeof window === 'undefined') return;
  
  try {
    // Get existing products
    const storedProducts = localStorage.getItem('mockProducts');
    let products: Product[] = [];
    
    if (storedProducts) {
      products = JSON.parse(storedProducts);
    }
    
    // Check if product already exists
    const index = products.findIndex(p => p.productId === product.productId);
    
    if (index !== -1) {
      // Update existing product
      products[index] = product;
    } else {
      // Add new product
      products.push(product);
    }
    
    // Save back to localStorage
    localStorage.setItem('mockProducts', JSON.stringify(products));
    console.log("[sync-service] Saved product to localStorage:", product.name);
  } catch (error) {
    console.error("[sync-service] Error saving product to localStorage:", error);
  }
};

// Function to get all products from localStorage
export const getProductsFromStorage = (): Product[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedProducts = localStorage.getItem('mockProducts');
    if (storedProducts) {
      return JSON.parse(storedProducts);
    }
  } catch (error) {
    console.error("[sync-service] Error getting products from localStorage:", error);
  }
  
  return [];
};

// Function to get all categories from localStorage
export const getCategoriesFromStorage = (): Category[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const storedCategories = localStorage.getItem('mockCategories');
    if (storedCategories) {
      return JSON.parse(storedCategories);
    }
  } catch (error) {
    console.error("[sync-service] Error getting categories from localStorage:", error);
  }
  
  return [];
};