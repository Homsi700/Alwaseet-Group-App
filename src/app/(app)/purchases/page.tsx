
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  ShoppingBag, 
  PlusCircle, 
  Filter, 
  FileText, 
  Search, 
  Loader2, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { DateRangePicker } from "@/components/date-range-picker";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { usePurchases, useCreatePurchase, useDeletePurchase } from '@/hooks/use-purchases';
import { useToast } from '@/hooks/use-toast';
import { ExportData } from '@/components/export/export-data';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// إنشاء عميل React Query
const queryClient = new QueryClient();

// ترجمة حالة المشتراة
const translatePurchaseStatus = (status: string) => {
  switch (status) {
    case 'COMPLETED':
      return 'مكتملة';
    case 'PENDING':
      return 'معلقة';
    case 'CANCELLED':
      return 'ملغية';
    case 'RETURNED':
      return 'مرتجعة';
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

function PurchasesContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const { toast } = useToast();
  
  // استخدام hooks للمشتريات
  const { data, isLoading, isError, error, refetch } = usePurchases({
    searchTerm: searchTerm,
    startDate: selectedDateRange.from,
    endDate: selectedDateRange.to,
    status: selectedStatus !== 'all' ? selectedStatus.toUpperCase() : undefined
  });
  
  // تحضير المشتريات للعرض
  const purchases = data?.purchases || [];
  
  // حذف مشتراة
  const deletePurchaseMutation = useDeletePurchase();
  
  const handleDeletePurchase = async () => {
    if (!selectedPurchaseId) return;
    
    try {
      await deletePurchaseMutation.mutateAsync(selectedPurchaseId);
      setIsDeleteDialogOpen(false);
      setSelectedPurchaseId(null);
      refetch();
    } catch (error) {
      console.error('خطأ في حذف المشتراة:', error);
    }
  };
  
  // تصدير البيانات
  const exportData = purchases.map((purchase: any) => ({
    'رقم الفاتورة': purchase.invoiceNumber || '-',
    'التاريخ': formatDate(purchase.date),
    'المورد': purchase.supplier?.name || 'مورد غير محدد',
    'الإجمالي': purchase.total.toFixed(2),
    'الحالة': translatePurchaseStatus(purchase.status || ''),
    'طريقة الدفع': translatePaymentMethod(purchase.paymentMethod || ''),
  }));
  
  // إحصائيات المشتريات
  const totalPurchases = data?.summary?.totalPurchases || 0;
  const completedPurchases = data?.summary?.completedPurchases || 0;
  const pendingPurchases = data?.summary?.pendingPurchases || 0;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة المشتريات</h1>
          <p className="text-muted-foreground mt-1">إدارة أوامر الشراء وفواتير الموردين</p>
        </div>
        <Button 
          className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => router.push('/purchases/new')}
        >
          <PlusCircle className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إضافة أمر شراء
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">إجمالي المشتريات</h3>
                <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{totalPurchases.toLocaleString()} ر.س</p>
              </div>
              <ArrowDownLeft className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">الفواتير المكتملة</h3>
                <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{completedPurchases}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">الفواتير المعلقة</h3>
                <p className="text-2xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">{pendingPurchases}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBag className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على المشتريات
          </CardTitle>
          <CardDescription>
            إدارة أوامر الشراء، وتتبع فواتير الموردين، وتسجيل المدفوعات، والإشراف على عمليات الشراء.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في المشتريات..."
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
              title="قائمة المشتريات"
              data={exportData}
              columns={[
                { header: 'رقم الفاتورة', accessor: 'رقم الفاتورة' },
                { header: 'التاريخ', accessor: 'التاريخ' },
                { header: 'المورد', accessor: 'المورد' },
                { header: 'الإجمالي', accessor: 'الإجمالي' },
                { header: 'الحالة', accessor: 'الحالة' },
                { header: 'طريقة الدفع', accessor: 'طريقة الدفع' },
              ]}
              fileName="purchases-list"
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الفاتورة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المورد</TableHead>
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
                ) : purchases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      لا توجد مشتريات لعرضها. قم بإضافة أمر شراء جديد.
                    </TableCell>
                  </TableRow>
                ) : (
                  purchases.map((purchase: any) => {
                    const status = translatePurchaseStatus(purchase.status);
                    return (
                      <TableRow key={purchase.id}>
                        <TableCell className="font-medium">{purchase.invoiceNumber}</TableCell>
                        <TableCell>{formatDate(purchase.date)}</TableCell>
                        <TableCell>{purchase.supplier?.name || "مورد غير محدد"}</TableCell>
                        <TableCell className="text-right rtl:text-left">{purchase.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            purchase.status === 'COMPLETED' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                            purchase.status === 'PENDING' ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                            purchase.status === 'CANCELLED' ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                            "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" // RETURNED
                          }`}>
                            {status}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-md"
                            onClick={() => router.push(`/purchases/${purchase.id}`)}
                          >
                            عرض
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-md"
                            onClick={() => router.push(`/purchases/${purchase.id}?edit=true`)}
                          >
                            تعديل
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-md text-destructive hover:text-destructive/90"
                            onClick={() => {
                              setSelectedPurchaseId(purchase.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            حذف
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            هذا القسم مخصص لإدارة دورة المشتريات بالكامل، من إنشاء أوامر الشراء إلى استلام البضائع وتسجيل فواتير الموردين.
          </p>
        </CardContent>
      </Card>
      
      {/* نافذة تأكيد الحذف */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف أمر الشراء هذا؟ لا يمكن التراجع عن هذا الإجراء.
              <br />
              <span className="text-destructive font-medium mt-2 block">
                ملاحظة: لا يمكن حذف أوامر الشراء المكتملة.
              </span>
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
              onClick={handleDeletePurchase}
              disabled={deletePurchaseMutation.isPending}
            >
              {deletePurchaseMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function PurchasesPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <PurchasesContent />
    </QueryClientProvider>
  );
}
