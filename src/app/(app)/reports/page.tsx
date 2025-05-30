
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Users, 
  Calendar, 
  FileText, 
  Download, 
  Truck, 
  ArrowUpDown, 
  Layers, 
  AlertTriangle, 
  Clock, 
  Repeat, 
  CreditCard, 
  Banknote, 
  ChevronRight,
  BarChartBig,
  LandmarkIcon,
  FilePieChart
} from "lucide-react";

// مكونات التقارير
const reportCategories = [
  {
    id: 'sales',
    title: 'تقارير المبيعات',
    description: 'تحليل المبيعات والإيرادات والعملاء',
    icon: <ShoppingCart className="h-6 w-6" />,
    reports: [
      {
        id: 'sales-summary',
        title: 'ملخص المبيعات',
        description: 'تقرير شامل عن المبيعات والإيرادات',
        icon: <BarChart3 className="h-5 w-5" />,
        path: '/reports/sales/summary',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      },
      {
        id: 'sales-by-product',
        title: 'المبيعات حسب المنتج',
        description: 'تحليل المبيعات لكل منتج',
        icon: <PieChart className="h-5 w-5" />,
        path: '/reports/sales/by-product',
        color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      },
      {
        id: 'sales-by-customer',
        title: 'المبيعات حسب العميل',
        description: 'تحليل المبيعات لكل عميل',
        icon: <Users className="h-5 w-5" />,
        path: '/reports/sales/by-customer',
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      },
      {
        id: 'sales-trends',
        title: 'اتجاهات المبيعات',
        description: 'تحليل اتجاهات المبيعات عبر الزمن',
        icon: <LineChart className="h-5 w-5" />,
        path: '/reports/sales/trends',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      },
      {
        id: 'invoices-report',
        title: 'تقرير الفواتير',
        description: 'تقرير مفصل عن فواتير المبيعات',
        icon: <FileText className="h-5 w-5" />,
        path: '/reports/sales/invoices',
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      },
    ],
  },
  {
    id: 'inventory',
    title: 'تقارير المخزون',
    description: 'تحليل المخزون والمنتجات والحركة',
    icon: <Package className="h-6 w-6" />,
    reports: [
      {
        id: 'inventory-status',
        title: 'حالة المخزون',
        description: 'تقرير شامل عن حالة المخزون الحالية',
        icon: <Layers className="h-5 w-5" />,
        path: '/reports/inventory/status',
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      },
      {
        id: 'low-stock',
        title: 'المنتجات منخفضة المخزون',
        description: 'تقرير عن المنتجات التي وصلت للحد الأدنى',
        icon: <AlertTriangle className="h-5 w-5" />,
        path: '/reports/inventory/low-stock',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      },
      {
        id: 'stock-movement',
        title: 'حركة المخزون',
        description: 'تقرير عن حركة المخزون (دخول وخروج)',
        icon: <ArrowUpDown className="h-5 w-5" />,
        path: '/reports/inventory/movement',
        color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
      },
      {
        id: 'inventory-valuation',
        title: 'تقييم المخزون',
        description: 'تقرير عن قيمة المخزون الحالية',
        icon: <DollarSign className="h-5 w-5" />,
        path: '/reports/inventory/valuation',
        color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
      },
      {
        id: 'product-performance',
        title: 'أداء المنتجات',
        description: 'تحليل أداء المنتجات من حيث المبيعات والربحية',
        icon: <TrendingUp className="h-5 w-5" />,
        path: '/reports/inventory/performance',
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      },
    ],
  },
  {
    id: 'purchases',
    title: 'تقارير المشتريات',
    description: 'تحليل المشتريات والموردين',
    icon: <Truck className="h-6 w-6" />,
    reports: [
      {
        id: 'purchases-summary',
        title: 'ملخص المشتريات',
        description: 'تقرير شامل عن المشتريات والنفقات',
        icon: <BarChart3 className="h-5 w-5" />,
        path: '/reports/purchases/summary',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      },
      {
        id: 'purchases-by-supplier',
        title: 'المشتريات حسب المورد',
        description: 'تحليل المشتريات لكل مورد',
        icon: <Users className="h-5 w-5" />,
        path: '/reports/purchases/by-supplier',
        color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      },
      {
        id: 'purchase-orders',
        title: 'أوامر الشراء',
        description: 'تقرير مفصل عن أوامر الشراء',
        icon: <FileText className="h-5 w-5" />,
        path: '/reports/purchases/orders',
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      },
    ],
  },
  {
    id: 'financial',
    title: 'التقارير المالية',
    description: 'تحليل الأداء المالي والإيرادات والنفقات',
    icon: <DollarSign className="h-6 w-6" />,
    reports: [
      {
        id: 'profit-loss',
        title: 'الأرباح والخسائر',
        description: 'تقرير الأرباح والخسائر للفترة المحددة',
        icon: <FilePieChart className="h-5 w-5" />,
        path: '/reports/financial/profit-loss',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      },
      {
        id: 'revenue-expenses',
        title: 'الإيرادات والنفقات',
        description: 'تحليل الإيرادات والنفقات عبر الزمن',
        icon: <LineChart className="h-5 w-5" />,
        path: '/reports/financial/revenue-expenses',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      },
      {
        id: 'payment-methods',
        title: 'طرق الدفع',
        description: 'تحليل المبيعات حسب طرق الدفع',
        icon: <CreditCard className="h-5 w-5" />,
        path: '/reports/financial/payment-methods',
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      },
      {
        id: 'tax-report',
        title: 'تقرير الضرائب',
        description: 'تقرير مفصل عن الضرائب المحصلة',
        icon: <Banknote className="h-5 w-5" />,
        path: '/reports/financial/tax',
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      },
      {
        id: 'balance-sheet',
        title: 'الميزانية العمومية',
        description: 'عرض المركز المالي للشركة في تاريخ معين',
        icon: <LandmarkIcon className="h-5 w-5" />,
        path: '/reports/financial/balance-sheet',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      },
    ],
  },
  {
    id: 'customers',
    title: 'تقارير العملاء',
    description: 'تحليل بيانات العملاء وسلوكهم الشرائي',
    icon: <Users className="h-6 w-6" />,
    reports: [
      {
        id: 'customer-balances',
        title: 'أرصدة العملاء',
        description: 'تقرير عن أرصدة العملاء الحالية',
        icon: <DollarSign className="h-5 w-5" />,
        path: '/reports/customers/balances',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      },
      {
        id: 'customer-activity',
        title: 'نشاط العملاء',
        description: 'تحليل نشاط العملاء وسلوكهم الشرائي',
        icon: <TrendingUp className="h-5 w-5" />,
        path: '/reports/customers/activity',
        color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
      },
      {
        id: 'top-customers',
        title: 'أفضل العملاء',
        description: 'تقرير عن أفضل العملاء من حيث المبيعات',
        icon: <Users className="h-5 w-5" />,
        path: '/reports/customers/top',
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      },
    ],
  },
];

