"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Search, Edit, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  barcode: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  expirationDate?: string;
  category: string;
  supplier: string;
}

const initialProductsData: Product[] = [
  { id: "prod_1", name: "تفاح عضوي (1 كجم)", barcode: "APL001", purchasePrice: 0.5, salePrice: 1.0, quantity: 100, expirationDate: "2024-12-31", category: "فواكه", supplier: "مزارع خضراء" },
  { id: "prod_2", name: "رغيف خبز قمح كامل", barcode: "BRD002", purchasePrice: 1.2, salePrice: 2.5, quantity: 50, category: "مخبوزات", supplier: "مخابز صحية" },
  { id: "prod_3", name: "حليب طازج (1 لتر)", barcode: "MLK003", purchasePrice: 0.8, salePrice: 1.5, quantity: 75, expirationDate: "2024-10-15", category: "ألبان", supplier: "مزرعة فريش" },
  { id: "prod_4", name: "جبنة شيدر (250 جم)", barcode: "CHS004", purchasePrice: 2.0, salePrice: 4.0, quantity: 30, expirationDate: "2024-11-30", category: "ألبان", supplier: "أجبان حرفية" },
  { id: "prod_5", name: "بيض بلدي (طبق)", barcode: "EGG005", purchasePrice: 1.5, salePrice: 3.0, quantity: 60, category: "ألبان", supplier: "مزرعة الدجاج السعيد" },
];

// Form component for Add/Edit Product
const ProductFormFields = ({ product, setProduct }: { product: Partial<Product>, setProduct: (p: Partial<Product>) => void }) => (
  <div className="grid gap-4 py-4">
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="name" className="text-left rtl:text-right">الاسم</Label>
      <Input id="name" value={product.name || ""} onChange={(e) => setProduct({...product, name: e.target.value})} className="col-span-3 rounded-md" placeholder="اسم المنتج" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="barcode" className="text-left rtl:text-right">الباركود</Label>
      <Input id="barcode" value={product.barcode || ""} onChange={(e) => setProduct({...product, barcode: e.target.value})} className="col-span-3 rounded-md" placeholder="باركود المنتج" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="purchasePrice" className="text-left rtl:text-right">سعر الشراء</Label>
      <Input id="purchasePrice" type="number" value={product.purchasePrice || ""} onChange={(e) => setProduct({...product, purchasePrice: parseFloat(e.target.value) || 0})} className="col-span-3 rounded-md" placeholder="0.00" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="salePrice" className="text-left rtl:text-right">سعر البيع</Label>
      <Input id="salePrice" type="number" value={product.salePrice || ""} onChange={(e) => setProduct({...product, salePrice: parseFloat(e.target.value) || 0})} className="col-span-3 rounded-md" placeholder="0.00" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="quantity" className="text-left rtl:text-right">الكمية</Label>
      <Input id="quantity" type="number" value={product.quantity || ""} onChange={(e) => setProduct({...product, quantity: parseInt(e.target.value) || 0})} className="col-span-3 rounded-md" placeholder="0" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="expirationDate" className="text-left rtl:text-right">تاريخ الصلاحية</Label>
      <Input id="expirationDate" type="date" value={product.expirationDate || ""} onChange={(e) => setProduct({...product, expirationDate: e.target.value})} className="col-span-3 rounded-md" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="category" className="text-left rtl:text-right">الفئة</Label>
      <Input id="category" value={product.category || ""} onChange={(e) => setProduct({...product, category: e.target.value})} className="col-span-3 rounded-md" placeholder="فئة المنتج" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="supplier" className="text-left rtl:text-right">المورد</Label>
      <Input id="supplier" value={product.supplier || ""} onChange={(e) => setProduct({...product, supplier: e.target.value})} className="col-span-3 rounded-md" placeholder="اسم المورد" />
    </div>
  </div>
);


