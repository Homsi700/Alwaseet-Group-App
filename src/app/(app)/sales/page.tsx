
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingUp, 
  PlusCircle, 
  Filter, 
  FileText, 
  Search, 
  Loader2, 
  AlertCircle, 
  Eye, 
  Edit, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  BarChart4, 
  Calendar, 
  CreditCard, 
  Users 
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/date-range-picker";
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
    case 'PARTIALLY_PAID':
      return 'مدفوعة جزئياً';
    case 'UNPAID':
      return 'غير مدفوعة';
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

// بيانات وهمية للمبيعات
const mockSales: Sale[] = [
  {
    id: 'sale-1',
    invoiceNumber: 'INV-2024-001',
    date: new Date('2024-07-15'),
    total: 5250.00,
    discount: 250,
    tax: 500,
    notes: 'تم التسليم للعميل',
    status: 'COMPLETED',
    paymentMethod: 'CASH',
    customerId: 'customer-1',
    customer: {
      id: 'customer-1',
      name: 'شركة الأمل للتجارة',
      phone: '0123456789',
      email: 'info@alamal.com',
    },
    items: [
      {
        productId: 'product-1',
        quantity: 2,
        price: 1500,
        discount: 100,
        total: 2900,
        product: {
          id: 'product-1',
          name: 'لابتوب HP ProBook',
          sku: 'HP-PB-001',
          barcode: '123456789',
        }
      },
      {
        productId: 'product-2',
        quantity: 3,
        price: 700,
        discount: 50,
        total: 2050,
        product: {
          id: 'product-2',
          name: 'طابعة Canon',
          sku: 'CN-PR-001',
          barcode: '987654321',
        }
      }
    ]
  },
  {
    id: 'sale-2',
    invoiceNumber: 'INV-2024-002',
    date: new Date('2024-07-14'),
    total: 3200.00,
    tax: 200,
    notes: 'طلب عاجل',
    status: 'PENDING',
    paymentMethod: 'BANK_TRANSFER',
    customerId: 'customer-2',
    customer: {
      id: 'customer-2',
      name: 'مؤسسة النجاح الحديثة',
      phone: '0123456788',
      email: 'info@alnajah.com',
    },
    items: [
      {
        productId: 'product-3',
        quantity: 1,
        price: 3000,
        total: 3000,
        product: {
          id: 'product-3',
          name: 'جهاز عرض Epson',
          sku: 'EP-PJ-001',
          barcode: '456789123',
        }
      }
    ]
  },
  {
    id: 'sale-3',
    invoiceNumber: 'INV-2024-003',
    date: new Date('2024-07-13'),
    total: 1800.00,
    discount: 200,
    tax: 0,
    notes: 'تم الإلغاء بناءً على طلب العميل',
    status: 'CANCELLED',
    paymentMethod: 'CREDIT_CARD',
    customerId: 'customer-3',
    customer: {
      id: 'customer-3',
      name: 'محلات الوفاء',
      phone: '0123456787',
      email: 'info@alwafaa.com',
    },
    items: [
      {
        productId: 'product-4',
        quantity: 2,
        price: 1000,
        discount: 200,
        total: 1800,
        product: {
          id: 'product-4',
          name: 'هاتف Samsung Galaxy',
          sku: 'SG-PH-001',
          barcode: '789123456',
        }
      }
    ]
  },
  {
    id: 'sale-4',
    invoiceNumber: 'INV-2024-004',
    date: new Date('2024-07-12'),
    total: 7500.00,
    tax: 500,
    notes: 'تم استرداد المبلغ بالكامل',
    status: 'REFUNDED',
    paymentMethod: 'CASH',
    customerId: 'customer-1',
    customer: {
      id: 'customer-1',
      name: 'شركة الأمل للتجارة',
      phone: '0123456789',
      email: 'info@alamal.com',
    },
    items: [
      {
        productId: 'product-5',
        quantity: 1,
        price: 7000,
        total: 7000,
        product: {
          id: 'product-5',
          name: 'كمبيوتر مكتبي Dell',
          sku: 'DL-PC-001',
          barcode: '321654987',
        }
      }
    ]
  },
  {
    id: 'sale-5',
    invoiceNumber: 'INV-2024-005',
    date: new Date('2024-07-11'),
    total: 4200.00,
    discount: 300,
    tax: 300,
    notes: 'تم دفع 2000 ريال كدفعة أولى',
    status: 'PARTIALLY_PAID',
    paymentMethod: 'BANK_TRANSFER',
    customerId: 'customer-2',
    customer: {
      id: 'customer-2',
      name: 'مؤسسة النجاح الحديثة',
      phone: '0123456788',
      email: 'info@alnajah.com',
    },
    items: [
      {
        productId: 'product-6',
        quantity: 3,
        price: 1500,
        discount: 300,
        total: 4200,
        product: {
          id: 'product-6',
          name: 'شاشة LG',
          sku: 'LG-MN-001',
          barcode: '654987321',
        }
      }
    ]
  }
];

function SalesContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const { toast } = useToast();
  
  // استخدام hooks للمبيعات
  const { data, isLoading, isError, error, refetch } = useSales({
    searchTerm: searchTerm,
    startDate: selectedDateRange.from,
    endDate: selectedDateRange.to,
    status: selectedStatus !== 'all' ? selectedStatus.toUpperCase() : undefined
  });
  
  // تحضير المبيعات للعرض
  const filteredSales = data?.sales || [];
  
  // حذف مبيعة
  const deleteSaleMutation = useDeleteSale();
  
  const handleDeleteSale = async () => {
    if (!selectedSaleId) return;
    
    try {
      await deleteSaleMutation.mutateAsync(selectedSaleId);
      setIsDeleteDialogOpen(false);
      setSelectedSaleId(null);
      refetch();
    } catch (error) {
      console.error('خطأ في حذف المبيعة:', error);
    }
  };
  
  // تصدير البيانات
  const exportData = filteredSales.map((sale) => ({
    'رقم الفاتورة': sale.invoiceNumber || '-',
    'التاريخ': formatDate(sale.date),
    'العميل': sale.customer?.name || 'عميل غير محدد',
    'الإجمالي': sale.total.toFixed(2),
    'الحالة': translateSaleStatus(sale.status || ''),
    'طريقة الدفع': translatePaymentMethod(sale.paymentMethod || ''),
  }));
  
  // إحصائيات المبيعات
  const totalSales = data?.summary?.totalSales || 0;
  const completedSales = data?.summary?.completedSales || 0;
  const pendingSales = data?.summary?.pendingSales || 0;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة المبيعات</h1>
          <p className="text-muted-foreground mt-1">إدارة فواتير المبيعات ومتابعة حالتها</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={() => router.push('/sales/reports')}
          >
            <BarChart4 className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> تقارير المبيعات
          </Button>
          <Button 
            className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => router.push('/sales/new')}
          >
            <PlusCircle className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إضافة فاتورة مبيعات
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">إجمالي المبيعات</h3>
                <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{totalSales.toLocaleString()} ر.س</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">الفواتير المكتملة</h3>
                <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{completedSales}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">الفواتير المعلقة</h3>
                <p className="text-2xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">{pendingSales}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>
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
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في الفواتير..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-3 pr-10 w-full rounded-md"
                />
              </div>
              
              <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-md w-full sm:w-auto">
                    <Filter className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تصفية
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>تصفية المبيعات</DialogTitle>
                    <DialogDescription>
                      اختر معايير التصفية المناسبة لعرض المبيعات.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">الحالة</Label>
                      <Select
                        value={selectedStatus}
                        onValueChange={setSelectedStatus}
                      >
                        <SelectTrigger id="status" className="w-full">
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">جميع الحالات</SelectItem>
                          <SelectItem value="COMPLETED">مكتملة</SelectItem>
                          <SelectItem value="PENDING">معلقة</SelectItem>
                          <SelectItem value="CANCELLED">ملغية</SelectItem>
                          <SelectItem value="REFUNDED">مستردة</SelectItem>
                          <SelectItem value="PARTIALLY_PAID">مدفوعة جزئياً</SelectItem>
                          <SelectItem value="UNPAID">غير مدفوعة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateRange">الفترة الزمنية</Label>
                      <DateRangePicker
                        value={selectedDateRange}
                        onValueChange={setSelectedDateRange}
                        align="start"
                        locale="ar"
                        placeholder="اختر الفترة الزمنية"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedStatus('all');
                        setSelectedDateRange({});
                      }}
                    >
                      إعادة تعيين
                    </Button>
                    <Button 
                      type="button" 
                      onClick={() => setIsFilterOpen(false)}
                    >
                      تطبيق
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
              variant="outline"
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
                  <TableHead>طريقة الدفع</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary ml-2" />
                        <span>جاري تحميل البيانات...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex justify-center items-center text-destructive">
                        <AlertCircle className="h-6 w-6 ml-2" />
                        <span>حدث خطأ أثناء تحميل البيانات: {error?.message}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      لا توجد فواتير مبيعات لعرضها. قم بإضافة فاتورة جديدة.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">{sale.invoiceNumber || '-'}</TableCell>
                      <TableCell>{formatDate(sale.date)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 text-muted-foreground ml-2" />
                          {sale.customer?.name || 'عميل غير محدد'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right rtl:text-left font-medium">{sale.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`
                            ${sale.status === 'COMPLETED' ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800" :
                              sale.status === 'PENDING' ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800" :
                              sale.status === 'CANCELLED' ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" :
                              sale.status === 'REFUNDED' ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800" :
                              sale.status === 'PARTIALLY_PAID' ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" :
                              "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800"
                            }
                          `}
                        >
                          {translateSaleStatus(sale.status || '')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {sale.paymentMethod === 'CASH' ? (
                            <Banknote className="h-4 w-4 text-muted-foreground ml-2" />
                          ) : sale.paymentMethod === 'CREDIT_CARD' ? (
                            <CreditCard className="h-4 w-4 text-muted-foreground ml-2" />
                          ) : sale.paymentMethod === 'BANK_TRANSFER' ? (
                            <ArrowUpRight className="h-4 w-4 text-muted-foreground ml-2" />
                          ) : (
                            <FileText className="h-4 w-4 text-muted-foreground ml-2" />
                          )}
                          {translatePaymentMethod(sale.paymentMethod || '')}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-md"
                          onClick={() => router.push(`/sales/${sale.id}`)}
                        >
                          <Eye className="h-4 w-4 ml-1 rtl:mr-1 icon-directional" /> عرض
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-md"
                          onClick={() => router.push(`/sales/${sale.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 ml-1 rtl:mr-1 icon-directional" /> تعديل
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-md text-destructive hover:text-destructive/90"
                          onClick={() => {
                            setSelectedSaleId(sale.id || '');
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 ml-1 rtl:mr-1 icon-directional" /> حذف
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
            <div>إجمالي الفواتير: {filteredSales.length}</div>
            <div>إجمالي المبيعات: {totalSales.toLocaleString()} ر.س</div>
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
          <div className="py-4">
            {selectedSaleId && (
              <div className="border rounded-md p-3">
                <p className="font-medium">
                  {filteredSales.find(sale => sale.id === selectedSaleId)?.invoiceNumber || ''}
                </p>
                <p className="text-sm text-muted-foreground">
                  {filteredSales.find(sale => sale.id === selectedSaleId)?.customer?.name || ''}
                </p>
                <p className="text-lg font-bold mt-2">
                  {filteredSales.find(sale => sale.id === selectedSaleId)?.total.toFixed(2) || ''} ر.س
                </p>
              </div>
            )}
          </div>
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
            >
              <Trash2 className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تأكيد الحذف
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
