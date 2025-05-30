import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart } from '@/components/charts/bar-chart';
import { LineChart } from '@/components/charts/line-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { EnhancedTable } from '@/components/ui/enhanced-table';
import { LoadingState } from '@/components/ui/loading-state';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Download, Calendar as CalendarIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// بيانات وهمية للتقرير المالي
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
  expenseCategories: [
    { category: 'رواتب', amount: 80000 },
    { category: 'إيجار', amount: 20000 },
    { category: 'مرافق', amount: 10000 },
    { category: 'تسويق', amount: 15000 },
    { category: 'مشتريات', amount: 20000 },
    { category: 'أخرى', amount: 5000 },
  ],
  revenueStreams: [
    { stream: 'مبيعات التجزئة', amount: 150000 },
    { stream: 'مبيعات الجملة', amount: 70000 },
    { stream: 'خدمات', amount: 20000 },
    { stream: 'أخرى', amount: 10000 },
  ],
  transactions: [
    { id: 1, date: '2023-06-15', description: 'مبيعات التجزئة', type: 'دخل', amount: 5000, category: 'مبيعات' },
    { id: 2, date: '2023-06-14', description: 'رواتب الموظفين', type: 'مصروف', amount: 15000, category: 'رواتب' },
    { id: 3, date: '2023-06-12', description: 'إيجار المتجر', type: 'مصروف', amount: 5000, category: 'إيجار' },
    { id: 4, date: '2023-06-10', description: 'مبيعات الجملة', type: 'دخل', amount: 12000, category: 'مبيعات' },
    { id: 5, date: '2023-06-08', description: 'فواتير الكهرباء', type: 'مصروف', amount: 1200, category: 'مرافق' },
  ],
};

interface FinancialReportProps {
  isLoading?: boolean;
  data?: typeof mockFinancialData;
  onDateRangeChange?: (from: Date, to: Date) => void;
  onExport?: () => void;
}

export function FinancialReport({
  isLoading = false,
  data = mockFinancialData,
  onDateRangeChange,
  onExport,
}: FinancialReportProps) {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
  const [period, setPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  
  // تنسيق المبالغ المالية
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('ar-SA')} ليرة`;
  };
  
  // تنسيق التاريخ
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'dd MMM yyyy', { locale: ar });
  };
  
  // تغيير نطاق التاريخ
  const handleDateRangeChange = (range: { from: Date; to: Date } | undefined) => {
    setDateRange(range);
    if (range && range.from && range.to && onDateRangeChange) {
      onDateRangeChange(range.from, range.to);
    }
  };
  
  // تصدير التقرير
  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      console.log('تصدير التقرير...');
    }
  };
  
  // أعمدة جدول المعاملات
  const transactionsColumns = [
    {
      header: 'التاريخ',
      accessorKey: 'date',
      cell: (row: any) => formatDate(row.date),
    },
    { header: 'الوصف', accessorKey: 'description' },
    { header: 'الفئة', accessorKey: 'category' },
    {
      header: 'النوع',
      accessorKey: 'type',
      cell: (row: any) => (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
            row.type === 'دخل'
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
          )}
        >
          {row.type === 'دخل' ? (
            <TrendingUp className="ml-1 h-3 w-3" />
          ) : (
            <TrendingDown className="ml-1 h-3 w-3" />
          )}
          {row.type}
        </span>
      ),
    },
    {
      header: 'المبلغ',
      accessorKey: 'amount',
      cell: (row: any) => (
        <span className={row.type === 'دخل' ? 'text-green-600' : 'text-red-600'}>
          {formatCurrency(row.amount)}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return <LoadingState fullPage text="جاري تحميل بيانات التقرير..." />;
  }

  return (
    <div className="space-y-6">
      {/* أدوات التقرير */}
      <Card>
        <CardHeader>
          <CardTitle>التقرير المالي</CardTitle>
          <CardDescription>عرض وتحليل البيانات المالية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* اختيار الفترة */}
              <Select
                value={period}
                onValueChange={(value: 'monthly' | 'quarterly' | 'yearly') => setPeriod(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="الفترة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">شهري</SelectItem>
                  <SelectItem value="quarterly">ربع سنوي</SelectItem>
                  <SelectItem value="yearly">سنوي</SelectItem>
                </SelectContent>
              </Select>
              
              {/* اختيار نطاق التاريخ */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal w-[240px]",
                      !dateRange && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "dd/MM/yyyy")
                      )
                    ) : (
                      "اختر نطاق التاريخ"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            {/* زر التصدير */}
            <Button variant="outline" onClick={handleExport}>
              <Download className="ml-2 h-4 w-4" />
              تصدير التقرير
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* ملخص مالي */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(data.summary.revenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              خلال الفترة المحددة
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي المصروفات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(data.summary.expenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              خلال الفترة المحددة
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">صافي الربح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(data.summary.profit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              قبل الضرائب
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الضرائب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.summary.taxAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ضريبة القيمة المضافة
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* تبويبات التقرير */}
      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
          <TabsTrigger value="expenses">المصروفات</TabsTrigger>
          <TabsTrigger value="transactions">المعاملات</TabsTrigger>
        </TabsList>
        
        {/* نظرة عامة */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <LineChart
              title="الإيرادات والمصروفات والأرباح"
              data={data.monthly}
              xAxisDataKey="month"
              formatYAxis={formatCurrency}
              lines={[
                { dataKey: 'revenue', name: 'الإيرادات', color: '#0088FE' },
                { dataKey: 'expenses', name: 'المصروفات', color: '#FF8042' },
                { dataKey: 'profit', name: 'الأرباح', color: '#00C49F' },
              ]}
              height={350}
            />
            
            <BarChart
              title="مقارنة الإيرادات والمصروفات"
              data={data.monthly}
              xAxisDataKey="month"
              formatYAxis={formatCurrency}
              bars={[
                { dataKey: 'revenue', name: 'الإيرادات', color: '#0088FE' },
                { dataKey: 'expenses', name: 'المصروفات', color: '#FF8042' },
              ]}
              height={350}
            />
          </div>
        </TabsContent>
        
        {/* الإيرادات */}
        <TabsContent value="revenue">
          <div className="grid gap-4 md:grid-cols-2">
            <PieChart
              title="مصادر الإيرادات"
              data={data.revenueStreams.map(stream => ({
                name: stream.stream,
                value: stream.amount,
              }))}
              formatValue={formatCurrency}
              height={350}
              donut
            />
            
            <BarChart
              title="تفاصيل الإيرادات"
              data={data.revenueStreams}
              xAxisDataKey="stream"
              formatYAxis={formatCurrency}
              bars={[
                { dataKey: 'amount', name: 'المبلغ', color: '#0088FE' },
              ]}
              height={350}
            />
          </div>
        </TabsContent>
        
        {/* المصروفات */}
        <TabsContent value="expenses">
          <div className="grid gap-4 md:grid-cols-2">
            <PieChart
              title="فئات المصروفات"
              data={data.expenseCategories.map(category => ({
                name: category.category,
                value: category.amount,
              }))}
              formatValue={formatCurrency}
              height={350}
            />
            
            <BarChart
              title="تفاصيل المصروفات"
              data={data.expenseCategories}
              xAxisDataKey="category"
              formatYAxis={formatCurrency}
              bars={[
                { dataKey: 'amount', name: 'المبلغ', color: '#FF8042' },
              ]}
              height={350}
            />
          </div>
        </TabsContent>
        
        {/* المعاملات */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>سجل المعاملات</CardTitle>
              <CardDescription>
                قائمة بأحدث المعاملات المالية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedTable
                data={data.transactions}
                columns={transactionsColumns}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}