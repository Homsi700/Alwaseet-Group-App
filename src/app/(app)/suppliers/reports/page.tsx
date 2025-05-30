"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BarChart4, Download, FileText, PieChart, TrendingUp, Truck } from "lucide-react";

// بيانات وهمية للتقارير
const mockSuppliersData = [
  { 
    id: 1, 
    name: "مورد النخبة للأجهزة", 
    category: "إلكترونيات",
    orderCount: 5,
    totalAmount: 150000,
    paidAmount: 120000,
    dueAmount: 30000,
    rating: 4.5
  },
  { 
    id: 2, 
    name: "الشركة العالمية للتوريدات", 
    category: "قرطاسية",
    orderCount: 8,
    totalAmount: 75000,
    paidAmount: 75000,
    dueAmount: 0,
    rating: 3.8
  },
  { 
    id: 3, 
    name: "مؤسسة الإمداد السريع", 
    category: "أثاث",
    orderCount: 3,
    totalAmount: 220000,
    paidAmount: 180000,
    dueAmount: 40000,
    rating: 4.2
  },
  { 
    id: 4, 
    name: "شركة الغذاء الصحي", 
    category: "مواد غذائية",
    orderCount: 12,
    totalAmount: 95000,
    paidAmount: 95000,
    dueAmount: 0,
    rating: 4.7
  },
  { 
    id: 5, 
    name: "مؤسسة الخدمات التقنية", 
    category: "خدمات",
    orderCount: 2,
    totalAmount: 45000,
    paidAmount: 25000,
    dueAmount: 20000,
    rating: 3.5
  },
];

const mockCategoryData = [
  { category: "إلكترونيات", orderCount: 5, totalAmount: 150000, supplierCount: 1 },
  { category: "قرطاسية", orderCount: 8, totalAmount: 75000, supplierCount: 1 },
  { category: "أثاث", orderCount: 3, totalAmount: 220000, supplierCount: 1 },
  { category: "مواد غذائية", orderCount: 12, totalAmount: 95000, supplierCount: 1 },
  { category: "خدمات", orderCount: 2, totalAmount: 45000, supplierCount: 1 },
];

const mockMonthlyData = [
  { month: "يناير", orderCount: 5, totalAmount: 120000 },
  { month: "فبراير", orderCount: 3, totalAmount: 85000 },
  { month: "مارس", orderCount: 7, totalAmount: 150000 },
  { month: "أبريل", orderCount: 4, totalAmount: 95000 },
  { month: "مايو", orderCount: 6, totalAmount: 135000 },
  { month: "يونيو", orderCount: 8, totalAmount: 180000 },
  { month: "يوليو", orderCount: 2, totalAmount: 45000 },
];

