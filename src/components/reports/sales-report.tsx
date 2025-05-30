import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart } from '@/components/charts/bar-chart';
import { LineChart } from '@/components/charts/line-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { Download } from 'lucide-react';

// بيانات وهمية للمبيعات
const mockSalesData = {
  monthly: [
    { month: 'يناير', sales: 45000, orders: 600, profit: 18000 },
    { month: 'فبراير', sales: 40000, orders: 550, profit: 16000 },
    { month: 'مارس', sales: 55000, orders: 700, profit: 22000 },
    { month: 'أبريل', sales: 48000, orders: 620, profit: 19000 },
    { month: 'مايو', sales: 60000, orders: 800, profit: 24000 },
    { month: 'يونيو', sales: 52000, orders: 680, profit: 21000 },
  ],
  categories: [
    { name: 'إلكترونيات', sales: 25000, percentage: 30 },
    { name: 'ملابس', sales: 20000, percentage: 24 },
    { name: 'أثاث', sales: 15000, percentage: 18 },
    { name: 'مستلزمات منزلية', sales: 12000, percentage: 14 },
    { name: 'أدوات مكتبية', sales: 8000, percentage: 10 },
    { name: 'أخرى', sales: 4000, percentage: 4 },
  ],
};

interface SalesReportProps {
  isLoading?: boolean;
  data?: typeof mockSalesData;
  onExport?: () => void;
}

export function SalesReport({
  isLoading = false,
  data = mockSalesData,
  onExport,
}: SalesReportProps) {
  const [timeFrame, setTimeFrame] = useState<'monthly' | 'quarterly'>('monthly');
  
  // تنسيق المبالغ المالية
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('ar-SA')} ليرة`;
  };
  
  // تصدير التقرير
  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      console.log('تصدير التقرير...');
    }
  };

  return (
    <div className="space-y-6">
      {/* أدوات التقرير */}
      <Card>
        <CardHeader>
          <CardTitle>تقرير المبيعات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* اختيار الفترة الزمنية */}
              <Select value={timeFrame} onValueChange={(value: 'monthly' | 'quarterly') => setTimeFrame(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="الفترة الزمنية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">شهري</SelectItem>
                  <SelectItem value="quarterly">ربع سنوي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* زر التصدير */}
            <Button variant="outline" onClick={handleExport}>
              <Download className="ml-2 h-4 w-4" />
              تصدير التقرير
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* ملخص المبيعات */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.monthly.reduce((sum, item) => sum + item.sales, 0))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">عدد الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.monthly.reduce((sum, item) => sum + item.orders, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.monthly.reduce((sum, item) => sum + item.profit, 0))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* تبويبات التقرير */}
      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="categories">الفئات</TabsTrigger>
        </TabsList>
        
        {/* نظرة عامة */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <BarChart
              title="المبيعات حسب الشهر"
              data={data.monthly}
              xAxisDataKey="month"
              formatYAxis={formatCurrency}
              bars={[
                { dataKey: 'sales', name: 'المبيعات', color: '#0088FE' },
                { dataKey: 'profit', name: 'الربح', color: '#00C49F' },
              ]}
              height={300}
            />
            
            <LineChart
              title="اتجاه المبيعات"
              data={data.monthly}
              xAxisDataKey="month"
              formatYAxis={formatCurrency}
              lines={[
                { dataKey: 'sales', name: 'المبيعات', color: '#0088FE' },
              ]}
              height={300}
            />
          </div>
        </TabsContent>
        
        {/* الفئات */}
        <TabsContent value="categories">
          <div className="grid gap-4 md:grid-cols-2">
            <PieChart
              title="المبيعات حسب الفئة"
              data={data.categories.map(cat => ({
                name: cat.name,
                value: cat.sales,
              }))}
              formatValue={formatCurrency}
              height={400}
              donut
            />
            
            <BarChart
              title="المبيعات حسب الفئة"
              data={data.categories}
              xAxisDataKey="name"
              formatYAxis={formatCurrency}
              bars={[
                { dataKey: 'sales', name: 'المبيعات', color: '#0088FE' },
              ]}
              height={400}
              horizontal
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}