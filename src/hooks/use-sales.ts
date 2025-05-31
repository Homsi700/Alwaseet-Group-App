import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// أنواع البيانات
export interface SaleItem {
  id?: string;
  productId: string;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
  product?: {
    id: string;
    name: string;
    sku?: string;
    barcode?: string;
  };
}

export interface Sale {
  id?: string;
  invoiceNumber?: string;
  date: Date | string;
  total: number;
  discount?: number;
  tax?: number;
  notes?: string;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  paymentMethod?: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CHECK' | 'OTHER';
  customerId?: string;
  customer?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  items: SaleItem[];
}

// استخدام قائمة المبيعات
export function useSales(filters?: {
  searchTerm?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: string;
  customerId?: string;
}) {
  const queryParams = new URLSearchParams();
  
  if (filters?.searchTerm) {
    queryParams.append('searchTerm', filters.searchTerm);
  }
  
  if (filters?.startDate) {
    queryParams.append('startDate', filters.startDate.toString());
  }
  
  if (filters?.endDate) {
    queryParams.append('endDate', filters.endDate.toString());
  }
  
  if (filters?.status) {
    queryParams.append('status', filters.status);
  }
  
  if (filters?.customerId) {
    queryParams.append('customerId', filters.customerId);
  }
  
  return useQuery({
    queryKey: ['sales', filters],
    queryFn: async () => {
      const response = await fetch(`/api/sales?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('فشل في الحصول على المبيعات');
      }
      
      const sales = await response.json();
      
      // حساب الإحصائيات
      const totalSales = sales.reduce((sum: number, sale: Sale) => sum + (sale.total || 0), 0);
      const totalInvoices = sales.length;
      const averageInvoiceValue = totalInvoices > 0 ? totalSales / totalInvoices : 0;
      
      // تصنيف المبيعات حسب الحالة
      const completedSales = sales.filter((sale: Sale) => sale.status === 'COMPLETED').length;
      const pendingSales = sales.filter((sale: Sale) => sale.status === 'PENDING').length;
      const cancelledSales = sales.filter((sale: Sale) => sale.status === 'CANCELLED').length;
      const refundedSales = sales.filter((sale: Sale) => sale.status === 'REFUNDED').length;
      
      // إرجاع البيانات مع الإحصائيات
      return {
        sales,
        summary: {
          totalSales,
          totalInvoices,
          averageInvoiceValue,
          completedSales,
          pendingSales,
          cancelledSales,
          refundedSales
        }
      };
    },
  });
}

// استخدام مبيعة محددة
export function useSale(saleId?: string) {
  return useQuery({
    queryKey: ['sale', saleId],
    queryFn: async () => {
      if (!saleId) return null;
      
      const response = await fetch(`/api/sales/${saleId}`);
      
      if (!response.ok) {
        throw new Error('فشل في الحصول على المبيعة');
      }
      
      return response.json();
    },
    enabled: !!saleId,
  });
}

// استخدام إنشاء مبيعة جديدة
export function useCreateSale() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newSale: Sale) => {
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSale),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل في إنشاء المبيعة');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: 'تم إنشاء المبيعة بنجاح',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// استخدام تحديث مبيعة
export function useUpdateSale() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ saleId, data }: { saleId: string; data: Partial<Sale> }) => {
      const response = await fetch(`/api/sales/${saleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل في تحديث المبيعة');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', variables.saleId] });
      toast({
        title: 'تم تحديث المبيعة بنجاح',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// استخدام حذف مبيعة
export function useDeleteSale() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (saleId: string) => {
      const response = await fetch(`/api/sales/${saleId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل في حذف المبيعة');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast({
        title: 'تم حذف المبيعة بنجاح',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}