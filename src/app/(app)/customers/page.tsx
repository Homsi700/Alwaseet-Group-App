
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, PlusCircle, Filter, FileText } from "lucide-react";

// بيانات عملاء وهمية
const mockCustomers = [
  { id: "CUST001", name: "شركة الأمل للتجارة", phone: "0987654321", email: "contact@alamal.com", balance: 1500.00 },
  { id: "CUST002", name: "مؤسسة النجاح الحديثة", phone: "0912345678", email: "info@najah.com", balance: -350.50 },
  { id: "CUST003", name: "محلات الوفاء", phone: "0933333333", email: "sales@alwafa.com", balance: 0.00 },
];

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">إدارة العملاء</h1>
        <Button className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إضافة عميل جديد
        </Button>
      </div>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على العملاء
          </CardTitle>
          <CardDescription>
            إدارة قاعدة بيانات عملائك، تتبع سجل الشراء، وإدارة الاتصالات، وتقسيم العملاء.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Button variant="outline" className="rounded-md">
              <Filter className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تصفية العملاء
            </Button>
             <Button variant="outline" className="rounded-md">
              <FileText className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تصدير القائمة
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم العميل</TableHead>
                  <TableHead>رقم الهاتف</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead className="text-right rtl:text-left">الرصيد (ر.س)</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone || "-"}</TableCell>
                    <TableCell>{customer.email || "-"}</TableCell>
                    <TableCell className={`text-right rtl:text-left font-semibold ${customer.balance > 0 ? "text-green-600 dark:text-green-400" : customer.balance < 0 ? "text-red-600 dark:text-red-400" : ""}`}>
                      {customer.balance.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" className="rounded-md">عرض</Button>
                      <Button variant="ghost" size="sm" className="rounded-md">تعديل</Button>
                    </TableCell>
                  </TableRow>
                ))}
                 {mockCustomers.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            لا يوجد عملاء لعرضهم. قم بإضافة عميل جديد.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            يتيح لك هذا القسم إدارة جميع جوانب علاقاتك مع العملاء، بما في ذلك معلومات الاتصال، سجل المعاملات،
            وإدارة الأرصدة والديون.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
