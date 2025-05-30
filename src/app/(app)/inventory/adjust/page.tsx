'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Search, 
  Loader2, 
  Package, 
  Plus, 
  Trash2, 
  AlertTriangle 
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useProducts } from '@/hooks/use-products';
import { useAdjustStock } from '@/hooks/use-inventory';

// بيانات وهمية للمنتجات
const mockProducts = [
  {
    id: 'product-1',
    name: 'لابتوب HP ProBook',
    sku: 'HP-PB-001',
    barcode: '123456789',
    stock: 10,
    unit: 'قطعة',
  },
  {
    id: 'product-2',
    name: 'طابعة Canon',
    sku: 'CN-PR-001',
    barcode: '987654321',
    stock: 15,
    unit: 'قطعة',
  },
  {
    id: 'product-3',
    name: 'جهاز عرض Epson',
    sku: 'EP-PJ-001',
    barcode: '456789123',
    stock: 5,
    unit: 'قطعة',
  },
  {
    id: 'product-4',
    name: 'هاتف Samsung Galaxy',
    sku: 'SG-PH-001',
    barcode: '789123456',
    stock: 20,
    unit: 'قطعة',
  },
  {
    id: 'product-5',
    name: 'كمبيوتر مكتبي Dell',
    sku: 'DL-PC-001',
    barcode: '321654987',
    stock: 3,
    unit: 'قطعة',
  },
  {
    id: 'product-6',
    name: 'شاشة LG',
    sku: 'LG-MN-001',
    barcode: '654987321',
    stock: 8,
    unit: 'قطعة',
  },
  {
    id: 'product-7',
    name: 'ماوس Logitech',
    sku: 'LG-MS-001',
    barcode: '987321654',
    stock: 30,
    unit: 'قطعة',
  },
  {
    id: 'product-8',
    name: 'لوحة مفاتيح Microsoft',
    sku: 'MS-KB-001',
    barcode: '321987654',
    stock: 25,
    unit: 'قطعة',
  },
  {
    id: 'product-9',
    name: 'سماعات Sony',
    sku: 'SN-HP-001',
    barcode: '159753456',
    stock: 0,
    unit: 'قطعة',
  },
  {
    id: 'product-10',
    name: 'كاميرا Canon',
    sku: 'CN-CM-001',
    barcode: '753159456',
    stock: 2,
    unit: 'قطعة',
  },
];

// أنواع التعديل
const adjustmentTypes = [
  { id: 'STOCK_COUNT', name: 'جرد مخزني' },
  { id: 'DAMAGE', name: 'تالف' },
  { id: 'LOSS', name: 'فقدان' },
  { id: 'CORRECTION', name: 'تصحيح' },
  { id: 'RETURN', name: 'مرتجع' },
  { id: 'OTHER', name: 'أخرى' },
];

