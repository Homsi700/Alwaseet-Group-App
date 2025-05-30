'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Save, 
  X, 
  PlusCircle, 
  Trash2, 
  Search, 
  Loader2, 
  Calculator, 
  AlertTriangle 
} from "lucide-react";
import { Sale, SaleItem } from '@/hooks/use-sales';
import { useToast } from '@/hooks/use-toast';

// بيانات وهمية للعملاء
const mockCustomers = [
  { id: 'customer-1', name: 'شركة الأمل للتجارة', phone: '0123456789', email: 'info@alamal.com' },
  { id: 'customer-2', name: 'مؤسسة النجاح الحديثة', phone: '0123456788', email: 'info@alnajah.com' },
  { id: 'customer-3', name: 'محلات الوفاء', phone: '0123456787', email: 'info@alwafaa.com' },
  { id: 'customer-4', name: 'شركة الإبداع للتقنية', phone: '0123456786', email: 'info@ibda3.com' },
  { id: 'customer-5', name: 'مؤسسة الريادة', phone: '0123456785', email: 'info@alriada.com' },
];

// بيانات وهمية للمنتجات
const mockProducts = [
  { id: 'product-1', name: 'لابتوب HP ProBook', sku: 'HP-PB-001', barcode: '123456789', price: 1500, stock: 10 },
  { id: 'product-2', name: 'طابعة Canon', sku: 'CN-PR-001', barcode: '987654321', price: 700, stock: 15 },
  { id: 'product-3', name: 'جهاز عرض Epson', sku: 'EP-PJ-001', barcode: '456789123', price: 3000, stock: 5 },
  { id: 'product-4', name: 'هاتف Samsung Galaxy', sku: 'SG-PH-001', barcode: '789123456', price: 1000, stock: 20 },
  { id: 'product-5', name: 'كمبيوتر مكتبي Dell', sku: 'DL-PC-001', barcode: '321654987', price: 7000, stock: 3 },
  { id: 'product-6', name: 'شاشة LG', sku: 'LG-MN-001', barcode: '654987321', price: 1500, stock: 8 },
  { id: 'product-7', name: 'ماوس Logitech', sku: 'LG-MS-001', barcode: '987321654', price: 150, stock: 30 },
  { id: 'product-8', name: 'لوحة مفاتيح Microsoft', sku: 'MS-KB-001', barcode: '321987654', price: 200, stock: 25 },
];

// بيانات وهمية للمبيعات
const mockSales: Sale[] = [
  {
    id: 'sale-1',
    invoiceNumber: 'INV-2024-001',
    date: new Date('2024-07-15'),
    total: 5250.00,
    discount: 250,
    tax: 500,
    notes: 'تم التسليم للعميل',
    status: 'COMPLETED',
    paymentMethod: 'CASH',
    customerId: 'customer-1',
    customer: {
      id: 'customer-1',
      name: 'شركة الأمل للتجارة',
      phone: '0123456789',
      email: 'info@alamal.com',
    },
    items: [
      {
        productId: 'product-1',
        quantity: 2,
        price: 1500,
        discount: 100,
        total: 2900,
        product: {
          id: 'product-1',
          name: 'لابتوب HP ProBook',
          sku: 'HP-PB-001',
          barcode: '123456789',
        }
      },
      {
        productId: 'product-2',
        quantity: 3,
        price: 700,
        discount: 50,
        total: 2050,
        product: {
          id: 'product-2',
          name: 'طابعة Canon',
          sku: 'CN-PR-001',
          barcode: '987654321',
        }
      }
    ]
  },
  {
    id: 'sale-2',
    invoiceNumber: 'INV-2024-002',
    date: new Date('2024-07-14'),
    total: 3200.00,
    tax: 200,
    notes: 'طلب عاجل',
    status: 'PENDING',
    paymentMethod: 'BANK_TRANSFER',
    customerId: 'customer-2',
    customer: {
      id: 'customer-2',
      name: 'مؤسسة النجاح الحديثة',
      phone: '0123456788',
      email: 'info@alnajah.com',
    },
    items: [
      {
        productId: 'product-3',
        quantity: 1,
        price: 3000,
        total: 3000,
        product: {
          id: 'product-3',
          name: 'جهاز عرض Epson',
          sku: 'EP-PJ-001',
          barcode: '456789123',
        }
      }
    ]
  }
];