export default function ProductListPage() {
  const [products, setProducts] = useState<Product[]>(initialProductsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const { toast } = useToast();

  const filteredProducts = useMemo(() => {
    const lowercasedFilter = searchTerm.toLowerCase();
    return products.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(lowercasedFilter)
      )
    );
  }, [searchTerm, products]);

  const openModalForAdd = () => {
    setCurrentProduct({});
    setIsModalOpen(true);
  };

  const openModalForEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    toast({ title: "تم حذف المنتج", description: "تمت إزالة المنتج بنجاح." });
  };

  const handleSaveProduct = () => {
    if (!currentProduct.name || !currentProduct.barcode) {
      toast({ title: "خطأ في التحقق", description: "اسم المنتج والباركود مطلوبان.", variant: "destructive" });
      return;
    }
    if (currentProduct.id) { // Editing
      setProducts(prev => prev.map(p => p.id === currentProduct.id ? currentProduct as Product : p));
      toast({ title: "تم تحديث المنتج", description: `تم تحديث ${currentProduct.name}.` });
    } else { // Adding
      const newProduct = { ...currentProduct, id: `prod_${Date.now()}` } as Product;
      setProducts(prev => [newProduct, ...prev]);
      toast({ title: "تمت إضافة المنتج", description: `تمت إضافة ${newProduct.name}.` });
    }
    setIsModalOpen(false);
    setCurrentProduct({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">قائمة المنتجات</h1>
        <Button onClick={openModalForAdd} className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="ml-2 h-5 w-5 icon-directional" /> إضافة منتج جديد
        </Button>
      </div>

      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>جميع المنتجات</CardTitle>
          <CardDescription>إدارة مخزونك وتفاصيل منتجاتك. تم العثور على {filteredProducts.length} منتج(ات).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 rtl:right-2.5 rtl:left-auto top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search" placeholder="ابحث عن المنتجات (الاسم، الباركود، الفئة...)"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 rtl:pr-8 rtl:pl-2 w-full sm:w-2/5 rounded-md"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>قائمة بجميع منتجاتك.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">الاسم</TableHead>
                  <TableHead className="min-w-[120px]">الباركود</TableHead>
                  <TableHead className="text-left rtl:text-right min-w-[100px]">سعر الشراء</TableHead>
                  <TableHead className="text-left rtl:text-right min-w-[100px]">سعر البيع</TableHead>
                  <TableHead className="text-left rtl:text-right min-w-[80px]">الكمية</TableHead>
                  <TableHead className="min-w-[120px]">تاريخ الصلاحية</TableHead>
                  <TableHead className="min-w-[100px]">الفئة</TableHead>
                  <TableHead className="min-w-[120px]">المورد</TableHead>
                  <TableHead className="text-center min-w-[100px]">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.barcode}</TableCell>
                    <TableCell className="text-left rtl:text-right">${product.purchasePrice.toFixed(2)}</TableCell>
                    <TableCell className="text-left rtl:text-right">${product.salePrice.toFixed(2)}</TableCell>
                    <TableCell className="text-left rtl:text-right">{product.quantity}</TableCell>
                    <TableCell>{product.expirationDate ? new Date(product.expirationDate).toLocaleDateString() : "لا يوجد"}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.supplier}</TableCell>
                    <TableCell className="text-center space-x-1 rtl:space-x-reverse">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => openModalForEdit(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80 rounded-md" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                            لم يتم العثور على منتجات تطابق معايير البحث الخاصة بك.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-lg">
          <DialogHeader>
            <DialogTitle>{currentProduct.id ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
            <DialogDescription>
              {currentProduct.id ? "تحديث تفاصيل المنتج." : "املأ تفاصيل المنتج الجديد."}
            </DialogDescription>
          </DialogHeader>
          <ProductFormFields product={currentProduct} setProduct={setCurrentProduct} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="rounded-md">إلغاء</Button>
            </DialogClose>
            <Button onClick={handleSaveProduct} className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">حفظ المنتج</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