// التقارير المميزة
const featuredReports = [
  {
    id: 'sales-summary',
    title: 'ملخص المبيعات',
    description: 'تقرير شامل عن المبيعات والإيرادات',
    icon: <BarChart3 className="h-5 w-5" />,
    path: '/reports/sales/summary',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    id: 'inventory-status',
    title: 'حالة المخزون',
    description: 'تقرير شامل عن حالة المخزون الحالية',
    icon: <Layers className="h-5 w-5" />,
    path: '/reports/inventory/status',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  {
    id: 'profit-loss',
    title: 'الأرباح والخسائر',
    description: 'تقرير الأرباح والخسائر للفترة المحددة',
    icon: <FilePieChart className="h-5 w-5" />,
    path: '/reports/financial/profit-loss',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    id: 'low-stock',
    title: 'المنتجات منخفضة المخزون',
    description: 'تقرير عن المنتجات التي وصلت للحد الأدنى',
    icon: <AlertTriangle className="h-5 w-5" />,
    path: '/reports/inventory/low-stock',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
];

// التقارير الأخيرة
const recentReports = [
  {
    id: 'sales-summary-june',
    title: 'ملخص المبيعات - يونيو 2024',
    date: '2024-06-20',
    path: '/reports/sales/summary?period=2024-06',
  },
  {
    id: 'inventory-status-june',
    title: 'حالة المخزون - يونيو 2024',
    date: '2024-06-19',
    path: '/reports/inventory/status?date=2024-06-19',
  },
  {
    id: 'profit-loss-q2',
    title: 'الأرباح والخسائر - الربع الثاني 2024',
    date: '2024-06-15',
    path: '/reports/financial/profit-loss?period=2024-Q2',
  },
  {
    id: 'sales-by-product-may',
    title: 'المبيعات حسب المنتج - مايو 2024',
    date: '2024-06-01',
    path: '/reports/sales/by-product?period=2024-05',
  },
  {
    id: 'purchases-summary-may',
    title: 'ملخص المشتريات - مايو 2024',
    date: '2024-05-31',
    path: '/reports/purchases/summary?period=2024-05',
  },
];

export default function ReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('featured');
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">التقارير والتحليلات</h1>
          <p className="text-muted-foreground mt-1">عرض وتحليل البيانات وإنشاء التقارير</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="featured">التقارير المميزة</TabsTrigger>
          <TabsTrigger value="all">جميع التقارير</TabsTrigger>
          <TabsTrigger value="recent">التقارير الأخيرة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="featured" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredReports.map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <Link href={report.path}>
                  <CardHeader className="p-4 pb-2">
                    <div className={`w-10 h-10 rounded-md flex items-center justify-center ${report.color}`}>
                      {report.icon}
                    </div>
                    <CardTitle className="mt-2 text-lg">{report.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <CardDescription className="line-clamp-2">
                      {report.description}
                    </CardDescription>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-end">
                    <Button variant="ghost" size="sm" className="text-primary">
                      عرض التقرير <ChevronRight className="mr-1 rtl:ml-1 h-4 w-4 icon-directional" />
                    </Button>
                  </CardFooter>
                </Link>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>التقارير الأخيرة</CardTitle>
              <CardDescription>
                آخر التقارير التي تم إنشاؤها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentReports.slice(0, 3).map((report) => (
                  <Link 
                    key={report.id} 
                    href={report.path}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{report.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.date).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      عرض <ChevronRight className="mr-1 rtl:ml-1 h-4 w-4 icon-directional" />
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setActiveTab('recent')}
              >
                عرض جميع التقارير الأخيرة
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="all" className="space-y-6">
          {reportCategories.map((category) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  {category.icon}
                  <div>
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.reports.map((report) => (
                    <Link 
                      key={report.id} 
                      href={report.path}
                      className="flex items-start gap-3 p-3 rounded-md hover:bg-muted transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center ${report.color}`}>
                        {report.icon}
                      </div>
                      <div>
                        <p className="font-medium">{report.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {report.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>التقارير الأخيرة</CardTitle>
              <CardDescription>
                آخر التقارير التي تم إنشاؤها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentReports.map((report) => (
                  <Link 
                    key={report.id} 
                    href={report.path}
                    className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{report.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.date).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      عرض <ChevronRight className="mr-1 rtl:ml-1 h-4 w-4 icon-directional" />
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>التقارير المجدولة</CardTitle>
              <CardDescription>
                التقارير المجدولة للإنشاء التلقائي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">ملخص المبيعات الأسبوعي</p>
                      <p className="text-sm text-muted-foreground">
                        كل يوم أحد - 08:00 صباحاً
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    تعديل
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <Repeat className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">تقرير المخزون الشهري</p>
                      <p className="text-sm text-muted-foreground">
                        نهاية كل شهر - 10:00 صباحاً
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    تعديل
                  </Button>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-md hover:bg-muted transition-colors">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">تقرير الأرباح والخسائر الشهري</p>
                      <p className="text-sm text-muted-foreground">
                        اليوم الخامس من كل شهر - 09:00 صباحاً
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    تعديل
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Clock className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> إنشاء تقرير مجدول جديد
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
