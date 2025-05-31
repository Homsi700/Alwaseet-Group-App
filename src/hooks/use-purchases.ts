import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// أنواع البيانات
export interface PurchaseItem {
  id?: string;
  productId: string;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
  product?: {
    id: string;
    name: string;
    barcode?: string;
  };
}

export interface Purchase {
  id?: string;
  invoiceNumber?: string;
  date: Date | string;
  total: number;
  discount?: number;
  tax?: number;
  notes?: string;
  status?: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'RETURNED';
  paymentMethod?: 'CASH' | 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CHECK' | 'OTHER';
  supplierId?: string;
  supplier?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  items: PurchaseItem[];
}

// استخدام قائمة المشتريات
export function usePurchases(filters?: {
  searchTerm?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: string;
  supplierId?: string;
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
  
  if (filters?.supplierId) {
    queryParams.append('supplierId', filters.supplierId);
  }
  
  return useQuery({
    queryKey: ['purchases', filters],
    queryFn: async () => {
      const response = await fetch(`/api/purchases?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('فشل في الحصول على المشتريات');
      }
      
      return response.json();
    },
  });
}

// استخدام مشتراة محددة
export function usePurchase(purchaseId?: string) {
  return useQuery({
    queryKey: ['purchase', purchaseId],
    queryFn: async () => {
      if (!purchaseId) return null;
      
      const response = await fetch(`/api/purchases/${purchaseId}`);
      
      if (!response.ok) {
        throw new Error('فشل في الحصول على المشتراة');
      }
      
      return response.json();
    },
    enabled: !!purchaseId,
  });
}

// استخدام إنشاء مشتراة جديدة
export function useCreatePurchase() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (newPurchase: Purchase) => {
      const response = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPurchase),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل في إنشاء المشتراة');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast({
        title: 'تم إنشاء المشتراة بنجاح',
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

// استخدام تحديث مشتراة
export function useUpdatePurchase() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ purchaseId, data }: { purchaseId: string; data: Partial<Purchase> }) => {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل في تحديث المشتراة');
      }
      
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['purchase', variables.purchaseId] });
      toast({
        title: 'تم تحديث المشتراة بنجاح',
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

// استخدام حذف مشتراة
export function useDeletePurchase() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (purchaseId: string) => {
      const response = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'فشل في حذف المشتراة');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      toast({
        title: 'تم حذف المشتراة بنجاح',
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