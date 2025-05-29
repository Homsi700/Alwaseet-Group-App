'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconCard } from '@/components/ui/IconCard';
import { dashboardGridItems, dashboardQuickAccessItems } from '@/components/layout/nav-items';
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  RefreshCw,
  Download
} from 'lucide-react';
import { ExportData } from '@/components/export/export-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart } from '@/components/charts/bar-chart';
import { LineChart } from '@/components/charts/line-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSalesReport, useInventoryReport, useFinancialReport } from '@/hooks/use-reports';

// إنشاء عميل React Query
const queryClient = new QueryClient();

interface Kpi {
  title: string;
  value: string;
  icon: React.ElementType;
  change?: string;
  changeType?: 'positive' | 'negative';
  description?: string;
}

const staticKpis: Kpi[] = [
  { title: "إجمالي المبيعات", value: "125,670 ل.س", icon: DollarSign, change: "+5.2% هذا الشهر", changeType: 'positive', description: "إجمالي المبيعات من جميع الفروع" },
  { title: "عدد الفواتير", value: "1,280", icon: ShoppingCart, change: "+8.1% هذا الشهر", changeType: 'positive', description: "عدد عمليات البيع" },
  { title: "العملاء النشطين", value: "350", icon: Users, change: "-1.5% هذا الشهر", changeType: 'negative', description: "العملاء ذوو النشاط الحديث" },
  { title: "المنتجات المتوفرة", value: "2,400", icon: Package, change: "+200 صنف", changeType: 'positive', description: "إجمالي المنتجات المتوفرة" },
];

