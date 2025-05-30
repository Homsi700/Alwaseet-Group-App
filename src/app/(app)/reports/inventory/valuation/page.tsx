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
import { DatePicker } from "@/components/date-picker";
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
  ArrowUpDown, 
  Calculator 
} from "lucide-react";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { ExportData } from '@/components/export/export-data';
import { InventoryValueChart } from '@/components/charts/inventory-value-chart';
import { InventoryValueTrendChart } from '@/components/charts/inventory-value-trend-chart';
import { InventoryProfitMarginChart } from '@/components/charts/inventory-profit-margin-chart';

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
    lastPurchasePrice: 1200,
    avgPurchasePrice: 1180,
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
    lastPurchaseDate: '2024-05-25',
    lastPurchasePrice: 500,
    avgPurchasePrice: 490,
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
    lastPurchaseDate: '2024-06-05',
    lastPurchasePrice: 800,
    avgPurchasePrice: 780,
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
    lastPurchaseDate: '2024-06-15',
    lastPurchasePrice: 1000,
    avgPurchasePrice: 980,
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
    lastPurchasePrice: 1500,
    avgPurchasePrice: 1450,
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
    lastPurchaseDate: '2024-06-01',
    lastPurchasePrice: 300,
    avgPurchasePrice: 290,
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
    lastPurchaseDate: '2024-06-08',
    lastPurchasePrice: 50,
    avgPurchasePrice: 48,
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
    lastPurchaseDate: '2024-05-28',
    lastPurchasePrice: 70,
    avgPurchasePrice: 65,
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
    lastPurchasePrice: 150,
    avgPurchasePrice: 145,
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
    lastPurchasePrice: 400,
    avgPurchasePrice: 390,
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
  inventoryValueByCategory: {
    labels: ['أجهزة كمبيوتر', 'طابعات', 'أجهزة عرض', 'هواتف', 'شاشات', 'ملحقات', 'سماعات', 'كاميرات'],
    data: [16500, 7500, 4000, 20000, 2400, 3700, 0, 800],
  },
  inventoryValueTrend: {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    data: [45000, 48000, 52000, 49000, 53000, 55000],
  },
  profitMarginByCategory: {
    labels: ['أجهزة كمبيوتر', 'طابعات', 'أجهزة عرض', 'هواتف', 'شاشات', 'ملحقات', 'سماعات', 'كاميرات'],
    data: [25, 50, 50, 40, 50, 60, 67, 50],
  },
};

// بيانات وهمية لتقييم المخزون التاريخي
const mockHistoricalValuation = [
  { date: '2024-01-31', totalValue: 45000, itemCount: 120 },
  { date: '2024-02-29', totalValue: 48000, itemCount: 125 },
  { date: '2024-03-31', totalValue: 52000, itemCount: 130 },
  { date: '2024-04-30', totalValue: 49000, itemCount: 128 },
  { date: '2024-05-31', totalValue: 53000, itemCount: 135 },
  { date: '2024-06-20', totalValue: 55000, itemCount: 140 },
];

// طرق التقييم
const valuationMethods = [
  { id: 'FIFO', name: 'الوارد أولاً صادر أولاً (FIFO)' },
  { id: 'LIFO', name: 'الوارد أخيراً صادر أولاً (LIFO)' },
  { id: 'WEIGHTED_AVERAGE', name: 'المتوسط المرجح' },
  { id: 'STANDARD_COST', name: 'التكلفة المعيارية' },
];

