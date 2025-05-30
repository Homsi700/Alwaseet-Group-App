'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Download,
  Search,
  Filter,
  ArrowLeft
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

// صفحة تقرير حالة المخزون
export default function InventoryStatusReportPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <InventoryStatusReportContent />
    </QueryClientProvider>
  );
}

// مكون محتوى صفحة تقرير حالة المخزون
function InventoryStatusReportContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // تنسيق المبالغ المالية
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('ar-SY')} ل.س`;
  };
  
  // استعلام بيانات تقرير حالة المخزون
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['inventoryStatusReport', { categoryId: selectedCategory, search: searchTerm }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/reports/inventory/status?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('فشل في الحصول على تقرير حالة المخزون');
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
      { productId: 1, id: 'prod_1', name: 'تفاح أحمر', barcode: 'P001', categoryName: 'فواكه', quantity: 150, purchasePrice: 500, salePrice: 650, status: 'ACTIVE' },
      { productId: 2, id: 'prod_2', name: 'موز', barcode: 'P002', categoryName: 'فواكه', quantity: 80, purchasePrice: 400, salePrice: 550, status: 'ACTIVE' },
      { productId: 3, id: 'prod_3', name: 'خبز عربي', barcode: 'P003', categoryName: 'مخبوزات', quantity: 30, purchasePrice: 200, salePrice: 250, status: 'LOW_STOCK' },
      { productId: 4, id: 'prod_4', name: 'حليب طازج', barcode: 'P004', categoryName: 'ألبان', quantity: 45, purchasePrice: 350, salePrice: 450, status: 'ACTIVE' },
      { productId: 5, id: 'prod_5', name: 'جبنة بيضاء', barcode: 'P005', categoryName: 'ألبان', quantity: 0, purchasePrice: 800, salePrice: 1000, status: 'OUT_OF_STOCK' },
    ],
    categoryStats: [
      { categoryId: 1, name: 'فواكه', productCount: 2, totalItems: 230, totalValue: 95000 },
      { categoryId: 2, name: 'مخبوزات', productCount: 1, totalItems: 30, totalValue: 6000 },
      { categoryId: 3, name: 'ألبان', productCount: 2, totalItems: 45, totalValue: 15750 },
    ],
    summary: {
      totalProducts: 5,
      totalItems: 305,
      totalValue: 116750,
      lowStockProducts: 1,
      outOfStockProducts: 1,
    }
  };
  
  // استخدام البيانات الحقيقية إذا كانت متوفرة، وإلا استخدام البيانات الوهمية
  const reportData = data || mockData;
  
  // تحويل بيانات الفئات إلى تنسيق مناسب للرسم البياني
  const categoryChartData = reportData.categoryStats.map((category) => ({
    name: category.name,
    value: category.totalValue,
  }));
  
  // تحويل بيانات حالة المنتجات إلى تنسيق مناسب للرسم البياني
  const statusChartData = [
    { name: 'متوفر', value: reportData.summary.totalProducts - reportData.summary.lowStockProducts - reportData.summary.outOfStockProducts },
    { name: 'منخفض المخزون', value: reportData.summary.lowStockProducts },
    { name: 'نفذ من المخزون', value: reportData.summary.outOfStockProducts },
  ];
  
  // تصفية المنتجات بناءً على البحث والفئة المحددة
  const filteredProducts = reportData.products.filter((product) => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || product.categoryId.toString() === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push('/inventory/reports')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">تقرير حالة المخزون</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} title="تحديث البيانات">
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <ExportData
            title="تقرير حالة المخزون"
            data={reportData.products.map((product) => ({
              'اسم المنتج': product.name,
              'الباركود': product.barcode,
              'الفئة': product.categoryName,
              'الكمية': product.quantity,
              'سعر الشراء': product.purchasePrice,
              'سعر البيع': product.salePrice,
              'القيمة الإجمالية': product.quantity * product.purchasePrice,
              'الحالة': product.status === 'ACTIVE' ? 'متوفر' : product.status === 'LOW_STOCK' ? 'منخفض المخزون' : 'نفذ من المخزون',
            }))}
            columns={[
              { header: 'اسم المنتج', accessor: 'اسم المنتج' },
              { header: 'الباركود', accessor: 'الباركود' },
              { header: 'الفئة', accessor: 'الفئة' },
              { header: 'الكمية', accessor: 'الكمية' },
              { header: 'سعر الشراء', accessor: 'سعر الشراء', format: (value) => formatCurrency(value) },
              { header: 'سعر البيع', accessor: 'سعر البيع', format: (value) => formatCurrency(value) },
              { header: 'القيمة الإجمالية', accessor: 'القيمة الإجمالية', format: (value) => formatCurrency(value) },
              { header: 'الحالة', accessor: 'الحالة' },
            ]}
            summary={{
              'إجمالي المنتجات': reportData.summary.totalProducts,
              'إجمالي الكميات': reportData.summary.totalItems,
              'إجمالي القيمة': formatCurrency(reportData.summary.totalValue),
              'منتجات منخفضة المخزون': reportData.summary.lowStockProducts,
              'منتجات نفذت من المخزون': reportData.summary.outOfStockProducts,
            }}
            fileName={`inventory-status-report-${format(new Date(), 'yyyy-MM-dd')}`}
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
            <div className="w-full md:w-1/3">
              <Label htmlFor="category">الفئة</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الفئات</SelectItem>
                  {reportData.categoryStats.map((category) => (
                    <SelectItem key={category.categoryId} value={category.categoryId.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ملخص حالة المخزون */}
      <section aria-labelledby="summary-title">
        <h2 id="summary-title" className="text-2xl font-semibold mb-4 text-foreground">ملخص حالة المخزون</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المنتجات</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.summary.totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                منتج في المخزون
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الكميات</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.summary.totalItems}</div>
              <p className="text-xs text-muted-foreground mt-1">
                وحدة في المخزون
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي القيمة</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(reportData.summary.totalValue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                قيمة المخزون الحالي
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">منتجات تحتاج انتباه</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.summary.lowStockProducts + reportData.summary.outOfStockProducts}</div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span className="text-amber-500">{reportData.summary.lowStockProducts} منخفض المخزون</span>
                <span className="text-red-500">{reportData.summary.outOfStockProducts} نفذ من المخزون</span>
              </div>
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
                <CardTitle>توزيع قيمة المخزون حسب الفئات</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <PieChart 
                  data={categoryChartData} 
                  index="name"
                  valueKey="value"
                  formatValue={(value) => formatCurrency(value)}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>حالة المنتجات</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <PieChart 
                  data={statusChartData} 
                  index="name"
                  valueKey="value"
                  colors={['#10b981', '#f59e0b', '#ef4444']}
                />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>أعلى الفئات من حيث القيمة</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <BarChart 
                data={categoryChartData.sort((a, b) => b.value - a.value).slice(0, 5)} 
                index="name"
                categories={['value']}
                valueFormatter={(value) => formatCurrency(value)}
                colors={['#3b82f6']}
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
                    <TableHead>القيمة الإجمالية</TableHead>
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
                      <TableCell>{formatCurrency(product.purchasePrice)}</TableCell>
                      <TableCell>{formatCurrency(product.salePrice)}</TableCell>
                      <TableCell>{formatCurrency(product.quantity * product.purchasePrice)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {product.status === 'ACTIVE' && (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-green-500">متوفر</span>
                            </>
                          )}
                          {product.status === 'LOW_STOCK' && (
                            <>
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                              <span className="text-amber-500">منخفض المخزون</span>
                            </>
                          )}
                          {product.status === 'OUT_OF_STOCK' && (
                            <>
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                              <span className="text-red-500">نفذ من المخزون</span>
                            </>
                          )}
                        </div>
                      </TableCell>
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
              <CardTitle>إحصائيات الفئات</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الفئة</TableHead>
                    <TableHead>عدد المنتجات</TableHead>
                    <TableHead>إجمالي الكميات</TableHead>
                    <TableHead>إجمالي القيمة</TableHead>
                    <TableHead>متوسط القيمة للمنتج</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.categoryStats.map((category) => (
                    <TableRow key={category.categoryId}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.productCount}</TableCell>
                      <TableCell>{category.totalItems}</TableCell>
                      <TableCell>{formatCurrency(category.totalValue)}</TableCell>
                      <TableCell>
                        {formatCurrency(category.productCount > 0 ? category.totalValue / category.productCount : 0)}
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