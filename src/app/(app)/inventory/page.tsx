
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Archive, PlusCircle, Edit, PackageSearch, Repeat } from "lucide-react";

// بيانات حالة مخزون وهمية
const mockInventoryStatus = [
  { id: "prod_1", name: "تفاح عضوي (1 كجم)", category: "فواكه", quantity: 85, unit: "كجم", purchasePrice: 0.5, salePrice: 1.0, value: 42.50 },
  { id: "prod_2", name: "رغيف خبز قمح كامل", category: "مخبوزات", quantity: 40, unit: "رغيف", purchasePrice: 1.2, salePrice: 2.5, value: 48.00 },
  { id: "prod_3", name: "حليب طازج (1 لتر)", category: "ألبان", quantity: 60, unit: "لتر", purchasePrice: 0.8, salePrice: 1.5, value: 48.00 },
];


export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">إدارة المخزون</h1>
        <div className="flex gap-2">
          <Button className="rounded-md bg-accent hover:bg-accent/90 text-accent-foreground">
            <Repeat className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إجراء جرد مخزني
          </Button>
          <Button className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
            <Edit className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> تعديل كميات
          </Button>
        </div>
      </div>

      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Archive className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على المخزون
          </CardTitle>
          <CardDescription>
            مراقبة مستويات المخزون، تتبع حركات المخزون، إدارة تنوعات المنتجات، وإجراء تعديلات على المخزون.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Button variant="outline" className="rounded-md">
              <PackageSearch className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> بحث في المخزون
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المنتج</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead className="text-center">الكمية الحالية</TableHead>
                  <TableHead>الوحدة</TableHead>
                  <TableHead className="text-right rtl:text-left">قيمة المخزون (ر.س)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockInventoryStatus.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell className="text-right rtl:text-left">{item.value.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {mockInventoryStatus.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            لا توجد بيانات مخزون لعرضها.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
           <p className="text-sm text-muted-foreground mt-6">
            سيتم هنا عرض حالة المخزون الحالية لجميع المنتجات، مع إمكانية تتبع الحركات (دخول وخروج)، وإدارة عمليات الجرد والتسويات المخزنية.
            سيتم تحديث المخزون تلقائياً بناءً على عمليات البيع والشراء.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
