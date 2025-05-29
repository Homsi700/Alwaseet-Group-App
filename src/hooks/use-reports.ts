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

// استخدام تقرير المخزون
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