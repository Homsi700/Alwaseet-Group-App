/**
 * صفحة إنشاء فاتورة جديدة
 * تتيح للمستخدم إنشاء فاتورة جديدة مع إضافة المنتجات والعملاء
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { CreateInvoiceRequest, InvoiceStatus } from '@/lib/types';

export default function CreateInvoicePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [invoice, setInvoice] = useState({
    customerId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'نقدي',
    discountPercent: 0,
    taxPercent: 0,
    amountPaid: 0,
    status: InvoiceStatus.Unpaid,
    notes: '',
  });

  // جلب بيانات العملاء والمنتجات عند تحميل الصفحة
  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب بيانات العملاء
        const customersResponse = await fetch('/api/customers');
        if (customersResponse.ok) {
          const customersData = await customersResponse.json();
          setCustomers(customersData.data?.items || []);
        }

        // جلب بيانات المنتجات
        const productsResponse = await fetch('/api/products');
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData.data?.items || []);
        }
      } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
        toast({
          variant: 'destructive',
          title: 'خطأ في جلب البيانات',
          description: 'حدث خطأ أثناء جلب بيانات العملاء والمنتجات',
        });
      }
    };

    fetchData();
  }, []);

  // تحديث بيانات الفاتورة
  const handleInvoiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInvoice((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // إضافة منتج إلى الفاتورة
  const handleAddProduct = () => {
    setSelectedProducts((prev) => [
      ...prev,
      {
        productId: '',
        quantity: 1,
        unitPrice: 0,
        discountPercent: 0,
        taxPercent: 0,
      },
    ]);
  };

  // حذف منتج من الفاتورة
  const handleRemoveProduct = (index: number) => {
    setSelectedProducts((prev) => prev.filter((_, i) => i !== index));
  };

  // تحديث بيانات المنتج المحدد
  const handleProductChange = (index: number, field: string, value: any) => {
    setSelectedProducts((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      // إذا تم تحديد منتج، قم بتعبئة سعر الوحدة تلقائيًا
      if (field === 'productId') {
        const selectedProduct = products.find((p) => p.productId.toString() === value.toString());
        if (selectedProduct) {
          updated[index].unitPrice = selectedProduct.salePrice;
        }
      }

      return updated;
    });
  };

  // حساب إجماليات الفاتورة
  const calculateTotals = () => {
    let subTotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    selectedProducts.forEach((product) => {
      const quantity = parseFloat(product.quantity) || 0;
      const unitPrice = parseFloat(product.unitPrice) || 0;
      const discountPercent = parseFloat(product.discountPercent) || 0;
      const taxPercent = parseFloat(product.taxPercent) || 0;

      const lineTotal = quantity * unitPrice;
      const lineDiscount = (lineTotal * discountPercent) / 100;
      const lineTax = ((lineTotal - lineDiscount) * taxPercent) / 100;

      subTotal += lineTotal;
      totalDiscount += lineDiscount;
      totalTax += lineTax;
    });

    // تطبيق خصم الفاتورة الإجمالي
    const invoiceDiscountAmount = (subTotal * parseFloat(invoice.discountPercent.toString())) / 100;
    totalDiscount += invoiceDiscountAmount;

    // تطبيق ضريبة الفاتورة الإجمالية
    const invoiceTaxAmount = ((subTotal - totalDiscount) * parseFloat(invoice.taxPercent.toString())) / 100;
    totalTax += invoiceTaxAmount;

    const total = subTotal - totalDiscount + totalTax;

    return {
      subTotal,
      totalDiscount,
      totalTax,
      total,
    };
  };

  const { subTotal, totalDiscount, totalTax, total } = calculateTotals();

  // إرسال الفاتورة
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من صحة البيانات
    if (!invoice.customerId) {
      toast({
        variant: 'destructive',
        title: 'خطأ في البيانات',
        description: 'يرجى اختيار العميل',
      });
      return;
    }

    if (selectedProducts.length === 0) {
      toast({
        variant: 'destructive',
        title: 'خطأ في البيانات',
        description: 'يرجى إضافة منتج واحد على الأقل',
      });
      return;
    }

    // التحقق من صحة بيانات المنتجات
    for (const product of selectedProducts) {
      if (!product.productId) {
        toast({
          variant: 'destructive',
          title: 'خطأ في البيانات',
          description: 'يرجى اختيار المنتج لجميع البنود',
        });
        return;
      }

      if (!product.quantity || product.quantity <= 0) {
        toast({
          variant: 'destructive',
          title: 'خطأ في البيانات',
          description: 'يرجى إدخال كمية صحيحة لجميع المنتجات',
        });
        return;
      }

      if (!product.unitPrice || product.unitPrice <= 0) {
        toast({
          variant: 'destructive',
          title: 'خطأ في البيانات',
          description: 'يرجى إدخال سعر صحيح لجميع المنتجات',
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      // إعداد بيانات الفاتورة
      const invoiceData: CreateInvoiceRequest = {
        invoice: {
          ...invoice,
          customerId: parseInt(invoice.customerId),
          discountPercent: parseFloat(invoice.discountPercent.toString()),
          taxPercent: parseFloat(invoice.taxPercent.toString()),
          amountPaid: parseFloat(invoice.amountPaid.toString()),
        },
        items: selectedProducts.map((product) => ({
          productId: parseInt(product.productId),
          quantity: parseFloat(product.quantity),
          unitPrice: parseFloat(product.unitPrice),
          discountPercent: parseFloat(product.discountPercent),
          taxPercent: parseFloat(product.taxPercent),
        })),
      };

      console.log('بيانات الفاتورة المرسلة:', invoiceData);

      // إرسال الفاتورة إلى API
      const response = await fetch('/sales/invoices/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        let errorMessage = `فشل في إنشاء الفاتورة (${response.status})`;
        
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

      const result = await response.json();
      console.log('تم إنشاء الفاتورة بنجاح:', result);

      toast({
        title: 'تم إنشاء الفاتورة بنجاح',
        description: `تم إنشاء الفاتورة رقم ${result.data.invoice.invoiceNumber} بنجاح`,
      });

      // الانتقال إلى صفحة عرض الفاتورة
      router.push(`/sales/invoices/${result.data.invoice.invoiceId}`);
    } catch (error: any) {
      console.error('خطأ في إنشاء الفاتورة:', error);
      
      toast({
        variant: 'destructive',
        title: 'خطأ في إنشاء الفاتورة',
        description: error.message || 'حدث خطأ أثناء إنشاء الفاتورة',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">إنشاء فاتورة جديدة</h2>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="ml-2 h-4 w-4" />
          العودة
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {/* بيانات الفاتورة */}
          <Card>
            <CardHeader>
              <CardTitle>بيانات الفاتورة</CardTitle>
              <CardDescription>أدخل بيانات الفاتورة الأساسية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerId">العميل</Label>
                <Select
                  name="customerId"
                  value={invoice.customerId}
                  onValueChange={(value) => setInvoice((prev) => ({ ...prev, customerId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.customerId} value={customer.customerId.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceDate">تاريخ الفاتورة</Label>
                <Input
                  type="date"
                  id="invoiceDate"
                  name="invoiceDate"
                  value={invoice.invoiceDate}
                  onChange={handleInvoiceChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                <Select
                  name="paymentMethod"
                  value={invoice.paymentMethod}
                  onValueChange={(value) => setInvoice((prev) => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="نقدي">نقدي</SelectItem>
                    <SelectItem value="بطاقة ائتمان">بطاقة ائتمان</SelectItem>
                    <SelectItem value="تحويل بنكي">تحويل بنكي</SelectItem>
                    <SelectItem value="شيك">شيك</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">حالة الفاتورة</Label>
                <Select
                  name="status"
                  value={invoice.status}
                  onValueChange={(value) => setInvoice((prev) => ({ ...prev, status: value as InvoiceStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر حالة الفاتورة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={InvoiceStatus.Draft}>مسودة</SelectItem>
                    <SelectItem value={InvoiceStatus.Pending}>معلقة</SelectItem>
                    <SelectItem value={InvoiceStatus.Completed}>مكتملة</SelectItem>
                    <SelectItem value={InvoiceStatus.Unpaid}>غير مدفوعة</SelectItem>
                    <SelectItem value={InvoiceStatus.Paid}>مدفوعة</SelectItem>
                    <SelectItem value={InvoiceStatus.PartiallyPaid}>مدفوعة جزئياً</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={invoice.notes}
                  onChange={handleInvoiceChange}
                  placeholder="أدخل أي ملاحظات إضافية هنا"
                />
              </div>
            </CardContent>
          </Card>

          {/* إجماليات الفاتورة */}
          <Card>
            <CardHeader>
              <CardTitle>إجماليات الفاتورة</CardTitle>
              <CardDescription>تفاصيل المبالغ والخصومات والضرائب</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discountPercent">نسبة الخصم (%)</Label>
                <Input
                  type="number"
                  id="discountPercent"
                  name="discountPercent"
                  value={invoice.discountPercent}
                  onChange={handleInvoiceChange}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxPercent">نسبة الضريبة (%)</Label>
                <Input
                  type="number"
                  id="taxPercent"
                  name="taxPercent"
                  value={invoice.taxPercent}
                  onChange={handleInvoiceChange}
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amountPaid">المبلغ المدفوع</Label>
                <Input
                  type="number"
                  id="amountPaid"
                  name="amountPaid"
                  value={invoice.amountPaid}
                  onChange={handleInvoiceChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between py-1">
                  <span>المجموع الفرعي:</span>
                  <span>{subTotal.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>الخصم:</span>
                  <span>{totalDiscount.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>الضريبة:</span>
                  <span>{totalTax.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between py-1 font-bold">
                  <span>الإجمالي:</span>
                  <span>{total.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>المبلغ المدفوع:</span>
                  <span>{parseFloat(invoice.amountPaid.toString()).toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between py-1 font-bold">
                  <span>المبلغ المتبقي:</span>
                  <span>{(total - parseFloat(invoice.amountPaid.toString())).toFixed(2)} ر.س</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* بنود الفاتورة */}
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>بنود الفاتورة</CardTitle>
              <CardDescription>أضف المنتجات إلى الفاتورة</CardDescription>
            </div>
            <Button type="button" onClick={handleAddProduct}>
              <Plus className="ml-2 h-4 w-4" />
              إضافة منتج
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>المنتج</TableHead>
                    <TableHead>الكمية</TableHead>
                    <TableHead>سعر الوحدة</TableHead>
                    <TableHead>الخصم (%)</TableHead>
                    <TableHead>الضريبة (%)</TableHead>
                    <TableHead>الإجمالي</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        لا توجد منتجات. اضغط على &quot;إضافة منتج&quot; لإضافة منتج إلى الفاتورة.
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedProducts.map((product, index) => {
                      const quantity = parseFloat(product.quantity) || 0;
                      const unitPrice = parseFloat(product.unitPrice) || 0;
                      const discountPercent = parseFloat(product.discountPercent) || 0;
                      const taxPercent = parseFloat(product.taxPercent) || 0;

                      const lineTotal = quantity * unitPrice;
                      const lineDiscount = (lineTotal * discountPercent) / 100;
                      const lineTax = ((lineTotal - lineDiscount) * taxPercent) / 100;
                      const finalLineTotal = lineTotal - lineDiscount + lineTax;

                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <Select
                              value={product.productId.toString()}
                              onValueChange={(value) => handleProductChange(index, 'productId', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="اختر المنتج" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((p) => (
                                  <SelectItem key={p.productId} value={p.productId.toString()}>
                                    {p.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={product.quantity}
                              onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                              min="1"
                              step="1"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={product.unitPrice}
                              onChange={(e) => handleProductChange(index, 'unitPrice', e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={product.discountPercent}
                              onChange={(e) => handleProductChange(index, 'discountPercent', e.target.value)}
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={product.taxPercent}
                              onChange={(e) => handleProductChange(index, 'taxPercent', e.target.value)}
                              min="0"
                              max="100"
                              step="0.01"
                            />
                          </TableCell>
                          <TableCell>{finalLineTotal.toFixed(2)} ر.س</TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveProduct(index)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="ml-2 h-4 w-4" />
                  حفظ الفاتورة
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}