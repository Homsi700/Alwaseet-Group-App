
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, PlusCircle, Filter, FileText } from "lucide-react";

// بيانات فواتير مبيعات وهمية
const mockSalesInvoices = [
  { id: "INV001", date: "2024-05-01", customer: "شركة الأمل للتجارة", total: 1250.75, status: "مدفوعة" },
  { id: "INV002", date: "2024-05-03", customer: "مؤسسة النجاح الحديثة", total: 870.00, status: "مدفوعة جزئياً" },
  { id: "INV003", date: "2024-05-05", customer: "محلات الوفاء", total: 2300.50, status: "غير مدفوعة" },
];

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">إدارة المبيعات</h1>
        <Button className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إضافة فاتورة مبيعات
        </Button>
      </div>

      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على المبيعات
          </CardTitle>
          <CardDescription>
            تتبع طلبات المبيعات، إنشاء الفواتير، إدارة مدفوعات العملاء، وتحليل أداء المبيعات.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Button variant="outline" className="rounded-md">
              <Filter className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تصفية الفواتير
            </Button>
             <Button variant="outline" className="rounded-md">
              <FileText className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تصدير القائمة
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الفاتورة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead className="text-right rtl:text-left">الإجمالي (ر.س)</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSalesInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell className="text-right rtl:text-left">{invoice.total.toFixed(2)}</TableCell>
                    <TableCell>
                       <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        invoice.status === "مدفوعة" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        invoice.status === "مدفوعة جزئياً" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}>
                        {invoice.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" className="rounded-md">عرض</Button>
                      <Button variant="ghost" size="sm" className="rounded-md">تعديل</Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {mockSalesInvoices.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            لا توجد فواتير مبيعات لعرضها. قم بإضافة فاتورة جديدة.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            سيتم هنا عرض قائمة بفواتير المبيعات مع إمكانية البحث، الفلترة، وإضافة فواتير جديدة أو تعديل الحالية.
            كما سيتم ربط هذا القسم بوحدة العملاء والمنتجات لتتبع شامل.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
