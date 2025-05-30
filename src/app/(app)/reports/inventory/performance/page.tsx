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
import { DateRangePicker } from "@/components/date-range-picker";
import { 
  ArrowLeft, 
  Download, 
  Search, 
  Filter, 
  Package, 
  DollarSign, 
  Printer, 
  FileText, 
  RefreshCw, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  ShoppingCart, 
  Star, 
  AlertTriangle, 
  ChevronUp, 
  ChevronDown 
} from "lucide-react";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { ExportData } from '@/components/export/export-data';
import { ProductPerformanceChart } from '@/components/charts/product-performance-chart';
import { ProductProfitabilityChart } from '@/components/charts/product-profitability-chart';
import { ProductSalesChart } from '@/components/charts/product-sales-chart';

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
    performance: {
      salesCount: 25,
      salesValue: 37500,
      costValue: 30000,
      profit: 7500,
      profitMargin: 25,
      returnRate: 4,
      stockTurnover: 2.5,
      daysToSell: 30,
      trend: 'UP',
    },
  },
  {
    id: 'product-2',
    name: 'طابعة Canon',
    sku: 'CN-PR-001',
    barcode: '987654321',
    stock: 15,
    minStock: 5,
    maxStock: 25,
    unit: 'قطعة',
    costPrice: 500,
    price: 750,
    categoryId: 'category-2',
    category: {
      id: 'category-2',
      name: 'طابعات',
    },
    status: 'ACTIVE',
    performance: {
      salesCount: 40,
      salesValue: 30000,
      costValue: 20000,
      profit: 10000,
      profitMargin: 50,
      returnRate: 2,
      stockTurnover: 2.7,
      daysToSell: 25,
      trend: 'UP',
    },
  },
  {
    id: 'product-3',
    name: 'جهاز عرض Epson',
    sku: 'EP-PJ-001',
    barcode: '456789123',
    stock: 5,
    minStock: 2,
    maxStock: 10,
    unit: 'قطعة',
    costPrice: 800,
    price: 1200,
    categoryId: 'category-3',
    category: {
      id: 'category-3',
      name: 'أجهزة عرض',
    },
    status: 'ACTIVE',
    performance: {
      salesCount: 12,
      salesValue: 14400,
      costValue: 9600,
      profit: 4800,
      profitMargin: 50,
      returnRate: 0,
      stockTurnover: 2.4,
      daysToSell: 35,
      trend: 'STABLE',
    },
  },
  {
    id: 'product-4',
    name: 'هاتف Samsung Galaxy',
    sku: 'SG-PH-001',
    barcode: '789123456',
    stock: 20,
    minStock: 5,
    maxStock: 30,
    unit: 'قطعة',
    costPrice: 1000,
    price: 1400,
    categoryId: 'category-4',
    category: {
      id: 'category-4',
      name: 'هواتف',
    },
    status: 'ACTIVE',
    performance: {
      salesCount: 35,
      salesValue: 49000,
      costValue: 35000,
      profit: 14000,
      profitMargin: 40,
      returnRate: 5.7,
      stockTurnover: 1.75,
      daysToSell: 40,
      trend: 'UP',
    },
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
    performance: {
      salesCount: 8,
      salesValue: 16000,
      costValue: 12000,
      profit: 4000,
      profitMargin: 33.3,
      returnRate: 0,
      stockTurnover: 2.7,
      daysToSell: 45,
      trend: 'DOWN',
    },
  },
  {
    id: 'product-6',
    name: 'شاشة LG',
    sku: 'LG-MN-001',
    barcode: '654987321',
    stock: 8,
    minStock: 4,
    maxStock: 20,
    unit: 'قطعة',
    costPrice: 300,
    price: 450,
    categoryId: 'category-5',
    category: {
      id: 'category-5',
      name: 'شاشات',
    },
    status: 'ACTIVE',
    performance: {
      salesCount: 30,
      salesValue: 13500,
      costValue: 9000,
      profit: 4500,
      profitMargin: 50,
      returnRate: 3.3,
      stockTurnover: 3.75,
      daysToSell: 20,
      trend: 'UP',
    },
  },
  {
    id: 'product-7',
    name: 'ماوس Logitech',
    sku: 'LG-MS-001',
    barcode: '987321654',
    stock: 30,
    minStock: 10,
    maxStock: 50,
    unit: 'قطعة',
    costPrice: 50,
    price: 80,
    categoryId: 'category-6',
    category: {
      id: 'category-6',
      name: 'ملحقات',
    },
    status: 'ACTIVE',
    performance: {
      salesCount: 75,
      salesValue: 6000,
      costValue: 3750,
      profit: 2250,
      profitMargin: 60,
      returnRate: 1.3,
      stockTurnover: 2.5,
      daysToSell: 15,
      trend: 'UP',
    },
  },
  {
    id: 'product-8',
    name: 'لوحة مفاتيح Microsoft',
    sku: 'MS-KB-001',
    barcode: '321987654',
    stock: 25,
    minStock: 8,
    maxStock: 40,
    unit: 'قطعة',
    costPrice: 70,
    price: 120,
    categoryId: 'category-6',
    category: {
      id: 'category-6',
      name: 'ملحقات',
    },
    status: 'ACTIVE',
    performance: {
      salesCount: 60,
      salesValue: 7200,
      costValue: 4200,
      profit: 3000,
      profitMargin: 71.4,
      returnRate: 1.7,
      stockTurnover: 2.4,
      daysToSell: 18,
      trend: 'STABLE',
    },
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
    performance: {
      salesCount: 20,
      salesValue: 5000,
      costValue: 3000,
      profit: 2000,
      profitMargin: 66.7,
      returnRate: 5,
      stockTurnover: 4,
      daysToSell: 10,
      trend: 'UP',
    },
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
    performance: {
      salesCount: 5,
      salesValue: 3000,
      costValue: 2000,
      profit: 1000,
      profitMargin: 50,
      returnRate: 0,
      stockTurnover: 2.5,
      daysToSell: 30,
      trend: 'DOWN',
    },
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
  topSellingProducts: {
    labels: ['ماوس Logitech', 'لوحة مفاتيح Microsoft', 'طابعة Canon', 'هاتف Samsung Galaxy', 'شاشة LG'],
    data: [75, 60, 40, 35, 30],
  },
  topProfitableProducts: {
    labels: ['لوحة مفاتيح Microsoft', 'سماعات Sony', 'ماوس Logitech', 'شاشة LG', 'طابعة Canon'],
    data: [71.4, 66.7, 60, 50, 50],
  },
  salesByCategory: {
    labels: ['أجهزة كمبيوتر', 'طابعات', 'هواتف', 'ملحقات', 'شاشات', 'أجهزة عرض', 'سماعات', 'كاميرات'],
    data: [53500, 30000, 49000, 13200, 13500, 14400, 5000, 3000],
  },
};

