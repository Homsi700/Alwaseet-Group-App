import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { Customer } from '@/hooks/use-customers';

// واجهة الخصائص
interface CustomerFormProps {
  initialData?: Partial<Customer>;
  onSubmit: (data: Customer) => Promise<void>;
  isSubmitting: boolean;
  mode: 'create' | 'edit';
}

export function CustomerForm({ initialData, onSubmit, isSubmitting, mode }: CustomerFormProps) {
  const [formData, setFormData] = useState<Partial<Customer>>(initialData || {
    name: '',
    email: '',
    phone: '',
    address: '',
    vatNumber: '',
    notes: '',
  });
  
  // تحديث حقل في النموذج
  const updateField = (field: keyof Customer, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // تقديم النموذج
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من البيانات المطلوبة
    if (!formData.name) {
      alert('يرجى إدخال اسم العميل');
      return;
    }
    
    // إرسال البيانات
    await onSubmit(formData as Customer);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">اسم العميل <span className="text-destructive">*</span></Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="أدخل اسم العميل"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => updateField('email', e.target.value)}
              placeholder="example@domain.com"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => updateField('phone', e.target.value)}
              placeholder="05xxxxxxxx"
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="address">العنوان</Label>
            <Textarea
              id="address"
              value={formData.address || ''}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="أدخل عنوان العميل"
              disabled={isSubmitting}
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="vatNumber">الرقم الضريبي</Label>
            <Input
              id="vatNumber"
              value={formData.vatNumber || ''}
              onChange={(e) => updateField('vatNumber', e.target.value)}
              placeholder="أدخل الرقم الضريبي إن وجد"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="أي ملاحظات إضافية"
              disabled={isSubmitting}
              rows={3}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="min-w-[150px]"
        >
          {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
          {mode === 'create' ? 'إضافة العميل' : 'تحديث العميل'}
        </Button>
      </div>
    </form>
  );
}