function DashboardContent() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // الحصول على التاريخ الحالي
  const today = new Date();
  
  // تحديد نطاق التاريخ بناءً على الفترة المحددة
  let startDate: Date;
  if (period === 'today') {
    startDate = new Date(today);
    startDate.setHours(0, 0, 0, 0);
  } else if (period === 'week') {
    startDate = new Date(today);
    startDate.setDate(today.getDate() - 7);
  } else {
    startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 1);
  }
  
  // استخدام hooks للتقارير
  const salesReport = useSalesReport({
    startDate,
    endDate: today,
    period: 'daily',
  });
  
  const inventoryReport = useInventoryReport({});
  
  const financialReport = useFinancialReport({
    startDate,
    endDate: today,
    period: 'monthly',
  });
  
  // تنسيق المبالغ المالية
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('ar-SY')} ل.س`;
  };
  
  // تنسيق التاريخ
  const formatDate = (date: Date) => {
    return format(date, 'dd MMMM yyyy', { locale: ar });
  };
  
  // تحديث البيانات
  const handleRefresh = () => {
    salesReport.refetch();
    inventoryReport.refetch();
    financialReport.refetch();
    setLastRefresh(new Date());
  };
  
  // التحديث التلقائي
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (autoRefresh) {
      interval = setInterval(() => {
        handleRefresh();
      }, 60000); // تحديث كل دقيقة
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);
  
  // بيانات وهمية للعرض في حالة عدم وجود بيانات حقيقية
  const mockSalesData = {
    summary: {
      totalSales: 125670,
      totalOrders: 1280,
      totalDiscount: 2000,
      totalTax: 3000,
      netSales: 123670,
    },
    salesByPeriod: [
      { day: '2023-06-01', sales: 4500, orders: 20, profit: 1800 },
      { day: '2023-06-02', sales: 5200, orders: 25, profit: 2100 },
      { day: '2023-06-03', sales: 4800, orders: 22, profit: 1900 },
      { day: '2023-06-04', sales: 6000, orders: 30, profit: 2400 },
      { day: '2023-06-05', sales: 5500, orders: 28, profit: 2200 },
      { day: '2023-06-06', sales: 4900, orders: 23, profit: 2000 },
      { day: '2023-06-07', sales: 5800, orders: 29, profit: 2300 },
    ],
    topProducts: [
      { productId: '1', productName: 'هاتف ذكي', sku: 'P001', quantity: 15, sales: 15000 },
      { productId: '2', productName: 'لابتوب', sku: 'P002', quantity: 8, sales: 24000 },
      { productId: '3', productName: 'سماعات لاسلكية', sku: 'P003', quantity: 25, sales: 5000 },
      { productId: '4', productName: 'شاشة عرض', sku: 'P004', quantity: 10, sales: 12000 },
      { productId: '5', productName: 'طابعة', sku: 'P005', quantity: 5, sales: 4000 },
    ],
  };
  
  const mockInventoryData = {
    summary: {
      totalItems: 2400,
      totalQuantity: 15000,
      totalValue: 450000,
      lowStock: 15,
      outOfStock: 5,
    },
    categories: [
      { categoryId: '1', name: 'إلكترونيات', count: 500, quantity: 3000, value: 150000 },
      { categoryId: '2', name: 'ملابس', count: 800, quantity: 5000, value: 120000 },
      { categoryId: '3', name: 'أثاث', count: 300, quantity: 1500, value: 90000 },
      { categoryId: '4', name: 'مستلزمات منزلية', count: 600, quantity: 4000, value: 60000 },
      { categoryId: '5', name: 'أدوات مكتبية', count: 200, quantity: 1000, value: 20000 },
    ],
  };
  
  const mockFinancialData = {
    summary: {
      revenue: 250000,
      expenses: 150000,
      profit: 100000,
      taxAmount: 25000,
    },
    monthly: [
      { month: 'يناير', revenue: 45000, expenses: 30000, profit: 15000 },
      { month: 'فبراير', revenue: 40000, expenses: 28000, profit: 12000 },
      { month: 'مارس', revenue: 55000, expenses: 32000, profit: 23000 },
      { month: 'أبريل', revenue: 48000, expenses: 30000, profit: 18000 },
      { month: 'مايو', revenue: 60000, expenses: 35000, profit: 25000 },
      { month: 'يونيو', revenue: 52000, expenses: 33000, profit: 19000 },
    ],
  };
  
  // استخدام البيانات الحقيقية إذا كانت متوفرة، وإلا استخدام البيانات الوهمية
  const salesData = salesReport.data || mockSalesData;
  const inventoryData = inventoryReport.data || mockInventoryData;
  const financialData = financialReport.data || mockFinancialData;
  
  // تحويل بيانات المبيعات اليومية إلى تنسيق مناسب للرسم البياني
  const salesChartData = salesData.salesByPeriod?.map((item: any) => {
    const date = new Date(item.day);
    return {
      date: format(date, 'dd/MM', { locale: ar }),
      sales: item.sales,
      orders: item.orders,
      profit: item.profit,
    };
  }) || [];
  
  // تحويل بيانات المنتجات الأكثر مبيعاً إلى تنسيق مناسب للرسم البياني
  const topProductsChartData = salesData.topProducts?.slice(0, 5).map((item: any) => ({
    name: item.productName,
    sales: item.sales,
  })) || [];
  
  // تحويل بيانات الفئات إلى تنسيق مناسب للرسم البياني
  const categoriesChartData = inventoryData.categories?.slice(0, 5).map((item: any) => ({
    name: item.name,
    value: item.value,
  })) || [];
  
  // تحويل البيانات المالية إلى تنسيق مناسب للرسم البياني
  const financialChartData = financialData.monthly?.slice(0, 6).map((item: any) => ({
    month: item.month,
    revenue: item.revenue,
    expenses: item.expenses,
    profit: item.profit,
  })) || [];

  // تحديث الـ KPIs بناءً على البيانات الحقيقية
  const kpis: Kpi[] = [
    { 
      title: "إجمالي المبيعات", 
      value: formatCurrency(salesData.summary.totalSales), 
      icon: DollarSign, 
      change: "+5.2% هذا الشهر", 
      changeType: 'positive', 
      description: period === 'today' ? 'اليوم' : period === 'week' ? 'هذا الأسبوع' : 'هذا الشهر'
    },
    { 
      title: "عدد الفواتير", 
      value: salesData.summary.totalOrders.toString(), 
      icon: ShoppingCart, 
      change: "+8.1% هذا الشهر", 
      changeType: 'positive', 
      description: period === 'today' ? 'اليوم' : period === 'week' ? 'هذا الأسبوع' : 'هذا الشهر'
    },
    { 
      title: "المنتجات المتوفرة", 
      value: inventoryData.summary.totalItems.toString(), 
      icon: Package, 
      change: inventoryData.summary.lowStock + " منتج منخفض المخزون", 
      changeType: 'negative', 
      description: "إجمالي المنتجات المتوفرة" 
    },
    { 
      title: "صافي الربح", 
      value: formatCurrency(financialData.summary.profit), 
      icon: TrendingUp, 
      change: "+15.3% هذا الشهر", 
      changeType: 'positive', 
      description: period === 'today' ? 'اليوم' : period === 'week' ? 'هذا الأسبوع' : 'هذا الشهر'
    },
  ];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
        <div className="flex items-center gap-2">
          <Tabs value={period} onValueChange={(value) => setPeriod(value as 'today' | 'week' | 'month')}>
            <TabsList>
              <TabsTrigger value="today">اليوم</TabsTrigger>
              <TabsTrigger value="week">الأسبوع</TabsTrigger>
              <TabsTrigger value="month">الشهر</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center gap-1">
            <Button 
              variant={autoRefresh ? "default" : "outline"} 
              size="icon" 
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={autoRefresh ? "إيقاف التحديث التلقائي" : "تفعيل التحديث التلقائي"}
            >
              <div className="relative">
                <RefreshCw className="h-4 w-4" />
                {autoRefresh && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-green-500"></span>
                )}
              </div>
            </Button>
            
            <Button variant="outline" size="icon" onClick={handleRefresh} title="تحديث البيانات">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <ExportData
            title="تقرير لوحة المعلومات"
            data={[
              ...salesChartData.map((item: { date: string; sales: number; orders: number; profit: number }) => ({
                التاريخ: item.date,
                المبيعات: item.sales,
                الطلبات: item.orders,
                الربح: item.profit
              })),
            ]}
            columns={[
              { header: 'التاريخ', accessor: 'التاريخ' },
              { header: 'المبيعات', accessor: 'المبيعات', format: (value) => formatCurrency(value) },
              { header: 'الطلبات', accessor: 'الطلبات' },
              { header: 'الربح', accessor: 'الربح', format: (value) => formatCurrency(value) },
            ]}
            summary={{
              'إجمالي المبيعات': formatCurrency(salesData.summary.totalSales),
              'عدد الطلبات': salesData.summary.totalOrders,
              'صافي الربح': formatCurrency(financialData.summary.profit),
              'المنتجات المتوفرة': inventoryData.summary.totalItems,
              'منتجات منخفضة المخزون': inventoryData.summary.lowStock,
            }}
            fileName={`dashboard-report-${period}-${format(today, 'yyyy-MM-dd')}`}
            size="icon"
          />
        </div>
      </div>

      {/* تاريخ اليوم وآخر تحديث */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span>{formatDate(today)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 sm:mt-0">
              <RefreshCw className="h-4 w-4" />
              <span>آخر تحديث: {format(lastRefresh, 'HH:mm:ss', { locale: ar })}</span>
              {autoRefresh && <span className="text-green-500">(تحديث تلقائي)</span>}
            </div>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="kpi-title">
        <h2 id="kpi-title" className="text-2xl font-semibold mb-4 text-foreground sr-only">مؤشرات الأداء الرئيسية</h2>
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                {kpi.change && (
                  <p className={`text-xs ${kpi.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                    {kpi.change}
                  </p>
                )}
                {kpi.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {kpi.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* الرسوم البيانية */}
      <section aria-labelledby="charts-title">
        <h2 id="charts-title" className="text-2xl font-semibold mb-4 text-foreground">تحليل البيانات</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {/* اتجاه المبيعات */}
          <Card>
            <CardHeader>
              <CardTitle>اتجاه المبيعات</CardTitle>
              <CardDescription>
                {period === 'today' ? 'مبيعات اليوم بالساعة' : period === 'week' ? 'مبيعات الأسبوع اليومية' : 'مبيعات الشهر اليومية'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LineChart
                data={salesChartData}
                xAxisDataKey="date"
                formatYAxis={formatCurrency}
                lines={[
                  { dataKey: 'sales', name: 'المبيعات', color: '#0088FE' },
                  { dataKey: 'profit', name: 'الربح', color: '#00C49F' },
                ]}
                height={300}
              />
            </CardContent>
          </Card>
          
          {/* المنتجات الأكثر مبيعاً */}
          <Card>
            <CardHeader>
              <CardTitle>المنتجات الأكثر مبيعاً</CardTitle>
              <CardDescription>
                أفضل 5 منتجات من حيث المبيعات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={topProductsChartData}
                xAxisDataKey="name"
                formatYAxis={formatCurrency}
                bars={[
                  { dataKey: 'sales', name: 'المبيعات', color: '#0088FE' },
                ]}
                height={300}
                horizontal
              />
            </CardContent>
          </Card>
          
          {/* توزيع المخزون */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع المخزون</CardTitle>
              <CardDescription>
                قيمة المخزون حسب الفئة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PieChart
                data={categoriesChartData}
                formatValue={formatCurrency}
                height={300}
                donut
              />
            </CardContent>
          </Card>
          
          {/* الإيرادات والمصروفات */}
          <Card>
            <CardHeader>
              <CardTitle>الإيرادات والمصروفات</CardTitle>
              <CardDescription>
                مقارنة الإيرادات والمصروفات الشهرية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarChart
                data={financialChartData}
                xAxisDataKey="month"
                formatYAxis={formatCurrency}
                bars={[
                  { dataKey: 'revenue', name: 'الإيرادات', color: '#0088FE' },
                  { dataKey: 'expenses', name: 'المصروفات', color: '#FF8042' },
                ]}
                height={300}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="quick-access-title">
        <h2 id="quick-access-title" className="text-2xl font-semibold mb-4 text-foreground">الوصول السريع</h2>
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardQuickAccessItems.map((item) => (
            <IconCard
              key={item.title}
              title={item.title}
              icon={item.icon}
              href={item.href}
              description={item.description}
              variant="default"
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="modules-title">
        <h2 id="modules-title" className="text-2xl font-semibold mb-4 text-foreground">وحدات النظام</h2>
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {dashboardGridItems.map((item) => (
            <IconCard
              key={item.title}
              title={item.title}
              icon={item.icon}
              href={item.href}
              description={item.description}
              variant="outline"
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent />
    </QueryClientProvider>
  );
}