// فترات التقرير
const reportPeriods = [
  { id: 'LAST_30_DAYS', name: 'آخر 30 يوم' },
  { id: 'LAST_90_DAYS', name: 'آخر 90 يوم' },
  { id: 'LAST_6_MONTHS', name: 'آخر 6 أشهر' },
  { id: 'LAST_YEAR', name: 'آخر سنة' },
  { id: 'CUSTOM', name: 'فترة مخصصة' },
];

// معايير الترتيب
const sortOptions = [
  { id: 'salesCount', name: 'عدد المبيعات' },
  { id: 'salesValue', name: 'قيمة المبيعات' },
  { id: 'profit', name: 'الربح' },
  { id: 'profitMargin', name: 'هامش الربح' },
  { id: 'stockTurnover', name: 'معدل دوران المخزون' },
  { id: 'returnRate', name: 'معدل المرتجعات' },
];

export default function ProductPerformanceReport() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('LAST_30_DAYS');
  const [selectedDateRange, setSelectedDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [sortBy, setSortBy] = useState<string>('salesValue');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // في الواقع، سنستخدم useProducts و useCategories hooks
  // لكن هنا سنحاكي العملية
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // محاكاة جلب البيانات
        setProducts(mockProducts);
        setCategories(mockCategories);
        setChartData(mockChartData);
        
        // التحقق من وجود معلمات في الـ URL
        const categoryId = searchParams.get('categoryId');
        if (categoryId) {
          setSelectedCategoryId(categoryId);
        }
        
        const period = searchParams.get('period');
        if (period) {
          setSelectedPeriod(period);
        }
        
        const sort = searchParams.get('sort');
        if (sort) {
          setSortBy(sort);
        }
        
        const order = searchParams.get('order');
        if (order && (order === 'asc' || order === 'desc')) {
          setSortOrder(order);
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
  
  // ترتيب المنتجات
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const valueA = sortBy === 'salesCount' ? a.performance.salesCount :
                  sortBy === 'salesValue' ? a.performance.salesValue :
                  sortBy === 'profit' ? a.performance.profit :
                  sortBy === 'profitMargin' ? a.performance.profitMargin :
                  sortBy === 'stockTurnover' ? a.performance.stockTurnover :
                  sortBy === 'returnRate' ? a.performance.returnRate : 0;
                  
    const valueB = sortBy === 'salesCount' ? b.performance.salesCount :
                  sortBy === 'salesValue' ? b.performance.salesValue :
                  sortBy === 'profit' ? b.performance.profit :
                  sortBy === 'profitMargin' ? b.performance.profitMargin :
                  sortBy === 'stockTurnover' ? b.performance.stockTurnover :
                  sortBy === 'returnRate' ? b.performance.returnRate : 0;
    
    return sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
  });
  
  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setSelectedCategoryId('');
    setSelectedPeriod('LAST_30_DAYS');
    setSelectedDateRange({});
    setSearchQuery('');
    setSortBy('salesValue');
    setSortOrder('desc');
  };
  
  // تغيير ترتيب الفرز
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };
  
  // حساب إجماليات الأداء
  const totalSalesCount = sortedProducts.reduce((sum, product) => sum + product.performance.salesCount, 0);
  const totalSalesValue = sortedProducts.reduce((sum, product) => sum + product.performance.salesValue, 0);
  const totalProfit = sortedProducts.reduce((sum, product) => sum + product.performance.profit, 0);
  const avgProfitMargin = totalSalesValue > 0 ? (totalProfit / totalSalesValue) * 100 : 0;
  
  // تصدير البيانات
  const handleExportData = () => {
    toast({
      title: 'تصدير البيانات',
      description: 'جاري تصدير تقرير أداء المنتجات',
      variant: 'default',
    });
  };
  
  // طباعة التقرير
  const handlePrintReport = () => {
    window.print();
  };
  
  // تحديد فترة التقرير
  const getReportPeriodText = () => {
    switch (selectedPeriod) {
      case 'LAST_30_DAYS':
        return 'آخر 30 يوم';
      case 'LAST_90_DAYS':
        return 'آخر 90 يوم';
      case 'LAST_6_MONTHS':
        return 'آخر 6 أشهر';
      case 'LAST_YEAR':
        return 'آخر سنة';
      case 'CUSTOM':
        if (selectedDateRange.from && selectedDateRange.to) {
          return `${formatDate(selectedDateRange.from)} - ${formatDate(selectedDateRange.to)}`;
        } else if (selectedDateRange.from) {
          return `من ${formatDate(selectedDateRange.from)}`;
        } else if (selectedDateRange.to) {
          return `حتى ${formatDate(selectedDateRange.to)}`;
        }
        return 'فترة مخصصة';
      default:
        return 'آخر 30 يوم';
    }
  };
  
  // تنسيق التاريخ
  function formatDate(date: Date) {
    return format(date, 'dd/MM/yyyy', { locale: ar });
  }
  
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
            <h1 className="text-3xl font-bold text-foreground">تقرير أداء المنتجات</h1>
          </div>
          <p className="text-muted-foreground mt-1">تحليل أداء المنتجات من حيث المبيعات والربحية</p>
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
              تصفية وترتيب بيانات أداء المنتجات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Label htmlFor="period">الفترة</Label>
                <Select
                  value={selectedPeriod}
                  onValueChange={setSelectedPeriod}
                >
                  <SelectTrigger id="period" className="w-full">
                    <SelectValue placeholder="اختر الفترة" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportPeriods.map(period => (
                      <SelectItem key={period.id} value={period.id}>
                        {period.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedPeriod === 'CUSTOM' && (
                <div className="space-y-2">
                  <Label>نطاق التاريخ</Label>
                  <DateRangePicker
                    value={selectedDateRange}
                    onValueChange={setSelectedDateRange}
                    align="start"
                    locale="ar"
                    placeholder="اختر نطاق التاريخ"
                    className="w-full"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="sortBy">ترتيب حسب</Label>
                <div className="flex gap-2">
                  <Select
                    value={sortBy}
                    onValueChange={setSortBy}
                  >
                    <SelectTrigger id="sortBy" className="w-full">
                      <SelectValue placeholder="اختر معيار الترتيب" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortOptions.map(option => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleSortOrder}
                    className="h-10 w-10"
                  >
                    {sortOrder === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-3 pr-10 w-full"
              />
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
          <h1 className="text-3xl font-bold">تقرير أداء المنتجات</h1>
          <p className="text-muted-foreground mt-1">
            الفترة: {getReportPeriodText()}
          </p>
          {selectedCategoryId && (
            <p className="text-muted-foreground mt-1">
              الفئة: {categories.find(c => c.id === selectedCategoryId)?.name}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
          <Card className="bg-blue-50 dark:bg-blue-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">إجمالي المبيعات</h3>
                  <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400 print:text-black">{totalSalesValue.toFixed(2)} ر.س</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-600 dark:text-blue-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 dark:bg-green-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">إجمالي الربح</h3>
                  <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400 print:text-black">{totalProfit.toFixed(2)} ر.س</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 dark:bg-purple-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">متوسط هامش الربح</h3>
                  <p className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400 print:text-black">{avgProfitMargin.toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 dark:bg-amber-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">عدد الوحدات المباعة</h3>
                  <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400 print:text-black">{totalSalesCount}</p>
                </div>
                <Package className="h-8 w-8 text-amber-600 dark:text-amber-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
        <Card className="lg:col-span-2 print:col-span-2">
          <CardHeader>
            <CardTitle>أداء المنتجات</CardTitle>
            <CardDescription>
              تحليل أداء المنتجات خلال الفترة: {getReportPeriodText()}
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
                      <TableHead className="text-center">المبيعات</TableHead>
                      <TableHead className="text-right rtl:text-left">قيمة المبيعات</TableHead>
                      <TableHead className="text-right rtl:text-left">الربح</TableHead>
                      <TableHead className="text-center">هامش الربح</TableHead>
                      <TableHead className="text-center">معدل الدوران</TableHead>
                      <TableHead className="text-center">الاتجاه</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                          لا توجد منتجات مطابقة للبحث
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedProducts.map((product, index) => (
                        <TableRow key={product.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-xs text-muted-foreground">{product.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{product.performance.salesCount}</TableCell>
                          <TableCell className="text-right rtl:text-left">
                            {product.performance.salesValue.toFixed(2)} ر.س
                          </TableCell>
                          <TableCell className="text-right rtl:text-left">
                            {product.performance.profit.toFixed(2)} ر.س
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={
                              product.performance.profitMargin >= 50 ? 'default' :
                              product.performance.profitMargin >= 30 ? 'secondary' :
                              product.performance.profitMargin >= 15 ? 'outline' :
                              'destructive'
                            }>
                              {product.performance.profitMargin.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            {product.performance.stockTurnover.toFixed(1)}x
                          </TableCell>
                          <TableCell className="text-center">
                            {product.performance.trend === 'UP' ? (
                              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto" />
                            ) : product.performance.trend === 'DOWN' ? (
                              <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400 mx-auto" />
                            ) : (
                              <ArrowLeft className="h-5 w-5 text-muted-foreground mx-auto" />
                            )}
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
                title="تصدير بيانات أداء المنتجات"
                data={sortedProducts.map((product, index) => ({
                  '#': index + 1,
                  'المنتج': product.name,
                  'الرمز': product.sku,
                  'الفئة': product.category.name,
                  'المبيعات (عدد)': product.performance.salesCount,
                  'قيمة المبيعات': product.performance.salesValue.toFixed(2),
                  'تكلفة المبيعات': product.performance.costValue.toFixed(2),
                  'الربح': product.performance.profit.toFixed(2),
                  'هامش الربح (%)': product.performance.profitMargin.toFixed(1),
                  'معدل المرتجعات (%)': product.performance.returnRate.toFixed(1),
                  'معدل دوران المخزون': product.performance.stockTurnover.toFixed(1),
                  'متوسط أيام البيع': product.performance.daysToSell,
                  'الاتجاه': product.performance.trend === 'UP' ? 'صعود' :
                             product.performance.trend === 'DOWN' ? 'هبوط' : 'مستقر',
                  'المخزون الحالي': product.stock,
                  'الوحدة': product.unit,
                  'سعر التكلفة': product.costPrice.toFixed(2),
                  'سعر البيع': product.price.toFixed(2),
                }))}
                columns={[
                  { header: '#', accessor: '#' },
                  { header: 'المنتج', accessor: 'المنتج' },
                  { header: 'الرمز', accessor: 'الرمز' },
                  { header: 'الفئة', accessor: 'الفئة' },
                  { header: 'المبيعات (عدد)', accessor: 'المبيعات (عدد)' },
                  { header: 'قيمة المبيعات', accessor: 'قيمة المبيعات' },
                  { header: 'تكلفة المبيعات', accessor: 'تكلفة المبيعات' },
                  { header: 'الربح', accessor: 'الربح' },
                  { header: 'هامش الربح (%)', accessor: 'هامش الربح (%)' },
                  { header: 'معدل المرتجعات (%)', accessor: 'معدل المرتجعات (%)' },
                  { header: 'معدل دوران المخزون', accessor: 'معدل دوران المخزون' },
                  { header: 'متوسط أيام البيع', accessor: 'متوسط أيام البيع' },
                  { header: 'الاتجاه', accessor: 'الاتجاه' },
                  { header: 'المخزون الحالي', accessor: 'المخزون الحالي' },
                  { header: 'الوحدة', accessor: 'الوحدة' },
                  { header: 'سعر التكلفة', accessor: 'سعر التكلفة' },
                  { header: 'سعر البيع', accessor: 'سعر البيع' },
                ]}
                fileName="product-performance-report"
                variant="outline"
                size="sm"
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6 print:space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>أفضل المنتجات مبيعاً</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData && (
                <div className="h-[200px]">
                  {/* في الواقع، سنستخدم مكون ProductSalesChart */}
                  {/* لكن هنا سنعرض صورة توضيحية */}
                  <div className="flex items-center justify-center h-full">
                    <BarChart3 className="h-32 w-32 text-muted-foreground" />
                  </div>
                </div>
              )}
              
              <div className="mt-4 space-y-2">
                {sortedProducts
                  .sort((a, b) => b.performance.salesCount - a.performance.salesCount)
                  .slice(0, 5)
                  .map((product, index) => (
                    <div key={product.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{index + 1}.</span>
                        <span className="text-sm">{product.name}</span>
                      </div>
                      <span className="text-sm font-medium">{product.performance.salesCount}</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>أعلى هوامش ربح</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData && (
                <div className="h-[200px]">
                  {/* في الواقع، سنستخدم مكون ProductProfitabilityChart */}
                  {/* لكن هنا سنعرض صورة توضيحية */}
                  <div className="flex items-center justify-center h-full">
                    <PieChart className="h-32 w-32 text-muted-foreground" />
                  </div>
                </div>
              )}
              
              <div className="mt-4 space-y-2">
                {sortedProducts
                  .sort((a, b) => b.performance.profitMargin - a.performance.profitMargin)
                  .slice(0, 5)
                  .map((product, index) => (
                    <div key={product.id} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{index + 1}.</span>
                        <span className="text-sm">{product.name}</span>
                      </div>
                      <span className="text-sm font-medium">{product.performance.profitMargin.toFixed(1)}%</span>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card className="print:mt-4">
        <CardHeader>
          <CardTitle>تحليل أداء المنتجات حسب الفئة</CardTitle>
          <CardDescription>
            مقارنة أداء المنتجات حسب الفئة خلال الفترة: {getReportPeriodText()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData && (
            <div className="h-[300px]">
              {/* في الواقع، سنستخدم مكون ProductPerformanceChart */}
              {/* لكن هنا سنعرض صورة توضيحية */}
              <div className="flex items-center justify-center h-full">
                <BarChart3 className="h-32 w-32 text-muted-foreground" />
              </div>
            </div>
          )}
          
          <div className="mt-6 border rounded-md overflow-x-auto print:border-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الفئة</TableHead>
                  <TableHead className="text-center">عدد المنتجات</TableHead>
                  <TableHead className="text-center">المبيعات</TableHead>
                  <TableHead className="text-right rtl:text-left">قيمة المبيعات</TableHead>
                  <TableHead className="text-right rtl:text-left">الربح</TableHead>
                  <TableHead className="text-center">هامش الربح</TableHead>
                  <TableHead className="text-center">معدل الدوران</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map(category => {
                  const categoryProducts = sortedProducts.filter(p => p.categoryId === category.id);
                  if (categoryProducts.length === 0) return null;
                  
                  const salesCount = categoryProducts.reduce((sum, p) => sum + p.performance.salesCount, 0);
                  const salesValue = categoryProducts.reduce((sum, p) => sum + p.performance.salesValue, 0);
                  const profit = categoryProducts.reduce((sum, p) => sum + p.performance.profit, 0);
                  const profitMargin = salesValue > 0 ? (profit / salesValue) * 100 : 0;
                  const avgStockTurnover = categoryProducts.reduce((sum, p) => sum + p.performance.stockTurnover, 0) / categoryProducts.length;
                  
                  return (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell className="text-center">{categoryProducts.length}</TableCell>
                      <TableCell className="text-center">{salesCount}</TableCell>
                      <TableCell className="text-right rtl:text-left">{salesValue.toFixed(2)} ر.س</TableCell>
                      <TableCell className="text-right rtl:text-left">{profit.toFixed(2)} ر.س</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={
                          profitMargin >= 50 ? 'default' :
                          profitMargin >= 30 ? 'secondary' :
                          profitMargin >= 15 ? 'outline' :
                          'destructive'
                        }>
                          {profitMargin.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{avgStockTurnover.toFixed(1)}x</TableCell>
                    </TableRow>
                  );
                }).filter(Boolean)}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card className="print:mt-4">
        <CardHeader>
          <CardTitle>المنتجات التي تحتاج إلى تحسين</CardTitle>
          <CardDescription>
            المنتجات ذات الأداء المنخفض أو التي تحتاج إلى مراجعة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <TrendingDown className="ml-2 rtl:mr-2 h-5 w-5 text-red-600 dark:text-red-400 icon-directional" />
                  منتجات بهامش ربح منخفض
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sortedProducts
                    .filter(p => p.performance.profitMargin < 30)
                    .sort((a, b) => a.performance.profitMargin - b.performance.profitMargin)
                    .slice(0, 5)
                    .map((product) => (
                      <div key={product.id} className="flex justify-between items-center">
                        <span className="text-sm">{product.name}</span>
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">
                          {product.performance.profitMargin.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="ml-2 rtl:mr-2 h-5 w-5 text-yellow-600 dark:text-yellow-400 icon-directional" />
                  معدل مرتجعات مرتفع
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sortedProducts
                    .filter(p => p.performance.returnRate > 3)
                    .sort((a, b) => b.performance.returnRate - a.performance.returnRate)
                    .slice(0, 5)
                    .map((product) => (
                      <div key={product.id} className="flex justify-between items-center">
                        <span className="text-sm">{product.name}</span>
                        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                          {product.performance.returnRate.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Package className="ml-2 rtl:mr-2 h-5 w-5 text-blue-600 dark:text-blue-400 icon-directional" />
                  معدل دوران منخفض
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sortedProducts
                    .filter(p => p.performance.stockTurnover < 2)
                    .sort((a, b) => a.performance.stockTurnover - b.performance.stockTurnover)
                    .slice(0, 5)
                    .map((product) => (
                      <div key={product.id} className="flex justify-between items-center">
                        <span className="text-sm">{product.name}</span>
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {product.performance.stockTurnover.toFixed(1)}x
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">توصيات لتحسين الأداء</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 print:bg-white print:border">
                <Star className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h4 className="font-medium">مراجعة التسعير</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    مراجعة أسعار المنتجات ذات هامش الربح المنخفض وتعديلها بما يتناسب مع السوق.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-md bg-green-50 dark:bg-green-900/20 print:bg-white print:border">
                <Star className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h4 className="font-medium">تحسين جودة المنتجات</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    التحقق من جودة المنتجات ذات معدل المرتجعات المرتفع ومعالجة المشكلات.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-md bg-purple-50 dark:bg-purple-900/20 print:bg-white print:border">
                <Star className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                <div>
                  <h4 className="font-medium">تحسين استراتيجية المخزون</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    تعديل كميات المخزون للمنتجات ذات معدل الدوران المنخفض لتقليل تكاليف التخزين.
                  </p>
                </div>
              </div>
            </div>
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