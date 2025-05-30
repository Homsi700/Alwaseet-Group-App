'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  RefreshCw,
  Download,
  Search,
  Filter,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ExportData } from '@/components/export/export-data';
import { format, subDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DatePicker } from '@/components/ui/date-picker';
import { LineChart } from '@/components/charts/line-chart';
import { BarChart } from '@/components/charts/bar-chart';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

// إنشاء عميل React Query
const queryClient = new QueryClient();

// صفحة تقرير حركة المخزون
export default function InventoryMovementReportPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <InventoryMovementReportContent />
    </QueryClientProvider>
  );
}

// مكون محتوى صفحة تقرير حركة المخزون
function InventoryMovementReportContent() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [fromDate, setFromDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [toDate, setToDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState<string>('movements');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // تنسيق المبالغ المالية
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('ar-SY')} ل.س`;
  };
  
  // تنسيق التاريخ
  const formatDate = (date: Date) => {
    return format(date, 'dd MMMM yyyy', { locale: ar });
  };
  
  // استعلام بيانات تقرير حركة المخزون
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['inventoryMovementReport', { 
      categoryId: selectedCategory, 
      productId: selectedProduct,
      type: selectedType,
      fromDate: fromDate?.toISOString(),
      toDate: toDate?.toISOString()
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedProduct) params.append('productId', selectedProduct);
      if (selectedType) params.append('type', selectedType);
      if (fromDate) params.append('fromDate', fromDate.toISOString());
      if (toDate) params.append('toDate', toDate.toISOString());
      
      const response = await fetch(`/api/reports/inventory/movement?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('فشل في الحصول على تقرير حركة المخزون');
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
    movements: [
      { movementId: 1, productId: 1, productName: 'تفاح أحمر', productSku: 'P001', categoryId: 1, categoryName: 'فواكه', type: 'PURCHASE', quantity: 50, date: '2023-06-01T10:00:00Z', reference: 'PO-001', notes: 'شراء مخزون أولي', userId: 1, userName: 'أحمد محمد', createdAt: '2023-06-01T10:05:00Z' },
      { movementId: 2, productId: 2, productName: 'موز', productSku: 'P002', categoryId: 1, categoryName: 'فواكه', type: 'PURCHASE', quantity: 30, date: '2023-06-02T11:00:00Z', reference: 'PO-002', notes: 'شراء مخزون أولي', userId: 1, userName: 'أحمد محمد', createdAt: '2023-06-02T11:05:00Z' },
      { movementId: 3, productId: 1, productName: 'تفاح أحمر', productSku: 'P001', categoryId: 1, categoryName: 'فواكه', type: 'SALE', quantity: -10, date: '2023-06-03T14:00:00Z', reference: 'INV-001', notes: 'بيع للعميل', userId: 2, userName: 'سارة أحمد', createdAt: '2023-06-03T14:05:00Z' },
      { movementId: 4, productId: 3, productName: 'خبز عربي', productSku: 'P003', categoryId: 2, categoryName: 'مخبوزات', type: 'PURCHASE', quantity: 50, date: '2023-06-04T09:00:00Z', reference: 'PO-003', notes: 'شراء مخزون', userId: 1, userName: 'أحمد محمد', createdAt: '2023-06-04T09:05:00Z' },
      { movementId: 5, productId: 2, productName: 'موز', productSku: 'P002', categoryId: 1, categoryName: 'فواكه', type: 'SALE', quantity: -5, date: '2023-06-05T16:00:00Z', reference: 'INV-002', notes: 'بيع للعميل', userId: 2, userName: 'سارة أحمد', createdAt: '2023-06-05T16:05:00Z' },
      { movementId: 6, productId: 3, productName: 'خبز عربي', productSku: 'P003', categoryId: 2, categoryName: 'مخبوزات', type: 'SALE', quantity: -20, date: '2023-06-06T10:00:00Z', reference: 'INV-003', notes: 'بيع للعميل', userId: 2, userName: 'سارة أحمد', createdAt: '2023-06-06T10:05:00Z' },
      { movementId: 7, productId: 4, productName: 'حليب طازج', productSku: 'P004', categoryId: 3, categoryName: 'ألبان', type: 'PURCHASE', quantity: 40, date: '2023-06-07T08:00:00Z', reference: 'PO-004', notes: 'شراء مخزون', userId: 1, userName: 'أحمد محمد', createdAt: '2023-06-07T08:05:00Z' },
      { movementId: 8, productId: 1, productName: 'تفاح أحمر', productSku: 'P001', categoryId: 1, categoryName: 'فواكه', type: 'ADJUSTMENT', quantity: -5, date: '2023-06-08T15:00:00Z', reference: 'ADJ-001', notes: 'تعديل المخزون - تالف', userId: 1, userName: 'أحمد محمد', createdAt: '2023-06-08T15:05:00Z' },
      { movementId: 9, productId: 5, productName: 'جبنة بيضاء', productSku: 'P005', categoryId: 3, categoryName: 'ألبان', type: 'PURCHASE', quantity: 20, date: '2023-06-09T09:00:00Z', reference: 'PO-005', notes: 'شراء مخزون', userId: 1, userName: 'أحمد محمد', createdAt: '2023-06-09T09:05:00Z' },
      { movementId: 10, productId: 4, productName: 'حليب طازج', productSku: 'P004', categoryId: 3, categoryName: 'ألبان', type: 'SALE', quantity: -15, date: '2023-06-10T13:00:00Z', reference: 'INV-004', notes: 'بيع للعميل', userId: 2, userName: 'سارة أحمد', createdAt: '2023-06-10T13:05:00Z' },
    ],
    stats: {
      totalIn: 190,
      totalOut: 55,
      netChange: 135,
      totalMovements: 10,
    },
    movementsByDate: [
      { date: '2023-06-01', totalIn: 50, totalOut: 0 },
      { date: '2023-06-02', totalIn: 30, totalOut: 0 },
      { date: '2023-06-03', totalIn: 0, totalOut: 10 },
      { date: '2023-06-04', totalIn: 50, totalOut: 0 },
      { date: '2023-06-05', totalIn: 0, totalOut: 5 },
      { date: '2023-06-06', totalIn: 0, totalOut: 20 },
      { date: '2023-06-07', totalIn: 40, totalOut: 0 },
      { date: '2023-06-08', totalIn: 0, totalOut: 5 },
      { date: '2023-06-09', totalIn: 20, totalOut: 0 },
      { date: '2023-06-10', totalIn: 0, totalOut: 15 },
    ]
  };
  
  // استخدام البيانات الحقيقية إذا كانت متوفرة، وإلا استخدام البيانات الوهمية
  const reportData = data || mockData;
  
  // تصفية الحركات بناءً على البحث والفئة والمنتج والنوع المحدد
  const filteredMovements = reportData.movements.filter((movement) => {
    const matchesSearch = searchTerm === '' || 
      movement.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.productSku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === '' || movement.categoryId.toString() === selectedCategory;
    
    const matchesProduct = selectedProduct === '' || movement.productId.toString() === selectedProduct;
    
    const matchesType = selectedType === '' || movement.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesProduct && matchesType;
  });
  
  // تجميع الفئات من الحركات
  const categories = Array.from(new Set(reportData.movements.map(movement => movement.categoryId)))
    .map(categoryId => {
      const movement = reportData.movements.find(m => m.categoryId === categoryId);
      return {
        categoryId,
        name: movement?.categoryName || 'غير معروف'
      };
    });
  
  // تجميع المنتجات من الحركات
  const products = Array.from(new Set(reportData.movements.map(movement => movement.productId)))
    .map(productId => {
      const movement = reportData.movements.find(m => m.productId === productId);
      return {
        productId,
        name: movement?.productName || 'غير معروف'
      };
    });
  
  // تحويل بيانات الحركات حسب التاريخ إلى تنسيق مناسب للرسم البياني
  const movementChartData = reportData.movementsByDate.map(item => ({
    date: format(new Date(item.date), 'dd/MM', { locale: ar }),
    in: item.totalIn,
    out: item.totalOut,
  }));
  
  // تجميع بيانات الحركات حسب النوع للرسم البياني
  const typeChartData = [
    { name: 'شراء', value: reportData.movements.filter(m => m.type === 'PURCHASE').reduce((sum, m) => sum + Math.abs(m.quantity), 0) },
    { name: 'بيع', value: reportData.movements.filter(m => m.type === 'SALE').reduce((sum, m) => sum + Math.abs(m.quantity), 0) },
    { name: 'تعديل', value: reportData.movements.filter(m => m.type === 'ADJUSTMENT').reduce((sum, m) => sum + Math.abs(m.quantity), 0) },
    { name: 'إرجاع', value: reportData.movements.filter(m => m.type === 'RETURN').reduce((sum, m) => sum + Math.abs(m.quantity), 0) },
  ].filter(item => item.value > 0);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push('/inventory/reports')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">تقرير حركة المخزون</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} title="تحديث البيانات">
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <ExportData
            title="تقرير حركة المخزون"
            data={reportData.movements.map((movement) => ({
              'رقم الحركة': movement.movementId,
              'اسم المنتج': movement.productName,
              'الباركود': movement.productSku,
              'الفئة': movement.categoryName,
              'نوع الحركة': movement.type === 'PURCHASE' ? 'شراء' : 
                           movement.type === 'SALE' ? 'بيع' : 
                           movement.type === 'ADJUSTMENT' ? 'تعديل' : 'إرجاع',
              'الكمية': Math.abs(movement.quantity),
              'الاتجاه': movement.quantity > 0 ? 'وارد' : 'صادر',
              'التاريخ': format(new Date(movement.date), 'yyyy-MM-dd HH:mm'),
              'المرجع': movement.reference || '',
              'الملاحظات': movement.notes || '',
              'المستخدم': movement.userName,
            }))}
            columns={[
              { header: 'رقم الحركة', accessor: 'رقم الحركة' },
              { header: 'اسم المنتج', accessor: 'اسم المنتج' },
              { header: 'الباركود', accessor: 'الباركود' },
              { header: 'الفئة', accessor: 'الفئة' },
              { header: 'نوع الحركة', accessor: 'نوع الحركة' },
              { header: 'الكمية', accessor: 'الكمية' },
              { header: 'الاتجاه', accessor: 'الاتجاه' },
              { header: 'التاريخ', accessor: 'التاريخ' },
              { header: 'المرجع', accessor: 'المرجع' },
              { header: 'الملاحظات', accessor: 'الملاحظات' },
              { header: 'المستخدم', accessor: 'المستخدم' },
            ]}
            summary={{
              'إجمالي الوارد': reportData.stats.totalIn,
              'إجمالي الصادر': reportData.stats.totalOut,
              'صافي التغيير': reportData.stats.netChange,
              'إجمالي الحركات': reportData.stats.totalMovements,
            }}
            fileName={`inventory-movement-report-${format(new Date(), 'yyyy-MM-dd')}`}
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
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">بحث</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="ابحث باسم المنتج أو الباركود أو المرجع"
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
                <Label htmlFor="product">المنتج</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="جميع المنتجات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع المنتجات</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.productId} value={product.productId.toString()}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/4">
                <Label htmlFor="type">نوع الحركة</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger id="type">
                    <SelectValue placeholder="جميع الأنواع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الأنواع</SelectItem>
                    <SelectItem value="PURCHASE">شراء</SelectItem>
                    <SelectItem value="SALE">بيع</SelectItem>
                    <SelectItem value="ADJUSTMENT">تعديل</SelectItem>
                    <SelectItem value="RETURN">إرجاع</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full md:w-1/4">
                <Label>من تاريخ</Label>
                <DatePicker date={fromDate} setDate={setFromDate} />
              </div>
              <div className="w-full md:w-1/4">
                <Label>إلى تاريخ</Label>
                <DatePicker date={toDate} setDate={setToDate} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ملخص حركة المخزون */}
      <section aria-labelledby="summary-title">
        <h2 id="summary-title" className="text-2xl font-semibold mb-4 text-foreground">ملخص حركة المخزون</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الوارد</CardTitle>
              <ArrowUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.stats.totalIn}</div>
              <p className="text-xs text-muted-foreground mt-1">
                وحدة واردة للمخزون
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الصادر</CardTitle>
              <ArrowDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.stats.totalOut}</div>
              <p className="text-xs text-muted-foreground mt-1">
                وحدة صادرة من المخزون
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">صافي التغيير</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.stats.netChange}</div>
              <p className="text-xs text-muted-foreground mt-1">
                صافي التغيير في المخزون
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الحركات</CardTitle>
              <Clock className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.stats.totalMovements}</div>
              <p className="text-xs text-muted-foreground mt-1">
                عدد حركات المخزون
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* تبويبات التقرير */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="movements">الحركات</TabsTrigger>
          <TabsTrigger value="charts">الرسوم البيانية</TabsTrigger>
        </TabsList>
        
        {/* الحركات */}
        <TabsContent value="movements">
          <Card>
            <CardHeader>
              <CardTitle>قائمة حركات المخزون</CardTitle>
              <CardDescription>
                {filteredMovements.length} حركة من أصل {reportData.movements.length}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الحركة</TableHead>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>نوع الحركة</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المرجع</TableHead>
                    <TableHead>الملاحظات</TableHead>
                    <TableHead>المستخدم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.map((movement) => (
                    <TableRow key={movement.movementId}>
                      <TableCell>{movement.movementId}</TableCell>
                      <TableCell className="font-medium">
                        <div>
                          <div>{movement.productName}</div>
                          <div className="text-xs text-muted-foreground">{movement.productSku}</div>
                        </div>
                      </TableCell>
                      <TableCell>{movement.categoryName}</TableCell>
                      <TableCell>
                        {movement.type === 'PURCHASE' && (
                          <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100">
                            شراء
                          </Badge>
                        )}
                        {movement.type === 'SALE' && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                            بيع
                          </Badge>
                        )}
                        {movement.type === 'ADJUSTMENT' && (
                          <Badge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                            تعديل
                          </Badge>
                        )}
                        {movement.type === 'RETURN' && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                            إرجاع
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {movement.quantity > 0 ? (
                            <ArrowUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-500" />
                          )}
                          <span>{Math.abs(movement.quantity)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{format(new Date(movement.date), 'yyyy-MM-dd HH:mm')}</TableCell>
                      <TableCell>{movement.reference || '-'}</TableCell>
                      <TableCell>{movement.notes || '-'}</TableCell>
                      <TableCell>{movement.userName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* الرسوم البيانية */}
        <TabsContent value="charts">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>حركة المخزون حسب التاريخ</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <LineChart 
                  data={movementChartData} 
                  index="date"
                  categories={['in', 'out']}
                  colors={['#10b981', '#ef4444']}
                  valueFormatter={(value) => value.toString()}
                  customTooltip={(props) => {
                    const { payload, label } = props;
                    if (!payload || !payload.length) return null;
                    
                    return (
                      <div className="bg-white p-2 border rounded shadow-md">
                        <p className="font-bold">{label}</p>
                        <p className="text-green-600">وارد: {payload[0].value}</p>
                        <p className="text-red-600">صادر: {payload[1].value}</p>
                      </div>
                    );
                  }}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>توزيع الحركات حسب النوع</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart 
                  data={typeChartData} 
                  index="name"
                  categories={['value']}
                  valueFormatter={(value) => value.toString()}
                  colors={['#3b82f6']}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}