'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DatePicker } from "@/components/date-picker";
import { 
  ArrowLeft, 
  Download, 
  Search, 
  Filter, 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Printer, 
  FileText, 
  RefreshCw, 
  ShoppingCart, 
  Truck, 
  ArrowUpDown, 
  BarChart3 
} from "lucide-react";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { ExportData } from '@/components/export/export-data';
import { LowStockChart } from '@/components/charts/low-stock-chart';

// بيانات وهمية للمنتجات
const mockProducts = [
  {
    id: 'product-1',
    name: 'لابتوب HP ProBook',
    sku: 'HP-PB-001',
    barcode: '123456789',
    stock: 10,
    minStock: 3,
    maxStock: 20,
    unit: 'قطعة',
    costPrice: 1200,
    price: 1500,
    categoryId: 'category-1',
    category: {
      id: 'category-1',
      name: 'أجهزة كمبيوتر',
    },
    status: 'ACTIVE',
    lastPurchaseDate: '2024-06-10',
    lastSaleDate: '2024-06-15',
    avgSalesPerMonth: 5,
  },
  {
    id: 'product-5',
    name: 'كمبيوتر مكتبي Dell',
    sku: 'DL-PC-001',
    barcode: '321654987',
    stock: 3,
    minStock: 3,
    maxStock: 15,
    unit: 'قطعة',
    costPrice: 1500,
    price: 2000,
    categoryId: 'category-1',
    category: {
      id: 'category-1',
      name: 'أجهزة كمبيوتر',
    },
    status: 'LOW_STOCK',
    lastPurchaseDate: '2024-05-20',
    lastSaleDate: '2024-06-18',
    avgSalesPerMonth: 2,
  },
  {
    id: 'product-9',
    name: 'سماعات Sony',
    sku: 'SN-HP-001',
    barcode: '159753456',
    stock: 0,
    minStock: 5,
    maxStock: 15,
    unit: 'قطعة',
    costPrice: 150,
    price: 250,
    categoryId: 'category-7',
    category: {
      id: 'category-7',
      name: 'سماعات',
    },
    status: 'OUT_OF_STOCK',
    lastPurchaseDate: '2024-04-15',
    lastSaleDate: '2024-06-05',
    avgSalesPerMonth: 4,
  },
  {
    id: 'product-10',
    name: 'كاميرا Canon',
    sku: 'CN-CM-001',
    barcode: '753159456',
    stock: 2,
    minStock: 3,
    maxStock: 10,
    unit: 'قطعة',
    costPrice: 400,
    price: 600,
    categoryId: 'category-8',
    category: {
      id: 'category-8',
      name: 'كاميرات',
    },
    status: 'LOW_STOCK',
    lastPurchaseDate: '2024-05-10',
    lastSaleDate: '2024-06-12',
    avgSalesPerMonth: 3,
  },
  {
    id: 'product-11',
    name: 'حبر طابعة HP',
    sku: 'HP-INK-001',
    barcode: '951357852',
    stock: 1,
    minStock: 5,
    maxStock: 20,
    unit: 'قطعة',
    costPrice: 80,
    price: 120,
    categoryId: 'category-2',
    category: {
      id: 'category-2',
      name: 'طابعات',
    },
    status: 'LOW_STOCK',
    lastPurchaseDate: '2024-04-25',
    lastSaleDate: '2024-06-17',
    avgSalesPerMonth: 8,
  },
];

// بيانات وهمية للفئات
const mockCategories = [
  { id: 'category-1', name: 'أجهزة كمبيوتر' },
  { id: 'category-2', name: 'طابعات' },
  { id: 'category-3', name: 'أجهزة عرض' },
  { id: 'category-4', name: 'هواتف' },
  { id: 'category-5', name: 'شاشات' },
  { id: 'category-6', name: 'ملحقات' },
  { id: 'category-7', name: 'سماعات' },
  { id: 'category-8', name: 'كاميرات' },
];

// بيانات وهمية للرسوم البيانية
const mockChartData = {
  lowStockByCategory: {
    labels: ['أجهزة كمبيوتر', 'طابعات', 'سماعات', 'كاميرات'],
    data: [1, 1, 1, 1],
  },
};