export default function EditSalePage({ params }: { params: { saleId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  
  // بيانات الفاتورة
  const [saleData, setSaleData] = useState<Partial<Sale>>({
    date: new Date(),
    items: [],
    status: 'COMPLETED',
    paymentMethod: 'CASH',
    total: 0,
    discount: 0,
    tax: 0,
  });
  
  // المنتج المحدد حالياً للإضافة
  const [selectedProduct, setSelectedProduct] = useState<{
    productId: string;
    quantity: number;
    price: number;
    discount: number;
  }>({
    productId: '',
    quantity: 1,
    price: 0,
    discount: 0,
  });
  
  // جلب بيانات الفاتورة
  useEffect(() => {
    const fetchSale = async () => {
      try {
        // محاكاة جلب البيانات
        const foundSale = mockSales.find(s => s.id === params.saleId);
        
        if (foundSale) {
          setSaleData(foundSale);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('خطأ في جلب بيانات الفاتورة:', error);
        setIsLoading(false);
      }
    };
    
    fetchSale();
  }, [params.saleId]);
  
  // تحديث بيانات الفاتورة
  const updateSaleData = (field: keyof Sale, value: any) => {
    setSaleData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };
  
  // تحديث المنتج المحدد
  const updateSelectedProduct = (field: string, value: any) => {
    setSelectedProduct(prev => ({ ...prev, [field]: value }));
    
    // تحديث السعر تلقائياً عند اختيار المنتج
    if (field === 'productId') {
      const product = mockProducts.find(p => p.id === value);
      if (product) {
        setSelectedProduct(prev => ({ ...prev, price: product.price }));
      }
    }
  };
  
  // إضافة منتج إلى الفاتورة
  const addProductToSale = () => {
    if (!selectedProduct.productId) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار المنتج',
        variant: 'destructive',
      });
      return;
    }
    
    if (selectedProduct.quantity <= 0) {
      toast({
        title: 'خطأ',
        description: 'يجب أن تكون الكمية أكبر من صفر',
        variant: 'destructive',
      });
      return;
    }
    
    const product = mockProducts.find(p => p.id === selectedProduct.productId);
    if (!product) return;
    
    // حساب إجمالي المنتج
    const total = (selectedProduct.price * selectedProduct.quantity) - selectedProduct.discount;
    
    // إنشاء عنصر جديد
    const newItem: SaleItem = {
      productId: selectedProduct.productId,
      quantity: selectedProduct.quantity,
      price: selectedProduct.price,
      discount: selectedProduct.discount,
      total,
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
      }
    };
    
    // إضافة العنصر إلى القائمة
    const updatedItems = [...(saleData.items || []), newItem];
    updateSaleData('items', updatedItems);
    
    // إعادة تعيين المنتج المحدد
    setSelectedProduct({
      productId: '',
      quantity: 1,
      price: 0,
      discount: 0,
    });
    
    // إغلاق نافذة إضافة المنتج
    setIsProductDialogOpen(false);
    
    // تحديث إجمالي الفاتورة
    calculateTotals(updatedItems, saleData.discount || 0, saleData.tax || 0);
  };
  
  // حذف منتج من الفاتورة
  const removeProductFromSale = (index: number) => {
    const updatedItems = [...(saleData.items || [])];
    updatedItems.splice(index, 1);
    updateSaleData('items', updatedItems);
    
    // تحديث إجمالي الفاتورة
    calculateTotals(updatedItems, saleData.discount || 0, saleData.tax || 0);
  };
  
  // حساب إجمالي الفاتورة
  const calculateTotals = (items: SaleItem[], discount: number, tax: number) => {
    // إجمالي المنتجات
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    
    // إجمالي الفاتورة بعد الخصم والضريبة
    const total = subtotal - discount + tax;
    
    updateSaleData('total', total);
  };
  
  // تحديث الخصم
  useEffect(() => {
    if (saleData.items) {
      calculateTotals(saleData.items, saleData.discount || 0, saleData.tax || 0);
    }
  }, [saleData.discount, saleData.tax]);
  
  // تصفية المنتجات حسب البحث
  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
    product.barcode.includes(productSearchTerm)
  );
  
  // حفظ الفاتورة
  const handleSaveSale = async () => {
    // التحقق من البيانات المطلوبة
    if (!saleData.customerId) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار العميل',
        variant: 'destructive',
      });
      return;
    }
    
    if (!saleData.items || saleData.items.length === 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى إضافة منتج واحد على الأقل',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // في الواقع، سنستخدم updateSaleMutation.mutateAsync
      // لكن هنا سنحاكي العملية
      
      setTimeout(() => {
        toast({
          title: 'تم تحديث الفاتورة بنجاح',
          description: 'تم تحديث فاتورة المبيعات بنجاح',
          variant: 'default',
        });
        
        setIsSaving(false);
        router.push(`/sales/${params.saleId}`);
      }, 1500);
    } catch (error) {
      setIsSaving(false);
      console.error('خطأ في تحديث الفاتورة:', error);
    }
  };
  
  // إلغاء التعديل
  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('هل أنت متأكد من رغبتك في إلغاء التعديلات؟ سيتم فقدان جميع التغييرات.')) {
        router.push(`/sales/${params.saleId}`);
      }
    } else {
      router.push(`/sales/${params.saleId}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!saleData.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">الفاتورة غير موجودة</h2>
        <p className="text-muted-foreground mb-6">لم يتم العثور على الفاتورة المطلوبة</p>
        <Button onClick={() => router.push('/sales')}>
          <ArrowLeft className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> العودة إلى قائمة المبيعات
        </Button>
      </div>
    );
  }
  
  // التحقق مما إذا كانت الفاتورة قابلة للتعديل
  const isEditable = saleData.status !== 'CANCELLED' && saleData.status !== 'REFUNDED';
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full"
              onClick={() => router.push(`/sales/${params.saleId}`)}
            >
              <ArrowLeft className="h-4 w-4 icon-directional" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">تعديل الفاتورة</h1>
          </div>
          <p className="text-muted-foreground mt-1">{saleData.invoiceNumber}</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إلغاء
          </Button>
          <Button 
            className="rounded-md"
            onClick={handleSaveSale}
            disabled={isSaving || !hasChanges || !isEditable}
          >
            <Save className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> حفظ التغييرات
            {isSaving && (
              <Loader2 className="ml-2 rtl:mr-2 h-4 w-4 animate-spin" />
            )}
          </Button>
        </div>
      </div>
      
      {!isEditable && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 ml-2 rtl:mr-2 icon-directional" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">تنبيه</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                هذه الفاتورة {saleData.status === 'CANCELLED' ? 'ملغية' : 'مستردة'} ولا يمكن تعديلها. يمكنك فقط عرض تفاصيلها.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الفاتورة</CardTitle>
              <CardDescription>
                تعديل المعلومات الأساسية للفاتورة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customer">العميل *</Label>
                    <Select
                      value={saleData.customerId}
                      onValueChange={(value) => {
                        updateSaleData('customerId', value);
                        const customer = mockCustomers.find(c => c.id === value);
                        if (customer) {
                          updateSaleData('customer', customer);
                        }
                      }}
                      disabled={!isEditable}
                    >
                      <SelectTrigger id="customer" className="w-full">
                        <SelectValue placeholder="اختر العميل" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCustomers.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">التاريخ *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={saleData.date instanceof Date ? saleData.date.toISOString().split('T')[0] : String(saleData.date).split('T')[0]}
                      onChange={(e) => updateSaleData('date', new Date(e.target.value))}
                      className="w-full"
                      disabled={!isEditable}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">الحالة *</Label>
                    <Select
                      value={saleData.status}
                      onValueChange={(value: any) => updateSaleData('status', value)}
                      disabled={!isEditable}
                    >
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue placeholder="اختر الحالة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="COMPLETED">مكتملة</SelectItem>
                        <SelectItem value="PENDING">معلقة</SelectItem>
                        <SelectItem value="PARTIALLY_PAID">مدفوعة جزئياً</SelectItem>
                        <SelectItem value="UNPAID">غير مدفوعة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">طريقة الدفع *</Label>
                    <Select
                      value={saleData.paymentMethod}
                      onValueChange={(value: any) => updateSaleData('paymentMethod', value)}
                      disabled={!isEditable}
                    >
                      <SelectTrigger id="paymentMethod" className="w-full">
                        <SelectValue placeholder="اختر طريقة الدفع" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASH">نقداً</SelectItem>
                        <SelectItem value="CREDIT_CARD">بطاقة ائتمان</SelectItem>
                        <SelectItem value="BANK_TRANSFER">تحويل بنكي</SelectItem>
                        <SelectItem value="CHECK">شيك</SelectItem>
                        <SelectItem value="OTHER">أخرى</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات</Label>
                    <Textarea
                      id="notes"
                      value={saleData.notes || ''}
                      onChange={(e) => updateSaleData('notes', e.target.value)}
                      placeholder="أي ملاحظات إضافية"
                      className="min-h-[100px]"
                      disabled={!isEditable}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>عناصر الفاتورة</CardTitle>
                <CardDescription>
                  تعديل المنتجات في الفاتورة
                </CardDescription>
              </div>
              {isEditable && (
                <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="rounded-md">
                      <PlusCircle className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> إضافة منتج
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>إضافة منتج</DialogTitle>
                      <DialogDescription>
                        اختر المنتج وحدد الكمية والسعر
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="بحث عن منتج..."
                          value={productSearchTerm}
                          onChange={(e) => setProductSearchTerm(e.target.value)}
                          className="pl-3 pr-10 w-full"
                        />
                      </div>
                      
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>المنتج</TableHead>
                              <TableHead>الرمز</TableHead>
                              <TableHead className="text-right rtl:text-left">السعر</TableHead>
                              <TableHead className="text-center">المخزون</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredProducts.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                                  لا توجد منتجات مطابقة للبحث
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredProducts.map(product => (
                                <TableRow key={product.id} className={selectedProduct.productId === product.id ? 'bg-muted/50' : ''}>
                                  <TableCell className="font-medium">{product.name}</TableCell>
                                  <TableCell>{product.sku}</TableCell>
                                  <TableCell className="text-right rtl:text-left">{product.price.toFixed(2)}</TableCell>
                                  <TableCell className="text-center">{product.stock}</TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="rounded-full h-8 w-8 p-0"
                                      onClick={() => updateSelectedProduct('productId', product.id)}
                                    >
                                      {selectedProduct.productId === product.id ? (
                                        <Check className="h-4 w-4" />
                                      ) : (
                                        <Plus className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      
                      {selectedProduct.productId && (
                        <div className="space-y-4 border rounded-md p-4 mt-4">
                          <div className="font-medium">
                            {mockProducts.find(p => p.id === selectedProduct.productId)?.name}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="quantity">الكمية</Label>
                              <Input
                                id="quantity"
                                type="number"
                                min="1"
                                value={selectedProduct.quantity}
                                onChange={(e) => updateSelectedProduct('quantity', parseInt(e.target.value) || 1)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="price">السعر</Label>
                              <Input
                                id="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={selectedProduct.price}
                                onChange={(e) => updateSelectedProduct('price', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="discount">الخصم</Label>
                              <Input
                                id="discount"
                                type="number"
                                min="0"
                                step="0.01"
                                value={selectedProduct.discount}
                                onChange={(e) => updateSelectedProduct('discount', parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </div>
                          
                          <div className="text-right rtl:text-left font-bold">
                            الإجمالي: {((selectedProduct.price * selectedProduct.quantity) - selectedProduct.discount).toFixed(2)} ر.س
                          </div>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsProductDialogOpen(false)}
                      >
                        إلغاء
                      </Button>
                      <Button
                        type="button"
                        onClick={addProductToSale}
                        disabled={!selectedProduct.productId}
                      >
                        إضافة
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {(!saleData.items || saleData.items.length === 0) ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
                  <FileText className="h-8 w-8 mx-auto mb-2" />
                  <p>لا توجد منتجات في الفاتورة</p>
                  <p className="text-sm mt-1">انقر على "إضافة منتج" لإضافة منتجات إلى الفاتورة</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">#</TableHead>
                        <TableHead>المنتج</TableHead>
                        <TableHead className="text-center">الكمية</TableHead>
                        <TableHead className="text-right rtl:text-left">السعر</TableHead>
                        <TableHead className="text-right rtl:text-left">الخصم</TableHead>
                        <TableHead className="text-right rtl:text-left">الإجمالي</TableHead>
                        {isEditable && <TableHead className="w-[70px]"></TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {saleData.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{item.product?.name}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right rtl:text-left">{item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right rtl:text-left">{item.discount?.toFixed(2) || '0.00'}</TableCell>
                          <TableCell className="text-right rtl:text-left font-bold">{item.total.toFixed(2)}</TableCell>
                          {isEditable && (
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="rounded-full h-8 w-8 p-0 text-destructive hover:text-destructive/90"
                                onClick={() => removeProductFromSale(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ملخص الفاتورة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">المجموع الفرعي:</span>
                <span className="font-medium">
                  {saleData.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2) || '0.00'} ر.س
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">الخصم:</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={saleData.discount || 0}
                    onChange={(e) => updateSaleData('discount', parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 text-right rtl:text-left"
                    disabled={!isEditable}
                  />
                </div>
                <span className="font-medium text-red-600 dark:text-red-400">
                  - {(saleData.discount || 0).toFixed(2)} ر.س
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">الضريبة:</span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={saleData.tax || 0}
                    onChange={(e) => updateSaleData('tax', parseFloat(e.target.value) || 0)}
                    className="w-20 h-8 text-right rtl:text-left"
                    disabled={!isEditable}
                  />
                </div>
                <span className="font-medium">
                  + {(saleData.tax || 0).toFixed(2)} ر.س
                </span>
              </div>
              
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold">الإجمالي:</span>
                <span className="text-xl font-bold">
                  {(saleData.total || 0).toFixed(2)} ر.س
                </span>
              </div>
              
              {isEditable && (
                <div className="pt-4">
                  <Button variant="outline" className="w-full" onClick={() => {
                    // حساب الضريبة تلقائياً (15% مثلاً)
                    const subtotal = saleData.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;
                    const calculatedTax = subtotal * 0.15;
                    updateSaleData('tax', calculatedTax);
                  }}>
                    <Calculator className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> حساب الضريبة تلقائياً (15%)
                  </Button>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              {isEditable && (
                <Button className="w-full" onClick={handleSaveSale} disabled={isSaving || !hasChanges}>
                  <Save className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> حفظ التغييرات
                  {isSaving && (
                    <Loader2 className="ml-2 rtl:mr-2 h-4 w-4 animate-spin" />
                  )}
                </Button>
              )}
              <Button variant="outline" className="w-full" onClick={handleCancel}>
                <X className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> إلغاء التعديل
              </Button>
            </CardFooter>
          </Card>
          
          {saleData.customerId && saleData.customer && (
            <Card>
              <CardHeader>
                <CardTitle>معلومات العميل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <span className="text-muted-foreground">الاسم:</span>
                  <p className="font-medium">{saleData.customer.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">رقم الهاتف:</span>
                  <p>{saleData.customer.phone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">البريد الإلكتروني:</span>
                  <p>{saleData.customer.email}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// مكونات إضافية
function Check(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function FileText(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}