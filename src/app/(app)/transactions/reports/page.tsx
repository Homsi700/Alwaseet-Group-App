"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DateRangePicker } from "@/components/date-range-picker";
import { ArrowLeft, Download, BarChart4, PieChart, TrendingUp, ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import { 
  TransactionType, 
  PaymentMethod, 
  EntityType 
} from "@/lib/types";

// بيانات وهمية للتقارير
const mockMonthlyData = [
  { month: "يناير", income: 120000, expense: 85000, balance: 35000 },
  { month: "فبراير", income: 135000, expense: 90000, balance: 45000 },
  { month: "مارس", income: 150000, expense: 95000, balance: 55000 },
  { month: "أبريل", income: 145000, expense: 100000, balance: 45000 },
  { month: "مايو", income: 160000, expense: 105000, balance: 55000 },
  { month: "يونيو", income: 175000, expense: 110000, balance: 65000 },
  { month: "يوليو", income: 165000, expense: 115000, balance: 50000 }
];

const mockCategoryData = [
  { category: "مبيعات", amount: 450000, percentage: 40 },
  { category: "خدمات", amount: 280000, percentage: 25 },
  { category: "استشارات", amount: 170000, percentage: 15 },
  { category: "إيرادات أخرى", amount: 225000, percentage: 20 }
];

const mockExpenseCategoryData = [
  { category: "رواتب", amount: 350000, percentage: 35 },
  { category: "إيجارات", amount: 150000, percentage: 15 },
  { category: "مشتريات", amount: 250000, percentage: 25 },
  { category: "مرافق", amount: 100000, percentage: 10 },
  { category: "مصاريف أخرى", amount: 150000, percentage: 15 }
];

const mockAccountsData = [
  { account: "الحساب البنكي الرئيسي", income: 650000, expense: 300000, balance: 350000 },
  { account: "الصندوق النقدي", income: 350000, expense: 275000, balance: 75000 },
  { account: "حساب بطاقة الائتمان", income: 125000, expense: 140000, balance: -15000 }
];

const mockEntityData = [
  { name: "شركة الأمل للتجارة", type: EntityType.CUSTOMER, income: 250000, expense: 0, balance: 250000 },
  { name: "مؤسسة النور للتجارة", type: EntityType.CUSTOMER, income: 175000, expense: 0, balance: 175000 },
  { name: "مورد النخبة للأجهزة", type: EntityType.SUPPLIER, income: 0, expense: 150000, balance: -150000 },
  { name: "الشركة العالمية للتوريدات", type: EntityType.SUPPLIER, income: 0, expense: 125000, balance: -125000 }
];

// ترجمة أنواع الكيانات
const entityTypeLabels: Record<EntityType, string> = {
  [EntityType.CUSTOMER]: "عميل",
  [EntityType.SUPPLIER]: "مورد",
  [EntityType.EMPLOYEE]: "موظف",
  [EntityType.COMPANY]: "الشركة",
  [EntityType.OTHER]: "أخرى"
};

export default function FinancialReportsPage() {
  const router = useRouter();
  const [reportPeriod, setReportPeriod] = useState("yearly");
  const [selectedDateRange, setSelectedDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [activeTab, setActiveTab] = useState("summary");

  // إجمالي الإيرادات
  const totalIncome = mockMonthlyData.reduce((sum, month) => sum + month.income, 0);
  
  // إجمالي المصروفات
  const totalExpenses = mockMonthlyData.reduce((sum, month) => sum + month.expense, 0);
  
  // صافي الربح
  const netProfit = totalIncome - totalExpenses;
  
  // نسبة الربح
  const profitMargin = (netProfit / totalIncome) * 100;

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
              onClick={() => router.push("/transactions")}
            >
              <ArrowLeft className="h-4 w-4 icon-directional" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">التقارير المالية</h1>
          </div>
          <p className="text-muted-foreground mt-1">تحليل وإحصائيات الأداء المالي</p>
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
                <h3 className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</h3>
                <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{totalIncome.toLocaleString()} ل.س</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">إجمالي المصروفات</h3>
                <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">{totalExpenses.toLocaleString()} ل.س</p>
              </div>
              <ArrowDownLeft className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">صافي الربح</h3>
                <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{netProfit.toLocaleString()} ل.س</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-50 dark:bg-purple-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">نسبة الربح</h3>
                <p className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400">{profitMargin.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="summary">ملخص</TabsTrigger>
          <TabsTrigger value="income">الإيرادات</TabsTrigger>
          <TabsTrigger value="expenses">المصروفات</TabsTrigger>
          <TabsTrigger value="accounts">الحسابات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ملخص الأداء المالي</CardTitle>
              <CardDescription>
                نظرة عامة على الأداء المالي خلال الفترة المحددة
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
                    <TableHead>الإيرادات</TableHead>
                    <TableHead>المصروفات</TableHead>
                    <TableHead>الرصيد</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMonthlyData.map((month) => (
                    <TableRow key={month.month}>
                      <TableCell className="font-medium">{month.month}</TableCell>
                      <TableCell className="text-green-600 dark:text-green-400">{month.income.toLocaleString()} ل.س</TableCell>
                      <TableCell className="text-red-600 dark:text-red-400">{month.expense.toLocaleString()} ل.س</TableCell>
                      <TableCell className={month.balance >= 0 ? "text-blue-600 dark:text-blue-400" : "text-red-600 dark:text-red-400"}>
                        {month.balance.toLocaleString()} ل.س
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>توزيع الإيرادات حسب الفئة</CardTitle>
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
                      <TableHead>المبلغ</TableHead>
                      <TableHead>النسبة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCategoryData.map((category) => (
                      <TableRow key={category.category}>
                        <TableCell className="font-medium">{category.category}</TableCell>
                        <TableCell>{category.amount.toLocaleString()} ل.س</TableCell>
                        <TableCell>{category.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>توزيع المصروفات حسب الفئة</CardTitle>
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
                      <TableHead>المبلغ</TableHead>
                      <TableHead>النسبة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockExpenseCategoryData.map((category) => (
                      <TableRow key={category.category}>
                        <TableCell className="font-medium">{category.category}</TableCell>
                        <TableCell>{category.amount.toLocaleString()} ل.س</TableCell>
                        <TableCell>{category.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="income" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقرير الإيرادات</CardTitle>
              <CardDescription>
                تحليل مفصل للإيرادات خلال الفترة المحددة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-md flex items-center justify-center mb-6">
                <BarChart4 className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground mr-2">سيتم عرض رسم بياني هنا</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</h3>
                        <p className="text-xl font-bold mt-1 text-green-600 dark:text-green-400">{totalIncome.toLocaleString()} ل.س</p>
                      </div>
                      <ArrowUpRight className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">متوسط الإيرادات الشهرية</h3>
                        <p className="text-xl font-bold mt-1 text-green-600 dark:text-green-400">
                          {(totalIncome / mockMonthlyData.length).toLocaleString()} ل.س
                        </p>
                      </div>
                      <BarChart4 className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">أعلى فئة إيرادات</h3>
                        <p className="text-xl font-bold mt-1 text-green-600 dark:text-green-400">
                          {mockCategoryData[0].category}
                        </p>
                      </div>
                      <PieChart className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">أعلى 5 مصادر للإيرادات</h3>
                <div className="space-y-4">
                  {mockEntityData
                    .filter(entity => entity.income > 0)
                    .sort((a, b) => b.income - a.income)
                    .slice(0, 5)
                    .map((entity, index) => (
                    <div key={entity.name} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div className="ml-4 rtl:mr-4 flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{entity.name} <span className="text-xs text-muted-foreground">({entityTypeLabels[entity.type]})</span></p>
                          <p className="font-bold text-green-600 dark:text-green-400">{entity.income.toLocaleString()} ل.س</p>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full mt-2">
                          <div 
                            className="bg-green-600 dark:bg-green-400 h-2 rounded-full" 
                            style={{ 
                              width: `${(entity.income / mockEntityData[0].income) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expenses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقرير المصروفات</CardTitle>
              <CardDescription>
                تحليل مفصل للمصروفات خلال الفترة المحددة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-md flex items-center justify-center mb-6">
                <BarChart4 className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground mr-2">سيتم عرض رسم بياني هنا</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">إجمالي المصروفات</h3>
                        <p className="text-xl font-bold mt-1 text-red-600 dark:text-red-400">{totalExpenses.toLocaleString()} ل.س</p>
                      </div>
                      <ArrowDownLeft className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">متوسط المصروفات الشهرية</h3>
                        <p className="text-xl font-bold mt-1 text-red-600 dark:text-red-400">
                          {(totalExpenses / mockMonthlyData.length).toLocaleString()} ل.س
                        </p>
                      </div>
                      <BarChart4 className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">أعلى فئة مصروفات</h3>
                        <p className="text-xl font-bold mt-1 text-red-600 dark:text-red-400">
                          {mockExpenseCategoryData[0].category}
                        </p>
                      </div>
                      <PieChart className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">أعلى 5 مصادر للمصروفات</h3>
                <div className="space-y-4">
                  {mockEntityData
                    .filter(entity => entity.expense > 0)
                    .sort((a, b) => b.expense - a.expense)
                    .slice(0, 5)
                    .map((entity, index) => (
                    <div key={entity.name} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                        {index + 1}
                      </div>
                      <div className="ml-4 rtl:mr-4 flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-medium">{entity.name} <span className="text-xs text-muted-foreground">({entityTypeLabels[entity.type]})</span></p>
                          <p className="font-bold text-red-600 dark:text-red-400">{entity.expense.toLocaleString()} ل.س</p>
                        </div>
                        <div className="w-full bg-muted h-2 rounded-full mt-2">
                          <div 
                            className="bg-red-600 dark:bg-red-400 h-2 rounded-full" 
                            style={{ 
                              width: `${(entity.expense / mockEntityData.filter(e => e.expense > 0)[0].expense) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="accounts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقرير الحسابات</CardTitle>
              <CardDescription>
                تحليل مفصل للحسابات المالية خلال الفترة المحددة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {mockAccountsData.map((account) => (
                  <Card key={account.account} className={`bg-muted/50 ${account.balance >= 0 ? "border-green-200 dark:border-green-800" : "border-red-200 dark:border-red-800"}`}>
                    <CardContent className="p-4">
                      <h3 className="font-medium">{account.account}</h3>
                      <p className={`text-xl font-bold mt-2 ${account.balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {account.balance.toLocaleString()} ل.س
                      </p>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-green-600 dark:text-green-400">+ {account.income.toLocaleString()}</span>
                        <span className="text-red-600 dark:text-red-400">- {account.expense.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="h-64 bg-muted rounded-md flex items-center justify-center mb-6">
                <BarChart4 className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground mr-2">سيتم عرض رسم بياني هنا</p>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الحساب</TableHead>
                    <TableHead>الإيرادات</TableHead>
                    <TableHead>المصروفات</TableHead>
                    <TableHead>الرصيد</TableHead>
                    <TableHead>نسبة الاستخدام</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAccountsData.map((account) => {
                    const totalTransactions = account.income + account.expense;
                    const totalAllTransactions = mockAccountsData.reduce((sum, acc) => sum + acc.income + acc.expense, 0);
                    const usagePercentage = (totalTransactions / totalAllTransactions) * 100;
                    
                    return (
                      <TableRow key={account.account}>
                        <TableCell className="font-medium">{account.account}</TableCell>
                        <TableCell className="text-green-600 dark:text-green-400">{account.income.toLocaleString()} ل.س</TableCell>
                        <TableCell className="text-red-600 dark:text-red-400">{account.expense.toLocaleString()} ل.س</TableCell>
                        <TableCell className={account.balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                          {account.balance.toLocaleString()} ل.س
                        </TableCell>
                        <TableCell>{usagePercentage.toFixed(1)}%</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}