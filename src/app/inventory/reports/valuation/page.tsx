'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  RefreshCw,
  Download,
  Search,
  Filter,
  ArrowLeft,
  TrendingUp,
  Percent,
  Package
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ExportData } from '@/components/export/export-data';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PieChart } from '@/components/charts/pie-chart';
import { BarChart } from '@/components/charts/bar-chart';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

// إنشاء عميل React Query
const queryClient = new QueryClient();

// صفحة تقرير تقييم المخزون
export default function InventoryValuationReportPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <InventoryValuationReportContent />
    </QueryClientProvider>
  );
}

// مكون محتوى صفحة تقرير تقييم المخزون
function InventoryValuationReportContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [valuationMethod, setValuationMethod] = useState<string>('FIFO');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // تنسيق المبالغ المالية
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('ar-SY')} ل.س`;
  };
  
  // استعلام بيانات تقرير تقييم المخزون
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['inventoryValuationReport', { categoryId: selectedCategory, search: searchTerm, valuationMethod }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      params.append('valuationMethod', valuationMethod);
      
      const response = await fetch(`/api/reports/inventory/valuation?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('فشل في الحصول على تقرير تقييم المخزون');
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
      { productId: 1, id: 'prod_1', name: 'تفاح أحمر', barcode: 'P001', categoryId: 1, categoryName: 'فواكه', quantity: 150, purchasePrice: 500, salePrice: 650, totalCost: 75000, potentialRevenue: 97500, potentialProfit: 22500, profitMargin: 30 },
      { productId: 2, id: 'prod_2', name: 'موز', barcode: 'P002', categoryId: 1, categoryName: 'فواكه', quantity: 80, purchasePrice: 400, salePrice: 550, totalCost: 32000, potentialRevenue: 44000, potentialProfit: 12000, profitMargin: 37.5 },
      { productId: 3, id: 'prod_3', name: 'خبز عربي', barcode: 'P003', categoryId: 2, categoryName: 'مخبوزات', quantity: 30, purchasePrice: 200, salePrice: 250, totalCost: 6000, potentialRevenue: 7500, potentialProfit: 1500, profitMargin: 25 },
      { productId: 4, id: 'prod_4', name: 'حليب طازج', barcode: 'P004', categoryId: 3, categoryName: 'ألبان', quantity: 45, purchasePrice: 350, salePrice: 450, totalCost: 15750, potentialRevenue: 20250, potentialProfit: 4500, profitMargin: 28.6 },
      { productId: 5, id: 'prod_5', name: 'جبنة بيضاء', barcode: 'P005', categoryId: 3, categoryName: 'ألبان', quantity: 20, purchasePrice: 800, salePrice: 1000, totalCost: 16000, potentialRevenue: 20000, potentialProfit: 4000, profitMargin: 25 },
    ],
    summary: {
      totalProducts: 5,
      totalItems: 325,
      totalCost: 144750,
      potentialRevenue: 189250,
      potentialProfit: 44500,
      averageProfitMargin: 30.7,
    },
    valuationMethod: 'FIFO'
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
  
  // تحويل بيانات تقييم المخزون حسب الفئة إلى تنسيق مناسب للرسم البياني
  const categoryValuationData = categories.map(category => {
    const categoryProducts = reportData.products.filter(p => p.categoryId === category.categoryId);
    const totalCost = categoryProducts.reduce((sum, product) => sum + product.totalCost, 0);
    const potentialRevenue = categoryProducts.reduce((sum, product) => sum + product.potentialRevenue, 0);
    const potentialProfit = categoryProducts.reduce((sum, product) => sum + product.potentialProfit, 0);
    
    return {
      name: category.name,
      cost: totalCost,
      revenue: potentialRevenue,
      profit: potentialProfit,
    };
  });
  
  // تحويل بيانات هامش الربح للمنتجات إلى تنسيق مناسب للرسم البياني
  const profitMarginData = reportData.products
    .sort((a, b) => b.profitMargin - a.profitMargin)
    .slice(0, 5)
    .map(product => ({
      name: product.name,
      margin: product.profitMargin,
    }));

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push('/inventory/reports')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">تقرير تقييم المخزون</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} title="تحديث البيانات">
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <ExportData
            title="تقرير تقييم المخزون"
            data={reportData.products.map((product) => ({
              'اسم المنتج': product.name,
              'الباركود': product.barcode,
              'الفئة': product.categoryName,
              'الكمية': product.quantity,
              'سعر الشراء': product.purchasePrice,
              'سعر البيع': product.salePrice,
              'إجمالي التكلفة': product.totalCost,
              'الإيرادات المحتملة': product.potentialRevenue,
              'الربح المحتمل': product.potentialProfit,
              'هامش الربح (%)': product.profitMargin,
            }))}
            columns={[
              { header: 'اسم المنتج', accessor: 'اسم المنتج' },
              { header: 'الباركود', accessor: 'الباركود' },
              { header: 'الفئة', accessor: 'الفئة' },
              { header: 'الكمية', accessor: 'الكمية' },
              { header: 'سعر الشراء', accessor: 'سعر الشراء', format: (value) => formatCurrency(value) },
              { header: 'سعر البيع', accessor: 'سعر البيع', format: (value) => formatCurrency(value) },
              { header: 'إجمالي التكلفة', accessor: 'إجمالي التكلفة', format: (value) => formatCurrency(value) },
              { header: 'الإيرادات المحتملة', accessor: 'الإيرادات المحتملة', format: (value) => formatCurrency(value) },
              { header: 'الربح المحتمل', accessor: 'الربح المحتمل', format: (value) => formatCurrency(value) },
              { header: 'هامش الربح (%)', accessor: 'هامش الربح (%)', format: (value) => `${value.toFixed(2)}%` },
            ]}
            summary={{
              'إجمالي المنتجات': reportData.summary.totalProducts,
              'إجمالي الكميات': reportData.summary.totalItems,
              'إجمالي التكلفة': formatCurrency(reportData.summary.totalCost),
              'الإيرادات المحتملة': formatCurrency(reportData.summary.potentialRevenue),
              'الربح المحتمل': formatCurrency(reportData.summary.potentialProfit),
              'متوسط هامش الربح': `${reportData.summary.averageProfitMargin.toFixed(2)}%`,
              'طريقة التقييم': reportData.valuationMethod === 'FIFO' ? 'الوارد أولاً صادر أولاً' : 
                              reportData.valuationMethod === 'LIFO' ? 'الوارد أخيراً صادر أولاً' : 
                              reportData.valuationMethod === 'AVERAGE' ? 'المتوسط المرجح' : 'التكلفة المعيارية',
            }}
            fileName={`inventory-valuation-report-${format(new Date(), 'yyyy-MM-dd')}`}
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
            <div className="w-full md:w-1/4">
              <Label htmlFor="valuationMethod">طريقة التقييم</Label>
              <Select value={valuationMethod} onValueChange={setValuationMethod}>
                <SelectTrigger id="valuationMethod">
                  <SelectValue placeholder="اختر طريقة التقييم" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FIFO">الوارد أولاً صادر أولاً (FIFO)</SelectItem>
                  <SelectItem value="LIFO">الوارد أخيراً صادر أولاً (LIFO)</SelectItem>
                  <SelectItem value="AVERAGE">المتوسط المرجح (AVERAGE)</SelectItem>
                  <SelectItem value="STANDARD">التكلفة المعيارية (STANDARD)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ملخص تقييم المخزون */}
      <section aria-labelledby="summary-title">
        <h2 id="summary-title" className="text-2xl font-semibold mb-4 text-foreground">ملخص تقييم المخزون</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي التكلفة</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData.summary.totalCost)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                تكلفة المخزون الحالي
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">الإيرادات المحتملة</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData.summary.potentialRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                الإيرادات المحتملة من بيع المخزون
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">الربح المحتمل</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData.summary.potentialProfit)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                الربح المحتمل من بيع المخزون
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">متوسط هامش الربح</CardTitle>
              <Percent className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.summary.averageProfitMargin.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                متوسط هامش الربح للمخزون
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
                <CardTitle>توزيع تكلفة المخزون حسب الفئة</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <PieChart 
                  data={categoryValuationData.map(item => ({ name: item.name, value: item.cost }))} 
                  index="name"
                  valueKey="value"
                  formatValue={(value) => formatCurrency(value)}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>توزيع الربح المحتمل حسب الفئة</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <PieChart 
                  data={categoryValuationData.map(item => ({ name: item.name, value: item.profit }))} 
                  index="name"
                  valueKey="value"
                  formatValue={(value) => formatCurrency(value)}
                  colors={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']}
                />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>أعلى المنتجات من حيث هامش الربح</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <BarChart 
                data={profitMarginData} 
                index="name"
                categories={['margin']}
                valueFormatter={(value) => `${value.toFixed(2)}%`}
                colors={['#8b5cf6']}
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
                    <TableHead>الباركود</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>سعر الشراء</TableHead>
                    <TableHead>سعر البيع</TableHead>
                    <TableHead>إجمالي التكلفة</TableHead>
                    <TableHead>الإيرادات المحتملة</TableHead>
                    <TableHead>الربح المحتمل</TableHead>
                    <TableHead>هامش الربح</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.barcode}</TableCell>
                      <TableCell>{product.categoryName}</TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell>{formatCurrency(product.purchasePrice)}</TableCell>
                      <TableCell>{formatCurrency(product.salePrice)}</TableCell>
                      <TableCell>{formatCurrency(product.totalCost)}</TableCell>
                      <TableCell>{formatCurrency(product.potentialRevenue)}</TableCell>
                      <TableCell>{formatCurrency(product.potentialProfit)}</TableCell>
                      <TableCell>{product.profitMargin.toFixed(2)}%</TableCell>
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
              <CardTitle>تقييم المخزون حسب الفئة</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الفئة</TableHead>
                    <TableHead>إجمالي التكلفة</TableHead>
                    <TableHead>الإيرادات المحتملة</TableHead>
                    <TableHead>الربح المحتمل</TableHead>
                    <TableHead>هامش الربح</TableHead>
                    <TableHead>نسبة من إجمالي التكلفة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categoryValuationData.map((category) => (
                    <TableRow key={category.name}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{formatCurrency(category.cost)}</TableCell>
                      <TableCell>{formatCurrency(category.revenue)}</TableCell>
                      <TableCell>{formatCurrency(category.profit)}</TableCell>
                      <TableCell>
                        {category.cost > 0 ? ((category.profit / category.cost) * 100).toFixed(2) : 0}%
                      </TableCell>
                      <TableCell>
                        {reportData.summary.totalCost > 0 ? ((category.cost / reportData.summary.totalCost) * 100).toFixed(2) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}