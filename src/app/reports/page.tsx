'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SalesReport } from '@/components/reports/sales-report';
import { InventoryReport } from '@/components/reports/inventory-report';
import { FinancialReport } from '@/components/reports/financial-report';
import { EnhancedBreadcrumb } from '@/components/ui/enhanced-breadcrumb';
import { Button } from '@/components/ui/button';
import { Download, FileText, BarChart, PieChart } from 'lucide-react';
import { ExportData } from '@/components/export/export-data';
import { useSalesReport, useInventoryReport, useFinancialReport } from '@/hooks/use-reports';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// إنشاء عميل React Query
const queryClient = new QueryClient();

function ReportsContent() {
  const [activeTab, setActiveTab] = useState('sales');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

  // استخدام hooks للتقارير
  const salesReport = useSalesReport({
    startDate: dateRange.from,
    endDate: dateRange.to,
    period: period === 'quarterly' ? 'monthly' : 'monthly',
  });

  const inventoryReport = useInventoryReport({
    categoryId,
  });

  const financialReport = useFinancialReport({
    startDate: dateRange.from,
    endDate: dateRange.to,
    period,
  });

  // تصدير التقرير
  const handleExport = () => {
    console.log(`تصدير تقرير ${activeTab}`);
    // هنا يمكن إضافة منطق التصدير الفعلي
  };

  // تغيير نطاق التاريخ
  const handleDateRangeChange = (from: Date, to: Date) => {
    setDateRange({ from, to });
  };

  // تغيير الفئة
  const handleCategoryChange = (category: string) => {
    setCategoryId(category === 'all' ? undefined : category);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* التنقل بين الصفحات */}
      <EnhancedBreadcrumb
        items={[
          { href: '/dashboard', label: 'لوحة المعلومات' },
          { href: '/reports', label: 'التقارير', isCurrentPage: true },
        ]}
      />

      {/* عنوان الصفحة */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">التقارير</h1>
          <p className="text-muted-foreground mt-1">
            عرض وتحليل بيانات المبيعات والمخزون والمالية
          </p>
        </div>
        
        <ExportData
          title={`تقرير ${activeTab === 'sales' ? 'المبيعات' : activeTab === 'inventory' ? 'المخزون' : 'المالية'}`}
          data={
            activeTab === 'sales' 
              ? salesReport.data?.salesByPeriod?.map((item: any) => ({
                  التاريخ: item.day,
                  المبيعات: item.sales,
                  الطلبات: item.orders,
                  الربح: item.profit
                })) || []
              : activeTab === 'inventory'
                ? inventoryReport.data?.categories?.map((item: any) => ({
                    الفئة: item.name,
                    العدد: item.count,
                    الكمية: item.quantity,
                    القيمة: item.value
                  })) || []
                : financialReport.data?.monthly?.map((item: any) => ({
                    الشهر: item.month,
                    الإيرادات: item.revenue,
                    المصروفات: item.expenses,
                    الربح: item.profit
                  })) || []
          }
          columns={
            activeTab === 'sales'
              ? [
                  { header: 'التاريخ', accessor: 'التاريخ' },
                  { header: 'المبيعات', accessor: 'المبيعات', format: (value) => `${value.toLocaleString('ar-SA')} ريال` },
                  { header: 'الطلبات', accessor: 'الطلبات' },
                  { header: 'الربح', accessor: 'الربح', format: (value) => `${value.toLocaleString('ar-SA')} ريال` },
                ]
              : activeTab === 'inventory'
                ? [
                    { header: 'الفئة', accessor: 'الفئة' },
                    { header: 'العدد', accessor: 'العدد' },
                    { header: 'الكمية', accessor: 'الكمية' },
                    { header: 'القيمة', accessor: 'القيمة', format: (value) => `${value.toLocaleString('ar-SA')} ريال` },
                  ]
                : [
                    { header: 'الشهر', accessor: 'الشهر' },
                    { header: 'الإيرادات', accessor: 'الإيرادات', format: (value) => `${value.toLocaleString('ar-SA')} ريال` },
                    { header: 'المصروفات', accessor: 'المصروفات', format: (value) => `${value.toLocaleString('ar-SA')} ريال` },
                    { header: 'الربح', accessor: 'الربح', format: (value) => `${value.toLocaleString('ar-SA')} ريال` },
                  ]
          }
          summary={
            activeTab === 'sales'
              ? {
                  'إجمالي المبيعات': `${(salesReport.data?.summary?.totalSales || 0).toLocaleString('ar-SA')} ريال`,
                  'عدد الطلبات': salesReport.data?.summary?.totalOrders || 0,
                  'صافي الربح': `${(salesReport.data?.summary?.netSales || 0).toLocaleString('ar-SA')} ريال`,
                }
              : activeTab === 'inventory'
                ? {
                    'إجمالي المنتجات': inventoryReport.data?.summary?.totalItems || 0,
                    'قيمة المخزون': `${(inventoryReport.data?.summary?.totalValue || 0).toLocaleString('ar-SA')} ريال`,
                    'منتجات منخفضة المخزون': inventoryReport.data?.summary?.lowStock || 0,
                  }
                : {
                    'إجمالي الإيرادات': `${(financialReport.data?.summary?.revenue || 0).toLocaleString('ar-SA')} ريال`,
                    'إجمالي المصروفات': `${(financialReport.data?.summary?.expenses || 0).toLocaleString('ar-SA')} ريال`,
                    'صافي الربح': `${(financialReport.data?.summary?.profit || 0).toLocaleString('ar-SA')} ريال`,
                  }
          }
          fileName={`${activeTab}-report-${new Date().toISOString().split('T')[0]}`}
        />
      </div>

      {/* تبويبات التقارير */}
      <Tabs
        defaultValue="sales"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>المبيعات</span>
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            <span>المخزون</span>
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>المالية</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales">
          <SalesReport 
            isLoading={salesReport.isLoading}
            data={salesReport.data}
            onExport={handleExport}
            onDateRangeChange={handleDateRangeChange}
          />
        </TabsContent>
        
        <TabsContent value="inventory">
          <InventoryReport 
            isLoading={inventoryReport.isLoading}
            data={inventoryReport.data}
            onExport={handleExport}
            onCategoryChange={handleCategoryChange}
          />
        </TabsContent>
        
        <TabsContent value="financial">
          <FinancialReport 
            isLoading={financialReport.isLoading}
            data={financialReport.data}
            onExport={handleExport}
            onDateRangeChange={handleDateRangeChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReportsContent />
    </QueryClientProvider>
  );
}