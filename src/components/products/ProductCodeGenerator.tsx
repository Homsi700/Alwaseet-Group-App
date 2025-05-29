'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Barcode, Copy, Download, Printer, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// أنواع المنتجات المختلفة
const PRODUCT_TYPES = [
  { id: 'FRUIT', name: 'فواكه', prefix: 'FR' },
  { id: 'VEG', name: 'خضار', prefix: 'VG' },
  { id: 'DAIRY', name: 'ألبان', prefix: 'DR' },
  { id: 'CHEESE', name: 'أجبان', prefix: 'CH' },
  { id: 'MEAT', name: 'لحوم', prefix: 'MT' },
  { id: 'BAKERY', name: 'مخبوزات', prefix: 'BK' },
  { id: 'OTHER', name: 'أخرى', prefix: 'OT' },
];

interface ProductCodeGeneratorProps {
  onCodeGenerated?: (code: string) => void;
  productName?: string;
  initialProductType?: string;
}

export function ProductCodeGenerator({ onCodeGenerated, productName = '', initialProductType = '' }: ProductCodeGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [productType, setProductType] = useState<string>(initialProductType || 'OTHER');
  const [customName, setCustomName] = useState<string>(productName || '');
  const { toast } = useToast();

  // توليد رمز فريد للمنتج
  const generateProductCode = () => {
    // الحصول على البادئة من نوع المنتج
    const selectedType = PRODUCT_TYPES.find(type => type.id === productType);
    const prefix = selectedType ? selectedType.prefix : 'OT';
    
    // إنشاء جزء من الاسم (أول 3 أحرف من اسم المنتج)
    const nameSegment = customName
      .replace(/\s+/g, '') // إزالة المسافات
      .slice(0, 3)
      .toUpperCase();
    
    // إنشاء رقم عشوائي من 4 أرقام
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    
    // إنشاء طابع زمني (آخر 3 أرقام من الطابع الزمني الحالي)
    const timestamp = Date.now().toString().slice(-3);
    
    // تجميع الرمز
    const code = `${prefix}${nameSegment}${randomNum}${timestamp}`;
    
    setGeneratedCode(code);
    
    // استدعاء الدالة المرجعية إذا تم توفيرها
    if (onCodeGenerated) {
      onCodeGenerated(code);
    }
  };

  // نسخ الرمز إلى الحافظة
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({
      title: 'تم النسخ',
      description: 'تم نسخ رمز المنتج إلى الحافظة',
    });
  };

  // طباعة بطاقة المنتج
  const printProductCard = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'خطأ',
        description: 'فشل في فتح نافذة الطباعة. يرجى التحقق من إعدادات المتصفح.',
        variant: 'destructive',
      });
      return;
    }

    const selectedType = PRODUCT_TYPES.find(type => type.id === productType);
    const productTypeName = selectedType ? selectedType.name : 'أخرى';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>بطاقة المنتج</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            direction: rtl;
          }
          .product-card {
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 15px;
            width: 300px;
            margin: 0 auto;
          }
          .product-name {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            text-align: center;
          }
          .product-code {
            font-size: 16px;
            text-align: center;
            margin-bottom: 10px;
            font-family: monospace;
            letter-spacing: 1px;
          }
          .product-type {
            font-size: 14px;
            color: #666;
            text-align: center;
            margin-bottom: 15px;
          }
          .barcode {
            text-align: center;
            font-size: 14px;
            margin-top: 15px;
          }
          .barcode-image {
            display: block;
            margin: 0 auto;
            height: 80px;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .product-card {
              border: none;
              width: 100%;
            }
            .print-button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="product-card">
          <div class="product-name">${customName}</div>
          <div class="product-type">النوع: ${productTypeName}</div>
          <div class="product-code">${generatedCode}</div>
          <div class="barcode">
            <img src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${generatedCode}&scale=3&includetext=true" alt="باركود" class="barcode-image">
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px;" class="print-button">
          <button onclick="window.print(); window.close();">طباعة</button>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Barcode className="ml-2 h-4 w-4" />
          توليد رمز منتج
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>توليد رمز منتج</DialogTitle>
          <DialogDescription>
            قم بإنشاء رمز فريد للمنتجات التي ليس لها رمز تسلسلي مثل الخضار والفواكه والألبان.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="product-name">اسم المنتج</Label>
            <Input
              id="product-name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="أدخل اسم المنتج"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="product-type">نوع المنتج</Label>
            <Select value={productType} onValueChange={setProductType}>
              <SelectTrigger id="product-type">
                <SelectValue placeholder="اختر نوع المنتج" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_TYPES.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {generatedCode && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">الرمز المولد</CardTitle>
                <CardDescription>يمكنك استخدام هذا الرمز لتعريف المنتج</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-lg">
                    {generatedCode}
                  </code>
                  <Button variant="ghost" size="icon" onClick={copyToClipboard} title="نسخ الرمز">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" onClick={generateProductCode}>
                  <RefreshCw className="ml-2 h-4 w-4" />
                  توليد رمز جديد
                </Button>
                <Button variant="outline" size="sm" onClick={printProductCard}>
                  <Printer className="ml-2 h-4 w-4" />
                  طباعة بطاقة المنتج
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
        <DialogFooter className="sm:justify-between">
          {!generatedCode && (
            <Button type="button" onClick={generateProductCode}>
              <Barcode className="ml-2 h-4 w-4" />
              توليد الرمز
            </Button>
          )}
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            إغلاق
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}