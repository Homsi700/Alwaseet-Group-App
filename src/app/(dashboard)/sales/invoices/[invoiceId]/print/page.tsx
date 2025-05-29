/**
 * صفحة طباعة الفاتورة
 * تعرض الفاتورة بتنسيق مناسب للطباعة
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { ArrowLeft, Printer, Download, Loader2 } from 'lucide-react';
import { Invoice, InvoiceItem } from '@/lib/types';

interface PrintInvoiceProps {
  params: {
    invoiceId: string;
  };
}

export default function PrintInvoicePage({ params }: PrintInvoiceProps) {
  const router = useRouter();
  const { invoiceId } = params;
  const printRef = useRef<HTMLDivElement>(null);
  
  const [isLoading, setIsLoading] = useState(true);
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

  // دالة للطباعة
  const handlePrint = () => {
    window.print();
  };

  // دالة لتحميل الفاتورة كملف PDF
  const handleDownloadPDF = () => {
    // هنا يمكن إضافة منطق لتحويل الفاتورة إلى ملف PDF وتحميله
    // يمكن استخدام مكتبات مثل html2pdf.js أو jspdf
    toast({
      title: 'تحميل PDF',
      description: 'سيتم إضافة هذه الميزة قريبًا',
    });
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
    <div className="flex-1 p-4 md:p-8 pt-6">
      {/* أزرار التحكم (تظهر فقط على الشاشة وليس عند الطباعة) */}
      <div className="flex justify-between mb-6 print:hidden">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          العودة
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="ml-2 h-4 w-4" />
            تحميل PDF
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </Button>
        </div>
      </div>

      {/* محتوى الفاتورة للطباعة */}
      <div ref={printRef} className="bg-white p-6 rounded-lg shadow-sm print:shadow-none max-w-4xl mx-auto">
        {/* رأس الفاتورة */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">فاتورة مبيعات</h1>
            <p className="text-gray-600">رقم الفاتورة: {invoice.invoiceNumber}</p>
            <p className="text-gray-600">التاريخ: {new Date(invoice.invoiceDate).toLocaleDateString('ar-SA')}</p>
            <p className="text-gray-600">الحالة: {translateStatus(invoice.status)}</p>
          </div>
          <div className="text-left">
            {invoice.companyLogo ? (
              <div className="w-32 h-32 relative">
                <Image
                  src={invoice.companyLogo}
                  alt={invoice.companyName || 'شعار الشركة'}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-gray-100 flex items-center justify-center rounded">
                <span className="text-gray-400 text-lg font-bold">{invoice.companyName || 'الشركة'}</span>
              </div>
            )}
          </div>
        </div>

        {/* معلومات الشركة والعميل */}
        <div className="flex justify-between mb-8">
          <div className="w-1/2 pl-4">
            <h2 className="text-lg font-bold mb-2 pb-1 border-b">معلومات الشركة</h2>
            <p className="mb-1"><strong>الاسم:</strong> {invoice.companyName || '-'}</p>
            <p className="mb-1"><strong>العنوان:</strong> {invoice.companyAddress || '-'}</p>
            <p className="mb-1"><strong>الهاتف:</strong> {invoice.companyPhone || '-'}</p>
            <p className="mb-1"><strong>البريد الإلكتروني:</strong> {invoice.companyEmail || '-'}</p>
            <p className="mb-1"><strong>الرقم الضريبي:</strong> {invoice.companyTaxNumber || '-'}</p>
          </div>
          <div className="w-1/2 pr-4">
            <h2 className="text-lg font-bold mb-2 pb-1 border-b">معلومات العميل</h2>
            <p className="mb-1"><strong>الاسم:</strong> {invoice.customerName || '-'}</p>
            <p className="mb-1"><strong>العنوان:</strong> {invoice.customerAddress || '-'}</p>
            <p className="mb-1"><strong>الهاتف:</strong> {invoice.customerPhone || '-'}</p>
            <p className="mb-1"><strong>البريد الإلكتروني:</strong> {invoice.customerEmail || '-'}</p>
            <p className="mb-1"><strong>الرقم الضريبي:</strong> {invoice.customerTaxNumber || '-'}</p>
          </div>
        </div>

        {/* بنود الفاتورة */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2 pb-1 border-b">بنود الفاتورة</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>المنتج</TableHead>
                <TableHead>الكمية</TableHead>
                <TableHead>سعر الوحدة</TableHead>
                <TableHead>الخصم</TableHead>
                <TableHead>الضريبة</TableHead>
                <TableHead className="text-left">الإجمالي</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={item.invoiceItemId}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell>{item.quantity} {item.unitOfMeasure || ''}</TableCell>
                  <TableCell>{item.unitPrice.toFixed(2)} ل.س</TableCell>
                  <TableCell>
                    {item.discountPercent > 0
                      ? `${item.discountAmount.toFixed(2)} ل.س (${item.discountPercent}%)`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {item.taxPercent > 0
                      ? `${item.taxAmount.toFixed(2)} ل.س (${item.taxPercent}%)`
                      : '-'}
                  </TableCell>
                  <TableCell className="text-left">{item.lineTotal.toFixed(2)} ل.س</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* إجماليات الفاتورة */}
        <div className="flex justify-end mb-8">
          <div className="w-1/3">
            <div className="border rounded-md p-4">
              <div className="flex justify-between mb-2">
                <span>المجموع الفرعي:</span>
                <span>{invoice.subTotal.toFixed(2)} ل.س</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>الخصم ({invoice.discountPercent}%):</span>
                <span>{invoice.discountAmount.toFixed(2)} ل.س</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>الضريبة ({invoice.taxPercent}%):</span>
                <span>{invoice.taxAmount.toFixed(2)} ل.س</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>الإجمالي:</span>
                <span>{invoice.totalAmount.toFixed(2)} ل.س</span>
              </div>
              <div className="flex justify-between mt-2">
                <span>المبلغ المدفوع:</span>
                <span>{invoice.amountPaid.toFixed(2)} ل.س</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>المبلغ المتبقي:</span>
                <span>{invoice.amountDue.toFixed(2)} ل.س</span>
              </div>
            </div>
          </div>
        </div>

        {/* ملاحظات الفاتورة */}
        {invoice.notes && (
          <div className="mb-8">
            <h2 className="text-lg font-bold mb-2 pb-1 border-b">ملاحظات</h2>
            <p className="text-gray-600">{invoice.notes}</p>
          </div>
        )}

        {/* تذييل الفاتورة */}
        <div className="text-center text-gray-500 text-sm mt-8 pt-4 border-t">
          <p>تم إنشاء هذه الفاتورة بواسطة نظام الوسيط للإدارة</p>
          <p>جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}