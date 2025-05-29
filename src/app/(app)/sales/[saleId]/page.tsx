'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  Printer, 
  FileText, 
  Edit, 
  Trash2, 
  Loader2, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useSale, useDeleteSale, useUpdateSale } from '@/hooks/use-sales';
import { SaleForm } from '@/components/sales/SaleForm';
import { useToast } from '@/hooks/use-toast';
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

// أيقونة حالة المبيعة
const getSaleStatusIcon = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'PENDING':
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case 'CANCELLED':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'REFUNDED':
      return <RefreshCw className="h-5 w-5 text-blue-500" />;
    default:
      return null;
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

function SaleDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const saleId = params.saleId as string;
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  
  // استخدام hooks للمبيعة
  const { data: sale, isLoading, isError, error } = useSale(saleId);
  const updateSaleMutation = useUpdateSale();
  const deleteSaleMutation = useDeleteSale();
  
  // تحديث المبيعة
  const handleUpdateSale = async (updatedSale: any) => {
    try {
      await updateSaleMutation.mutateAsync({ saleId, data: updatedSale });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('خطأ في تحديث المبيعة:', error);
    }
  };
  
  // حذف المبيعة
  const handleDeleteSale = async () => {
    try {
      await deleteSaleMutation.mutateAsync(saleId);
      router.push('/sales');
      toast({
        title: 'تم حذف المبيعة بنجاح',
        variant: 'default',
      });
    } catch (error) {
      console.error('خطأ في حذف المبيعة:', error);
    }
  };
  
  // طباعة الفاتورة
  const handlePrintInvoice = () => {
    setIsPrintDialogOpen(false);
    window.print();
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
        <span>جاري تحميل البيانات...</span>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex justify-center items-center h-64 text-destructive">
        <AlertCircle className="h-8 w-8 ml-2" />
        <span>حدث خطأ أثناء تحميل البيانات: {error?.message}</span>
      </div>
    );
  }
  
  if (!sale) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        <span>لم يتم العثور على المبيعة</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/sales')}
            className="ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">تفاصيل الفاتورة</h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Printer className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" />
                طباعة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>طباعة الفاتورة</DialogTitle>
                <DialogDescription>
                  هل تريد طباعة الفاتورة الآن؟
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsPrintDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button onClick={handlePrintInvoice}>
                  <Printer className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" />
                  طباعة
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <FileText className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" />
            تصدير PDF
          </Button>
          
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Edit className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" />
                تعديل
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>تعديل الفاتورة</DialogTitle>
                <DialogDescription>
                  قم بتعديل بيانات الفاتورة. اضغط على حفظ عند الانتهاء.
                </DialogDescription>
              </DialogHeader>
              <SaleForm
                initialData={sale}
                onSubmit={handleUpdateSale}
                isSubmitting={updateSaleMutation.isPending}
                mode="edit"
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" />
                حذف
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تأكيد الحذف</DialogTitle>
                <DialogDescription>
                  هل أنت متأكد من رغبتك في حذف هذه الفاتورة؟ لا يمكن التراجع عن هذا الإجراء.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button
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
      </div>
      
      <div className="print-section">
        <Card className="shadow-lg rounded-lg border-border">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">فاتورة مبيعات #{sale.invoiceNumber || saleId}</CardTitle>
                <CardDescription className="mt-1">
                  تاريخ الفاتورة: {formatDate(sale.date)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 bg-muted/30 px-3 py-1 rounded-full">
                {getSaleStatusIcon(sale.status)}
                <span className="font-medium">{translateSaleStatus(sale.status)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">بيانات العميل</h3>
                <div className="bg-muted/30 p-4 rounded-md">
                  <p className="font-medium">{sale.customer?.name || 'عميل غير محدد'}</p>
                  {sale.customer?.phone && <p>هاتف: {sale.customer.phone}</p>}
                  {sale.customer?.email && <p>بريد إلكتروني: {sale.customer.email}</p>}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">تفاصيل الدفع</h3>
                <div className="bg-muted/30 p-4 rounded-md">
                  <p>طريقة الدفع: {translatePaymentMethod(sale.paymentMethod)}</p>
                  <p>حالة الفاتورة: {translateSaleStatus(sale.status)}</p>
                  {sale.notes && <p>ملاحظات: {sale.notes}</p>}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3">عناصر الفاتورة</h3>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المنتج</TableHead>
                      <TableHead className="text-center">الكمية</TableHead>
                      <TableHead className="text-center">السعر</TableHead>
                      <TableHead className="text-center">الخصم</TableHead>
                      <TableHead className="text-right rtl:text-left">الإجمالي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sale.items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                          لا توجد عناصر في هذه الفاتورة
                        </TableCell>
                      </TableRow>
                    ) : (
                      sale.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product?.name || 'منتج غير معروف'}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-center">{item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-center">{(item.discount || 0).toFixed(2)}</TableCell>
                          <TableCell className="text-right rtl:text-left font-medium">
                            {item.total.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <div className="w-full max-w-xs space-y-2">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{sale.total.toFixed(2)} ريال</span>
                </div>
                <div className="flex justify-between">
                  <span>الضريبة:</span>
                  <span>{(sale.tax || 0).toFixed(2)} ريال</span>
                </div>
                <div className="flex justify-between">
                  <span>الخصم:</span>
                  <span>{(sale.discount || 0).toFixed(2)} ريال</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>الإجمالي:</span>
                  <span>{((sale.total) + (sale.tax || 0) - (sale.discount || 0)).toFixed(2)} ريال</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center text-sm text-muted-foreground print-footer">
              <p>شكراً لتعاملكم معنا</p>
              <p>تم إنشاء هذه الفاتورة بواسطة نظام مجموعة الوسيط</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SaleDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <SaleDetailContent />
    </QueryClientProvider>
  );
}