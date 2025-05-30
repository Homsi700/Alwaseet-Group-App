'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DateRangePicker } from "@/components/date-range-picker";
import { ArrowLeft, Download, BarChart4, PieChart, TrendingUp, ArrowUpRight, ArrowDownLeft, Users } from "lucide-react";
import { ExportData } from '@/components/export/export-data';

// بيانات وهمية للتقارير
const mockMonthlyData = [
  { month: "يناير", sales: 120000, orders: 45, avgOrderValue: 2666.67 },
  { month: "فبراير", sales: 135000, orders: 50, avgOrderValue: 2700.00 },
  { month: "مارس", sales: 150000, orders: 55, avgOrderValue: 2727.27 },
  { month: "أبريل", sales: 145000, orders: 52, avgOrderValue: 2788.46 },
  { month: "مايو", sales: 160000, orders: 60, avgOrderValue: 2666.67 },
  { month: "يونيو", sales: 175000, orders: 65, avgOrderValue: 2692.31 },
  { month: "يوليو", sales: 165000, orders: 58, avgOrderValue: 2844.83 }
];

const mockCategoryData = [
  { category: "أجهزة كمبيوتر", sales: 450000, percentage: 40, orders: 150 },
  { category: "طابعات", sales: 280000, percentage: 25, orders: 100 },
  { category: "هواتف", sales: 170000, percentage: 15, orders: 80 },
  { category: "ملحقات", sales: 225000, percentage: 20, orders: 120 }
];

const mockCustomerData = [
  { name: "شركة الأمل للتجارة", sales: 250000, orders: 85, avgOrderValue: 2941.18 },
  { name: "مؤسسة النجاح الحديثة", sales: 175000, orders: 60, avgOrderValue: 2916.67 },
  { name: "محلات الوفاء", sales: 120000, orders: 45, avgOrderValue: 2666.67 },
  { name: "شركة الإبداع للتقنية", sales: 95000, orders: 35, avgOrderValue: 2714.29 },
  { name: "مؤسسة الريادة", sales: 85000, orders: 30, avgOrderValue: 2833.33 }
];

const mockPaymentMethodData = [
  { method: "نقداً", sales: 350000, percentage: 35, orders: 120 },
  { method: "بطاقة ائتمان", sales: 300000, percentage: 30, orders: 110 },
  { method: "تحويل بنكي", sales: 250000, percentage: 25, orders: 90 },
  { method: "شيك", sales: 100000, percentage: 10, orders: 40 }
];

