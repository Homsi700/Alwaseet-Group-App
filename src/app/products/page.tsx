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
  { id: "prod_1", name: "Organic Apples (1kg)", barcode: "APL001", purchasePrice: 0.5, salePrice: 1.0, quantity: 100, expirationDate: "2024-12-31", category: "Fruits", supplier: "Green Farms" },
  { id: "prod_2", name: "Whole Wheat Bread Loaf", barcode: "BRD002", purchasePrice: 1.2, salePrice: 2.5, quantity: 50, category: "Bakery", supplier: "Healthy Bakes" },
  { id: "prod_3", name: "Fresh Milk (1L)", barcode: "MLK003", purchasePrice: 0.8, salePrice: 1.5, quantity: 75, expirationDate: "2024-10-15", category: "Dairy", supplier: "Farm Fresh" },
  { id: "prod_4", name: "Cheddar Cheese (250g)", barcode: "CHS004", purchasePrice: 2.0, salePrice: 4.0, quantity: 30, expirationDate: "2024-11-30", category: "Dairy", supplier: "Artisan Cheeses" },
  { id: "prod_5", name: "Free-Range Eggs (Dozen)", barcode: "EGG005", purchasePrice: 1.5, salePrice: 3.0, quantity: 60, category: "Dairy", supplier: "Happy Hens Farm" },
];

// Form component for Add/Edit Product
const ProductFormFields = ({ product, setProduct }: { product: Partial<Product>, setProduct: (p: Partial<Product>) => void }) => (
  <div className="grid gap-4 py-4">
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="name" className="text-right">Name</Label>
      <Input id="name" value={product.name || ""} onChange={(e) => setProduct({...product, name: e.target.value})} className="col-span-3 rounded-md" placeholder="Product Name" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="barcode" className="text-right">Barcode</Label>
      <Input id="barcode" value={product.barcode || ""} onChange={(e) => setProduct({...product, barcode: e.target.value})} className="col-span-3 rounded-md" placeholder="Product Barcode" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="purchasePrice" className="text-right">Purchase Price</Label>
      <Input id="purchasePrice" type="number" value={product.purchasePrice || ""} onChange={(e) => setProduct({...product, purchasePrice: parseFloat(e.target.value) || 0})} className="col-span-3 rounded-md" placeholder="0.00" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="salePrice" className="text-right">Sale Price</Label>
      <Input id="salePrice" type="number" value={product.salePrice || ""} onChange={(e) => setProduct({...product, salePrice: parseFloat(e.target.value) || 0})} className="col-span-3 rounded-md" placeholder="0.00" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="quantity" className="text-right">Quantity</Label>
      <Input id="quantity" type="number" value={product.quantity || ""} onChange={(e) => setProduct({...product, quantity: parseInt(e.target.value) || 0})} className="col-span-3 rounded-md" placeholder="0" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="expirationDate" className="text-right">Exp. Date</Label>
      <Input id="expirationDate" type="date" value={product.expirationDate || ""} onChange={(e) => setProduct({...product, expirationDate: e.target.value})} className="col-span-3 rounded-md" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="category" className="text-right">Category</Label>
      <Input id="category" value={product.category || ""} onChange={(e) => setProduct({...product, category: e.target.value})} className="col-span-3 rounded-md" placeholder="Product Category" />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="supplier" className="text-right">Supplier</Label>
      <Input id="supplier" value={product.supplier || ""} onChange={(e) => setProduct({...product, supplier: e.target.value})} className="col-span-3 rounded-md" placeholder="Supplier Name" />
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
    toast({ title: "Product Deleted", description: "The product has been removed successfully." });
  };

  const handleSaveProduct = () => {
    if (!currentProduct.name || !currentProduct.barcode) {
      toast({ title: "Validation Error", description: "Product name and barcode are required.", variant: "destructive" });
      return;
    }
    if (currentProduct.id) { // Editing
      setProducts(prev => prev.map(p => p.id === currentProduct.id ? currentProduct as Product : p));
      toast({ title: "Product Updated", description: `${currentProduct.name} has been updated.` });
    } else { // Adding
      const newProduct = { ...currentProduct, id: `prod_${Date.now()}` } as Product;
      setProducts(prev => [newProduct, ...prev]);
      toast({ title: "Product Added", description: `${newProduct.name} has been added.` });
    }
    setIsModalOpen(false);
    setCurrentProduct({});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">Product List</h1>
        <Button onClick={openModalForAdd} className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Product
        </Button>
      </div>

      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>Manage your inventory and product details. Found {filteredProducts.length} product(s).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search" placeholder="Search products (name, barcode, category...)"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full sm:w-2/5 rounded-md"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>A list of all your products.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Name</TableHead>
                  <TableHead className="min-w-[120px]">Barcode</TableHead>
                  <TableHead className="text-right min-w-[100px]">Purchase Price</TableHead>
                  <TableHead className="text-right min-w-[100px]">Sale Price</TableHead>
                  <TableHead className="text-right min-w-[80px]">Quantity</TableHead>
                  <TableHead className="min-w-[120px]">Exp. Date</TableHead>
                  <TableHead className="min-w-[100px]">Category</TableHead>
                  <TableHead className="min-w-[120px]">Supplier</TableHead>
                  <TableHead className="text-center min-w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.barcode}</TableCell>
                    <TableCell className="text-right">${product.purchasePrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">${product.salePrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{product.quantity}</TableCell>
                    <TableCell>{product.expirationDate ? new Date(product.expirationDate).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.supplier}</TableCell>
                    <TableCell className="text-center space-x-1">
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
                            No products found matching your search criteria.
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
            <DialogTitle>{currentProduct.id ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              {currentProduct.id ? "Update product details." : "Fill in the new product details."}
            </DialogDescription>
          </DialogHeader>
          <ProductFormFields product={currentProduct} setProduct={setCurrentProduct} />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="rounded-md">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSaveProduct} className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">Save Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
