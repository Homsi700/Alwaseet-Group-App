import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// استخدام تقرير المبيعات
export function useSalesReport(options: {
  startDate?: Date;
  endDate?: Date;
  period?: 'daily' | 'monthly';
}) {
  const { startDate, endDate, period = 'monthly' } = options;
  
  // بناء معلمات الاستعلام
  const queryParams = new URLSearchParams();
  
  if (startDate) {
    queryParams.append('startDate', startDate.toISOString());
  }
  
  if (endDate) {
    queryParams.append('endDate', endDate.toISOString());
  }
  
  queryParams.append('period', period);
  
  // استعلام البيانات
  return useQuery({
    queryKey: ['salesReport', { startDate, endDate, period }],
    queryFn: async () => {
      const response = await fetch(`/api/reports/sales?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('فشل في الحصول على تقرير المبيعات');
      }
      
      return response.json();
    },
  });
}

// استخدام تقرير المخزون العام
export function useInventoryReport(options: {
  categoryId?: string;
}) {
  const { categoryId } = options;
  
  // بناء معلمات الاستعلام
  const queryParams = new URLSearchParams();
  
  if (categoryId) {
    queryParams.append('categoryId', categoryId);
  }
  
  // استعلام البيانات
  return useQuery({
    queryKey: ['inventoryReport', { categoryId }],
    queryFn: async () => {
      const response = await fetch(`/api/reports/inventory?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('فشل في الحصول على تقرير المخزون');
      }
      
      return response.json();
    },
  });
}

// استخدام تقرير حالة المخزون
export function useInventoryStatusReport(options: {
  categoryId?: string;
  search?: string;
}) {
  const { categoryId, search } = options;
  
  // بناء معلمات الاستعلام
  const queryParams = new URLSearchParams();
  
  if (categoryId) {
    queryParams.append('categoryId', categoryId);
  }
  
  if (search) {
    queryParams.append('search', search);
  }
  
  // استعلام البيانات
  return useQuery({
    queryKey: ['inventoryStatusReport', { categoryId, search }],
    queryFn: async () => {
      const response = await fetch(`/api/reports/inventory/status?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('فشل في الحصول على تقرير حالة المخزون');
      }
      
      return response.json();
    },
  });
}

// استخدام تقرير المنتجات منخفضة المخزون
export function useLowStockReport(options: {
  categoryId?: string;
  status?: 'LOW_STOCK' | 'OUT_OF_STOCK';
}) {
  const { categoryId, status } = options;
  
  // بناء معلمات الاستعلام
  const queryParams = new URLSearchParams();
  
  if (categoryId) {
    queryParams.append('categoryId', categoryId);
  }
  
  if (status) {
    queryParams.append('status', status);
  }
  
  // استعلام البيانات
  return useQuery({
    queryKey: ['lowStockReport', { categoryId, status }],
    queryFn: async () => {
      const response = await fetch(`/api/reports/inventory/low-stock?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('فشل في الحصول على تقرير المنتجات منخفضة المخزون');
      }
      
      return response.json();
    },
  });
}

// استخدام تقرير حركة المخزون
export function useInventoryMovementReport(options: {
  fromDate?: Date;
  toDate?: Date;
  categoryId?: string;
  productId?: string;
  type?: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN';
}) {
  const { fromDate, toDate, categoryId, productId, type } = options;
  
  // بناء معلمات الاستعلام
  const queryParams = new URLSearchParams();
  
  if (fromDate) {
    queryParams.append('fromDate', fromDate.toISOString());
  }
  
  if (toDate) {
    queryParams.append('toDate', toDate.toISOString());
  }
  
  if (categoryId) {
    queryParams.append('categoryId', categoryId);
  }
  
  if (productId) {
    queryParams.append('productId', productId);
  }
  
  if (type) {
    queryParams.append('type', type);
  }
  
  // استعلام البيانات
  return useQuery({
    queryKey: ['inventoryMovementReport', { fromDate, toDate, categoryId, productId, type }],
    queryFn: async () => {
      const response = await fetch(`/api/reports/inventory/movement?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('فشل في الحصول على تقرير حركة المخزون');
      }
      
      return response.json();
    },
  });
}

// استخدام تقرير تقييم المخزون
export function useInventoryValuationReport(options: {
  categoryId?: string;
  search?: string;
  valuationMethod?: 'FIFO' | 'LIFO' | 'AVERAGE' | 'STANDARD';
}) {
  const { categoryId, search, valuationMethod = 'FIFO' } = options;
  
  // بناء معلمات الاستعلام
  const queryParams = new URLSearchParams();
  
  if (categoryId) {
    queryParams.append('categoryId', categoryId);
  }
  
  if (search) {
    queryParams.append('search', search);
  }
  
  queryParams.append('valuationMethod', valuationMethod);
  
  // استعلام البيانات
  return useQuery({
    queryKey: ['inventoryValuationReport', { categoryId, search, valuationMethod }],
    queryFn: async () => {
      const response = await fetch(`/api/reports/inventory/valuation?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('فشل في الحصول على تقرير تقييم المخزون');
      }
      
      return response.json();
    },
  });
}

// استخدام تقرير أداء المنتجات
export function useProductPerformanceReport(options: {
  categoryId?: string;
  fromDate?: Date;
  toDate?: Date;
}) {
  const { categoryId, fromDate, toDate } = options;
  
  // بناء معلمات الاستعلام
  const queryParams = new URLSearchParams();
  
  if (categoryId) {
    queryParams.append('categoryId', categoryId);
  }
  
  if (fromDate) {
    queryParams.append('fromDate', fromDate.toISOString());
  }
  
  if (toDate) {
    queryParams.append('toDate', toDate.toISOString());
  }
  
  // استعلام البيانات
  return useQuery({
    queryKey: ['productPerformanceReport', { categoryId, fromDate, toDate }],
    queryFn: async () => {
      const response = await fetch(`/api/reports/inventory/performance?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('فشل في الحصول على تقرير أداء المنتجات');
      }
      
      return response.json();
    },
  });
}

// استخدام التقرير المالي
export function useFinancialReport(options: {
  startDate?: Date;
  endDate?: Date;
  period?: 'monthly' | 'quarterly' | 'yearly';
}) {
  const { startDate, endDate, period = 'monthly' } = options;
  
  // بناء معلمات الاستعلام
  const queryParams = new URLSearchParams();
  
  if (startDate) {
    queryParams.append('startDate', startDate.toISOString());
  }
  
  if (endDate) {
    queryParams.append('endDate', endDate.toISOString());
  }
  
  queryParams.append('period', period);
  
  // استعلام البيانات
  return useQuery({
    queryKey: ['financialReport', { startDate, endDate, period }],
    queryFn: async () => {
      const response = await fetch(`/api/reports/financial?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('فشل في الحصول على التقرير المالي');
      }
      
      return response.json();
    },
  });
}