/**
 * صفحة عرض تفاصيل الفاتورة
 * تعرض تفاصيل فاتورة محددة مع إمكانية الطباعة والتحرير
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Printer, ArrowLeft, Edit, Trash2, FileDown, Loader2 } from 'lucide-react';
import { Invoice, InvoiceItem } from '@/lib/types';

interface InvoiceDetailsProps {
  params: {
    invoiceId: string;
  };
}

export default function InvoiceDetailsPage({ params }: InvoiceDetailsProps) {
  const router = useRouter();
  const { invoiceId } = params;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // جلب تفاصيل الفاتورة عند تحميل الصفحة
  useEffect(() => {
    const fetchInvoiceDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/sales/invoices/${invoiceId}`);
        
        if (!response.ok) {
          let errorMessage = `فشل في جلب تفاصيل الفاتورة (${response.status})`;
          
          try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (error) {
            console.error('خطأ في قراءة استجابة الخطأ:', error);
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        setInvoice(data.data.invoice);
        setItems(data.data.items);
      } catch (error: any) {
        console.error('خطأ في جلب تفاصيل الفاتورة:', error);
        
        toast({
          variant: 'destructive',
          title: 'خطأ في جلب تفاصيل الفاتورة',
          description: error.message || 'حدث خطأ أثناء جلب تفاصيل الفاتورة',
        });
        
        // العودة إلى صفحة الفواتير في حالة حدوث خطأ
        router.push('/sales/invoices');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvoiceDetails();
  }, [invoiceId, router]);

  // دالة لحذف الفاتورة
  const handleDeleteInvoice = async () => {
    try {
      setIsDeleting(true);
      
      const response = await fetch(`/sales/invoices/${invoiceId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        let errorMessage = `فشل في حذف الفاتورة (${response.status})`;
        
        try {
          const errorData = await response.json();
          if (errorData && errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (error) {
          console.error('خطأ في قراءة استجابة الخطأ:', error);
        }
        
        throw new Error(errorMessage);
      }
      
      toast({
        title: 'تم حذف الفاتورة بنجاح',
        description: 'تم حذف الفاتورة واسترجاع كميات المنتجات',
      });
      
      // العودة إلى صفحة الفواتير بعد الحذف
      router.push('/sales/invoices');
    } catch (error: any) {
      console.error('خطأ في حذف الفاتورة:', error);
      
      toast({
        variant: 'destructive',
        title: 'خطأ في حذف الفاتورة',
        description: error.message || 'حدث خطأ أثناء حذف الفاتورة',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // دالة لطباعة الفاتورة
  const handlePrintInvoice = () => {
    router.push(`/sales/invoices/${invoiceId}/print`);
  };

  // دالة لتحديد لون حالة الفاتورة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-100 text-green-800';
      case 'Unpaid':
        return 'bg-red-100 text-red-800';
      case 'PartiallyPaid':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'Refunded':
        return 'bg-purple-100 text-purple-800';
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // دالة لترجمة حالة الفاتورة
  const translateStatus = (status: string) => {
    switch (status) {
      case 'Paid':
        return 'مدفوعة';
      case 'Unpaid':
        return 'غير مدفوعة';
      case 'PartiallyPaid':
        return 'مدفوعة جزئياً';
      case 'Completed':
        return 'مكتملة';
      case 'Pending':
        return 'معلقة';
      case 'Cancelled':
        return 'ملغاة';
      case 'Refunded':
        return 'مستردة';
      case 'Draft':
        return 'مسودة';
      default:
        return status;
    }
  };

  // عرض حالة التحميل
  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>جاري تحميل تفاصيل الفاتورة...</p>
        </div>
      </div>
    );
  }

  // التحقق من وجود الفاتورة
  if (!invoice) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">الفاتورة غير موجودة</h2>
          <Button onClick={() => router.push('/sales/invoices')}>
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة إلى قائمة الفواتير
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">تفاصيل الفاتورة</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة
          </Button>
          <Button variant="outline" onClick={handlePrintInvoice}>
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </Button>
          <Link href={`/sales/invoices/${invoiceId}/edit`} passHref>
            <Button variant="outline">
              <Edit className="ml-2 h-4 w-4" />
              تحرير
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="ml-2 h-4 w-4" />
                حذف
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد من حذف هذه الفاتورة؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف الفاتورة نهائياً واسترجاع كميات المنتجات إلى المخزون. هذا الإجراء لا يمكن التراجع عنه.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteInvoice} disabled={isDeleting}>
                  {isDeleting ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      جاري الحذف...
                    </>
                  ) : (
                    'تأكيد الحذف'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {/* معلومات الفاتورة */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات الفاتورة</CardTitle>
            <CardDescription>تفاصيل أساسية عن الفاتورة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">رقم الفاتورة:</span>
              <span>{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">تاريخ الفاتورة:</span>
              <span>{new Date(invoice.invoiceDate).toLocaleDateString('ar-SA')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">طريقة الدفع:</span>
              <span>{invoice.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">حالة الفاتورة:</span>
              <Badge className={getStatusColor(invoice.status)}>
                {translateStatus(invoice.status)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">تاريخ الإنشاء:</span>
              <span>{invoice.createdAt ? new Date(invoice.createdAt).toLocaleDateString('ar-SA') : '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">تاريخ التحديث:</span>
              <span>{invoice.updatedAt ? new Date(invoice.updatedAt).toLocaleDateString('ar-SA') : '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">منشئ الفاتورة:</span>
              <span>{invoice.createdByFirstName} {invoice.createdByLastName}</span>
            </div>
            {invoice.notes && (
              <div className="pt-2">
                <span className="font-semibold block mb-1">ملاحظات:</span>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* معلومات العميل */}
        <Card>
          <CardHeader>
            <CardTitle>معلومات العميل</CardTitle>
            <CardDescription>بيانات العميل المرتبط بالفاتورة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold">اسم العميل:</span>
              <span>{invoice.customerName || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">رقم الهاتف:</span>
              <span>{invoice.customerPhone || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">البريد الإلكتروني:</span>
              <span>{invoice.customerEmail || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">العنوان:</span>
              <span>{invoice.customerAddress || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">الرقم الضريبي:</span>
              <span>{invoice.customerTaxNumber || '-'}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between items-center">
              <span className="font-semibold">اسم الشركة:</span>
              <span>{invoice.companyName || '-'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold">الرقم الضريبي للشركة:</span>
              <span>{invoice.companyTaxNumber || '-'}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* بنود الفاتورة */}
      <Card>
        <CardHeader>
          <CardTitle>بنود الفاتورة</CardTitle>
          <CardDescription>قائمة المنتجات المضافة إلى الفاتورة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المنتج</TableHead>
                  <TableHead>الباركود</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>وحدة القياس</TableHead>
                  <TableHead>سعر الوحدة</TableHead>
                  <TableHead>الخصم</TableHead>
                  <TableHead>الضريبة</TableHead>
                  <TableHead>الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      لا توجد بنود في هذه الفاتورة
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.invoiceItemId}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.productBarcode || '-'}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unitOfMeasure || '-'}</TableCell>
                      <TableCell>{item.unitPrice.toFixed(2)} ل.س</TableCell>
                      <TableCell>
                        {item.discountPercent > 0
                          ? `${item.discountPercent}% (${item.discountAmount.toFixed(2)} ل.س)`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {item.taxPercent > 0
                          ? `${item.taxPercent}% (${item.taxAmount.toFixed(2)} ل.س)`
                          : '-'}
                      </TableCell>
                      <TableCell className="font-semibold">{item.lineTotal.toFixed(2)} ل.س</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* إجماليات الفاتورة */}
      <Card>
        <CardHeader>
          <CardTitle>إجماليات الفاتورة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-md mr-auto">
            <div className="space-y-2">
              <div className="flex justify-between py-1">
                <span>المجموع الفرعي:</span>
                <span>{invoice.subTotal.toFixed(2)} ل.س</span>
              </div>
              <div className="flex justify-between py-1">
                <span>الخصم ({invoice.discountPercent}%):</span>
                <span>{invoice.discountAmount.toFixed(2)} ل.س</span>
              </div>
              <div className="flex justify-between py-1">
                <span>الضريبة ({invoice.taxPercent}%):</span>
                <span>{invoice.taxAmount.toFixed(2)} ل.س</span>
              </div>
              <Separator />
              <div className="flex justify-between py-1 font-bold">
                <span>الإجمالي:</span>
                <span>{invoice.totalAmount.toFixed(2)} ل.س</span>
              </div>
              <div className="flex justify-between py-1">
                <span>المبلغ المدفوع:</span>
                <span>{invoice.amountPaid.toFixed(2)} ل.س</span>
              </div>
              <div className="flex justify-between py-1 font-bold">
                <span>المبلغ المتبقي:</span>
                <span>{invoice.amountDue.toFixed(2)} ل.س</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" onClick={handlePrintInvoice}>
            <Printer className="ml-2 h-4 w-4" />
            طباعة الفاتورة
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}