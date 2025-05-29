import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { SaleItem } from '@/hooks/use-sales';

// واجهة الخصائص
interface SaleItemsTableProps {
  items: SaleItem[];
  onItemsChange: (items: SaleItem[]) => void;
  onTotalChange: (total: number) => void;
}

// واجهة المنتج
interface Product {
  id: string;
  name: string;
  price: number;
  cost?: number;
  quantity: number;
  sku?: string;
  barcode?: string;
}

// جلب المنتجات من API
const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch('/api/products');
  if (!response.ok) {
    throw new Error('فشل في جلب المنتجات');
  }
  return response.json();
};

export function SaleItemsTable({ items, onItemsChange, onTotalChange }: SaleItemsTableProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [discount, setDiscount] = useState<number>(0);
  
  // استخدام React Query لجلب المنتجات
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });
  
  // إضافة عنصر جديد
  const handleAddItem = () => {
    if (!selectedProductId) return;
    
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    
    const price = product.price;
    const total = (price * quantity) - discount;
    
    const newItem: SaleItem = {
      productId: selectedProductId,
      quantity,
      price,
      discount,
      total,
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
      },
    };
    
    const updatedItems = [...items, newItem];
    onItemsChange(updatedItems);
    
    // حساب الإجمالي
    const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    onTotalChange(newTotal);
    
    // إعادة تعيين الحقول
    setSelectedProductId('');
    setQuantity(1);
    setDiscount(0);
  };
  
  // حذف عنصر
  const handleDeleteItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    onItemsChange(updatedItems);
    
    // حساب الإجمالي
    const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    onTotalChange(newTotal);
  };
  
  // تحديث كمية عنصر
  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) return;
    
    const updatedItems = [...items];
    updatedItems[index].quantity = newQuantity;
    updatedItems[index].total = (updatedItems[index].price * newQuantity) - (updatedItems[index].discount || 0);
    
    onItemsChange(updatedItems);
    
    // حساب الإجمالي
    const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    onTotalChange(newTotal);
  };
  
  // تحديث خصم عنصر
  const handleUpdateDiscount = (index: number, newDiscount: number) => {
    if (newDiscount < 0) return;
    
    const updatedItems = [...items];
    updatedItems[index].discount = newDiscount;
    updatedItems[index].total = (updatedItems[index].price * updatedItems[index].quantity) - newDiscount;
    
    onItemsChange(updatedItems);
    
    // حساب الإجمالي
    const newTotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    onTotalChange(newTotal);
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-2 items-end">
        <div className="col-span-5">
          <label className="text-sm font-medium mb-1 block">المنتج</label>
          <Select
            value={selectedProductId}
            onValueChange={setSelectedProductId}
            disabled={isLoading || isError}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر منتج" />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  <span>جاري التحميل...</span>
                </div>
              ) : isError ? (
                <div className="p-2 text-destructive">خطأ في تحميل المنتجات</div>
              ) : products.length === 0 ? (
                <div className="p-2">لا توجد منتجات متاحة</div>
              ) : (
                products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} - {product.price.toFixed(2)} ريال
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="col-span-2">
          <label className="text-sm font-medium mb-1 block">الكمية</label>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          />
        </div>
        
        <div className="col-span-2">
          <label className="text-sm font-medium mb-1 block">الخصم</label>
          <Input
            type="number"
            min="0"
            value={discount}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
          />
        </div>
        
        <div className="col-span-3">
          <Button
            type="button"
            onClick={handleAddItem}
            disabled={!selectedProductId || isLoading}
            className="w-full"
          >
            <Plus className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" />
            إضافة
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>المنتج</TableHead>
              <TableHead className="text-center">الكمية</TableHead>
              <TableHead className="text-center">السعر</TableHead>
              <TableHead className="text-center">الخصم</TableHead>
              <TableHead className="text-right rtl:text-left">الإجمالي</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                  لم يتم إضافة أي منتجات بعد
                </TableCell>
              </TableRow>
            ) : (
              items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.product?.name || 'منتج غير معروف'}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </Button>
                      <span className="mx-2">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{item.price.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <Input
                      type="number"
                      min="0"
                      value={item.discount || 0}
                      onChange={(e) => handleUpdateDiscount(index, parseFloat(e.target.value) || 0)}
                      className="w-20 mx-auto text-center"
                    />
                  </TableCell>
                  <TableCell className="text-right rtl:text-left font-medium">
                    {item.total.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {items.length > 0 && (
        <div className="flex justify-end">
          <div className="text-lg font-bold">
            الإجمالي: {items.reduce((sum, item) => sum + item.total, 0).toFixed(2)} ريال
          </div>
        </div>
      )}
    </div>
  );
}