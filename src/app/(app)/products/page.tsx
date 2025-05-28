
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Search, Edit, Trash2, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import type { Product, Category } from '@/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";


// API Interaction Functions
const fetchProducts = async (searchTerm: string = ""): Promise<Product[]> => {
  const response = await fetch(`/api/products?searchTerm=${encodeURIComponent(searchTerm)}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'فشل في جلب المنتجات' }));
    throw new Error(errorData.message || 'فشل في جلب المنتجات');
  }
  return response.json();
};

const addProduct = async (newProduct: Omit<Product, 'id' | 'productId' | 'companyId' | 'isActive'>): Promise<Product> => {
  const response = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProduct),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'فشل في إضافة المنتج' }));
    throw new Error(errorData.message || 'فشل في إضافة المنتج');
  }
  return response.json();
};

const updateProduct = async (updatedProduct: Partial<Product> & { productId: number }): Promise<Product> => {
  const response = await fetch(`/api/products/${updatedProduct.productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedProduct),
  });
  if (!response.ok) {
     const errorData = await response.json().catch(() => ({ message: 'فشل في تحديث المنتج' }));
    throw new Error(errorData.message || 'فشل في تحديث المنتج');
  }
  return response.json();
};

const deleteProduct = async (productId: number): Promise<{ message: string }> => {
  const response = await fetch(`/api/products/${productId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'فشل في حذف المنتج' }));
    throw new Error(errorData.message || 'فشل في حذف المنتج');
  }
  return response.json();
};

const fetchCategories = async (): Promise<Category[]> => {
    const response = await fetch('/api/categories');
    if(!response.ok) {
        throw new Error('فشل في جلب الفئات');
    }
    return response.json();
}


// Form component for Add/Edit Product
const ProductFormFields = ({ product, setProduct, categories, isLoadingCategories }: { product: Partial<Product>, setProduct: (name: keyof Product, value: any) => void, categories: Category[], isLoadingCategories: boolean }) => (
  <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2 rtl:pl-2 rtl:pr-0">
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="name" className="text-left rtl:text-right">الاسم</Label>
      <Input id="name" value={product.name || ""} onChange={(e) => setProduct('name', e.target.value)} className="col-span-3 rounded-md" placeholder="اسم المنتج" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="barcode" className="text-left rtl:text-right">الباركود</Label>
      <Input id="barcode" value={product.barcode || ""} onChange={(e) => setProduct('barcode', e.target.value)} className="col-span-3 rounded-md" placeholder="باركود المنتج" />
    </div>
     <div className="grid grid-cols-4 items-start gap-4">
      <Label htmlFor="description" className="text-left rtl:text-right mt-2">الوصف</Label>
      <Textarea id="description" value={product.description || ""} onChange={(e) => setProduct('description', e.target.value)} className="col-span-3 rounded-md" placeholder="وصف مختصر للمنتج" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="purchasePrice" className="text-left rtl:text-right">سعر الشراء</Label>
      <Input id="purchasePrice" type="number" value={product.purchasePrice || ""} onChange={(e) => setProduct('purchasePrice', parseFloat(e.target.value) || 0)} className="col-span-3 rounded-md" placeholder="٠٫٠٠" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="salePrice" className="text-left rtl:text-right">سعر البيع</Label>
      <Input id="salePrice" type="number" value={product.salePrice || ""} onChange={(e) => setProduct('salePrice', parseFloat(e.target.value) || 0)} className="col-span-3 rounded-md" placeholder="٠٫٠٠" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="quantity" className="text-left rtl:text-right">الكمية</Label>
      <Input id="quantity" type="number" value={product.quantity || ""} onChange={(e) => setProduct('quantity', parseInt(e.target.value) || 0)} className="col-span-3 rounded-md" placeholder="٠" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="unitOfMeasure" className="text-left rtl:text-right">وحدة القياس</Label>
        <Input id="unitOfMeasure" value={product.unitOfMeasure || ""} onChange={(e) => setProduct('unitOfMeasure', e.target.value)} className="col-span-3 rounded-md" placeholder="مثال: كجم، قطعة، علبة" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="minimumQuantity" className="text-left rtl:text-right">حد أدنى للكمية</Label>
        <Input id="minimumQuantity" type="number" value={product.minimumQuantity || ""} onChange={(e) => setProduct('minimumQuantity', parseInt(e.target.value) || 0)} className="col-span-3 rounded-md" placeholder="٠ (لتنبيهات المخزون)" />
    </div>
     <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="category" className="text-left rtl:text-right">الفئة</Label>
      <Select
        value={product.categoryId?.toString() || ""}
        onValueChange={(value) => setProduct('categoryId', value ? parseInt(value) : undefined)}
        disabled={isLoadingCategories}
        dir="rtl" 
      >
        <SelectTrigger className="col-span-3 rounded-md">
          <SelectValue placeholder={isLoadingCategories ? "جاري تحميل الفئات..." : "اختر فئة"} />
        </SelectTrigger>
        <SelectContent>
          {categories.map(cat => (
            <SelectItem key={cat.categoryId} value={cat.categoryId.toString()}>{cat.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="expirationDate" className="text-left rtl:text-right">تاريخ الصلاحية</Label>
      <Input id="expirationDate" type="date" value={product.expirationDate || ""} onChange={(e) => setProduct('expirationDate', e.target.value)} className="col-span-3 rounded-md" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="supplier" className="text-left rtl:text-right">المورد</Label>
      <Input id="supplier" value={product.supplier || ""} onChange={(e) => setProduct('supplier', e.target.value)} className="col-span-3 rounded-md" placeholder="اسم المورد" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="imageUrl" className="text-left rtl:text-right">رابط الصورة</Label>
      <Input id="imageUrl" value={product.imageUrl || ""} onChange={(e) => setProduct('imageUrl', e.target.value)} className="col-span-3 rounded-md" placeholder="https://example.com/image.png" />
    </div>
  </div>
);


export default function ProductListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { data: products = [], isLoading: isLoadingProducts, isError: isErrorProducts, error: productsError } = useQuery<Product[], Error>({
    queryKey: ['products', debouncedSearchTerm], 
    queryFn: () => fetchProducts(debouncedSearchTerm),
    // keepPreviousData: true, // تم تحديث tanstack-query، هذا قد يكون مختلفاً
  });
  
  const { data: categories = [], isLoading: isLoadingCategories, isError: isErrorCategories, error: categoriesError } = useQuery<Category[], Error>({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 5 * 60 * 1000, // Cache categories for 5 minutes
  });


  const addProductMutation = useMutation({
    mutationFn: addProduct,
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "تمت إضافة المنتج", description: `تمت إضافة ${newProduct.name} بنجاح.` });
      setIsModalOpen(false);
      setCurrentProduct({});
    },
    onError: (error: Error) => {
      toast({ title: "خطأ في الإضافة", description: error.message, variant: "destructive" });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: (updatedProduct) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "تم تحديث المنتج", description: `تم تحديث ${updatedProduct.name} بنجاح.` });
      setIsModalOpen(false);
      setCurrentProduct({});
    },
    onError: (error: Error) => {
      toast({ title: "خطأ في التحديث", description: error.message, variant: "destructive" });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: (data, productId) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: "تم حذف المنتج", description: data.message });
    },
    onError: (error: Error) => {
      toast({ title: "خطأ في الحذف", description: error.message, variant: "destructive" });
    }
  });


  const openModalForAdd = () => {
    setCurrentProduct({}); 
    setIsModalOpen(true);
  };

  const openModalForEdit = (product: Product) => {
    setCurrentProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (productId: number | undefined) => {
    if (productId === undefined) {
        toast({ title: "خطأ", description: "معرف المنتج غير متوفر.", variant: "destructive"});
        return;
    }
    if(confirm("هل أنت متأكد أنك تريد حذف هذا المنتج؟")) {
      deleteProductMutation.mutate(productId);
    }
  };
  
  const handleProductFormFieldChange = (fieldName: keyof Product, value: any) => {
    setCurrentProduct(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSaveProduct = () => {
    if (!currentProduct.name || !currentProduct.barcode) {
      toast({ title: "خطأ في التحقق", description: "اسم المنتج والباركود مطلوبان.", variant: "destructive" });
      return;
    }
    if (currentProduct.purchasePrice === undefined || currentProduct.purchasePrice < 0) {
        toast({ title: "خطأ في التحقق", description: "سعر الشراء يجب أن يكون رقمًا موجبًا.", variant: "destructive" });
        return;
    }
    if (currentProduct.salePrice === undefined || currentProduct.salePrice < 0) {
        toast({ title: "خطأ في التحقق", description: "سعر البيع يجب أن يكون رقمًا موجبًا.", variant: "destructive" });
        return;
    }
    if (currentProduct.quantity === undefined || currentProduct.quantity < 0) {
        toast({ title: "خطأ في التحقق", description: "الكمية يجب أن تكون رقمًا موجبًا.", variant: "destructive" });
        return;
    }

    const productToSave: Omit<Product, 'id' | 'productId' | 'companyId' | 'isActive'> = {
      name: currentProduct.name,
      barcode: currentProduct.barcode,
      description: currentProduct.description,
      purchasePrice: currentProduct.purchasePrice ?? 0,
      salePrice: currentProduct.salePrice ?? 0,
      quantity: currentProduct.quantity ?? 0,
      unitOfMeasure: currentProduct.unitOfMeasure,
      minimumQuantity: currentProduct.minimumQuantity,
      categoryId: currentProduct.categoryId,
      expirationDate: currentProduct.expirationDate,
      supplier: currentProduct.supplier,
      imageUrl: currentProduct.imageUrl,
    };

    if (currentProduct.productId) { 
      updateProductMutation.mutate({ ...productToSave, productId: currentProduct.productId } as Product);
    } else { 
      addProductMutation.mutate(productToSave);
    }
  };
  
  const isSaving = addProductMutation.isPending || updateProductMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">قائمة المنتجات</h1>
        <Button onClick={openModalForAdd} className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إضافة منتج جديد
        </Button>
      </div>

      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>جميع المنتجات</CardTitle>
          <CardDescription>
            إدارة مخزونك وتفاصيل منتجاتك. 
            {isLoadingProducts && " جاري تحميل المنتجات..."}
            {!isLoadingProducts && !isErrorProducts && ` تم العثور على ${products.length} منتج(ات).`}
            {isErrorCategories && " خطأ في تحميل الفئات."}
          </CardDescription>
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
              <TableCaption>قائمة بجميع منتجاتك المسجلة.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">الاسم</TableHead>
                  <TableHead className="min-w-[120px]">الباركود</TableHead>
                  <TableHead className="text-left rtl:text-right min-w-[100px]">سعر الشراء</TableHead>
                  <TableHead className="text-left rtl:text-right min-w-[100px]">سعر البيع</TableHead>
                  <TableHead className="text-left rtl:text-right min-w-[80px]">الكمية</TableHead>
                  <TableHead className="min-w-[100px]">الفئة</TableHead>
                  <TableHead className="min-w-[120px]">تاريخ الصلاحية</TableHead>
                  <TableHead className="min-w-[120px]">المورد</TableHead>
                  <TableHead className="text-center min-w-[100px]">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingProducts && Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell><Skeleton className="h-5 w-32 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20 rounded" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24 rounded" /></TableCell>
                    <TableCell className="text-center space-x-1 rtl:space-x-reverse">
                      <Skeleton className="h-8 w-8 rounded-md inline-block" />
                      <Skeleton className="h-8 w-8 rounded-md inline-block" />
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoadingProducts && isErrorProducts && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-destructive py-8">
                      حدث خطأ أثناء جلب المنتجات: {productsError?.message || "يرجى المحاولة مرة أخرى."}
                    </TableCell>
                  </TableRow>
                )}
                {!isLoadingProducts && !isErrorProducts && products.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                            لم يتم العثور على منتجات. قم بإضافة منتج جديد للبدء.
                        </TableCell>
                    </TableRow>
                )}
                {!isLoadingProducts && !isErrorProducts && products.map((product) => (
                  <TableRow key={product.productId}> {/* استخدام productId الفريد كـ key */}
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.barcode}</TableCell>
                    <TableCell className="text-left rtl:text-right">{product.purchasePrice?.toFixed(2) ?? '٠٫٠٠'} ر.س</TableCell>
                    <TableCell className="text-left rtl:text-right">{product.salePrice?.toFixed(2) ?? '٠٫٠٠'} ر.س</TableCell>
                    <TableCell className="text-left rtl:text-right">{product.quantity ?? 0}</TableCell>
                    <TableCell>{categories.find(c => c.categoryId === product.categoryId)?.name || product.categoryName || "غير محدد"}</TableCell>
                    <TableCell>{product.expirationDate ? new Date(product.expirationDate).toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: '2-digit', day: '2-digit'}) : "لا يوجد"}</TableCell>
                    <TableCell>{product.supplier || "غير محدد"}</TableCell>
                    <TableCell className="text-center space-x-1 rtl:space-x-reverse">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md" onClick={() => openModalForEdit(product)} disabled={deleteProductMutation.isPending || isSaving}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80 rounded-md" onClick={() => handleDeleteProduct(product.productId)} disabled={deleteProductMutation.isPending || product.productId === undefined || isSaving}>
                         {deleteProductMutation.isPending && deleteProductMutation.variables === product.productId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>{currentProduct.productId ? "تعديل المنتج" : "إضافة منتج جديد"}</DialogTitle>
            <DialogDescription>
              {currentProduct.productId ? "تحديث تفاصيل المنتج." : "املأ تفاصيل المنتج الجديد."}
            </DialogDescription>
          </DialogHeader>
          <ProductFormFields 
            product={currentProduct} 
            setProduct={handleProductFormFieldChange} 
            categories={categories} 
            isLoadingCategories={isLoadingCategories} 
           />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="rounded-md" disabled={isSaving}>إلغاء</Button>
            </DialogClose>
            <Button onClick={handleSaveProduct} className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSaving}>
              {isSaving ? <Loader2 className="ml-2 rtl:mr-2 h-4 w-4 animate-spin icon-directional" /> : null}
              {isSaving ? (currentProduct.productId ? "جاري التحديث..." : "جاري الإضافة...") : "حفظ المنتج"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
