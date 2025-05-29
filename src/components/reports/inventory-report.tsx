import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart } from '@/components/charts/bar-chart';
import { PieChart } from '@/components/charts/pie-chart';
import { Download, AlertTriangle } from 'lucide-react';

// بيانات وهمية للمخزون
const mockInventoryData = {
  summary: {
    totalItems: 2500,
    totalValue: 450000,
    lowStock: 15,
    outOfStock: 5,
  },
  categories: [
    { name: 'إلكترونيات', count: 500, value: 150000 },
    { name: 'ملابس', count: 800, value: 120000 },
    { name: 'أثاث', count: 300, value: 90000 },
    { name: 'مستلزمات منزلية', count: 600, value: 60000 },
    { name: 'أدوات مكتبية', count: 200, value: 20000 },
    { name: 'أخرى', count: 100, value: 10000 },
  ],
  lowStockItems: [
    { id: 1, name: 'هاتف ذكي', sku: 'P001', quantity: 3, minQuantity: 10, category: 'إلكترونيات' },
    { id: 2, name: 'لابتوب', sku: 'P002', quantity: 2, minQuantity: 5, category: 'إلكترونيات' },
    { id: 3, name: 'سماعات لاسلكية', sku: 'P003', quantity: 5, minQuantity: 15, category: 'إلكترونيات' },
  ],
};

interface InventoryReportProps {
  isLoading?: boolean;
  data?: typeof mockInventoryData;
  onCategoryChange?: (category: string) => void;
  onExport?: () => void;
}

export function InventoryReport({
  isLoading = false,
  data = mockInventoryData,
  onCategoryChange,
  onExport,
}: InventoryReportProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // تنسيق المبالغ المالية
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('ar-SA')} ريال`;
  };
  
  // تغيير الفئة
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (onCategoryChange) {
      onCategoryChange(category);
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

  return (
    <div className="space-y-6">
      {/* أدوات التقرير */}
      <Card>
        <CardHeader>
          <CardTitle>تقرير المخزون</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* اختيار الفئة */}
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="اختر الفئة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  {data.categories.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
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
      
      {/* ملخص المخزون */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.totalItems.toLocaleString('ar-SA')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(data.summary.totalValue)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">منخفض المخزون</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {data.summary.lowStock}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">نفذت الكمية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.summary.outOfStock}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* تبويبات التقرير */}
      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="lowStock">منخفض المخزون</TabsTrigger>
        </TabsList>
        
        {/* نظرة عامة */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2">
            <PieChart
              title="توزيع المنتجات حسب الفئة"
              data={data.categories.map(cat => ({
                name: cat.name,
                value: cat.count,
              }))}
              height={350}
            />
            
            <BarChart
              title="قيمة المخزون حسب الفئة"
              data={data.categories}
              xAxisDataKey="name"
              formatYAxis={formatCurrency}
              bars={[
                { dataKey: 'value', name: 'القيمة', color: '#0088FE' },
              ]}
              height={350}
            />
          </div>
        </TabsContent>
        
        {/* منخفض المخزون */}
        <TabsContent value="lowStock">
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardHeader className="bg-yellow-50 dark:bg-yellow-900/20">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 ml-2" />
                <CardTitle>المنتجات منخفضة المخزون</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 px-4 text-right">المنتج</th>
                      <th className="py-3 px-4 text-right">رمز المنتج</th>
                      <th className="py-3 px-4 text-right">الفئة</th>
                      <th className="py-3 px-4 text-right">الكمية الحالية</th>
                      <th className="py-3 px-4 text-right">الحد الأدنى</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.lowStockItems.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{item.name}</td>
                        <td className="py-3 px-4">{item.sku}</td>
                        <td className="py-3 px-4">{item.category}</td>
                        <td className="py-3 px-4">{item.quantity}</td>
                        <td className="py-3 px-4">{item.minQuantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}