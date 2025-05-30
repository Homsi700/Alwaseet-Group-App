'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  RefreshCw,
  Download,
  Search,
  Filter,
  ArrowLeft,
  ShoppingCart,
  DollarSign,
  Percent,
  BarChart3,
  Calendar
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ExportData } from '@/components/export/export-data';
import { format, subDays, subMonths } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePicker } from '@/components/ui/date-picker';
import { PieChart } from '@/components/charts/pie-chart';
import { BarChart } from '@/components/charts/bar-chart';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

// إنشاء عميل React Query
const queryClient = new QueryClient();

// صفحة تقرير أداء المنتجات
export default function ProductPerformanceReportPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProductPerformanceReportContent />
    </QueryClientProvider>
  );
}

// مكون محتوى صفحة تقرير أداء المنتجات
function ProductPerformanceReportContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [fromDate, setFromDate] = useState<Date | undefined>(subMonths(new Date(), 3));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // تنسيق المبالغ المالية
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('ar-SY')} ل.س`;
  };
  
  // تنسيق التاريخ
  const formatDate = (date: Date) => {
    return format(date, 'dd MMMM yyyy', { locale: ar });
  };
  
  // استعلام بيانات تقرير أداء المنتجات
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['productPerformanceReport', { 
      categoryId: selectedCategory, 
      fromDate: fromDate?.toISOString(),
      toDate: toDate?.toISOString()
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (fromDate) params.append('fromDate', fromDate.toISOString());
      if (toDate) params.append('toDate', toDate.toISOString());
      
      const response = await fetch(`/api/reports/inventory/performance?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('فشل في الحصول على تقرير أداء المنتجات');
      }
      
      return response.json();
    },
  });
  
  // تحديث البيانات
  const handleRefresh = () => {
    refetch();
    setLastRefresh(new Date());
  };
  
  // بيانات وهمية للعرض في حالة عدم وجود بيانات حقيقية
  const mockData = {
    products: [
      { productId: 1, name: 'تفاح أحمر', barcode: 'P001', categoryId: 1, categoryName: 'فواكه', salesCount: 25, quantitySold: 120, salesValue: 78000, costValue: 60000, profit: 18000, profitMargin: 30, returnCount: 2, returnRate: 1.67, stockTurnover: 0.8, currentStock: 150 },
      { productId: 2, name: 'موز', barcode: 'P002', categoryId: 1, categoryName: 'فواكه', salesCount: 18, quantitySold: 90, salesValue: 49500, costValue: 36000, profit: 13500, profitMargin: 37.5, returnCount: 0, returnRate: 0, stockTurnover: 1.13, currentStock: 80 },
      { productId: 3, name: 'خبز عربي', barcode: 'P003', categoryId: 2, categoryName: 'مخبوزات', salesCount: 40, quantitySold: 200, salesValue: 50000, costValue: 40000, profit: 10000, profitMargin: 25, returnCount: 5, returnRate: 2.5, stockTurnover: 6.67, currentStock: 30 },
      { productId: 4, name: 'حليب طازج', barcode: 'P004', categoryId: 3, categoryName: 'ألبان', salesCount: 30, quantitySold: 150, salesValue: 67500, costValue: 52500, profit: 15000, profitMargin: 28.6, returnCount: 3, returnRate: 2, stockTurnover: 3.33, currentStock: 45 },
      { productId: 5, name: 'جبنة بيضاء', barcode: 'P005', categoryId: 3, categoryName: 'ألبان', salesCount: 15, quantitySold: 40, salesValue: 40000, costValue: 32000, profit: 8000, profitMargin: 25, returnCount: 1, returnRate: 2.5, stockTurnover: 2, currentStock: 20 },
    ],
    topSellers: [
      { productId: 3, name: 'خبز عربي', barcode: 'P003', categoryId: 2, categoryName: 'مخبوزات', salesCount: 40, quantitySold: 200, salesValue: 50000, costValue: 40000, profit: 10000, profitMargin: 25, returnCount: 5, returnRate: 2.5, stockTurnover: 6.67, currentStock: 30 },
      { productId: 4, name: 'حليب طازج', barcode: 'P004', categoryId: 3, categoryName: 'ألبان', salesCount: 30, quantitySold: 150, salesValue: 67500, costValue: 52500, profit: 15000, profitMargin: 28.6, returnCount: 3, returnRate: 2, stockTurnover: 3.33, currentStock: 45 },
      { productId: 1, name: 'تفاح أحمر', barcode: 'P001', categoryId: 1, categoryName: 'فواكه', salesCount: 25, quantitySold: 120, salesValue: 78000, costValue: 60000, profit: 18000, profitMargin: 30, returnCount: 2, returnRate: 1.67, stockTurnover: 0.8, currentStock: 150 },
      { productId: 2, name: 'موز', barcode: 'P002', categoryId: 1, categoryName: 'فواكه', salesCount: 18, quantitySold: 90, salesValue: 49500, costValue: 36000, profit: 13500, profitMargin: 37.5, returnCount: 0, returnRate: 0, stockTurnover: 1.13, currentStock: 80 },
      { productId: 5, name: 'جبنة بيضاء', barcode: 'P005', categoryId: 3, categoryName: 'ألبان', salesCount: 15, quantitySold: 40, salesValue: 40000, costValue: 32000, profit: 8000, profitMargin: 25, returnCount: 1, returnRate: 2.5, stockTurnover: 2, currentStock: 20 },
    ],
    topProfitable: [
      { productId: 1, name: 'تفاح أحمر', barcode: 'P001', categoryId: 1, categoryName: 'فواكه', salesCount: 25, quantitySold: 120, salesValue: 78000, costValue: 60000, profit: 18000, profitMargin: 30, returnCount: 2, returnRate: 1.67, stockTurnover: 0.8, currentStock: 150 },
      { productId: 4, name: 'حليب طازج', barcode: 'P004', categoryId: 3, categoryName: 'ألبان', salesCount: 30, quantitySold: 150, salesValue: 67500, costValue: 52500, profit: 15000, profitMargin: 28.6, returnCount: 3, returnRate: 2, stockTurnover: 3.33, currentStock: 45 },
      { productId: 2, name: 'موز', barcode: 'P002', categoryId: 1, categoryName: 'فواكه', salesCount: 18, quantitySold: 90, salesValue: 49500, costValue: 36000, profit: 13500, profitMargin: 37.5, returnCount: 0, returnRate: 0, stockTurnover: 1.13, currentStock: 80 },
      { productId: 3, name: 'خبز عربي', barcode: 'P003', categoryId: 2, categoryName: 'مخبوزات', salesCount: 40, quantitySold: 200, salesValue: 50000, costValue: 40000, profit: 10000, profitMargin: 25, returnCount: 5, returnRate: 2.5, stockTurnover: 6.67, currentStock: 30 },
      { productId: 5, name: 'جبنة بيضاء', barcode: 'P005', categoryId: 3, categoryName: 'ألبان', salesCount: 15, quantitySold: 40, salesValue: 40000, costValue: 32000, profit: 8000, profitMargin: 25, returnCount: 1, returnRate: 2.5, stockTurnover: 2, currentStock: 20 },
    ],
    summary: {
      totalSales: 285000,
      totalProfit: 64500,
      averageProfitMargin: 29.2,
      totalUnitsSold: 600,
      totalReturns: 11,
      averageReturnRate: 1.83,
    }
  };
  
  // استخدام البيانات الحقيقية إذا كانت متوفرة، وإلا استخدام البيانات الوهمية
  const reportData = data || mockData;
  
  // تصفية المنتجات بناءً على البحث والفئة المحددة
  const filteredProducts = reportData.products.filter((product) => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || product.categoryId.toString() === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // تجميع الفئات من المنتجات
  const categories = Array.from(new Set(reportData.products.map(product => product.categoryId)))
    .map(categoryId => {
      const product = reportData.products.find(p => p.categoryId === categoryId);
      return {
        categoryId,
        name: product?.categoryName || 'غير معروف'
      };
    });
  
  // تحويل بيانات المنتجات الأكثر مبيعًا إلى تنسيق مناسب للرسم البياني
  const topSellersChartData = reportData.topSellers.map(product => ({
    name: product.name,
    quantity: product.quantitySold,
  }));
  
  // تحويل بيانات المنتجات الأكثر ربحية إلى تنسيق مناسب للرسم البياني
  const topProfitableChartData = reportData.topProfitable.map(product => ({
    name: product.name,
    profit: product.profit,
  }));
  
  // تجميع بيانات المبيعات حسب الفئة للرسم البياني
  const categorySalesData = categories.map(category => {
    const categoryProducts = reportData.products.filter(p => p.categoryId === category.categoryId);
    const totalSales = categoryProducts.reduce((sum, product) => sum + product.salesValue, 0);
    const totalProfit = categoryProducts.reduce((sum, product) => sum + product.profit, 0);
    
    return {
      name: category.name,
      sales: totalSales,
      profit: totalProfit,
    };
  });

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push('/inventory/reports')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">تقرير أداء المنتجات</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} title="تحديث البيانات">
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <ExportData
            title="تقرير أداء المنتجات"
            data={reportData.products.map((product) => ({
              'اسم المنتج': product.name,
              'الباركود': product.barcode,
              'الفئة': product.categoryName,
              'عدد المبيعات': product.salesCount,
              'الكمية المباعة': product.quantitySold,
              'قيمة المبيعات': product.salesValue,
              'تكلفة المبيعات': product.costValue,
              'الربح': product.profit,
              'هامش الربح (%)': product.profitMargin,
              'عدد المرتجعات': product.returnCount,
              'معدل الإرجاع (%)': product.returnRate,
              'معدل دوران المخزون': product.stockTurnover,
              'المخزون الحالي': product.currentStock,
            }))}
            columns={[
              { header: 'اسم المنتج', accessor: 'اسم المنتج' },
              { header: 'الباركود', accessor: 'الباركود' },
              { header: 'الفئة', accessor: 'الفئة' },
              { header: 'عدد المبيعات', accessor: 'عدد المبيعات' },
              { header: 'الكمية المباعة', accessor: 'الكمية المباعة' },
              { header: 'قيمة المبيعات', accessor: 'قيمة المبيعات', format: (value) => formatCurrency(value) },
              { header: 'تكلفة المبيعات', accessor: 'تكلفة المبيعات', format: (value) => formatCurrency(value) },
              { header: 'الربح', accessor: 'الربح', format: (value) => formatCurrency(value) },
              { header: 'هامش الربح (%)', accessor: 'هامش الربح (%)', format: (value) => `${value.toFixed(2)}%` },
              { header: 'عدد المرتجعات', accessor: 'عدد المرتجعات' },
              { header: 'معدل الإرجاع (%)', accessor: 'معدل الإرجاع (%)', format: (value) => `${value.toFixed(2)}%` },
              { header: 'معدل دوران المخزون', accessor: 'معدل دوران المخزون', format: (value) => value.toFixed(2) },
              { header: 'المخزون الحالي', accessor: 'المخزون الحالي' },
            ]}
            summary={{
              'إجمالي المبيعات': formatCurrency(reportData.summary.totalSales),
              'إجمالي الربح': formatCurrency(reportData.summary.totalProfit),
              'متوسط هامش الربح': `${reportData.summary.averageProfitMargin.toFixed(2)}%`,
              'إجمالي الوحدات المباعة': reportData.summary.totalUnitsSold,
              'إجمالي المرتجعات': reportData.summary.totalReturns,
              'متوسط معدل الإرجاع': `${reportData.summary.averageReturnRate.toFixed(2)}%`,
            }}
            fileName={`product-performance-report-${format(new Date(), 'yyyy-MM-dd')}`}
            size="icon"
          />
        </div>
      </div>

      {/* تاريخ التقرير وآخر تحديث */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between">
            <div className="flex items-center gap-2">
              <span>تاريخ التقرير: {format(new Date(), 'dd MMMM yyyy', { locale: ar })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 sm:mt-0">
              <RefreshCw className="h-4 w-4" />
              <span>آخر تحديث: {format(lastRefresh, 'HH:mm:ss', { locale: ar })}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* أدوات البحث والتصفية */}
      <Card>
        <CardHeader>
          <CardTitle>البحث والتصفية</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">بحث</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="ابحث باسم المنتج أو الباركود"
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-1/4">
              <Label htmlFor="category">الفئة</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الفئات</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="w-full md:w-1/4">
              <Label>من تاريخ</Label>
              <DatePicker date={fromDate} setDate={setFromDate} />
            </div>
            <div className="w-full md:w-1/4">
              <Label>إلى تاريخ</Label>
              <DatePicker date={toDate} setDate={setToDate} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ملخص أداء المنتجات */}
      <section aria-labelledby="summary-title">
        <h2 id="summary-title" className="text-2xl font-semibold mb-4 text-foreground">ملخص أداء المنتجات</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المبيعات</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData.summary.totalSales)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                قيمة المبيعات الإجمالية
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الربح</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData.summary.totalProfit)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                الربح الإجمالي من المبيعات
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">الوحدات المباعة</CardTitle>
              <ShoppingCart className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.summary.totalUnitsSold}</div>
              <p className="text-xs text-muted-foreground mt-1">
                إجمالي عدد الوحدات المباعة
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">متوسط هامش الربح</CardTitle>
              <Percent className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.summary.averageProfitMargin.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                متوسط هامش الربح للمنتجات
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* تبويبات التقرير */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="categories">الفئات</TabsTrigger>
        </TabsList>
        
        {/* نظرة عامة */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>المنتجات الأكثر مبيعًا</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart 
                  data={topSellersChartData} 
                  index="name"
                  categories={['quantity']}
                  valueFormatter={(value) => value.toString()}
                  colors={['#3b82f6']}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>المنتجات الأكثر ربحية</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart 
                  data={topProfitableChartData} 
                  index="name"
                  categories={['profit']}
                  valueFormatter={(value) => formatCurrency(value)}
                  colors={['#10b981']}
                />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>المبيعات والأرباح حسب الفئة</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <BarChart 
                data={categorySalesData} 
                index="name"
                categories={['sales', 'profit']}
                valueFormatter={(value) => formatCurrency(value)}
                colors={['#3b82f6', '#10b981']}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* المنتجات */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>قائمة المنتجات</CardTitle>
              <CardDescription>
                {filteredProducts.length} منتج من أصل {reportData.products.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم المنتج</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>الكمية المباعة</TableHead>
                    <TableHead>قيمة المبيعات</TableHead>
                    <TableHead>الربح</TableHead>
                    <TableHead>هامش الربح</TableHead>
                    <TableHead>معدل الإرجاع</TableHead>
                    <TableHead>معدل دوران المخزون</TableHead>
                    <TableHead>المخزون الحالي</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.productId}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.categoryName}</TableCell>
                      <TableCell>{product.quantitySold}</TableCell>
                      <TableCell>{formatCurrency(product.salesValue)}</TableCell>
                      <TableCell>{formatCurrency(product.profit)}</TableCell>
                      <TableCell>{product.profitMargin.toFixed(2)}%</TableCell>
                      <TableCell>{product.returnRate.toFixed(2)}%</TableCell>
                      <TableCell>{product.stockTurnover.toFixed(2)}</TableCell>
                      <TableCell>{product.currentStock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* الفئات */}
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>أداء المنتجات حسب الفئة</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الفئة</TableHead>
                    <TableHead>عدد المنتجات</TableHead>
                    <TableHead>إجمالي المبيعات</TableHead>
                    <TableHead>إجمالي الربح</TableHead>
                    <TableHead>متوسط هامش الربح</TableHead>
                    <TableHead>إجمالي الوحدات المباعة</TableHead>
                    <TableHead>متوسط معدل الإرجاع</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => {
                    const categoryProducts = reportData.products.filter(p => p.categoryId === category.categoryId);
                    const totalSales = categoryProducts.reduce((sum, product) => sum + product.salesValue, 0);
                    const totalProfit = categoryProducts.reduce((sum, product) => sum + product.profit, 0);
                    const totalQuantitySold = categoryProducts.reduce((sum, product) => sum + product.quantitySold, 0);
                    const totalReturns = categoryProducts.reduce((sum, product) => sum + product.returnCount, 0);
                    const avgProfitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
                    const avgReturnRate = totalQuantitySold > 0 ? (totalReturns / totalQuantitySold) * 100 : 0;
                    
                    return (
                      <TableRow key={category.categoryId}>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>{categoryProducts.length}</TableCell>
                        <TableCell>{formatCurrency(totalSales)}</TableCell>
                        <TableCell>{formatCurrency(totalProfit)}</TableCell>
                        <TableCell>{avgProfitMargin.toFixed(2)}%</TableCell>
                        <TableCell>{totalQuantitySold}</TableCell>
                        <TableCell>{avgReturnRate.toFixed(2)}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}