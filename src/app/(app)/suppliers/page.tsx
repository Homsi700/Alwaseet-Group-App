
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, PlusCircle, Filter, FileText } from "lucide-react";

// بيانات موردين وهمية
const mockSuppliers = [
  { id: "SUP001", name: "مورد النخبة للأجهزة", contactPerson: "أحمد خالد", phone: "0911111111", email: "sales@elite.com" },
  { id: "SUP002", name: "الشركة العالمية للتوريدات", contactPerson: "فاطمة علي", phone: "0922222222", email: "global@supplies.com" },
  { id: "SUP003", name: "مؤسسة الإمداد السريع", contactPerson: "عمر ياسين", phone: "0933333333", email: "info@fastsupply.co" },
];

export default function SuppliersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">إدارة الموردين</h1>
        <Button className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إضافة مورد جديد
        </Button>
      </div>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على الموردين
          </CardTitle>
          <CardDescription>
            تتبع مورديك، وإدارة معلومات الاتصال، ومراقبة سجل الشراء، وتقييم أداء الموردين.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Button variant="outline" className="rounded-md">
              <Filter className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تصفية الموردين
            </Button>
             <Button variant="outline" className="rounded-md">
              <FileText className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تصدير القائمة
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المورد</TableHead>
                  <TableHead>مسؤول الاتصال</TableHead>
                  <TableHead>رقم الهاتف</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.contactPerson}</TableCell>
                    <TableCell>{supplier.phone || "-"}</TableCell>
                    <TableCell>{supplier.email || "-"}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" className="rounded-md">عرض</Button>
                      <Button variant="ghost" size="sm" className="rounded-md">تعديل</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {mockSuppliers.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                           لا يوجد موردون لعرضهم. قم بإضافة مورد جديد.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            يساعدك هذا القسم على إدارة علاقاتك مع الموردين بفعالية، بما في ذلك تتبع أوامر الشراء والفواتير المستلمة.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
