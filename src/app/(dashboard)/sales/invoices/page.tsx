/**
 * صفحة قائمة الفواتير
 * تعرض قائمة بجميع الفواتير مع إمكانية البحث والتصفية
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Search, FileDown, Filter } from 'lucide-react';

export const metadata: Metadata = {
  title: 'الفواتير | نظام الوسيط',
  description: 'إدارة فواتير المبيعات',
};

export default function InvoicesPage() {
  // هنا يمكن إضافة منطق جلب البيانات من الخادم
  // في هذا المثال، نستخدم بيانات وهمية
  const invoices = [
    {
      id: 1,
      invoiceNumber: 'INV-2023-001',
      date: '2023-05-15',
      customer: 'شركة الأمل',
      amount: 1250.75,
      status: 'مدفوعة',
    },
    {
      id: 2,
      invoiceNumber: 'INV-2023-002',
      date: '2023-05-16',
      customer: 'مؤسسة النور',
      amount: 850.50,
      status: 'معلقة',
    },
    {
      id: 3,
      invoiceNumber: 'INV-2023-003',
      date: '2023-05-17',
      customer: 'شركة المستقبل',
      amount: 2100.00,
      status: 'مدفوعة جزئياً',
    },
    {
      id: 4,
      invoiceNumber: 'INV-2023-004',
      date: '2023-05-18',
      customer: 'مؤسسة الإبداع',
      amount: 1500.25,
      status: 'مدفوعة',
    },
    {
      id: 5,
      invoiceNumber: 'INV-2023-005',
      date: '2023-05-19',
      customer: 'شركة التقدم',
      amount: 3200.00,
      status: 'ملغاة',
    },
  ];

  // دالة لتحديد لون حالة الفاتورة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'مدفوعة':
        return 'bg-green-100 text-green-800';
      case 'معلقة':
        return 'bg-yellow-100 text-yellow-800';
      case 'مدفوعة جزئياً':
        return 'bg-blue-100 text-blue-800';
      case 'ملغاة':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">الفواتير</h2>
        <div className="flex items-center gap-2">
          <Link href="/sales/invoices/create" passHref>
            <Button>
              <PlusCircle className="ml-2 h-4 w-4" />
              فاتورة جديدة
            </Button>
          </Link>
          <Button variant="outline">
            <FileDown className="ml-2 h-4 w-4" />
            تصدير
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>فواتير المبيعات</CardTitle>
          <CardDescription>
            إدارة فواتير المبيعات وعرض تفاصيلها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="بحث عن فاتورة..." className="flex-1" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="ml-2 h-4 w-4" />
              تصفية
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الفاتورة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>العميل</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-left">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      <Link href={`/sales/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
                        {invoice.invoiceNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>{invoice.amount.toFixed(2)} ر.س</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link href={`/sales/invoices/${invoice.id}`} passHref>
                          <Button variant="ghost" size="sm">
                            عرض
                          </Button>
                        </Link>
                        <Link href={`/sales/invoices/${invoice.id}/print`} passHref>
                          <Button variant="ghost" size="sm">
                            طباعة
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}