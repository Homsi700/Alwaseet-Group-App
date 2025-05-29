import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, AlertTriangle } from "lucide-react";
import Image from 'next/image';
import { Badge } from "@/components/ui/badge";

// واجهة الخصائص
interface ProductCardProps {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (productId: string | number) => void;
}

export function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  // التحقق من حالة المخزون
  const isLowStock = product.quantity <= (product.minimumQuantity || 5);
  const isOutOfStock = product.quantity <= 0;
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-muted-foreground">لا توجد صورة</span>
          </div>
        )}
        
        {/* شارات حالة المخزون */}
        {isOutOfStock && (
          <Badge variant="destructive" className="absolute top-2 left-2 rtl:right-2 rtl:left-auto">
            غير متوفر
          </Badge>
        )}
        {!isOutOfStock && isLowStock && (
          <Badge variant="warning" className="absolute top-2 left-2 rtl:right-2 rtl:left-auto bg-yellow-500 hover:bg-yellow-600">
            مخزون منخفض
          </Badge>
        )}
      </div>
      
      <CardHeader className="p-4 pb-0">
        <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-2 flex-grow">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description || 'لا يوجد وصف'}
          </p>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">السعر:</span>
            <span className="font-bold text-primary">{product.salePrice?.toFixed(2) || '0.00'} ريال</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">المخزون:</span>
            <div className="flex items-center">
              {isLowStock && <AlertTriangle className="h-4 w-4 text-yellow-500 ml-1 rtl:mr-1" />}
              <span className={`font-medium ${isOutOfStock ? 'text-destructive' : (isLowStock ? 'text-yellow-600' : 'text-green-600')}`}>
                {product.quantity}
              </span>
            </div>
          </div>
          
          {product.barcode && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">الباركود:</span>
              <span className="text-sm">{product.barcode}</span>
            </div>
          )}
          
          {product.category && (
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">الفئة:</span>
              <Badge variant="outline">{product.category.name}</Badge>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 border-t flex justify-between">
        <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
          <Edit className="h-4 w-4 ml-2 rtl:mr-2" /> تعديل
        </Button>
        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDelete(product.id || product.productId)}>
          <Trash2 className="h-4 w-4 ml-2 rtl:mr-2" /> حذف
        </Button>
      </CardFooter>
    </Card>
  );
}