export default function SuppliersReportsPage() {
  const router = useRouter();
  const [reportPeriod, setReportPeriod] = useState("yearly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // إجمالي المشتريات
  const totalPurchases = mockSuppliersData.reduce((sum, supplier) => sum + supplier.totalAmount, 0);
  
  // إجمالي المبالغ المستحقة
  const totalDueAmount = mockSuppliersData.reduce((sum, supplier) => sum + supplier.dueAmount, 0);
  
  // إجمالي عدد أوامر الشراء
  const totalOrders = mockSuppliersData.reduce((sum, supplier) => sum + supplier.orderCount, 0);
  
  // متوسط التقييم
  const averageRating = mockSuppliersData.reduce((sum, supplier) => sum + supplier.rating, 0) / mockSuppliersData.length;

  // تصدير التقرير (محاكاة)
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
              onClick={() => router.push("/suppliers")}
            >
              <ArrowLeft className="h-4 w-4 icon-directional" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">تقارير الموردين</h1>
          </div>
          <p className="text-muted-foreground mt-1">تحليل وإحصائيات المشتريات والموردين</p>
        </div>
        
        <Button 
          variant="outline" 
          className="rounded-md"
          onClick={handleExportReport}
        >
          <Download className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> تصدير التقرير
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">إجمالي الموردين</h3>
                <p className="text-2xl font-bold mt-1">{mockSuppliersData.length}</p>
              </div>
              <Truck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">إجمالي المشتريات</h3>
                <p className="text-2xl font-bold mt-1">{totalPurchases.toLocaleString()} ل.س</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">المبالغ المستحقة</h3>
                <p className="text-2xl font-bold mt-1">{totalDueAmount.toLocaleString()} ل.س</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">متوسط التقييم</h3>
                <p className="text-2xl font-bold mt-1">{averageRating.toFixed(1)}</p>
              </div>
              <BarChart4 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>فلترة التقارير</CardTitle>
          <CardDescription>
            حدد الفترة الزمنية والفئة لعرض التقارير المناسبة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
              <>
                <div className="space-y-2">
                  <Label>من تاريخ</Label>
                  <Input 
                    type="date" 
                    className="rounded-md" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>إلى تاريخ</Label>
                  <Input 
                    type="date" 
                    className="rounded-md" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label>الفئة</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="rounded-md">
                  <SelectValue placeholder="جميع الفئات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفئات</SelectItem>
                  <SelectItem value="إلكترونيات">إلكترونيات</SelectItem>
                  <SelectItem value="قرطاسية">قرطاسية</SelectItem>
                  <SelectItem value="أثاث">أثاث</SelectItem>
                  <SelectItem value="مواد غذائية">مواد غذائية</SelectItem>
                  <SelectItem value="خدمات">خدمات</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="suppliers">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="suppliers">تقرير الموردين</TabsTrigger>
          <TabsTrigger value="categories">تقرير الفئات</TabsTrigger>
          <TabsTrigger value="trends">تقرير الاتجاهات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقرير الموردين</CardTitle>
              <CardDescription>
                تحليل المشتريات حسب المورد
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المورد</TableHead>
                    <TableHead>الفئة</TableHead>
                    <TableHead>عدد الطلبات</TableHead>
                    <TableHead>إجمالي المشتريات</TableHead>
                    <TableHead>المبالغ المدفوعة</TableHead>
                    <TableHead>المبالغ المستحقة</TableHead>
                    <TableHead>التقييم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSuppliersData
                    .filter(supplier => selectedCategory === "all" || supplier.category === selectedCategory)
                    .map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.category}</TableCell>
                      <TableCell>{supplier.orderCount}</TableCell>
                      <TableCell>{supplier.totalAmount.toLocaleString()} ل.س</TableCell>
                      <TableCell>{supplier.paidAmount.toLocaleString()} ل.س</TableCell>
                      <TableCell>{supplier.dueAmount.toLocaleString()} ل.س</TableCell>
                      <TableCell>{supplier.rating}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <h3 className="text-lg font-medium mb-4">توزيع المشتريات حسب المورد</h3>
                <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                  <PieChart className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground mr-2">سيتم عرض رسم بياني هنا</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقرير الفئات</CardTitle>
              <CardDescription>
                تحليل المشتريات حسب فئة المورد
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الفئة</TableHead>
                    <TableHead>عدد الموردين</TableHead>
                    <TableHead>عدد الطلبات</TableHead>
                    <TableHead>إجمالي المشتريات</TableHead>
                    <TableHead>النسبة المئوية</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCategoryData
                    .filter(category => selectedCategory === "all" || category.category === selectedCategory)
                    .map((category) => (
                    <TableRow key={category.category}>
                      <TableCell className="font-medium">{category.category}</TableCell>
                      <TableCell>{category.supplierCount}</TableCell>
                      <TableCell>{category.orderCount}</TableCell>
                      <TableCell>{category.totalAmount.toLocaleString()} ل.س</TableCell>
                      <TableCell>
                        {((category.totalAmount / totalPurchases) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <h3 className="text-lg font-medium mb-4">توزيع المشتريات حسب الفئة</h3>
                <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                  <PieChart className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground mr-2">سيتم عرض رسم بياني هنا</p>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تقرير الاتجاهات</CardTitle>
              <CardDescription>
                تحليل اتجاهات المشتريات على مر الزمن
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الفترة</TableHead>
                    <TableHead>عدد الطلبات</TableHead>
                    <TableHead>إجمالي المشتريات</TableHead>
                    <TableHead>متوسط قيمة الطلب</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockMonthlyData.map((data) => (
                    <TableRow key={data.month}>
                      <TableCell className="font-medium">{data.month}</TableCell>
                      <TableCell>{data.orderCount}</TableCell>
                      <TableCell>{data.totalAmount.toLocaleString()} ل.س</TableCell>
                      <TableCell>
                        {(data.totalAmount / data.orderCount).toLocaleString()} ل.س
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <h3 className="text-lg font-medium mb-4">اتجاهات المشتريات الشهرية</h3>
                <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                  <BarChart4 className="h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground mr-2">سيتم عرض رسم بياني هنا</p>
                </div>
              </div>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>أعلى 5 موردين</CardTitle>
              <CardDescription>
                الموردين الأكثر تعاملاً من حيث قيمة المشتريات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockSuppliersData
                  .sort((a, b) => b.totalAmount - a.totalAmount)
                  .slice(0, 5)
                  .map((supplier, index) => (
                  <div key={supplier.id} className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                    <div className="ml-4 rtl:mr-4 flex-1">
                      <div className="flex justify-between items-center">
                        <p className="font-medium">{supplier.name}</p>
                        <p className="font-bold">{supplier.totalAmount.toLocaleString()} ل.س</p>
                      </div>
                      <div className="w-full bg-muted h-2 rounded-full mt-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ 
                            width: `${(supplier.totalAmount / mockSuppliersData[0].totalAmount) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}