export default function InventoryValuationReport() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedValuationMethod, setSelectedValuationMethod] = useState<string>('WEIGHTED_AVERAGE');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  // في الواقع، سنستخدم useProducts و useCategories hooks
  // لكن هنا سنحاكي العملية
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [historicalValuation, setHistoricalValuation] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // محاكاة جلب البيانات
        setProducts(mockProducts);
        setCategories(mockCategories);
        setChartData(mockChartData);
        setHistoricalValuation(mockHistoricalValuation);
        
        // التحقق من وجود تاريخ في الـ URL
        const dateParam = searchParams.get('date');
        if (dateParam) {
          setSelectedDate(new Date(dateParam));
        }
        
        // التحقق من وجود طريقة تقييم في الـ URL
        const methodParam = searchParams.get('method');
        if (methodParam) {
          setSelectedValuationMethod(methodParam);
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
  
  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setSelectedCategoryId('');
    setSearchQuery('');
  };
  
  // حساب إجماليات المخزون
  const totalProducts = filteredProducts.length;
  const totalItems = filteredProducts.reduce((sum, product) => sum + product.stock, 0);
  
  // حساب قيمة المخزون حسب طريقة التقييم المختارة
  const calculateInventoryValue = (product: any) => {
    switch (selectedValuationMethod) {
      case 'FIFO':
        // في الواقع، سنحتاج إلى بيانات أكثر تفصيلاً عن الدفعات
        // لكن هنا سنستخدم سعر آخر شراء كتقريب
        return product.stock * product.lastPurchasePrice;
      case 'LIFO':
        // في الواقع، سنحتاج إلى بيانات أكثر تفصيلاً عن الدفعات
        // لكن هنا سنستخدم سعر آخر شراء كتقريب
        return product.stock * product.lastPurchasePrice;
      case 'WEIGHTED_AVERAGE':
        return product.stock * product.avgPurchasePrice;
      case 'STANDARD_COST':
        return product.stock * product.costPrice;
      default:
        return product.stock * product.costPrice;
    }
  };
  
  // حساب إجمالي قيمة المخزون
  const totalInventoryValue = filteredProducts.reduce((sum, product) => sum + calculateInventoryValue(product), 0);
  
  // حساب قيمة المخزون المقدرة للبيع
  const totalSellingValue = filteredProducts.reduce((sum, product) => sum + (product.stock * product.price), 0);
  
  // حساب إجمالي هامش الربح المتوقع
  const totalPotentialProfit = totalSellingValue - totalInventoryValue;
  
  // تصدير البيانات
  const handleExportData = () => {
    toast({
      title: 'تصدير البيانات',
      description: 'جاري تصدير تقرير تقييم المخزون',
      variant: 'default',
    });
  };
  
  // طباعة التقرير
  const handlePrintReport = () => {
    window.print();
  };
  
  // حساب هامش الربح
  const calculateProfitMargin = (costPrice: number, sellingPrice: number) => {
    if (costPrice <= 0) return 0;
    return ((sellingPrice - costPrice) / costPrice) * 100;
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
            <h1 className="text-3xl font-bold text-foreground">تقرير تقييم المخزون</h1>
          </div>
          <p className="text-muted-foreground mt-1">تقرير عن قيمة المخزون الحالية وتحليلها</p>
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
            <CardTitle>إعدادات التقييم</CardTitle>
            <CardDescription>
              اختر طريقة التقييم والفلاتر المطلوبة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valuationMethod">طريقة التقييم</Label>
                <Select
                  value={selectedValuationMethod}
                  onValueChange={setSelectedValuationMethod}
                >
                  <SelectTrigger id="valuationMethod" className="w-full">
                    <SelectValue placeholder="اختر طريقة التقييم" />
                  </SelectTrigger>
                  <SelectContent>
                    {valuationMethods.map(method => (
                      <SelectItem key={method.id} value={method.id}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
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
                <Label htmlFor="date">تاريخ التقييم</Label>
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
          <h1 className="text-3xl font-bold">تقرير تقييم المخزون</h1>
          <p className="text-muted-foreground mt-1">
            {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ar }) : format(new Date(), 'dd/MM/yyyy', { locale: ar })}
          </p>
          <p className="text-muted-foreground mt-1">
            طريقة التقييم: {valuationMethods.find(m => m.id === selectedValuationMethod)?.name}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
          <Card className="bg-blue-50 dark:bg-blue-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">قيمة المخزون</h3>
                  <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400 print:text-black">{totalInventoryValue.toFixed(2)} ر.س</p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 dark:bg-green-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">قيمة البيع المقدرة</h3>
                  <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400 print:text-black">{totalSellingValue.toFixed(2)} ر.س</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 dark:bg-purple-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">هامش الربح المتوقع</h3>
                  <p className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400 print:text-black">{totalPotentialProfit.toFixed(2)} ر.س</p>
                </div>
                <Calculator className="h-8 w-8 text-purple-600 dark:text-purple-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 dark:bg-amber-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">إجمالي الوحدات</h3>
                  <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400 print:text-black">{totalItems}</p>
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
            <CardTitle>تقييم المخزون حسب المنتج</CardTitle>
            <CardDescription>
              تفاصيل تقييم المخزون لكل منتج باستخدام طريقة {valuationMethods.find(m => m.id === selectedValuationMethod)?.name}
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
                      <TableHead className="text-right rtl:text-left">سعر التكلفة</TableHead>
                      <TableHead className="text-right rtl:text-left">قيمة المخزون</TableHead>
                      <TableHead className="text-right rtl:text-left">سعر البيع</TableHead>
                      <TableHead className="text-right rtl:text-left">قيمة البيع المقدرة</TableHead>
                      <TableHead className="text-center">هامش الربح</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                          لا توجد منتجات مطابقة للبحث
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product, index) => {
                        const inventoryValue = calculateInventoryValue(product);
                        const sellingValue = product.stock * product.price;
                        const profitMargin = calculateProfitMargin(
                          inventoryValue / (product.stock || 1),
                          product.price
                        );
                        
                        return (
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
                            <TableCell className="text-right rtl:text-left">
                              {(inventoryValue / (product.stock || 1)).toFixed(2)} ر.س
                            </TableCell>
                            <TableCell className="text-right rtl:text-left font-medium">
                              {inventoryValue.toFixed(2)} ر.س
                            </TableCell>
                            <TableCell className="text-right rtl:text-left">
                              {product.price.toFixed(2)} ر.س
                            </TableCell>
                            <TableCell className="text-right rtl:text-left font-medium">
                              {sellingValue.toFixed(2)} ر.س
                            </TableCell>
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
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            
            <div className="flex justify-end mt-4 print:hidden">
              <ExportData
                title="تصدير بيانات تقييم المخزون"
                data={filteredProducts.map((product, index) => {
                  const inventoryValue = calculateInventoryValue(product);
                  const sellingValue = product.stock * product.price;
                  const profitMargin = calculateProfitMargin(
                    inventoryValue / (product.stock || 1),
                    product.price
                  );
                  
                  return {
                    '#': index + 1,
                    'المنتج': product.name,
                    'الرمز': product.sku,
                    'الفئة': product.category.name,
                    'المخزون': product.stock,
                    'الوحدة': product.unit,
                    'سعر التكلفة': (inventoryValue / (product.stock || 1)).toFixed(2),
                    'قيمة المخزون': inventoryValue.toFixed(2),
                    'سعر البيع': product.price.toFixed(2),
                    'قيمة البيع المقدرة': sellingValue.toFixed(2),
                    'هامش الربح (%)': profitMargin.toFixed(1),
                    'هامش الربح (ر.س)': (sellingValue - inventoryValue).toFixed(2),
                  };
                })}
                columns={[
                  { header: '#', accessor: '#' },
                  { header: 'المنتج', accessor: 'المنتج' },
                  { header: 'الرمز', accessor: 'الرمز' },
                  { header: 'الفئة', accessor: 'الفئة' },
                  { header: 'المخزون', accessor: 'المخزون' },
                  { header: 'الوحدة', accessor: 'الوحدة' },
                  { header: 'سعر التكلفة', accessor: 'سعر التكلفة' },
                  { header: 'قيمة المخزون', accessor: 'قيمة المخزون' },
                  { header: 'سعر البيع', accessor: 'سعر البيع' },
                  { header: 'قيمة البيع المقدرة', accessor: 'قيمة البيع المقدرة' },
                  { header: 'هامش الربح (%)', accessor: 'هامش الربح (%)' },
                  { header: 'هامش الربح (ر.س)', accessor: 'هامش الربح (ر.س)' },
                ]}
                fileName="inventory-valuation-report"
                variant="outline"
                size="sm"
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6 print:space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>توزيع قيمة المخزون حسب الفئة</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData && (
                <div className="h-[200px]">
                  {/* في الواقع، سنستخدم مكون InventoryValueChart */}
                  {/* لكن هنا سنعرض صورة توضيحية */}
                  <div className="flex items-center justify-center h-full">
                    <PieChart className="h-32 w-32 text-muted-foreground" />
                  </div>
                </div>
              )}
              
              <div className="mt-4 space-y-2">
                {categories.map(category => {
                  const categoryProducts = filteredProducts.filter(p => p.categoryId === category.id);
                  const categoryValue = categoryProducts.reduce((sum, p) => sum + calculateInventoryValue(p), 0);
                  const percentage = totalInventoryValue > 0 ? (categoryValue / totalInventoryValue) * 100 : 0;
                  
                  if (categoryValue <= 0) return null;
                  
                  return (
                    <div key={category.id} className="flex justify-between items-center">
                      <span className="text-sm">{category.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{categoryValue.toFixed(2)} ر.س</span>
                        <span className="text-xs text-muted-foreground">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>هامش الربح حسب الفئة</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData && (
                <div className="h-[200px]">
                  {/* في الواقع، سنستخدم مكون InventoryProfitMarginChart */}
                  {/* لكن هنا سنعرض صورة توضيحية */}
                  <div className="flex items-center justify-center h-full">
                    <BarChart3 className="h-32 w-32 text-muted-foreground" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card className="print:mt-4">
        <CardHeader>
          <CardTitle>تطور قيمة المخزون</CardTitle>
          <CardDescription>
            تطور قيمة المخزون خلال الأشهر الستة الماضية
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData && (
            <div className="h-[300px]">
              {/* في الواقع، سنستخدم مكون InventoryValueTrendChart */}
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
                  <TableHead>التاريخ</TableHead>
                  <TableHead className="text-right rtl:text-left">قيمة المخزون</TableHead>
                  <TableHead className="text-center">عدد الوحدات</TableHead>
                  <TableHead className="text-center">التغيير عن الشهر السابق</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historicalValuation.map((item, index) => {
                  const prevValue = index > 0 ? historicalValuation[index - 1].totalValue : item.totalValue;
                  const change = ((item.totalValue - prevValue) / prevValue) * 100;
                  
                  return (
                    <TableRow key={item.date}>
                      <TableCell>{format(new Date(item.date), 'MMMM yyyy', { locale: ar })}</TableCell>
                      <TableCell className="text-right rtl:text-left font-medium">
                        {item.totalValue.toFixed(2)} ر.س
                      </TableCell>
                      <TableCell className="text-center">{item.itemCount}</TableCell>
                      <TableCell className="text-center">
                        {index === 0 ? (
                          <span className="text-muted-foreground">-</span>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            {change > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                            ) : change < 0 ? (
                              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                            ) : (
                              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className={
                              change > 0 ? 'text-green-600 dark:text-green-400' :
                              change < 0 ? 'text-red-600 dark:text-red-400' :
                              'text-muted-foreground'
                            }>
                              {change > 0 ? '+' : ''}{change.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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