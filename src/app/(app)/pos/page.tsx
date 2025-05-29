
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, MinusCircle, Trash2, Percent, ScanLine, Users, FileText, XCircle, Loader2 } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Product } from '@/types';
import { useQuery } from '@tanstack/react-query';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
}

// دالة لجلب المنتجات من API
const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch(`/api/products`);
  if (!response.ok) {
    throw new Error('فشل في جلب المنتجات');
  }
  return response.json();
};

export default function PointOfSalePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState("");
  const [customer, setCustomer] = useState("عميل عابر"); 
  const [discountPercent, setDiscountPercent] = useState(0);
  const [invoiceNumber, setInvoiceNumber] = useState<string>(() => {
    // إنشاء رقم فاتورة عشوائي عند تحميل الصفحة
    return Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  });
  const { toast } = useToast();
  
  // مرجع للحقل النصي للباركود
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  
  // استخدام React Query لجلب المنتجات
  const { data: products = [], isLoading, isError, refetch } = useQuery<Product[], Error>({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 1000, // 1 second
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
  
  // إعادة تحميل المنتجات عند تحميل الصفحة
  useEffect(() => {
    refetch();
    console.log("[pos/page.tsx] Refetching products on page load");
  }, [refetch]);
  
  // التركيز على حقل الباركود عند تحميل الصفحة وبعد إضافة منتج
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [cart.length]);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const discountAmount = useMemo(() => (subtotal * discountPercent) / 100, [subtotal, discountPercent]);
  const totalAmount = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);

  const handleBarcodeScan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    // البحث عن المنتج باستخدام الباركود
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      // تحويل المنتج إلى عنصر في السلة
      const cartItem: CartItem = {
        id: product.id || `prod_${product.productId}`,
        name: product.name,
        price: product.salePrice,
        quantity: 0,
        barcode: product.barcode
      };
      
      addToCart(cartItem);
      toast({ title: "تمت إضافة المنتج", description: `تمت إضافة ${product.name} إلى السلة.` });
    } else {
      toast({ title: "المنتج غير موجود", description: `لم يتم العثور على منتج بالباركود: ${barcode}`, variant: "destructive" });
    }
    setBarcode("");
  };

  const addToCart = (product: CartItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, change: number) => {
    setCart(prevCart =>
      prevCart
        .map(item => (item.id === productId ? { ...item, quantity: Math.max(0, item.quantity + change) } : item))
        .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    toast({ title: "تمت إزالة المنتج", description: "تمت إزالة المنتج من السلة."});
  };
  
  const clearCart = () => {
    setCart([]);
    toast({ title: "تم إفراغ السلة", description: "تمت إزالة جميع المنتجات من السلة."});
  }

  return (
    <div className="container mx-auto p-0 md:p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">نقطة بيع سريعة</h1>
        <div className="text-lg font-semibold bg-muted p-2 rounded-md">
          فاتورة رقم: <span className="text-primary">{invoiceNumber}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl">مسح المنتج أو إضافته يدويًا</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBarcodeScan} className="flex items-end gap-2 mb-4">
                <div className="flex-grow">
                  <Label htmlFor="barcode" className="mb-1 block">الباركود</Label>
                  <Input
                    id="barcode" 
                    type="text" 
                    value={barcode} 
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="امسح أو اكتب الباركود..." 
                    className="rounded-md"
                    ref={barcodeInputRef}
                    autoFocus
                  />
                </div>
                <Button type="submit" className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
                  <ScanLine className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إضافة
                </Button>
              </form>
              {isLoading ? (
                <Button variant="outline" className="w-full rounded-md" disabled>
                  <Loader2 className="ml-2 rtl:mr-2 h-5 w-5 animate-spin icon-directional" /> جاري تحميل المنتجات...
                </Button>
              ) : isError ? (
                <Button variant="outline" className="w-full rounded-md text-destructive" disabled>
                  <XCircle className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> خطأ في تحميل المنتجات
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button variant="outline" className="w-full rounded-md">
                    <PlusCircle className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> تصفح المنتجات / إضافة يدوية
                  </Button>
                  <div className="flex flex-col items-center space-y-2">
                    <div className="text-xs text-muted-foreground text-center">
                      تم تحميل {products.length} منتج من قاعدة البيانات
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        refetch();
                        toast({ title: "تحديث المنتجات", description: "تم تحديث قائمة المنتجات" });
                      }} 
                      className="text-xs"
                    >
                      <Loader2 className="ml-2 rtl:mr-2 h-3 w-3 icon-directional" /> تحديث قائمة المنتجات
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-lg">
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">سلة التسوق</CardTitle>
                <CardDescription>{cart.length} منتج(ات) في السلة</CardDescription>
              </div>
              {cart.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearCart} className="text-destructive hover:bg-destructive/10 border-destructive/50 hover:text-destructive rounded-md">
                  <XCircle className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> إفراغ السلة
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">سلتك فارغة. امسح منتجًا للبدء.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>المنتج</TableHead>
                        <TableHead className="text-center w-32">الكمية</TableHead>
                        <TableHead className="text-right rtl:text-left">السعر</TableHead>
                        <TableHead className="text-right rtl:text-left">الإجمالي</TableHead>
                        <TableHead className="text-center">إجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => updateQuantity(item.id, -1)}><MinusCircle className="h-4 w-4" /></Button>
                              <Input type="number" value={item.quantity} readOnly className="w-12 h-8 text-center rounded-md p-1 border-border"/>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={() => updateQuantity(item.id, 1)}><PlusCircle className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right rtl:text-left">{item.price.toFixed(2)} ر.س</TableCell>
                          <TableCell className="text-right rtl:text-left">{(item.price * item.quantity).toFixed(2)} ر.س</TableCell>
                          <TableCell className="text-center">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80 rounded-md" onClick={() => removeFromCart(item.id)}><Trash2 className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl">ملخص الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer" className="mb-1 block">العميل</Label>
                <Select value={customer} onValueChange={setCustomer} dir="rtl">
                  <SelectTrigger id="customer" className="rounded-md"><SelectValue placeholder="اختر العميل" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="عميل عابر">عميل عابر</SelectItem>
                    <SelectItem value="Customer A">عميل مسجل أ</SelectItem>
                    <SelectItem value="Customer B">عميل مسجل ب</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discount" className="mb-1 block">الخصم (%)</Label>
                <div className="flex items-center">
                  <Input
                    id="discount" type="number" value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                    placeholder="٠" className="rounded-md" min="0" max="100"
                  />
                  <Percent className="mr-2 rtl:ml-2 h-5 w-5 text-muted-foreground icon-directional" />
                </div>
              </div>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>المجموع الفرعي:</span><span>{subtotal.toFixed(2)} ر.س</span></div>
                <div className="flex justify-between"><span>الخصم ({discountPercent}%):</span><span className="text-destructive">-{discountAmount.toFixed(2)} ر.س</span></div>
                <Separator/>
                <div className="flex justify-between font-bold text-lg text-primary"><span>الإجمالي:</span><span>{totalAmount.toFixed(2)} ر.س</span></div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                size="lg" 
                className="w-full rounded-md bg-accent hover:bg-accent/90 text-accent-foreground"
                onClick={() => {
                  if (cart.length === 0) {
                    toast({ 
                      title: "لا توجد منتجات", 
                      description: "الرجاء إضافة منتجات إلى السلة أولاً", 
                      variant: "destructive" 
                    });
                    return;
                  }
                  
                  // إنشاء نافذة طباعة
                  const printWindow = window.open('', '_blank');
                  if (!printWindow) {
                    toast({ 
                      title: "خطأ في الطباعة", 
                      description: "لم نتمكن من فتح نافذة الطباعة. يرجى التحقق من إعدادات المتصفح.", 
                      variant: "destructive" 
                    });
                    return;
                  }
                  
                  // إنشاء محتوى الفاتورة
                  const invoiceDate = new Date().toLocaleDateString('ar-SA');
                  const invoiceTime = new Date().toLocaleTimeString('ar-SA');
                  
                  printWindow.document.write(`
                    <html dir="rtl">
                    <head>
                      <title>فاتورة رقم ${invoiceNumber}</title>
                      <style>
                        @page {
                          size: 80mm auto; /* عرض 80 ملم وارتفاع تلقائي - مناسب لطابعات الكاشير */
                          margin: 0mm;
                        }
                        body {
                          font-family: Arial, sans-serif;
                          margin: 0;
                          padding: 5mm;
                          direction: rtl;
                          width: 70mm; /* عرض المحتوى */
                          font-size: 10pt; /* حجم خط أصغر */
                        }
                        .invoice-header {
                          text-align: center;
                          margin-bottom: 5mm;
                        }
                        .invoice-header h1 {
                          font-size: 12pt;
                          margin: 0;
                          padding: 0;
                        }
                        .invoice-header p {
                          font-size: 10pt;
                          margin: 2mm 0;
                        }
                        .invoice-details {
                          margin-bottom: 5mm;
                          font-size: 9pt;
                        }
                        .invoice-details p {
                          margin: 1mm 0;
                        }
                        table {
                          width: 100%;
                          border-collapse: collapse;
                          font-size: 8pt;
                        }
                        th, td {
                          padding: 1mm 2mm;
                          text-align: right;
                          border-bottom: 1px dotted #000;
                        }
                        .total-section {
                          margin-top: 5mm;
                          text-align: left;
                          font-size: 9pt;
                        }
                        .total-section p {
                          margin: 1mm 0;
                        }
                        .footer {
                          margin-top: 5mm;
                          text-align: center;
                          font-size: 8pt;
                          border-top: 1px dotted #000;
                          padding-top: 2mm;
                        }
                        .footer p {
                          margin: 1mm 0;
                        }
                        .divider {
                          border-top: 1px dashed #000;
                          margin: 3mm 0;
                        }
                        @media print {
                          button {
                            display: none;
                          }
                        }
                      </style>
                    </head>
                    <body>
                      <div class="invoice-header">
                        <h1>مجموعة الوسيط جروب</h1>
                        <p>فاتورة ضريبية مبسطة</p>
                      </div>
                      
                      <div class="divider"></div>
                      
                      <div class="invoice-details">
                        <p><strong>رقم الفاتورة:</strong> ${invoiceNumber}</p>
                        <p><strong>التاريخ:</strong> ${invoiceDate}</p>
                        <p><strong>الوقت:</strong> ${invoiceTime}</p>
                        <p><strong>العميل:</strong> ${customer}</p>
                      </div>
                      
                      <div class="divider"></div>
                      
                      <table>
                        <thead>
                          <tr>
                            <th>المنتج</th>
                            <th>الكمية</th>
                            <th>السعر</th>
                            <th>الإجمالي</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${cart.map((item) => `
                            <tr>
                              <td>${item.name}</td>
                              <td>${item.quantity}</td>
                              <td>${item.price.toFixed(2)}</td>
                              <td>${(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          `).join('')}
                        </tbody>
                      </table>
                      
                      <div class="divider"></div>
                      
                      <div class="total-section">
                        <p><strong>المجموع:</strong> ${subtotal.toFixed(2)} ر.س</p>
                        <p><strong>الخصم (${discountPercent}%):</strong> ${discountAmount.toFixed(2)} ر.س</p>
                        <p><strong>الإجمالي:</strong> ${totalAmount.toFixed(2)} ر.س</p>
                      </div>
                      
                      <div class="footer">
                        <p>شكراً لتسوقكم معنا!</p>
                        <p>للاستفسارات: 0123456789</p>
                      </div>
                      
                      <div style="text-align: center; margin-top: 5mm;">
                        <button onclick="window.print(); setTimeout(() => window.close(), 500);">طباعة الفاتورة</button>
                      </div>
                    </body>
                    </html>
                  `);
                  
                  // إغلاق الفاتورة الحالية وإنشاء فاتورة جديدة
                  setCart([]);
                  setDiscountPercent(0);
                  setCustomer("عميل عابر");
                  
                  // إنشاء رقم فاتورة جديد
                  const newInvoiceNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                  setInvoiceNumber(newInvoiceNumber);
                  
                  toast({ 
                    title: "تم إنشاء الفاتورة", 
                    description: `تم إنشاء الفاتورة رقم ${invoiceNumber} بنجاح` 
                  });
                }}
                disabled={cart.length === 0}
              >
                معالجة الدفع وطباعة الفاتورة
              </Button>
              
              <div className="flex gap-2 w-full">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1 rounded-md"
                  onClick={() => {
                    if (cart.length === 0) {
                      toast({ 
                        title: "لا توجد منتجات", 
                        description: "السلة فارغة بالفعل", 
                        variant: "destructive" 
                      });
                      return;
                    }
                    
                    setCart([]);
                    setDiscountPercent(0);
                    setCustomer("عميل عابر");
                    
                    // إنشاء رقم فاتورة جديد
                    const newInvoiceNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
                    setInvoiceNumber(newInvoiceNumber);
                    
                    toast({ 
                      title: "تم إلغاء الفاتورة", 
                      description: "تم إلغاء الفاتورة الحالية وإنشاء فاتورة جديدة" 
                    });
                  }}
                >
                  <XCircle className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إلغاء الفاتورة
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1 rounded-md"
                >
                  <FileText className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> حفظ كمسودة
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
