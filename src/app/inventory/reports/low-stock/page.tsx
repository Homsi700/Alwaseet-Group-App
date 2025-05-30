'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  RefreshCw,
  Download,
  Search,
  Filter,
  ArrowLeft,
  ShoppingBag,
  XCircle,
  CheckCircle
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
import { Badge } from '@/components/ui/badge';

// إنشاء عميل React Query
const queryClient = new QueryClient();

// صفحة تقرير المنتجات منخفضة المخزون
export default function LowStockReportPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <LowStockReportContent />
    </QueryClientProvider>
  );
}

// مكون محتوى صفحة تقرير المنتجات منخفضة المخزون
function LowStockReportContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // تنسيق المبالغ المالية
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('ar-SY')} ل.س`;
  };
  
  // استعلام بيانات تقرير المنتجات منخفضة المخزون
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['lowStockReport', { categoryId: selectedCategory, status: selectedStatus }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);
      
      const response = await fetch(`/api/reports/inventory/low-stock?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('فشل في الحصول على تقرير المنتجات منخفضة المخزون');
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
      { productId: 1, id: 'prod_1', name: 'خبز عربي', barcode: 'P003', categoryId: 2, categoryName: 'مخبوزات', quantity: 5, minimumQuantity: 10, recommendedPurchase: 20, purchasePrice: 200, salePrice: 250, status: 'LOW_STOCK' },
      { productId: 2, id: 'prod_2', name: 'جبنة بيضاء', barcode: 'P005', categoryId: 3, categoryName: 'ألبان', quantity: 0, minimumQuantity: 5, recommendedPurchase: 15, purchasePrice: 800, salePrice: 1000, status: 'OUT_OF_STOCK' },
      { productId: 3, id: 'prod_3', name: 'زيت زيتون', barcode: 'P008', categoryId: 4, categoryName: 'زيوت', quantity: 3, minimumQuantity: 8, recommendedPurchase: 12, purchasePrice: 1500, salePrice: 1800, status: 'LOW_STOCK' },
      { productId: 4, id: 'prod_4', name: 'سكر', barcode: 'P010', categoryId: 5, categoryName: 'مواد غذائية', quantity: 0, minimumQuantity: 20, recommendedPurchase: 50, purchasePrice: 300, salePrice: 350, status: 'OUT_OF_STOCK' },
      { productId: 5, id: 'prod_5', name: 'أرز بسمتي', barcode: 'P012', categoryId: 5, categoryName: 'مواد غذائية', quantity: 8, minimumQuantity: 15, recommendedPurchase: 30, purchasePrice: 700, salePrice: 850, status: 'LOW_STOCK' },
    ],
    summary: {
      totalLowStockProducts: 3,
      totalOutOfStockProducts: 2,
      totalRecommendedPurchase: 127,
      estimatedPurchaseCost: 62900,
    }
  };
  
  // استخدام البيانات الحقيقية إذا كانت متوفرة، وإلا استخدام البيانات الوهمية
  const reportData = data || mockData;
  
  // تصفية المنتجات بناءً على البحث والفئة والحالة المحددة
  const filteredProducts = reportData.products.filter((product) => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || product.categoryId.toString() === selectedCategory;
    
    const matchesStatus = selectedStatus === '' || product.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
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
  
  // تحويل بيانات حالة المنتجات إلى تنسيق مناسب للرسم البياني
  const statusChartData = [
    { name: 'منخفض المخزون', value: reportData.summary.totalLowStockProducts },
    { name: 'نفذ من المخزون', value: reportData.summary.totalOutOfStockProducts },
  ];
  
  // تجميع بيانات الفئات للرسم البياني
  const categoryChartData = categories.map(category => {
    const categoryProducts = reportData.products.filter(p => p.categoryId === category.categoryId);
    const totalCost = categoryProducts.reduce((sum, product) => sum + (product.recommendedPurchase * product.purchasePrice), 0);
    
    return {
      name: category.name,
      value: totalCost,
    };
  });

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push('/inventory/reports')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">تقرير المنتجات منخفضة المخزون</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} title="تحديث البيانات">
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <ExportData
            title="تقرير المنتجات منخفضة المخزون"
            data={reportData.products.map((product) => ({
              'اسم المنتج': product.name,
              'الباركود': product.barcode,
              'الفئة': product.categoryName,
              'الكمية الحالية': product.quantity,
              'الحد الأدنى': product.minimumQuantity,
              'الكمية الموصى بشرائها': product.recommendedPurchase,
              'سعر الشراء': product.purchasePrice,
              'التكلفة المقدرة': product.recommendedPurchase * product.purchasePrice,
              'الحالة': product.status === 'LOW_STOCK' ? 'منخفض المخزون' : 'نفذ من المخزون',
            }))}
            columns={[
              { header: 'اسم المنتج', accessor: 'اسم المنتج' },
              { header: 'الباركود', accessor: 'الباركود' },
              { header: 'الفئة', accessor: 'الفئة' },
              { header: 'الكمية الحالية', accessor: 'الكمية الحالية' },
              { header: 'الحد الأدنى', accessor: 'الحد الأدنى' },
              { header: 'الكمية الموصى بشرائها', accessor: 'الكمية الموصى بشرائها' },
              { header: 'سعر الشراء', accessor: 'سعر الشراء', format: (value) => formatCurrency(value) },
              { header: 'التكلفة المقدرة', accessor: 'التكلفة المقدرة', format: (value) => formatCurrency(value) },
              { header: 'الحالة', accessor: 'الحالة' },
            ]}
            summary={{
              'منتجات منخفضة المخزون': reportData.summary.totalLowStockProducts,
              'منتجات نفذت من المخزون': reportData.summary.totalOutOfStockProducts,
              'إجمالي الكميات الموصى بشرائها': reportData.summary.totalRecommendedPurchase,
              'التكلفة المقدرة للشراء': formatCurrency(reportData.summary.estimatedPurchaseCost),
            }}
            fileName={`low-stock-report-${format(new Date(), 'yyyy-MM-dd')}`}
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
              <Label htmlFor="status">الحالة</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الحالات</SelectItem>
                  <SelectItem value="LOW_STOCK">منخفض المخزون</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">نفذ من المخزون</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ملخص المنتجات منخفضة المخزون */}
      <section aria-labelledby="summary-title">
        <h2 id="summary-title" className="text-2xl font-semibold mb-4 text-foreground">ملخص المنتجات منخفضة المخزون</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">منخفض المخزون</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.summary.totalLowStockProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                منتج بحاجة إلى إعادة الطلب
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">نفذ من المخزون</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.summary.totalOutOfStockProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                منتج غير متوفر حالياً
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">الكميات الموصى بشرائها</CardTitle>
              <ShoppingBag className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.summary.totalRecommendedPurchase}</div>
              <p className="text-xs text-muted-foreground mt-1">
                وحدة مطلوبة للشراء
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">التكلفة المقدرة</CardTitle>
              <ShoppingBag className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData.summary.estimatedPurchaseCost)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                تكلفة إعادة تعبئة المخزون
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* الرسوم البيانية */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>توزيع المنتجات حسب الحالة</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <PieChart 
              data={statusChartData} 
              index="name"
              valueKey="value"
              colors={['#f59e0b', '#ef4444']}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>تكلفة الشراء المقدرة حسب الفئة</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <BarChart 
              data={categoryChartData.sort((a, b) => b.value - a.value)} 
              index="name"
              categories={['value']}
              valueFormatter={(value) => formatCurrency(value)}
              colors={['#3b82f6']}
            />
          </CardContent>
        </Card>
      </div>

      {/* قائمة المنتجات */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المنتجات منخفضة المخزون</CardTitle>
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
                <TableHead>الكمية الحالية</TableHead>
                <TableHead>الحد الأدنى</TableHead>
                <TableHead>الكمية الموصى بشرائها</TableHead>
                <TableHead>سعر الشراء</TableHead>
                <TableHead>التكلفة المقدرة</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.barcode}</TableCell>
                  <TableCell>{product.categoryName}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{product.minimumQuantity}</TableCell>
                  <TableCell>{product.recommendedPurchase}</TableCell>
                  <TableCell>{formatCurrency(product.purchasePrice)}</TableCell>
                  <TableCell>{formatCurrency(product.recommendedPurchase * product.purchasePrice)}</TableCell>
                  <TableCell>
                    {product.status === 'LOW_STOCK' ? (
                      <Badge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                        منخفض المخزون
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-700 hover:bg-red-100">
                        نفذ من المخزون
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}