export default function AdjustStockPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  
  // بيانات التعديل
  const [adjustmentData, setAdjustmentData] = useState({
    reference: `ADJ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
    date: new Date(),
    type: 'STOCK_COUNT',
    notes: '',
    items: [] as {
      productId: string;
      product: any;
      currentStock: number;
      newStock: number;
      difference: number;
      notes: string;
    }[],
  });
  
  // في الواقع، سنستخدم useProducts hook
  // لكن هنا سنحاكي العملية
  const products = mockProducts;
  
  useEffect(() => {
    const productId = searchParams.get('productId');
    if (productId) {
      const product = products.find(p => p.id === productId);
      if (product) {
        addProductToAdjustment(product);
      }
    }
  }, [searchParams]);
  
  // تصفية المنتجات حسب البحث
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.includes(searchQuery)
  );
  
  // إضافة منتج إلى التعديل
  const addProductToAdjustment = (product: any) => {
    // التحقق من وجود المنتج مسبقاً
    const existingItemIndex = adjustmentData.items.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex !== -1) {
      toast({
        title: 'تنبيه',
        description: 'هذا المنتج موجود بالفعل في قائمة التعديل',
        variant: 'default',
      });
      return;
    }
    
    // إضافة المنتج إلى القائمة
    setAdjustmentData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: product.id,
          product,
          currentStock: product.stock,
          newStock: product.stock,
          difference: 0,
          notes: '',
        },
      ],
    }));
    
    setIsProductDialogOpen(false);
  };
  
  // حذف منتج من التعديل
  const removeProductFromAdjustment = (index: number) => {
    setAdjustmentData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };
  
  // تحديث كمية المنتج
  const updateProductQuantity = (index: number, newStock: number) => {
    setAdjustmentData(prev => {
      const updatedItems = [...prev.items];
      const item = updatedItems[index];
      const difference = newStock - item.currentStock;
      
      updatedItems[index] = {
        ...item,
        newStock,
        difference,
      };
      
      return {
        ...prev,
        items: updatedItems,
      };
    });
  };
  
  // تحديث ملاحظات المنتج
  const updateProductNotes = (index: number, notes: string) => {
    setAdjustmentData(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = {
        ...updatedItems[index],
        notes,
      };
      
      return {
        ...prev,
        items: updatedItems,
      };
    });
  };
  
  // حفظ التعديل
  const handleSaveAdjustment = async () => {
    // التحقق من وجود منتجات
    if (adjustmentData.items.length === 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى إضافة منتج واحد على الأقل',
        variant: 'destructive',
      });
      return;
    }
    
    // التحقق من وجود تغييرات
    const hasChanges = adjustmentData.items.some(item => item.difference !== 0);
    if (!hasChanges) {
      toast({
        title: 'تنبيه',
        description: 'لم يتم إجراء أي تغييرات على المخزون',
        variant: 'default',
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // في الواقع، سنستخدم adjustStockMutation.mutateAsync
      // لكن هنا سنحاكي العملية
      
      setTimeout(() => {
        toast({
          title: 'تم تعديل المخزون بنجاح',
          description: 'تم تحديث كميات المخزون بنجاح',
          variant: 'default',
        });
        
        setIsSaving(false);
        router.push('/inventory');
      }, 1500);
    } catch (error) {
      setIsSaving(false);
      console.error('خطأ في تعديل المخزون:', error);
    }
  };
  
  // إلغاء التعديل
  const handleCancel = () => {
    if (adjustmentData.items.length > 0) {
      if (confirm('هل أنت متأكد من رغبتك في إلغاء التعديل؟ سيتم فقدان جميع التغييرات.')) {
        router.push('/inventory');
      }
    } else {
      router.push('/inventory');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full"
              onClick={() => router.push('/inventory')}
            >
              <ArrowLeft className="h-4 w-4 icon-directional" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">تعديل المخزون</h1>
          </div>
          <p className="text-muted-foreground mt-1">تعديل كميات المخزون وتسجيل الفروقات</p>
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
            onClick={handleSaveAdjustment}
            disabled={isSaving || adjustmentData.items.length === 0}
          >
            <Save className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> حفظ التعديل
            {isSaving && (
              <Loader2 className="ml-2 rtl:mr-2 h-4 w-4 animate-spin" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات التعديل</CardTitle>
              <CardDescription>
                أدخل معلومات تعديل المخزون
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reference">رقم المرجع</Label>
                  <Input
                    id="reference"
                    value={adjustmentData.reference}
                    onChange={(e) => setAdjustmentData(prev => ({ ...prev, reference: e.target.value }))}
                    placeholder="أدخل رقم المرجع"
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">التاريخ</Label>
                  <Input
                    id="date"
                    type="date"
                    value={adjustmentData.date instanceof Date ? adjustmentData.date.toISOString().split('T')[0] : String(adjustmentData.date).split('T')[0]}
                    onChange={(e) => setAdjustmentData(prev => ({ ...prev, date: new Date(e.target.value) }))}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">نوع التعديل</Label>
                <Select
                  value={adjustmentData.type}
                  onValueChange={(value) => setAdjustmentData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue placeholder="اختر نوع التعديل" />
                  </SelectTrigger>
                  <SelectContent>
                    {adjustmentTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={adjustmentData.notes}
                  onChange={(e) => setAdjustmentData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="أدخل ملاحظات التعديل"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle>المنتجات</CardTitle>
                <CardDescription>
                  إضافة المنتجات وتعديل كمياتها
                </CardDescription>
              </div>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="rounded-md">
                    <Plus className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> إضافة منتج
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>إضافة منتج</DialogTitle>
                    <DialogDescription>
                      اختر المنتج لإضافته إلى قائمة التعديل
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="relative">
                      <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="بحث عن منتج..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-3 pr-10 w-full"
                      />
                    </div>
                    
                    <div className="border rounded-md overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>المنتج</TableHead>
                            <TableHead>الرمز</TableHead>
                            <TableHead className="text-center">المخزون الحالي</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredProducts.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                لا توجد منتجات مطابقة للبحث
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredProducts.map(product => (
                              <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.sku}</TableCell>
                                <TableCell className="text-center">{product.stock} {product.unit}</TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="rounded-full h-8 w-8 p-0"
                                    onClick={() => addProductToAdjustment(product)}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsProductDialogOpen(false)}
                    >
                      إغلاق
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {adjustmentData.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
                  <Package className="h-8 w-8 mx-auto mb-2" />
                  <p>لا توجد منتجات في قائمة التعديل</p>
                  <p className="text-sm mt-1">انقر على "إضافة منتج" لإضافة منتجات إلى القائمة</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">#</TableHead>
                        <TableHead>المنتج</TableHead>
                        <TableHead className="text-center">المخزون الحالي</TableHead>
                        <TableHead className="text-center">المخزون الجديد</TableHead>
                        <TableHead className="text-center">الفرق</TableHead>
                        <TableHead>ملاحظات</TableHead>
                        <TableHead className="w-[70px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adjustmentData.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-medium">{item.product.name}</div>
                              <div className="text-xs text-muted-foreground">{item.product.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{item.currentStock} {item.product.unit}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={item.newStock}
                              onChange={(e) => updateProductQuantity(index, parseInt(e.target.value) || 0)}
                              className="w-20 mx-auto text-center"
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={
                              item.difference > 0 ? 'text-green-600 dark:text-green-400' :
                              item.difference < 0 ? 'text-red-600 dark:text-red-400' : ''
                            }>
                              {item.difference > 0 ? '+' : ''}{item.difference}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={item.notes}
                              onChange={(e) => updateProductNotes(index, e.target.value)}
                              placeholder="ملاحظات"
                              className="w-full"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full h-8 w-8 p-0 text-destructive hover:text-destructive/90"
                              onClick={() => removeProductFromAdjustment(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ملخص التعديل</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">رقم المرجع:</span>
                  <span className="font-medium">{adjustmentData.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">التاريخ:</span>
                  <span className="font-medium">
                    {adjustmentData.date instanceof Date
                      ? adjustmentData.date.toLocaleDateString('ar-SA')
                      : new Date(adjustmentData.date).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">نوع التعديل:</span>
                  <span className="font-medium">
                    {adjustmentTypes.find(t => t.id === adjustmentData.type)?.name}
                  </span>
                </div>
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">عدد المنتجات:</span>
                  <span className="font-medium">{adjustmentData.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">إجمالي الزيادة:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    +{adjustmentData.items.reduce((sum, item) => sum + (item.difference > 0 ? item.difference : 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">إجمالي النقص:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {adjustmentData.items.reduce((sum, item) => sum + (item.difference < 0 ? item.difference : 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between font-bold border-t pt-2 mt-2">
                  <span>صافي التغيير:</span>
                  <span className={
                    adjustmentData.items.reduce((sum, item) => sum + item.difference, 0) > 0
                      ? 'text-green-600 dark:text-green-400'
                      : adjustmentData.items.reduce((sum, item) => sum + item.difference, 0) < 0
                      ? 'text-red-600 dark:text-red-400'
                      : ''
                  }>
                    {adjustmentData.items.reduce((sum, item) => sum + item.difference, 0) > 0 ? '+' : ''}
                    {adjustmentData.items.reduce((sum, item) => sum + item.difference, 0)}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                className="w-full" 
                onClick={handleSaveAdjustment}
                disabled={isSaving || adjustmentData.items.length === 0}
              >
                <Save className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> حفظ التعديل
                {isSaving && (
                  <Loader2 className="ml-2 rtl:mr-2 h-4 w-4 animate-spin" />
                )}
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> إلغاء
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>نصائح</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium">تعديل المخزون</h4>
                  <p className="text-muted-foreground mt-1">
                    يستخدم تعديل المخزون لتصحيح الفروقات بين المخزون الفعلي والمخزون المسجل في النظام.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium">الجرد المخزني</h4>
                  <p className="text-muted-foreground mt-1">
                    قم بإجراء جرد مخزني دوري للتأكد من دقة بيانات المخزون وتصحيح أي فروقات.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="font-medium">توثيق التعديلات</h4>
                  <p className="text-muted-foreground mt-1">
                    تأكد من توثيق سبب التعديل في حقل الملاحظات لتسهيل المراجعة لاحقاً.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}