export default function SalesReportsPage() {
  const router = useRouter();
  const [reportPeriod, setReportPeriod] = useState("yearly");
  const [selectedDateRange, setSelectedDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [activeTab, setActiveTab] = useState("overview");

  // إجمالي المبيعات
  const totalSales = mockMonthlyData.reduce((sum, month) => sum + month.sales, 0);
  
  // إجمالي الطلبات
  const totalOrders = mockMonthlyData.reduce((sum, month) => sum + month.orders, 0);
  
  // متوسط قيمة الطلب
  const avgOrderValue = totalSales / totalOrders;
  
  // أعلى فئة مبيعات
  const topCategory = mockCategoryData.sort((a, b) => b.sales - a.sales)[0];

  // تصدير التقرير
  const handleExportReport = () => {
    alert("تم تصدير التقرير بنجاح");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full"
              onClick={() => router.push("/sales")}
            >
              <ArrowLeft className="h-4 w-4 icon-directional" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">تقارير المبيعات</h1>
          </div>
          <p className="text-muted-foreground mt-1">تحليل وإحصائيات أداء المبيعات</p>
        </div>
        
        <Button 
          variant="outline" 
          className="rounded-md"
          onClick={handleExportReport}
        >
          <Download className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> تصدير التقرير
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>فلترة التقارير</CardTitle>
          <CardDescription>
            حدد الفترة الزمنية لعرض التقارير المناسبة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>الفترة الزمنية</Label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger className="rounded-md">
                  <SelectValue placeholder="اختر الفترة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">شهري</SelectItem>
                  <SelectItem value="quarterly">ربع سنوي</SelectItem>
                  <SelectItem value="yearly">سنوي</SelectItem>
                  <SelectItem value="custom">مخصص</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {reportPeriod === "custom" && (
              <div className="space-y-2 sm:col-span-2">
                <Label>نطاق التاريخ</Label>
                <DateRangePicker
                  value={selectedDateRange}
                  onValueChange={setSelectedDateRange}
                  align="start"
                  locale="ar"
                  placeholder="تحديد الفترة"
                  className="w-full"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">إجمالي المبيعات</h3>
                <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{totalSales.toLocaleString()} ر.س</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">عدد الطلبات</h3>
                <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{totalOrders}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 dark:bg-purple-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">متوسط قيمة الطلب</h3>
                <p className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">{avgOrderValue.toFixed(2)} ر.س</p>
              </div>
              <Calculator className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">أعلى فئة مبيعات</h3>
                <p className="text-2xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">{topCategory.category}</p>
              </div>
              <BarChart4 className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="products">المنتجات</TabsTrigger>
          <TabsTrigger value="customers">العملاء</TabsTrigger>
          <TabsTrigger value="payments">طرق الدفع</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقرير المبيعات الشهرية</CardTitle>
              <CardDescription>
                نظرة عامة على المبيعات الشهرية خلال الفترة المحددة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-md flex items-center justify-center mb-6">
                <BarChart4 className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground mr-2">سيتم عرض رسم بياني هنا</p>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الشهر</TableHead>
                    <TableHead className="text-right rtl:text-left">المبيعات</TableHead>
                    <TableHead className="text-center">عدد الطلبات</TableHead>
                    <TableHead className="text-right rtl:text-left">متوسط قيمة الطلب</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMonthlyData.map((month) => (
                    <TableRow key={month.month}>
                      <TableCell className="font-medium">{month.month}</TableCell>
                      <TableCell className="text-right rtl:text-left">{month.sales.toLocaleString()} ر.س</TableCell>
                      <TableCell className="text-center">{month.orders}</TableCell>
                      <TableCell className="text-right rtl:text-left">{month.avgOrderValue.toFixed(2)} ر.س</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="mt-4 flex justify-end">
                <ExportData
                  title="تقرير المبيعات الشهرية"
                  data={mockMonthlyData.map(month => ({
                    'الشهر': month.month,
                    'المبيعات': month.sales.toLocaleString(),
                    'عدد الطلبات': month.orders,
                    'متوسط قيمة الطلب': month.avgOrderValue.toFixed(2)
                  }))}
                  columns={[
                    { header: 'الشهر', accessor: 'الشهر' },
                    { header: 'المبيعات', accessor: 'المبيعات' },
                    { header: 'عدد الطلبات', accessor: 'عدد الطلبات' },
                    { header: 'متوسط قيمة الطلب', accessor: 'متوسط قيمة الطلب' },
                  ]}
                  fileName="monthly-sales-report"
                  variant="outline"
                  size="sm"
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>توزيع المبيعات حسب الفئة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-muted rounded-md flex items-center justify-center mb-6">
                  <PieChart className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground mr-2">سيتم عرض رسم بياني هنا</p>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الفئة</TableHead>
                      <TableHead className="text-right rtl:text-left">المبيعات</TableHead>
                      <TableHead className="text-center">النسبة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCategoryData.map((category) => (
                      <TableRow key={category.category}>
                        <TableCell className="font-medium">{category.category}</TableCell>
                        <TableCell className="text-right rtl:text-left">{category.sales.toLocaleString()} ر.س</TableCell>
                        <TableCell className="text-center">{category.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>توزيع المبيعات حسب طريقة الدفع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-muted rounded-md flex items-center justify-center mb-6">
                  <PieChart className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground mr-2">سيتم عرض رسم بياني هنا</p>
                </div>
                
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>طريقة الدفع</TableHead>
                      <TableHead className="text-right rtl:text-left">المبيعات</TableHead>
                      <TableHead className="text-center">النسبة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPaymentMethodData.map((method) => (
                      <TableRow key={method.method}>
                        <TableCell className="font-medium">{method.method}</TableCell>
                        <TableCell className="text-right rtl:text-left">{method.sales.toLocaleString()} ر.س</TableCell>
                        <TableCell className="text-center">{method.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقرير المنتجات</CardTitle>
              <CardDescription>
                تحليل مفصل للمنتجات الأكثر مبيعاً
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-md flex items-center justify-center mb-6">
                <BarChart4 className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground mr-2">سيتم عرض رسم بياني هنا</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">أعلى 5 فئات مبيعاً</h3>
                <div className="space-y-4">
                  {mockCategoryData
                    .sort((a, b) => b.sales - a.sales)
                    .map((category, index) => (
                    <div key={category.category} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div className="ml-4 rtl:mr-4 flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{category.category}</p>
                          <p className="font-bold text-green-600 dark:text-green-400">{category.sales.toLocaleString()} ر.س</p>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full mt-2">
                          <div 
                            className="bg-green-600 dark:bg-green-400 h-2 rounded-full" 
                            style={{ 
                              width: `${(category.sales / mockCategoryData[0].sales) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">تحليل المبيعات حسب الفئة</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الفئة</TableHead>
                      <TableHead className="text-right rtl:text-left">المبيعات</TableHead>
                      <TableHead className="text-center">عدد الطلبات</TableHead>
                      <TableHead className="text-center">النسبة من إجمالي المبيعات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCategoryData.map((category) => (
                      <TableRow key={category.category}>
                        <TableCell className="font-medium">{category.category}</TableCell>
                        <TableCell className="text-right rtl:text-left">{category.sales.toLocaleString()} ر.س</TableCell>
                        <TableCell className="text-center">{category.orders}</TableCell>
                        <TableCell className="text-center">{category.percentage}%</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/50">
                      <TableCell className="font-bold">الإجمالي</TableCell>
                      <TableCell className="text-right rtl:text-left font-bold">{totalSales.toLocaleString()} ر.س</TableCell>
                      <TableCell className="text-center font-bold">{totalOrders}</TableCell>
                      <TableCell className="text-center font-bold">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقرير العملاء</CardTitle>
              <CardDescription>
                تحليل مفصل لأداء العملاء
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-md flex items-center justify-center mb-6">
                <BarChart4 className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground mr-2">سيتم عرض رسم بياني هنا</p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">أعلى 5 عملاء</h3>
                <div className="space-y-4">
                  {mockCustomerData
                    .sort((a, b) => b.sales - a.sales)
                    .map((customer, index) => (
                    <div key={customer.name} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div className="ml-4 rtl:mr-4 flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{customer.name}</p>
                          <p className="font-bold text-green-600 dark:text-green-400">{customer.sales.toLocaleString()} ر.س</p>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full mt-2">
                          <div 
                            className="bg-green-600 dark:bg-green-400 h-2 rounded-full" 
                            style={{ 
                              width: `${(customer.sales / mockCustomerData[0].sales) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">تحليل مبيعات العملاء</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العميل</TableHead>
                      <TableHead className="text-right rtl:text-left">المبيعات</TableHead>
                      <TableHead className="text-center">عدد الطلبات</TableHead>
                      <TableHead className="text-right rtl:text-left">متوسط قيمة الطلب</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCustomerData.map((customer) => (
                      <TableRow key={customer.name}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell className="text-right rtl:text-left">{customer.sales.toLocaleString()} ر.س</TableCell>
                        <TableCell className="text-center">{customer.orders}</TableCell>
                        <TableCell className="text-right rtl:text-left">{customer.avgOrderValue.toFixed(2)} ر.س</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقرير طرق الدفع</CardTitle>
              <CardDescription>
                تحليل مفصل لطرق الدفع المستخدمة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-md flex items-center justify-center mb-6">
                <PieChart className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground mr-2">سيتم عرض رسم بياني هنا</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {mockPaymentMethodData.map((method) => (
                  <Card key={method.method} className="bg-muted/50">
                    <CardContent className="p-4">
                      <h3 className="font-medium">{method.method}</h3>
                      <p className="text-xl font-bold mt-2 text-green-600 dark:text-green-400">
                        {method.sales.toLocaleString()} ر.س
                      </p>
                      <div className="flex justify-between text-sm mt-2">
                        <span>{method.orders} طلب</span>
                        <span>{method.percentage}% من المبيعات</span>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full mt-2">
                        <div 
                          className="bg-green-600 dark:bg-green-400 h-2 rounded-full" 
                          style={{ width: `${method.percentage}%` }}
                        ></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>طريقة الدفع</TableHead>
                    <TableHead className="text-right rtl:text-left">المبيعات</TableHead>
                    <TableHead className="text-center">عدد الطلبات</TableHead>
                    <TableHead className="text-center">النسبة من إجمالي المبيعات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPaymentMethodData.map((method) => (
                    <TableRow key={method.method}>
                      <TableCell className="font-medium">{method.method}</TableCell>
                      <TableCell className="text-right rtl:text-left">{method.sales.toLocaleString()} ر.س</TableCell>
                      <TableCell className="text-center">{method.orders}</TableCell>
                      <TableCell className="text-center">{method.percentage}%</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-muted/50">
                    <TableCell className="font-bold">الإجمالي</TableCell>
                    <TableCell className="text-right rtl:text-left font-bold">{totalSales.toLocaleString()} ر.س</TableCell>
                    <TableCell className="text-center font-bold">{totalOrders}</TableCell>
                    <TableCell className="text-center font-bold">100%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// مكونات إضافية
function FileText(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}

function Calculator(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    </svg>
  );
}