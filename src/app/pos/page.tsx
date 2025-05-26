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
  { id: "prod_1", name: "Organic Apples (1kg)", price: 3.99, quantity: 0, barcode: "123456789012" },
  { id: "prod_2", name: "Whole Wheat Bread Loaf", price: 2.49, quantity: 0, barcode: "987654321098" },
  { id: "prod_3", name: "Fresh Milk (1L)", price: 1.50, quantity: 0, barcode: "112233445566" },
  { id: "prod_4", name: "Cheddar Cheese (250g)", price: 4.20, quantity: 0, barcode: "665544332211" },
];

export default function PointOfSalePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState("");
  const [customer, setCustomer] = useState("Walk-in Customer");
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
      toast({ title: "Product Added", description: `${product.name} added to cart.` });
    } else {
      toast({ title: "Product Not Found", description: `No product found with barcode: ${barcode}`, variant: "destructive" });
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
    toast({ title: "Item Removed", description: "Product removed from cart."});
  };
  
  const clearCart = () => {
    setCart([]);
    toast({ title: "Cart Cleared", description: "All items removed from cart."});
  }

  return (
    <div className="container mx-auto p-0 md:p-4">
      <h1 className="text-3xl font-bold mb-6 text-foreground">Quick Point of Sale</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg rounded-lg">
            <CardHeader>
              <CardTitle className="text-xl">Scan Product or Add Manually</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBarcodeScan} className="flex items-end gap-2 mb-4">
                <div className="flex-grow">
                  <Label htmlFor="barcode" className="mb-1 block">Barcode</Label>
                  <Input
                    id="barcode" type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)}
                    placeholder="Scan or type barcode..." className="rounded-md"
                  />
                </div>
                <Button type="submit" className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
                  <ScanLine className="mr-2 h-5 w-5" /> Add
                </Button>
              </form>
              <Button variant="outline" className="w-full rounded-md">
                <PlusCircle className="mr-2 h-5 w-5" /> Browse Products / Add Manually
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-lg">
            <CardHeader className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Shopping Cart</CardTitle>
                <CardDescription>{cart.length} item(s) in cart</CardDescription>
              </div>
              {cart.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearCart} className="text-destructive hover:bg-destructive/10 border-destructive/50 hover:text-destructive rounded-md">
                  <XCircle className="mr-2 h-4 w-4" /> Clear Cart
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Your cart is empty. Scan a product to begin.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center w-32">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
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
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
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
              <CardTitle className="text-xl">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer" className="mb-1 block">Customer</Label>
                <Select value={customer} onValueChange={setCustomer}>
                  <SelectTrigger id="customer" className="rounded-md"><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Walk-in Customer">Walk-in Customer</SelectItem>
                    <SelectItem value="Customer A">Registered Customer A</SelectItem>
                    <SelectItem value="Customer B">Registered Customer B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="discount" className="mb-1 block">Discount (%)</Label>
                <div className="flex items-center">
                  <Input
                    id="discount" type="number" value={discountPercent}
                    onChange={(e) => setDiscountPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
                    placeholder="0" className="rounded-md" min="0" max="100"
                  />
                  <Percent className="ml-2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <Separator />
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Discount ({discountPercent}%):</span><span className="text-destructive">-${discountAmount.toFixed(2)}</span></div>
                <Separator/>
                <div className="flex justify-between font-bold text-lg text-primary"><span>Total:</span><span>${totalAmount.toFixed(2)}</span></div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button size="lg" className="w-full rounded-md bg-accent hover:bg-accent/90 text-accent-foreground">
                Process Payment
              </Button>
              <Button variant="outline" size="lg" className="w-full rounded-md">
                <FileText className="mr-2 h-5 w-5" /> Save as Draft
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
