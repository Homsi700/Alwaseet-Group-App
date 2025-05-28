
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShoppingBag, PlusCircle, Filter, FileText } from "lucide-react";

// بيانات أوامر شراء وهمية
const mockPurchaseOrders = [
  { id: "PO001", date: "2024-04-20", supplier: "مورد النخبة للأجهزة", total: 3500.00, status: "مستلمة" },
  { id: "PO002", date: "2024-04-25", supplier: "الشركة العالمية للتوريدات", total: 1200.50, status: "قيد المعالجة" },
  { id: "PO003", date: "2024-05-02", supplier: "مؤسسة الإمداد السريع", total: 5800.00, status: "مستلمة جزئياً" },
];

export default function PurchasesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">إدارة المشتريات</h1>
        <Button className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إضافة أمر شراء
        </Button>
      </div>

      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBag className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على المشتريات
          </CardTitle>
          <CardDescription>
            إدارة أوامر الشراء، وتتبع فواتير الموردين، وتسجيل المدفوعات، والإشراف على عمليات الشراء.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Button variant="outline" className="rounded-md">
              <Filter className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تصفية الأوامر
            </Button>
            <Button variant="outline" className="rounded-md">
              <FileText className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تصدير القائمة
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الأمر</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>المورد</TableHead>
                  <TableHead className="text-right rtl:text-left">الإجمالي (ر.س)</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPurchaseOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.supplier}</TableCell>
                    <TableCell className="text-right rtl:text-left">{order.total.toFixed(2)}</TableCell>
                     <TableCell>
                       <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        order.status === "مستلمة" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        order.status === "مستلمة جزئياً" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" // قيد المعالجة
                      }`}>
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" className="rounded-md">عرض</Button>
                       <Button variant="ghost" size="sm" className="rounded-md">تعديل</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {mockPurchaseOrders.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            لا توجد أوامر شراء لعرضها. قم بإضافة أمر جديد.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
           <p className="text-sm text-muted-foreground mt-6">
            هذا القسم مخصص لإدارة دورة المشتريات بالكامل، من إنشاء أوامر الشراء إلى استلام البضائع وتسجيل فواتير الموردين.
            سيتم ربطه بوحدتي الموردين والمخزون.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
