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
import { DateRangePicker } from "@/components/date-range-picker";
import { 
  ArrowLeft, 
  Download, 
  Search, 
  Filter, 
  Package, 
  ArrowUpDown, 
  Printer, 
  FileText, 
  RefreshCw, 
  BarChart3, 
  LineChart, 
  TrendingUp, 
  TrendingDown, 
  Calendar 
} from "lucide-react";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';
import { useStockMovements } from '@/hooks/use-inventory';
import { ExportData } from '@/components/export/export-data';
import { StockMovementChart } from '@/components/charts/stock-movement-chart';
import { StockMovementByTypeChart } from '@/components/charts/stock-movement-by-type-chart';

// بيانات وهمية للمنتجات
const mockProducts = [
  { id: 'product-1', name: 'لابتوب HP ProBook', sku: 'HP-PB-001' },
  { id: 'product-2', name: 'طابعة Canon', sku: 'CN-PR-001' },
  { id: 'product-3', name: 'جهاز عرض Epson', sku: 'EP-PJ-001' },
  { id: 'product-4', name: 'هاتف Samsung Galaxy', sku: 'SG-PH-001' },
  { id: 'product-5', name: 'كمبيوتر مكتبي Dell', sku: 'DL-PC-001' },
  { id: 'product-6', name: 'شاشة LG', sku: 'LG-MN-001' },
  { id: 'product-7', name: 'ماوس Logitech', sku: 'LG-MS-001' },
  { id: 'product-8', name: 'لوحة مفاتيح Microsoft', sku: 'MS-KB-001' },
  { id: 'product-9', name: 'سماعات Sony', sku: 'SN-HP-001' },
  { id: 'product-10', name: 'كاميرا Canon', sku: 'CN-CM-001' },
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

// بيانات وهمية لحركة المخزون
const mockStockMovements = [
  {
    id: 'movement-1',
    date: new Date('2024-06-20'),
    productId: 'product-1',
    product: {
      id: 'product-1',
      name: 'لابتوب HP ProBook',
      sku: 'HP-PB-001',
      categoryId: 'category-1',
      category: {
        id: 'category-1',
        name: 'أجهزة كمبيوتر',
      },
    },
    type: 'PURCHASE',
    quantity: 5,
    reference: 'PO-2024-001',
    notes: 'شراء من المورد',
    user: 'أحمد محمد',
  },
  {
    id: 'movement-2',
    date: new Date('2024-06-18'),
    productId: 'product-1',
    product: {
      id: 'product-1',
      name: 'لابتوب HP ProBook',
      sku: 'HP-PB-001',
      categoryId: 'category-1',
      category: {
        id: 'category-1',
        name: 'أجهزة كمبيوتر',
      },
    },
    type: 'SALE',
    quantity: -2,
    reference: 'INV-2024-001',
    notes: 'بيع للعميل',
    user: 'محمد علي',
  },
  {
    id: 'movement-3',
    date: new Date('2024-06-15'),
    productId: 'product-1',
    product: {
      id: 'product-1',
      name: 'لابتوب HP ProBook',
      sku: 'HP-PB-001',
      categoryId: 'category-1',
      category: {
        id: 'category-1',
        name: 'أجهزة كمبيوتر',
      },
    },
    type: 'ADJUSTMENT',
    quantity: 1,
    reference: 'ADJ-2024-001',
    notes: 'تعديل بعد الجرد',
    user: 'أحمد محمد',
  },
  {
    id: 'movement-4',
    date: new Date('2024-06-10'),
    productId: 'product-1',
    product: {
      id: 'product-1',
      name: 'لابتوب HP ProBook',
      sku: 'HP-PB-001',
      categoryId: 'category-1',
      category: {
        id: 'category-1',
        name: 'أجهزة كمبيوتر',
      },
    },
    type: 'RETURN',
    quantity: 1,
    reference: 'RET-2024-001',
    notes: 'مرتجع من العميل',
    user: 'محمد علي',
  },
  {
    id: 'movement-5',
    date: new Date('2024-06-05'),
    productId: 'product-1',
    product: {
      id: 'product-1',
      name: 'لابتوب HP ProBook',
      sku: 'HP-PB-001',
      categoryId: 'category-1',
      category: {
        id: 'category-1',
        name: 'أجهزة كمبيوتر',
      },
    },
    type: 'PURCHASE',
    quantity: 10,
    reference: 'PO-2024-002',
    notes: 'شراء أولي',
    user: 'أحمد محمد',
  },
  {
    id: 'movement-6',
    date: new Date('2024-06-19'),
    productId: 'product-2',
    product: {
      id: 'product-2',
      name: 'طابعة Canon',
      sku: 'CN-PR-001',
      categoryId: 'category-2',
      category: {
        id: 'category-2',
        name: 'طابعات',
      },
    },
    type: 'PURCHASE',
    quantity: 8,
    reference: 'PO-2024-003',
    notes: 'شراء من المورد',
    user: 'أحمد محمد',
  },
  {
    id: 'movement-7',
    date: new Date('2024-06-17'),
    productId: 'product-2',
    product: {
      id: 'product-2',
      name: 'طابعة Canon',
      sku: 'CN-PR-001',
      categoryId: 'category-2',
      category: {
        id: 'category-2',
        name: 'طابعات',
      },
    },
    type: 'SALE',
    quantity: -3,
    reference: 'INV-2024-002',
    notes: 'بيع للعميل',
    user: 'محمد علي',
  },
  {
    id: 'movement-8',
    date: new Date('2024-06-12'),
    productId: 'product-3',
    product: {
      id: 'product-3',
      name: 'جهاز عرض Epson',
      sku: 'EP-PJ-001',
      categoryId: 'category-3',
      category: {
        id: 'category-3',
        name: 'أجهزة عرض',
      },
    },
    type: 'PURCHASE',
    quantity: 5,
    reference: 'PO-2024-004',
    notes: 'شراء من المورد',
    user: 'أحمد محمد',
  },
  {
    id: 'movement-9',
    date: new Date('2024-06-08'),
    productId: 'product-3',
    product: {
      id: 'product-3',
      name: 'جهاز عرض Epson',
      sku: 'EP-PJ-001',
      categoryId: 'category-3',
      category: {
        id: 'category-3',
        name: 'أجهزة عرض',
      },
    },
    type: 'SALE',
    quantity: -1,
    reference: 'INV-2024-003',
    notes: 'بيع للعميل',
    user: 'محمد علي',
  },
  {
    id: 'movement-10',
    date: new Date('2024-06-03'),
    productId: 'product-4',
    product: {
      id: 'product-4',
      name: 'هاتف Samsung Galaxy',
      sku: 'SG-PH-001',
      categoryId: 'category-4',
      category: {
        id: 'category-4',
        name: 'هواتف',
      },
    },
    type: 'ADJUSTMENT',
    quantity: -2,
    reference: 'ADJ-2024-002',
    notes: 'تعديل بعد الجرد - نقص',
    user: 'أحمد محمد',
  },
  {
    id: 'movement-11',
    date: new Date('2024-05-28'),
    productId: 'product-5',
    product: {
      id: 'product-5',
      name: 'كمبيوتر مكتبي Dell',
      sku: 'DL-PC-001',
      categoryId: 'category-1',
      category: {
        id: 'category-1',
        name: 'أجهزة كمبيوتر',
      },
    },
    type: 'PURCHASE',
    quantity: 3,
    reference: 'PO-2024-005',
    notes: 'شراء من المورد',
    user: 'أحمد محمد',
  },
  {
    id: 'movement-12',
    date: new Date('2024-05-25'),
    productId: 'product-6',
    product: {
      id: 'product-6',
      name: 'شاشة LG',
      sku: 'LG-MN-001',
      categoryId: 'category-5',
      category: {
        id: 'category-5',
        name: 'شاشات',
      },
    },
    type: 'PURCHASE',
    quantity: 10,
    reference: 'PO-2024-006',
    notes: 'شراء من المورد',
    user: 'أحمد محمد',
  },
  {
    id: 'movement-13',
    date: new Date('2024-05-22'),
    productId: 'product-6',
    product: {
      id: 'product-6',
      name: 'شاشة LG',
      sku: 'LG-MN-001',
      categoryId: 'category-5',
      category: {
        id: 'category-5',
        name: 'شاشات',
      },
    },
    type: 'SALE',
    quantity: -2,
    reference: 'INV-2024-004',
    notes: 'بيع للعميل',
    user: 'محمد علي',
  },
  {
    id: 'movement-14',
    date: new Date('2024-05-20'),
    productId: 'product-7',
    product: {
      id: 'product-7',
      name: 'ماوس Logitech',
      sku: 'LG-MS-001',
      categoryId: 'category-6',
      category: {
        id: 'category-6',
        name: 'ملحقات',
      },
    },
    type: 'PURCHASE',
    quantity: 30,
    reference: 'PO-2024-007',
    notes: 'شراء من المورد',
    user: 'أحمد محمد',
  },
  {
    id: 'movement-15',
    date: new Date('2024-05-18'),
    productId: 'product-8',
    product: {
      id: 'product-8',
      name: 'لوحة مفاتيح Microsoft',
      sku: 'MS-KB-001',
      categoryId: 'category-6',
      category: {
        id: 'category-6',
        name: 'ملحقات',
      },
    },
    type: 'PURCHASE',
    quantity: 25,
    reference: 'PO-2024-008',
    notes: 'شراء من المورد',
    user: 'أحمد محمد',
  },
];

// بيانات وهمية للرسوم البيانية
const mockChartData = {
  stockMovementByDate: {
    labels: ['1 يونيو', '5 يونيو', '10 يونيو', '15 يونيو', '20 يونيو'],
    inData: [15, 10, 5, 8, 12],
    outData: [-5, -8, -3, -6, -4],
  },
  stockMovementByType: {
    labels: ['شراء', 'بيع', 'تعديل', 'مرتجع'],
    data: [61, -8, -1, 1],
  },
};

// تنسيق التاريخ
const formatDate = (date: string | Date) => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ar });
};

