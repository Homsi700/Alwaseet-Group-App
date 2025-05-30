'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  TrendingDown, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Clock, 
  DollarSign,
  RefreshCw,
  Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ExportData } from '@/components/export/export-data';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// إنشاء عميل React Query
const queryClient = new QueryClient();

// صفحة التقارير الرئيسية
export default function InventoryReportsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <InventoryReportsContent />
    </QueryClientProvider>
  );
}

// مكون محتوى صفحة التقارير
function InventoryReportsContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('status');
  
  // تنسيق المبالغ المالية
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('ar-SY')} ل.س`;
  };
  
  // تنسيق التاريخ
  const formatDate = (date: Date) => {
    return format(date, 'dd MMMM yyyy', { locale: ar });
  };
  
  // بيانات التقارير المتاحة
  const reports = [
    {
      id: 'status',
      title: 'حالة المخزون',
      description: 'نظرة عامة على حالة المخزون الحالية',
      icon: Package,
      path: '/inventory/reports/status',
      color: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'low-stock',
      title: 'المنتجات منخفضة المخزون',
      description: 'قائمة بالمنتجات التي تحتاج إلى إعادة الطلب',
      icon: AlertTriangle,
      path: '/inventory/reports/low-stock',
      color: 'bg-amber-100 text-amber-700',
    },
    {
      id: 'movement',
      title: 'حركة المخزون',
      description: 'تتبع حركة المنتجات (الإضافات والسحب)',
      icon: Clock,
      path: '/inventory/reports/movement',
      color: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'valuation',
      title: 'تقييم المخزون',
      description: 'تقييم مالي للمخزون الحالي',
      icon: DollarSign,
      path: '/inventory/reports/valuation',
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'performance',
      title: 'أداء المنتجات',
      description: 'تحليل أداء المنتجات من حيث المبيعات والربحية',
      icon: TrendingUp,
      path: '/inventory/reports/performance',
      color: 'bg-purple-100 text-purple-700',
    },
  ];

  // التنقل إلى صفحة التقرير المحدد
  const navigateToReport = (reportPath: string) => {
    router.push(reportPath);
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">تقارير المخزون</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>اختر التقرير</CardTitle>
          <CardDescription>
            اختر من بين التقارير المتاحة للحصول على رؤى حول المخزون
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <Card 
                key={report.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigateToReport(report.path)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-full ${report.color}`}>
                      <report.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">{report.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>التقارير الأخيرة</CardTitle>
          <CardDescription>
            تقارير تم إنشاؤها مؤخرًا
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">تقرير حالة المخزون</h3>
                  <p className="text-sm text-muted-foreground">{formatDate(new Date())}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateToReport('/inventory/reports/status')}>
                عرض
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 text-amber-700 p-2 rounded-full">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">تقرير المنتجات منخفضة المخزون</h3>
                  <p className="text-sm text-muted-foreground">{formatDate(new Date(Date.now() - 86400000))}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateToReport('/inventory/reports/low-stock')}>
                عرض
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-100 text-emerald-700 p-2 rounded-full">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">تقرير تقييم المخزون</h3>
                  <p className="text-sm text-muted-foreground">{formatDate(new Date(Date.now() - 172800000))}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigateToReport('/inventory/reports/valuation')}>
                عرض
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}