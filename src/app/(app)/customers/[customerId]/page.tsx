'use client';

import { useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Loader2, 
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard
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
import { useCustomer, useUpdateCustomer, useDeleteCustomer } from '@/hooks/use-customers';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { useToast } from '@/hooks/use-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// إنشاء عميل React Query
const queryClient = new QueryClient();

// تنسيق التاريخ
const formatDate = (date: string | Date) => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ar });
};

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

function CustomerDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const customerId = params.customerId as string;
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(searchParams.get('edit') === 'true');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // استخدام hooks للعميل
  const { data: customer, isLoading, isError, error } = useCustomer(customerId);
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();
  
  // تحديث العميل
  const handleUpdateCustomer = async (updatedCustomer: any) => {
    try {
      await updateCustomerMutation.mutateAsync({ customerId, data: updatedCustomer });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('خطأ في تحديث العميل:', error);
    }
  };
  
  // حذف العميل
  const handleDeleteCustomer = async () => {
    try {
      await deleteCustomerMutation.mutateAsync(customerId);
      router.push('/customers');
      toast({
        title: 'تم حذف العميل بنجاح',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('خطأ في حذف العميل:', error);
      toast({
        title: 'خطأ في حذف العميل',
        description: error.message || 'حدث خطأ أثناء حذف العميل',
        variant: 'destructive',
      });
    }
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
  
  if (!customer) {
    return (
      <div className="flex justify-center items-center h-64 text-muted-foreground">
        <span>لم يتم العثور على العميل</span>
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
            onClick={() => router.push('/customers')}
            className="ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">تفاصيل العميل</h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Edit className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" />
                تعديل
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>تعديل بيانات العميل</DialogTitle>
                <DialogDescription>
                  قم بتعديل بيانات العميل. اضغط على حفظ عند الانتهاء.
                </DialogDescription>
              </DialogHeader>
              <CustomerForm
                initialData={customer}
                onSubmit={handleUpdateCustomer}
                isSubmitting={updateCustomerMutation.isPending}
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
                  هل أنت متأكد من رغبتك في حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.
                  <br />
                  <span className="text-destructive font-medium mt-2 block">
                    ملاحظة: لا يمكن حذف العميل إذا كان مرتبطاً بمبيعات.
                  </span>
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
                  onClick={handleDeleteCustomer}
                  disabled={deleteCustomerMutation.isPending}
                >
                  {deleteCustomerMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                  حذف
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-lg rounded-lg border-border md:col-span-2">
          <CardHeader>
            <CardTitle>معلومات العميل</CardTitle>
            <CardDescription>
              البيانات الأساسية للعميل
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-muted/50 p-2 rounded-full ml-3 rtl:mr-3">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                    <p className="font-medium">{customer.phone || 'غير محدد'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-muted/50 p-2 rounded-full ml-3 rtl:mr-3">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                    <p className="font-medium">{customer.email || 'غير محدد'}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-muted/50 p-2 rounded-full ml-3 rtl:mr-3">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">العنوان</p>
                    <p className="font-medium">{customer.address || 'غير محدد'}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-muted/50 p-2 rounded-full ml-3 rtl:mr-3">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الرقم الضريبي</p>
                    <p className="font-medium">{customer.vatNumber || 'غير محدد'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {customer.notes && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="font-medium mb-2">ملاحظات</h3>
                <p className="text-muted-foreground">{customer.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg rounded-lg border-border">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="ml-2 rtl:mr-2 h-5 w-5 text-primary icon-directional" />
              الرصيد والمعاملات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-md">
                <p className="text-sm text-muted-foreground">الرصيد الحالي</p>
                <p className="text-2xl font-bold text-primary">1,250.00 ريال</p>
                <p className="text-xs text-muted-foreground mt-1">آخر تحديث: {formatDate(new Date())}</p>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>إجمالي المبيعات</span>
                <span className="font-medium">5,750.00 ريال</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>إجمالي المدفوعات</span>
                <span className="font-medium">4,500.00 ريال</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle>آخر المعاملات</CardTitle>
          <CardDescription>
            آخر المبيعات والمدفوعات للعميل
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الفاتورة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead className="text-right rtl:text-left">المبلغ (ر.س)</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.sales && customer.sales.length > 0 ? (
                  customer.sales.map((sale: any) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.invoiceNumber || '-'}</TableCell>
                      <TableCell>{formatDate(sale.date)}</TableCell>
                      <TableCell>فاتورة مبيعات</TableCell>
                      <TableCell className="text-right rtl:text-left">{sale.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          sale.status === 'COMPLETED' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                          sale.status === 'PENDING' ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}>
                          {translateSaleStatus(sale.status)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-md"
                          onClick={() => window.location.href = `/sales/${sale.id}`}
                        >
                          عرض
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      لا توجد معاملات سابقة لهذا العميل.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CustomerDetailPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomerDetailContent />
    </QueryClientProvider>
  );
}