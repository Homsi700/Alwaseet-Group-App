import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { Sale, SaleItem } from '@/hooks/use-sales';
import { SaleItemsTable } from './SaleItemsTable';

// واجهة الخصائص
interface SaleFormProps {
  initialData?: Partial<Sale>;
  onSubmit: (data: Sale) => Promise<void>;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

// واجهة العميل
interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

// جلب العملاء من API
const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await fetch('/api/customers');
    if (!response.ok) {
      throw new Error('فشل في جلب العملاء');
    }
    return response.json();
  } catch (error) {
    console.error('خطأ في جلب العملاء:', error);
    // إرجاع بيانات وهمية مؤقتاً حتى يتم تنفيذ API العملاء
    return [
      { id: 'customer-1', name: 'شركة الأمل للتجارة', phone: '0987654321', email: 'contact@alamal.com' },
      { id: 'customer-2', name: 'مؤسسة النجاح الحديثة', phone: '0912345678', email: 'info@najah.com' },
      { id: 'customer-3', name: 'محلات الوفاء', phone: '0933333333', email: 'sales@alwafa.com' },
    ];
  }
};

export function SaleForm({ initialData, onSubmit, isSubmitting, mode }: SaleFormProps) {
  const [formData, setFormData] = useState<Partial<Sale>>(initialData || {
    date: new Date(),
    items: [],
    status: 'COMPLETED',
    paymentMethod: 'CASH',
    total: 0,
    discount: 0,
    tax: 0,
  });
  
  // استخدام React Query لجلب العملاء
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });
  
  // تحديث حقل في النموذج
  const updateField = (field: keyof Sale, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // تحديث عناصر المبيعة
  const handleItemsChange = (items: SaleItem[]) => {
    updateField('items', items);
  };
  
  // تحديث الإجمالي
  const handleTotalChange = (total: number) => {
    updateField('total', total);
  };
  
  // تقديم النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من البيانات المطلوبة
    if (!formData.customerId) {
      alert('يرجى اختيار العميل');
      return;
    }
    
    if (!formData.items || formData.items.length === 0) {
      alert('يرجى إضافة منتج واحد على الأقل');
      return;
    }
    
    // إرسال البيانات
    await onSubmit(formData as Sale);
  };
  
  // تنسيق التاريخ للعرض في حقل التاريخ
  const formatDateForInput = (date: Date | string | undefined) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="customer">العميل</Label>
            <Select
              value={formData.customerId}
              onValueChange={(value) => updateField('customerId', value)}
              disabled={isLoadingCustomers || isSubmitting}
            >
              <SelectTrigger id="customer">
                <SelectValue placeholder="اختر العميل" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingCustomers ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    <span>جاري التحميل...</span>
                  </div>
                ) : customers.length === 0 ? (
                  <div className="p-2">لا يوجد عملاء</div>
                ) : (
                  customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="invoiceNumber">رقم الفاتورة</Label>
            <Input
              id="invoiceNumber"
              value={formData.invoiceNumber || ''}
              onChange={(e) => updateField('invoiceNumber', e.target.value)}
              placeholder="سيتم إنشاؤه تلقائياً إذا تركته فارغاً"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <Label htmlFor="date">التاريخ</Label>
            <Input
              id="date"
              type="date"
              value={formatDateForInput(formData.date)}
              onChange={(e) => updateField('date', new Date(e.target.value))}
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">الحالة</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => updateField('status', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="اختر الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPLETED">مكتملة</SelectItem>
                <SelectItem value="PENDING">معلقة</SelectItem>
                <SelectItem value="CANCELLED">ملغية</SelectItem>
                <SelectItem value="REFUNDED">مستردة</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="paymentMethod">طريقة الدفع</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value: any) => updateField('paymentMethod', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="paymentMethod">
                <SelectValue placeholder="اختر طريقة الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">نقداً</SelectItem>
                <SelectItem value="CREDIT_CARD">بطاقة ائتمان</SelectItem>
                <SelectItem value="BANK_TRANSFER">تحويل بنكي</SelectItem>
                <SelectItem value="CHECK">شيك</SelectItem>
                <SelectItem value="OTHER">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="أي ملاحظات إضافية"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>
      
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">عناصر الفاتورة</h3>
        <SaleItemsTable
          items={formData.items || []}
          onItemsChange={handleItemsChange}
          onTotalChange={handleTotalChange}
        />
      </div>
      
      <div className="border-t pt-6">
        <div className="flex flex-col md:flex-row md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>المجموع الفرعي:</span>
              <span>{formData.total?.toFixed(2) || '0.00'} ريال</span>
            </div>
            <div className="flex justify-between">
              <span>الضريبة ({formData.tax ? ((formData.tax / formData.total!) * 100).toFixed(0) : '0'}%):</span>
              <span>{formData.tax?.toFixed(2) || '0.00'} ريال</span>
            </div>
            <div className="flex justify-between">
              <span>الخصم:</span>
              <span>{formData.discount?.toFixed(2) || '0.00'} ريال</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>الإجمالي:</span>
              <span>{((formData.total || 0) + (formData.tax || 0) - (formData.discount || 0)).toFixed(2)} ريال</span>
            </div>
          </div>
          
          <div className="flex items-end justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[150px]"
            >
              {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {mode === 'create' ? 'إنشاء الفاتورة' : 'تحديث الفاتورة'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}