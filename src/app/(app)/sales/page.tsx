
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, PlusCircle, Filter, FileText, Search, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useSales, useCreateSale, useDeleteSale, Sale } from '@/hooks/use-sales';
import { useToast } from '@/hooks/use-toast';
import { ExportData } from '@/components/export/export-data';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// إنشاء عميل React Query
const queryClient = new QueryClient();

// ترجمة حالة المبيعة
const translateSaleStatus = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'مكتملة';
    case 'PENDING':
      return 'معلقة';
    case 'CANCELLED':
      return 'ملغية';
    case 'REFUNDED':
      return 'مستردة';
    default:
      return status;
  }
};

// ترجمة طريقة الدفع
const translatePaymentMethod = (method: string) => {
  switch (method) {
    case 'CASH':
      return 'نقداً';
    case 'CREDIT_CARD':
      return 'بطاقة ائتمان';
    case 'BANK_TRANSFER':
      return 'تحويل بنكي';
    case 'CHECK':
      return 'شيك';
    case 'OTHER':
      return 'أخرى';
    default:
      return method;
  }
};

// تنسيق التاريخ
const formatDate = (date: string | Date) => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ar });
};

function SalesContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [newSale, setNewSale] = useState<Partial<Sale>>({
    date: new Date(),
    items: [],
    status: 'COMPLETED',
    paymentMethod: 'CASH',
  });
  
  const { toast } = useToast();
  
  // استخدام hooks للمبيعات
  const { data: sales = [], isLoading, isError, error } = useSales({ searchTerm });
  const createSaleMutation = useCreateSale();
  const deleteSaleMutation = useDeleteSale();
  
  // تحديث حقل في المبيعة الجديدة
  const updateNewSale = (field: keyof Sale, value: any) => {
    setNewSale(prev => ({ ...prev, [field]: value }));
  };
  
  // إضافة مبيعة جديدة
  const handleAddSale = async () => {
    try {
      // التحقق من البيانات المطلوبة
      if (!newSale.customerId) {
        toast({
          title: 'خطأ',
          description: 'يرجى اختيار العميل',
          variant: 'destructive',
        });
        return;
      }
      
      if (!newSale.items || newSale.items.length === 0) {
        toast({
          title: 'خطأ',
          description: 'يرجى إضافة منتج واحد على الأقل',
          variant: 'destructive',
        });
        return;
      }
      
      // إرسال البيانات
      await createSaleMutation.mutateAsync(newSale as Sale);
      
      // إغلاق النافذة وإعادة تعيين النموذج
      setIsAddDialogOpen(false);
      setNewSale({
        date: new Date(),
        items: [],
        status: 'COMPLETED',
        paymentMethod: 'CASH',
      });
    } catch (error) {
      console.error('خطأ في إضافة المبيعة:', error);
    }
  };
  
  // حذف مبيعة
  const handleDeleteSale = async () => {
    if (!selectedSaleId) return;
    
    try {
      await deleteSaleMutation.mutateAsync(selectedSaleId);
      setIsDeleteDialogOpen(false);
      setSelectedSaleId(null);
    } catch (error) {
      console.error('خطأ في حذف المبيعة:', error);
    }
  };
  
  // تصدير البيانات
  const exportData = sales.map((sale: any) => ({
    'رقم الفاتورة': sale.invoiceNumber || '-',
    'التاريخ': formatDate(sale.date),
    'العميل': sale.customer?.name || 'عميل غير محدد',
    'الإجمالي': sale.total.toFixed(2),
    'الحالة': translateSaleStatus(sale.status),
    'طريقة الدفع': translatePaymentMethod(sale.paymentMethod),
  }));
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">إدارة المبيعات</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إضافة فاتورة مبيعات
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>إضافة فاتورة مبيعات جديدة</DialogTitle>
              <DialogDescription>
                أدخل بيانات فاتورة المبيعات الجديدة. اضغط على حفظ عند الانتهاء.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customer" className="text-left rtl:text-right">العميل</Label>
                <Select
                  value={newSale.customerId}
                  onValueChange={(value) => updateNewSale('customerId', value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer-1">شركة الأمل للتجارة</SelectItem>
                    <SelectItem value="customer-2">مؤسسة النجاح الحديثة</SelectItem>
                    <SelectItem value="customer-3">محلات الوفاء</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-left rtl:text-right">التاريخ</Label>
                <Input
                  id="date"
                  type="date"
                  value={newSale.date instanceof Date ? newSale.date.toISOString().split('T')[0] : String(newSale.date).split('T')[0]}
                  onChange={(e) => updateNewSale('date', new Date(e.target.value))}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-left rtl:text-right">الحالة</Label>
                <Select
                  value={newSale.status}
                  onValueChange={(value: any) => updateNewSale('status', value)}
                >
                  <SelectTrigger className="col-span-3">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paymentMethod" className="text-left rtl:text-right">طريقة الدفع</Label>
                <Select
                  value={newSale.paymentMethod}
                  onValueChange={(value: any) => updateNewSale('paymentMethod', value)}
                >
                  <SelectTrigger className="col-span-3">
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-left rtl:text-right">ملاحظات</Label>
                <Input
                  id="notes"
                  value={newSale.notes || ''}
                  onChange={(e) => updateNewSale('notes', e.target.value)}
                  className="col-span-3"
                  placeholder="أي ملاحظات إضافية"
                />
              </div>
              
              {/* هنا سيتم إضافة جدول لعناصر المبيعة */}
              <div className="col-span-4 mt-4">
                <Label className="mb-2 block">عناصر الفاتورة</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  سيتم هنا إضافة جدول لإدارة عناصر الفاتورة (المنتجات، الكميات، الأسعار).
                </p>
                <Button
                  variant="outline"
                  type="button"
                  className="w-full"
                  onClick={() => {
                    // إضافة عنصر وهمي للتجربة
                    const newItems = [...(newSale.items || []), {
                      productId: 'product-1',
                      quantity: 1,
                      price: 100,
                      total: 100
                    }];
                    updateNewSale('items', newItems);
                    // تحديث الإجمالي
                    const total = newItems.reduce((sum, item) => sum + item.total, 0);
                    updateNewSale('total', total);
                  }}
                >
                  <PlusCircle className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" />
                  إضافة منتج
                </Button>
              </div>
              
              {newSale.items && newSale.items.length > 0 && (
                <div className="col-span-4 mt-2">
                  <div className="text-sm font-medium">
                    عدد المنتجات: {newSale.items.length}
                  </div>
                  <div className="text-lg font-bold mt-2">
                    الإجمالي: {newSale.total?.toFixed(2) || '0.00'} ريال
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button
                type="button"
                onClick={handleAddSale}
                disabled={createSaleMutation.isPending}
              >
                {createSaleMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                حفظ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على المبيعات
          </CardTitle>
          <CardDescription>
            تتبع طلبات المبيعات، إنشاء الفواتير، إدارة مدفوعات العملاء، وتحليل أداء المبيعات.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في الفواتير..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-3 pr-10 w-full"
                />
              </div>
              <Button variant="outline" className="rounded-md">
                <Filter className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تصفية
              </Button>
            </div>
            <ExportData
              title="تقرير المبيعات"
              data={exportData}
              columns={[
                { header: 'رقم الفاتورة', accessor: 'رقم الفاتورة' },
                { header: 'التاريخ', accessor: 'التاريخ' },
                { header: 'العميل', accessor: 'العميل' },
                { header: 'الإجمالي (ر.س)', accessor: 'الإجمالي' },
                { header: 'الحالة', accessor: 'الحالة' },
                { header: 'طريقة الدفع', accessor: 'طريقة الدفع' },
              ]}
              fileName="sales-report"
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الفاتورة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead className="text-right rtl:text-left">الإجمالي (ر.س)</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary ml-2" />
                        <span>جاري تحميل البيانات...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center items-center text-destructive">
                        <AlertCircle className="h-6 w-6 ml-2" />
                        <span>حدث خطأ أثناء تحميل البيانات: {error?.message}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      لا توجد فواتير مبيعات لعرضها. قم بإضافة فاتورة جديدة.
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale: any) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.invoiceNumber || '-'}</TableCell>
                      <TableCell>{formatDate(sale.date)}</TableCell>
                      <TableCell>{sale.customer?.name || 'عميل غير محدد'}</TableCell>
                      <TableCell className="text-right rtl:text-left">{sale.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          sale.status === 'COMPLETED' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                          sale.status === 'PENDING' ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                          sale.status === 'CANCELLED' ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }`}>
                          {translateSaleStatus(sale.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm" className="rounded-md">عرض</Button>
                        <Button variant="ghost" size="sm" className="rounded-md">تعديل</Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-md text-destructive hover:text-destructive/90"
                          onClick={() => {
                            setSelectedSaleId(sale.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          حذف
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {/* نافذة تأكيد الحذف */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteSale}
              disabled={deleteSaleMutation.isPending}
            >
              {deleteSaleMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function SalesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SalesContent />
    </QueryClientProvider>
  );
}