export default function LowStockReport() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // في الواقع، سنستخدم useProducts و useCategories hooks
  // لكن هنا سنحاكي العملية
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // محاكاة جلب البيانات
        // فلترة المنتجات منخفضة المخزون أو التي نفذت
        const lowStockProducts = mockProducts.filter(
          product => product.stock <= product.minStock
        );
        
        setProducts(lowStockProducts);
        setCategories(mockCategories);
        setChartData(mockChartData);
        
        // التحقق من وجود تاريخ في الـ URL
        const dateParam = searchParams.get('date');
        if (dateParam) {
          setSelectedDate(new Date(dateParam));
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [searchParams]);
  
  // تصفية المنتجات
  const filteredProducts = products.filter(product => {
    // تصفية حسب الفئة
    if (selectedCategoryId && product.categoryId !== selectedCategoryId) {
      return false;
    }
    
    // تصفية حسب الحالة
    if (selectedStatus && product.status !== selectedStatus) {
      return false;
    }
    
    // تصفية حسب البحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.barcode.includes(query) ||
        product.category.name.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setSelectedCategoryId('');
    setSelectedStatus('');
    setSearchQuery('');
  };
  
  // حساب إجماليات المنتجات منخفضة المخزون
  const lowStockCount = filteredProducts.filter(product => product.stock > 0 && product.stock <= product.minStock).length;
  const outOfStockCount = filteredProducts.filter(product => product.stock === 0).length;
  const totalLowStockValue = filteredProducts.reduce((sum, product) => sum + (product.stock * product.costPrice), 0);
  const estimatedPurchaseValue = filteredProducts.reduce((sum, product) => {
    const neededStock = product.minStock * 2 - product.stock;
    return sum + (neededStock > 0 ? neededStock * product.costPrice : 0);
  }, 0);
  
  // تصدير البيانات
  const handleExportData = () => {
    toast({
      title: 'تصدير البيانات',
      description: 'جاري تصدير تقرير المنتجات منخفضة المخزون',
      variant: 'default',
    });
  };
  
  // طباعة التقرير
  const handlePrintReport = () => {
    window.print();
  };
  
  // حساب نسبة المخزون
  const calculateStockPercentage = (stock: number, maxStock: number) => {
    return Math.min(Math.round((stock / maxStock) * 100), 100);
  };
  
  // حساب الوقت المتبقي قبل نفاذ المخزون
  const calculateTimeToStockOut = (stock: number, avgSalesPerMonth: number) => {
    if (avgSalesPerMonth <= 0 || stock <= 0) return 'غير محدد';
    
    const daysRemaining = Math.round((stock / avgSalesPerMonth) * 30);
    
    if (daysRemaining < 1) return 'أقل من يوم';
    if (daysRemaining === 1) return 'يوم واحد';
    if (daysRemaining < 30) return `${daysRemaining} يوم`;
    
    const monthsRemaining = Math.round(daysRemaining / 30);
    if (monthsRemaining === 1) return 'شهر واحد';
    return `${monthsRemaining} شهر`;
  };
  
  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full"
              onClick={() => router.push('/reports')}
            >
              <ArrowLeft className="h-4 w-4 icon-directional" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">تقرير المنتجات منخفضة المخزون</h1>
          </div>
          <p className="text-muted-foreground mt-1">تقرير عن المنتجات التي وصلت للحد الأدنى أو نفذت من المخزون</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={handlePrintReport}
          >
            <Printer className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> طباعة
          </Button>
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={handleExportData}
          >
            <Download className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> تصدير
          </Button>
        </div>
      </div>
      
      <div className="print:hidden">
        <Card>
          <CardHeader>
            <CardTitle>فلترة البيانات</CardTitle>
            <CardDescription>
              تصفية المنتجات منخفضة المخزون حسب الفئة والحالة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">الفئة</Label>
                <Select
                  value={selectedCategoryId}
                  onValueChange={setSelectedCategoryId}
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="جميع الفئات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الفئات</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الحالات</SelectItem>
                    <SelectItem value="LOW_STOCK">منخفض</SelectItem>
                    <SelectItem value="OUT_OF_STOCK">نفذ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="date">التاريخ</Label>
                <DatePicker
                  value={selectedDate}
                  onValueChange={setSelectedDate}
                  locale="ar"
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="search">بحث</Label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="بحث عن منتج..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-3 pr-10 w-full"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                className="rounded-md"
                onClick={resetFilters}
              >
                <RefreshCw className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> إعادة تعيين
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="print:mt-0">
        <div className="text-center print:block hidden mb-6">
          <h1 className="text-3xl font-bold">تقرير المنتجات منخفضة المخزون</h1>
          <p className="text-muted-foreground mt-1">
            {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ar }) : format(new Date(), 'dd/MM/yyyy', { locale: ar })}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
          <Card className="bg-yellow-50 dark:bg-yellow-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">منتجات منخفضة المخزون</h3>
                  <p className="text-2xl font-bold mt-1 text-yellow-600 dark:text-yellow-400 print:text-black">{lowStockCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 dark:bg-red-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">منتجات نفذت من المخزون</h3>
                  <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400 print:text-black">{outOfStockCount}</p>
                </div>
                <Package className="h-8 w-8 text-red-600 dark:text-red-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 dark:bg-blue-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">قيمة المخزون الحالي</h3>
                  <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400 print:text-black">{totalLowStockValue.toFixed(2)} ر.س</p>
                </div>
                <TrendingDown className="h-8 w-8 text-blue-600 dark:text-blue-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 dark:bg-green-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">قيمة الشراء المقدرة</h3>
                  <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400 print:text-black">{estimatedPurchaseValue.toFixed(2)} ر.س</p>
                </div>
                <Truck className="h-8 w-8 text-green-600 dark:text-green-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
        <Card className="lg:col-span-2 print:col-span-2">
          <CardHeader>
            <CardTitle>المنتجات منخفضة المخزون</CardTitle>
            <CardDescription>
              قائمة المنتجات التي وصلت للحد الأدنى أو نفذت من المخزون
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="border rounded-md overflow-x-auto print:border-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">#</TableHead>
                      <TableHead>المنتج</TableHead>
                      <TableHead>الفئة</TableHead>
                      <TableHead className="text-center">المخزون</TableHead>
                      <TableHead className="text-center">الحد الأدنى</TableHead>
                      <TableHead className="text-center">نسبة المخزون</TableHead>
                      <TableHead className="text-center">الحالة</TableHead>
                      <TableHead className="text-center">الوقت المتبقي</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          لا توجد منتجات مطابقة للبحث
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product, index) => (
                        <TableRow key={product.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-muted-foreground">{product.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell>{product.category.name}</TableCell>
                          <TableCell className="text-center">{product.stock} {product.unit}</TableCell>
                          <TableCell className="text-center">{product.minStock} {product.unit}</TableCell>
                          <TableCell>
                            <div className="flex flex-col items-center">
                              <Progress 
                                value={calculateStockPercentage(product.stock, product.maxStock)} 
                                className="h-2 w-full"
                                indicatorClassName={
                                  product.stock === 0 ? 'bg-red-500' :
                                  product.stock < product.minStock ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }
                              />
                              <span className="text-xs text-muted-foreground mt-1">
                                {calculateStockPercentage(product.stock, product.maxStock)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={
                              product.status === 'ACTIVE' ? 'default' :
                              product.status === 'LOW_STOCK' ? 'warning' :
                              'destructive'
                            }>
                              {product.status === 'ACTIVE' ? 'نشط' :
                               product.status === 'LOW_STOCK' ? 'منخفض' :
                               'نفذ'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={
                              product.stock === 0 ? 'text-red-600 dark:text-red-400' :
                              product.avgSalesPerMonth > 0 && (product.stock / product.avgSalesPerMonth) * 30 < 7 ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-muted-foreground'
                            }>
                              {calculateTimeToStockOut(product.stock, product.avgSalesPerMonth)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            
            <div className="flex justify-end mt-4 print:hidden">
              <ExportData
                title="تصدير بيانات المنتجات منخفضة المخزون"
                data={filteredProducts.map((product, index) => ({
                  '#': index + 1,
                  'المنتج': product.name,
                  'الرمز': product.sku,
                  'الفئة': product.category.name,
                  'المخزون الحالي': product.stock,
                  'الوحدة': product.unit,
                  'الحد الأدنى': product.minStock,
                  'الحد الأقصى': product.maxStock,
                  'نسبة المخزون': `${calculateStockPercentage(product.stock, product.maxStock)}%`,
                  'الحالة': product.status === 'ACTIVE' ? 'نشط' :
                           product.status === 'LOW_STOCK' ? 'منخفض' :
                           'نفذ',
                  'آخر شراء': product.lastPurchaseDate,
                  'آخر بيع': product.lastSaleDate,
                  'متوسط المبيعات الشهرية': product.avgSalesPerMonth,
                  'الوقت المتبقي': calculateTimeToStockOut(product.stock, product.avgSalesPerMonth),
                  'سعر التكلفة': product.costPrice,
                  'قيمة المخزون الحالي': product.stock * product.costPrice,
                  'قيمة الشراء المقدرة': Math.max(0, (product.minStock * 2 - product.stock)) * product.costPrice,
                }))}
                columns={[
                  { header: '#', accessor: '#' },
                  { header: 'المنتج', accessor: 'المنتج' },
                  { header: 'الرمز', accessor: 'الرمز' },
                  { header: 'الفئة', accessor: 'الفئة' },
                  { header: 'المخزون الحالي', accessor: 'المخزون الحالي' },
                  { header: 'الوحدة', accessor: 'الوحدة' },
                  { header: 'الحد الأدنى', accessor: 'الحد الأدنى' },
                  { header: 'الحد الأقصى', accessor: 'الحد الأقصى' },
                  { header: 'نسبة المخزون', accessor: 'نسبة المخزون' },
                  { header: 'الحالة', accessor: 'الحالة' },
                  { header: 'آخر شراء', accessor: 'آخر شراء' },
                  { header: 'آخر بيع', accessor: 'آخر بيع' },
                  { header: 'متوسط المبيعات الشهرية', accessor: 'متوسط المبيعات الشهرية' },
                  { header: 'الوقت المتبقي', accessor: 'الوقت المتبقي' },
                  { header: 'سعر التكلفة', accessor: 'سعر التكلفة' },
                  { header: 'قيمة المخزون الحالي', accessor: 'قيمة المخزون الحالي' },
                  { header: 'قيمة الشراء المقدرة', accessor: 'قيمة الشراء المقدرة' },
                ]}
                fileName="low-stock-report"
                variant="outline"
                size="sm"
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6 print:space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>توزيع المنتجات منخفضة المخزون حسب الفئة</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData && (
                <div className="h-[200px]">
                  {/* في الواقع، سنستخدم مكون LowStockChart */}
                  {/* لكن هنا سنعرض صورة توضيحية */}
                  <div className="flex items-center justify-center h-full">
                    <BarChart3 className="h-32 w-32 text-muted-foreground" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>الإجراءات المقترحة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 print:bg-white print:border">
                <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium">طلب شراء جديد</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    إنشاء طلب شراء للمنتجات التي وصلت للحد الأدنى أو نفذت من المخزون.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 print:hidden"
                    onClick={() => router.push('/purchases/new')}
                  >
                    إنشاء طلب شراء
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 print:bg-white print:border">
                <ArrowUpDown className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium">تعديل حدود المخزون</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    مراجعة وتعديل حدود المخزون (الحد الأدنى والحد الأقصى) بناءً على معدلات البيع.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-md bg-green-50 dark:bg-green-900/20 print:bg-white print:border">
                <ShoppingCart className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium">مراجعة استراتيجية المبيعات</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    مراجعة استراتيجية المبيعات للمنتجات التي نفذت من المخزون لفترة طويلة.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card className="print:mt-4">
        <CardHeader>
          <CardTitle>تفاصيل الشراء المقترحة</CardTitle>
          <CardDescription>
            كميات الشراء المقترحة للمنتجات منخفضة المخزون
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-x-auto print:border-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">#</TableHead>
                  <TableHead>المنتج</TableHead>
                  <TableHead className="text-center">المخزون الحالي</TableHead>
                  <TableHead className="text-center">الكمية المقترح شراؤها</TableHead>
                  <TableHead className="text-right rtl:text-left">سعر الوحدة</TableHead>
                  <TableHead className="text-right rtl:text-left">الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product, index) => {
                  const suggestedQuantity = Math.max(0, (product.minStock * 2) - product.stock);
                  const totalCost = suggestedQuantity * product.costPrice;
                  
                  if (suggestedQuantity <= 0) return null;
                  
                  return (
                    <TableRow key={product.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">{product.sku}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{product.stock} {product.unit}</TableCell>
                      <TableCell className="text-center font-medium">{suggestedQuantity} {product.unit}</TableCell>
                      <TableCell className="text-right rtl:text-left">{product.costPrice.toFixed(2)} ر.س</TableCell>
                      <TableCell className="text-right rtl:text-left font-bold">{totalCost.toFixed(2)} ر.س</TableCell>
                    </TableRow>
                  );
                }).filter(Boolean)}
                <TableRow>
                  <TableCell colSpan={5} className="text-right rtl:text-left font-bold">الإجمالي</TableCell>
                  <TableCell className="text-right rtl:text-left font-bold">{estimatedPurchaseValue.toFixed(2)} ر.س</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end mt-4 print:hidden">
            <Button 
              onClick={() => router.push('/purchases/new')}
            >
              <Truck className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> إنشاء طلب شراء
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="print:mt-8 print:text-center print:text-sm text-muted-foreground">
        <p>تم إنشاء هذا التقرير في: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ar })}</p>
        <p className="mt-1">مجموعة الوسيط - نظام إدارة المخزون</p>
      </div>
    </div>
  );
}