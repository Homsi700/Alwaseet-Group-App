"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, MinusCircle, Trash2, Percent, ScanLine, Users, FileText, XCircle } from "lucide-react";
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode?: string;
}

// Mock product data - in a real app, this would come from a database/API
const mockProducts: CartItem[] = [
  { id: "prod_1", name: "تفاح عضوي (1 كجم)", price: 3.99, quantity: 0, barcode: "123456789012" },
  { id: "prod_2", name: "رغيف خبز قمح كامل", price: 2.49, quantity: 0, barcode: "987654321098" },
  { id: "prod_3", name: "حليب طازج (1 لتر)", price: 1.50, quantity: 0, barcode: "112233445566" },
  { id: "prod_4", name: "جبنة شيدر (250 جم)", price: 4.20, quantity: 0, barcode: "665544332211" },
];

export default function PointOfSalePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState("");
  const [customer, setCustomer] = useState("عميل عابر"); // Walk-in Customer
  const [discountPercent, setDiscountPercent] = useState(0);
  const { toast } = useToast();

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
  const discountAmount = useMemo(() => (subtotal * discountPercent) / 100, [subtotal, discountPercent]);
  const totalAmount = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);

  const handleBarcodeScan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    const product = mockProducts.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
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
      <h1 className="text-3xl font-bold mb-6 text-foreground">نقطة بيع سريعة</h1>
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
                    id="barcode" type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)}
                    placeholder="امسح أو اكتب الباركود..." className="rounded-md"
                  />
                </div>
                <Button type="submit" className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
                  <ScanLine className="ml-2 h-5 w-5 icon-directional" /> إضافة
                </Button>
              </form>
              <Button variant="outline" className="w-full rounded-md">
                <PlusCircle className="ml-2 h-5 w-5 icon-directional" /> تصفح المنتجات / إضافة يدوية
              </Button>
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
                  <XCircle className="ml-2 h-4 w-4 icon-directional" /> إفراغ السلة
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
                        <TableHead className="text-left rtl:text-right">السعر</TableHead>
                        <TableHead className="text-left rtl:text-right">الإجمالي</TableHead>
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
                          <TableCell className="text-left rtl:text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-left rtl:text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
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
                <Select value={customer} onValueChange={setCustomer}>
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
                    placeholder="0" className="rounded-md" min="0" max="100"
                  />
                  <Percent className="mr-2 rtl:ml-2 h-5 w-5 text-muted-foreground icon-directional" />
                </div>
              </div>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>المجموع الفرعي:</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>الخصم ({discountPercent}%):</span><span className="text-destructive">-${discountAmount.toFixed(2)}</span></div>
                <Separator/>
                <div className="flex justify-between font-bold text-lg text-primary"><span>الإجمالي:</span><span>${totalAmount.toFixed(2)}</span></div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button size="lg" className="w-full rounded-md bg-accent hover:bg-accent/90 text-accent-foreground">
                معالجة الدفع
              </Button>
              <Button variant="outline" size="lg" className="w-full rounded-md">
                <FileText className="ml-2 h-5 w-5 icon-directional" /> حفظ كمسودة
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
