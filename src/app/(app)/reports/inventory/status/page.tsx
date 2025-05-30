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
  Layers, 
  DollarSign, 
  AlertTriangle, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Printer, 
  FileText, 
  RefreshCw 
} from "lucide-react";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { ExportData } from '@/components/export/export-data';
import { InventoryStatusChart } from '@/components/charts/inventory-status-chart';
import { InventoryValueChart } from '@/components/charts/inventory-value-chart';
import { CategoryDistributionChart } from '@/components/charts/category-distribution-chart';

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
  inventoryStatus: {
    labels: ['نشط', 'منخفض', 'نفذ'],
    data: [7, 2, 1],
  },
  categoryDistribution: {
    labels: ['أجهزة كمبيوتر', 'طابعات', 'أجهزة عرض', 'هواتف', 'شاشات', 'ملحقات', 'سماعات', 'كاميرات'],
    data: [2, 1, 1, 1, 1, 2, 1, 1],
  },
  inventoryValue: {
    labels: ['أجهزة كمبيوتر', 'طابعات', 'أجهزة عرض', 'هواتف', 'شاشات', 'ملحقات', 'سماعات', 'كاميرات'],
    data: [16500, 7500, 4000, 20000, 2400, 3700, 0, 800],
  },
};

export default function InventoryStatusReport() {
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
        setProducts(mockProducts);
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
  
  // حساب إجماليات المخزون
  const totalProducts = filteredProducts.length;
  const totalStock = filteredProducts.reduce((sum, product) => sum + product.stock, 0);
  const totalValue = filteredProducts.reduce((sum, product) => sum + (product.stock * product.costPrice), 0);
  const lowStockCount = filteredProducts.filter(product => product.stock <= product.minStock && product.stock > 0).length;
  const outOfStockCount = filteredProducts.filter(product => product.stock === 0).length;
  
  // تصدير البيانات
  const handleExportData = () => {
    toast({
      title: 'تصدير البيانات',
      description: 'جاري تصدير تقرير حالة المخزون',
      variant: 'default',
    });
  };
  
  // طباعة التقرير
  const handlePrintReport = () => {
    window.print();
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
            <h1 className="text-3xl font-bold text-foreground">تقرير حالة المخزون</h1>
          </div>
          <p className="text-muted-foreground mt-1">تقرير شامل عن حالة المخزون الحالية</p>
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
              تصفية بيانات المخزون حسب الفئة والحالة
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
                    <SelectItem value="ACTIVE">نشط</SelectItem>
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
          <h1 className="text-3xl font-bold">تقرير حالة المخزون</h1>
          <p className="text-muted-foreground mt-1">
            {selectedDate ? format(selectedDate, 'dd/MM/yyyy', { locale: ar }) : format(new Date(), 'dd/MM/yyyy', { locale: ar })}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
          <Card className="bg-blue-50 dark:bg-blue-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">إجمالي المنتجات</h3>
                  <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400 print:text-black">{totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600 dark:text-blue-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 dark:bg-green-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">إجمالي المخزون</h3>
                  <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400 print:text-black">{totalStock}</p>
                </div>
                <Layers className="h-8 w-8 text-green-600 dark:text-green-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-amber-50 dark:bg-amber-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">قيمة المخزون</h3>
                  <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400 print:text-black">{totalValue.toFixed(2)} ر.س</p>
                </div>
                <DollarSign className="h-8 w-8 text-amber-600 dark:text-amber-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 dark:bg-red-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">منتجات منخفضة / نفذت</h3>
                  <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400 print:text-black">{lowStockCount} / {outOfStockCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
        <Card className="lg:col-span-2 print:col-span-2">
          <CardHeader>
            <CardTitle>قائمة المنتجات</CardTitle>
            <CardDescription>
              عرض حالة المخزون لجميع المنتجات
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
                      <TableHead className="text-center">الحالة</TableHead>
                      <TableHead className="text-right rtl:text-left">القيمة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
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
                          <TableCell className="text-right rtl:text-left font-medium">
                            {(product.stock * product.costPrice).toFixed(2)} ر.س
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
                title="تصدير بيانات المخزون"
                data={filteredProducts.map((product, index) => ({
                  '#': index + 1,
                  'المنتج': product.name,
                  'الرمز': product.sku,
                  'الفئة': product.category.name,
                  'المخزون': product.stock,
                  'الوحدة': product.unit,
                  'الحد الأدنى': product.minStock,
                  'الحد الأقصى': product.maxStock,
                  'الحالة': product.status === 'ACTIVE' ? 'نشط' :
                           product.status === 'LOW_STOCK' ? 'منخفض' :
                           'نفذ',
                  'سعر التكلفة': product.costPrice,
                  'سعر البيع': product.price,
                  'قيمة المخزون': product.stock * product.costPrice,
                }))}
                columns={[
                  { header: '#', accessor: '#' },
                  { header: 'المنتج', accessor: 'المنتج' },
                  { header: 'الرمز', accessor: 'الرمز' },
                  { header: 'الفئة', accessor: 'الفئة' },
                  { header: 'المخزون', accessor: 'المخزون' },
                  { header: 'الوحدة', accessor: 'الوحدة' },
                  { header: 'الحد الأدنى', accessor: 'الحد الأدنى' },
                  { header: 'الحد الأقصى', accessor: 'الحد الأقصى' },
                  { header: 'الحالة', accessor: 'الحالة' },
                  { header: 'سعر التكلفة', accessor: 'سعر التكلفة' },
                  { header: 'سعر البيع', accessor: 'سعر البيع' },
                  { header: 'قيمة المخزون', accessor: 'قيمة المخزون' },
                ]}
                fileName="inventory-status-report"
                variant="outline"
                size="sm"
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6 print:space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>توزيع حالة المخزون</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData && (
                <div className="h-[200px]">
                  {/* في الواقع، سنستخدم مكون InventoryStatusChart */}
                  {/* لكن هنا سنعرض صورة توضيحية */}
                  <div className="flex items-center justify-center h-full">
                    <PieChart className="h-32 w-32 text-muted-foreground" />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="flex flex-col items-center p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 print:bg-white print:border">
                  <span className="text-sm text-muted-foreground">نشط</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400 print:text-black">
                    {chartData?.inventoryStatus.data[0] || 0}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 print:bg-white print:border">
                  <span className="text-sm text-muted-foreground">منخفض</span>
                  <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400 print:text-black">
                    {chartData?.inventoryStatus.data[1] || 0}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-md bg-red-50 dark:bg-red-900/20 print:bg-white print:border">
                  <span className="text-sm text-muted-foreground">نفذ</span>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400 print:text-black">
                    {chartData?.inventoryStatus.data[2] || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>توزيع المخزون حسب الفئة</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData && (
                <div className="h-[200px]">
                  {/* في الواقع، سنستخدم مكون CategoryDistributionChart */}
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
          <CardTitle>قيمة المخزون حسب الفئة</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData && (
            <div className="h-[300px]">
              {/* في الواقع، سنستخدم مكون InventoryValueChart */}
              {/* لكن هنا سنعرض صورة توضيحية */}
              <div className="flex items-center justify-center h-full">
                <BarChart3 className="h-32 w-32 text-muted-foreground" />
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {categories.map((category, index) => {
              const categoryProducts = products.filter(p => p.categoryId === category.id);
              const categoryValue = categoryProducts.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
              
              return (
                <div key={category.id} className="flex flex-col p-3 rounded-md border">
                  <span className="text-sm text-muted-foreground">{category.name}</span>
                  <span className="text-lg font-bold">{categoryValue.toFixed(2)} ر.س</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {categoryProducts.length} منتج | {categoryProducts.reduce((sum, p) => sum + p.stock, 0)} وحدة
                  </span>
                </div>
              );
            })}
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