export default function StockMovementReport() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<{ from?: Date; to?: Date }>({});
  
  // في الواقع، سنستخدم useStockMovements و useProducts و useCategories hooks
  // لكن هنا سنحاكي العملية
  const [stockMovements, setStockMovements] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // محاكاة جلب البيانات
        setStockMovements(mockStockMovements);
        setProducts(mockProducts);
        setCategories(mockCategories);
        setChartData(mockChartData);
        
        // التحقق من وجود معلمات في الـ URL
        const productId = searchParams.get('productId');
        if (productId) {
          setSelectedProductId(productId);
        }
        
        const categoryId = searchParams.get('categoryId');
        if (categoryId) {
          setSelectedCategoryId(categoryId);
        }
        
        const type = searchParams.get('type');
        if (type) {
          setSelectedType(type);
        }
        
        const fromDate = searchParams.get('from');
        const toDate = searchParams.get('to');
        if (fromDate || toDate) {
          const dateRange: { from?: Date; to?: Date } = {};
          if (fromDate) dateRange.from = new Date(fromDate);
          if (toDate) dateRange.to = new Date(toDate);
          setSelectedDateRange(dateRange);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [searchParams]);
  
  // تصفية حركات المخزون
  const filteredMovements = stockMovements.filter(movement => {
    // تصفية حسب المنتج
    if (selectedProductId && movement.productId !== selectedProductId) {
      return false;
    }
    
    // تصفية حسب الفئة
    if (selectedCategoryId && movement.product.categoryId !== selectedCategoryId) {
      return false;
    }
    
    // تصفية حسب النوع
    if (selectedType && movement.type !== selectedType) {
      return false;
    }
    
    // تصفية حسب نطاق التاريخ
    if (selectedDateRange.from && new Date(movement.date) < selectedDateRange.from) {
      return false;
    }
    
    if (selectedDateRange.to) {
      const toDate = new Date(selectedDateRange.to);
      toDate.setHours(23, 59, 59, 999);
      if (new Date(movement.date) > toDate) {
        return false;
      }
    }
    
    // تصفية حسب البحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        movement.product.name.toLowerCase().includes(query) ||
        movement.product.sku.toLowerCase().includes(query) ||
        movement.reference.toLowerCase().includes(query) ||
        movement.notes.toLowerCase().includes(query) ||
        movement.user.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setSelectedProductId('');
    setSelectedCategoryId('');
    setSelectedType('');
    setSelectedDateRange({});
    setSearchQuery('');
  };
  
  // حساب إجماليات الحركات
  const totalIn = filteredMovements
    .filter(m => m.quantity > 0)
    .reduce((sum, m) => sum + m.quantity, 0);
    
  const totalOut = filteredMovements
    .filter(m => m.quantity < 0)
    .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    
  const netChange = totalIn - totalOut;
  
  // حساب عدد الحركات حسب النوع
  const purchaseCount = filteredMovements.filter(m => m.type === 'PURCHASE').length;
  const saleCount = filteredMovements.filter(m => m.type === 'SALE').length;
  const adjustmentCount = filteredMovements.filter(m => m.type === 'ADJUSTMENT').length;
  const returnCount = filteredMovements.filter(m => m.type === 'RETURN').length;
  
  // تصدير البيانات
  const handleExportData = () => {
    toast({
      title: 'تصدير البيانات',
      description: 'جاري تصدير تقرير حركة المخزون',
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
            <h1 className="text-3xl font-bold text-foreground">تقرير حركة المخزون</h1>
          </div>
          <p className="text-muted-foreground mt-1">تقرير عن حركة المخزون (دخول وخروج)</p>
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
              تصفية حركات المخزون حسب المنتج والفئة والنوع والتاريخ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="product">المنتج</Label>
                <Select
                  value={selectedProductId}
                  onValueChange={setSelectedProductId}
                >
                  <SelectTrigger id="product" className="w-full">
                    <SelectValue placeholder="جميع المنتجات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع المنتجات</SelectItem>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
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
                <Label htmlFor="type">نوع الحركة</Label>
                <Select
                  value={selectedType}
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="جميع الأنواع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الأنواع</SelectItem>
                    <SelectItem value="PURCHASE">شراء</SelectItem>
                    <SelectItem value="SALE">بيع</SelectItem>
                    <SelectItem value="ADJUSTMENT">تعديل</SelectItem>
                    <SelectItem value="RETURN">مرتجع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
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
            </div>
            
            <div className="mt-4 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن منتج، مرجع، ملاحظات..."
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
          <h1 className="text-3xl font-bold">تقرير حركة المخزون</h1>
          <p className="text-muted-foreground mt-1">
            {selectedDateRange.from && selectedDateRange.to ? (
              `${formatDate(selectedDateRange.from)} - ${formatDate(selectedDateRange.to)}`
            ) : selectedDateRange.from ? (
              `من ${formatDate(selectedDateRange.from)}`
            ) : selectedDateRange.to ? (
              `حتى ${formatDate(selectedDateRange.to)}`
            ) : (
              'جميع الفترات'
            )}
          </p>
          {selectedProductId && (
            <p className="text-muted-foreground mt-1">
              المنتج: {products.find(p => p.id === selectedProductId)?.name}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
          <Card className="bg-green-50 dark:bg-green-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">إجمالي الداخل</h3>
                  <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400 print:text-black">{totalIn}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50 dark:bg-red-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">إجمالي الخارج</h3>
                  <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400 print:text-black">{totalOut}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-50 dark:bg-blue-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">صافي التغيير</h3>
                  <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400 print:text-black">{netChange}</p>
                </div>
                <ArrowUpDown className="h-8 w-8 text-blue-600 dark:text-blue-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 dark:bg-purple-900/20 print:bg-white print:border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">عدد الحركات</h3>
                  <p className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400 print:text-black">{filteredMovements.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400 print:text-black" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-3 print:gap-4">
        <Card className="lg:col-span-2 print:col-span-2">
          <CardHeader>
            <CardTitle>سجل حركة المخزون</CardTitle>
            <CardDescription>
              عرض جميع حركات الدخول والخروج للمخزون
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
                      <TableHead>التاريخ</TableHead>
                      <TableHead>المنتج</TableHead>
                      <TableHead>النوع</TableHead>
                      <TableHead className="text-center">الكمية</TableHead>
                      <TableHead>المرجع</TableHead>
                      <TableHead>الملاحظات</TableHead>
                      <TableHead>المستخدم</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMovements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          لا توجد حركات مخزون مطابقة للبحث
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredMovements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>{formatDate(movement.date)}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{movement.product.name}</div>
                              <div className="text-xs text-muted-foreground">{movement.product.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              movement.type === 'PURCHASE' ? 'default' :
                              movement.type === 'SALE' ? 'destructive' :
                              movement.type === 'ADJUSTMENT' ? 'outline' :
                              'secondary'
                            }>
                              {movement.type === 'PURCHASE' ? 'شراء' :
                               movement.type === 'SALE' ? 'بيع' :
                               movement.type === 'ADJUSTMENT' ? 'تعديل' :
                               movement.type === 'RETURN' ? 'مرتجع' : movement.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={
                              movement.quantity > 0 ? 'text-green-600 dark:text-green-400' :
                              movement.quantity < 0 ? 'text-red-600 dark:text-red-400' : ''
                            }>
                              {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                            </span>
                          </TableCell>
                          <TableCell>{movement.reference}</TableCell>
                          <TableCell>{movement.notes}</TableCell>
                          <TableCell>{movement.user}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
            
            <div className="flex justify-end mt-4 print:hidden">
              <ExportData
                title="تصدير حركة المخزون"
                data={filteredMovements.map(movement => ({
                  'التاريخ': formatDate(movement.date),
                  'المنتج': movement.product.name,
                  'الرمز': movement.product.sku,
                  'الفئة': movement.product.category.name,
                  'النوع': movement.type === 'PURCHASE' ? 'شراء' :
                           movement.type === 'SALE' ? 'بيع' :
                           movement.type === 'ADJUSTMENT' ? 'تعديل' :
                           movement.type === 'RETURN' ? 'مرتجع' : movement.type,
                  'الكمية': movement.quantity,
                  'المرجع': movement.reference,
                  'الملاحظات': movement.notes,
                  'المستخدم': movement.user,
                }))}
                columns={[
                  { header: 'التاريخ', accessor: 'التاريخ' },
                  { header: 'المنتج', accessor: 'المنتج' },
                  { header: 'الرمز', accessor: 'الرمز' },
                  { header: 'الفئة', accessor: 'الفئة' },
                  { header: 'النوع', accessor: 'النوع' },
                  { header: 'الكمية', accessor: 'الكمية' },
                  { header: 'المرجع', accessor: 'المرجع' },
                  { header: 'الملاحظات', accessor: 'الملاحظات' },
                  { header: 'المستخدم', accessor: 'المستخدم' },
                ]}
                fileName="stock-movements-report"
                variant="outline"
                size="sm"
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6 print:space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ملخص الحركات حسب النوع</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData && (
                <div className="h-[200px]">
                  {/* في الواقع، سنستخدم مكون StockMovementByTypeChart */}
                  {/* لكن هنا سنعرض صورة توضيحية */}
                  <div className="flex items-center justify-center h-full">
                    <PieChart className="h-32 w-32 text-muted-foreground" />
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="flex flex-col items-center p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 print:bg-white print:border">
                  <span className="text-sm text-muted-foreground">شراء</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400 print:text-black">
                    {purchaseCount}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-md bg-red-50 dark:bg-red-900/20 print:bg-white print:border">
                  <span className="text-sm text-muted-foreground">بيع</span>
                  <span className="text-lg font-bold text-red-600 dark:text-red-400 print:text-black">
                    {saleCount}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-md bg-yellow-50 dark:bg-yellow-900/20 print:bg-white print:border">
                  <span className="text-sm text-muted-foreground">تعديل</span>
                  <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400 print:text-black">
                    {adjustmentCount}
                  </span>
                </div>
                <div className="flex flex-col items-center p-2 rounded-md bg-green-50 dark:bg-green-900/20 print:bg-white print:border">
                  <span className="text-sm text-muted-foreground">مرتجع</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400 print:text-black">
                    {returnCount}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>توزيع الحركات حسب المنتج</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products.map(product => {
                  const productMovements = filteredMovements.filter(m => m.productId === product.id);
                  if (productMovements.length === 0) return null;
                  
                  const inCount = productMovements.filter(m => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0);
                  const outCount = productMovements.filter(m => m.quantity < 0).reduce((sum, m) => sum + Math.abs(m.quantity), 0);
                  
                  return (
                    <div key={product.id} className="flex flex-col p-3 rounded-md border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-sm text-muted-foreground">{product.sku}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-sm text-green-600 dark:text-green-400">{inCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                          <span className="text-sm text-red-600 dark:text-red-400">{outCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ArrowUpDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm text-blue-600 dark:text-blue-400">{inCount - outCount}</span>
                        </div>
                      </div>
                    </div>
                  );
                }).filter(Boolean)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card className="print:mt-4">
        <CardHeader>
          <CardTitle>تطور حركة المخزون</CardTitle>
          <CardDescription>
            تطور حركة الدخول والخروج للمخزون خلال الفترة المحددة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {chartData && (
            <div className="h-[300px]">
              {/* في الواقع، سنستخدم مكون StockMovementChart */}
              {/* لكن هنا سنعرض صورة توضيحية */}
              <div className="flex items-center justify-center h-full">
                <LineChart className="h-32 w-32 text-muted-foreground" />
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">ملخص الحركات حسب الفئة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categories.map(category => {
                    const categoryMovements = filteredMovements.filter(m => m.product.categoryId === category.id);
                    if (categoryMovements.length === 0) return null;
                    
                    const inCount = categoryMovements.filter(m => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0);
                    const outCount = categoryMovements.filter(m => m.quantity < 0).reduce((sum, m) => sum + Math.abs(m.quantity), 0);
                    
                    return (
                      <div key={category.id} className="flex justify-between items-center">
                        <span className="text-sm">{category.name}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-green-600 dark:text-green-400">+{inCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-red-600 dark:text-red-400">-{outCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={
                              inCount - outCount > 0 ? 'text-xs text-green-600 dark:text-green-400' :
                              inCount - outCount < 0 ? 'text-xs text-red-600 dark:text-red-400' :
                              'text-xs text-muted-foreground'
                            }>
                              {inCount - outCount > 0 ? '+' : ''}{inCount - outCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }).filter(Boolean)}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">ملخص الحركات حسب المستخدم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from(new Set(filteredMovements.map(m => m.user))).map(user => {
                    const userMovements = filteredMovements.filter(m => m.user === user);
                    
                    const inCount = userMovements.filter(m => m.quantity > 0).reduce((sum, m) => sum + m.quantity, 0);
                    const outCount = userMovements.filter(m => m.quantity < 0).reduce((sum, m) => sum + Math.abs(m.quantity), 0);
                    
                    return (
                      <div key={user} className="flex justify-between items-center">
                        <span className="text-sm">{user}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-green-600 dark:text-green-400">+{inCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-red-600 dark:text-red-400">-{outCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={
                              inCount - outCount > 0 ? 'text-xs text-green-600 dark:text-green-400' :
                              inCount - outCount < 0 ? 'text-xs text-red-600 dark:text-red-400' :
                              'text-xs text-muted-foreground'
                            }>
                              {inCount - outCount > 0 ? '+' : ''}{inCount - outCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
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