'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, 
  Save, 
  X, 
  Upload, 
  Trash2, 
  Loader2, 
  Package, 
  Barcode, 
  ImagePlus, 
  Info, 
  DollarSign, 
  ShoppingCart, 
  Tag, 
  AlertTriangle 
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useProduct, useUpdateProduct } from '@/hooks/use-products';
import { useCategories } from '@/hooks/use-categories';

// بيانات وهمية للفئات
const mockCategories = [
  { id: 'category-1', name: 'أجهزة كمبيوتر' },
  { id: 'category-2', name: 'طابعات' },
  { id: 'category-3', name: 'أجهزة عرض' },
  { id: 'category-4', name: 'هواتف' },
  { id: 'category-5', name: 'شاشات' },
  { id: 'category-6', name: 'ملحقات' },
  { id: 'category-7', name: 'سماعات' },
  { id: 'category-8', name: 'كاميرات' },
];

// بيانات وهمية للمنتج
const mockProduct = {
  id: 'product-1',
  name: 'لابتوب HP ProBook',
  sku: 'HP-PB-001',
  barcode: '123456789',
  description: 'لابتوب HP ProBook بمعالج Core i7 وذاكرة 16GB وقرص صلب SSD بسعة 512GB. يأتي مع نظام تشغيل Windows 11 Pro مثبت مسبقاً. مثالي للاستخدام المكتبي والأعمال.',
  price: 1500,
  costPrice: 1200,
  stock: 10,
  minStock: 3,
  maxStock: 20,
  unit: 'قطعة',
  categoryId: 'category-1',
  category: {
    id: 'category-1',
    name: 'أجهزة كمبيوتر',
  },
  status: 'ACTIVE',
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
  ],
  isActive: true,
  isFeatured: true,
  isDigital: false,
  hasVariants: false,
  taxRate: 15,
  weight: 2.5,
  dimensions: {
    length: 35,
    width: 25,
    height: 2.5,
  },
  tags: ['لابتوب', 'HP', 'كمبيوتر محمول'],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-06-20'),
};

export default function EditProductPage({ params }: { params: { productId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('basic');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // بيانات المنتج
  const [productData, setProductData] = useState<any>(null);
  
  // في الواقع، سنستخدم useProduct و useUpdateProduct hooks
  // لكن هنا سنحاكي العملية
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // محاكاة جلب البيانات
        if (params.productId === mockProduct.id) {
          setProductData(mockProduct);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('خطأ في جلب بيانات المنتج:', error);
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [params.productId]);
  
  // تحديث بيانات المنتج
  const updateProductData = (field: string, value: any) => {
    setProductData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };
  
  // تحديث الأبعاد
  const updateDimension = (dimension: string, value: number) => {
    setProductData(prev => ({
      ...prev,
      dimensions: {
        ...prev.dimensions,
        [dimension]: value,
      },
    }));
    setHasChanges(true);
  };
  
  // إضافة صورة
  const handleAddImage = () => {
    // في الواقع، سنستخدم مكتبة لرفع الصور
    // لكن هنا سنحاكي العملية
    const newImage = `https://example.com/image${productData.images.length + 1}.jpg`;
    setProductData(prev => ({
      ...prev,
      images: [...prev.images, newImage],
    }));
    setHasChanges(true);
    
    toast({
      title: 'تمت إضافة الصورة',
      description: 'تمت إضافة الصورة بنجاح',
      variant: 'default',
    });
  };
  
  // حذف صورة
  const handleRemoveImage = (index: number) => {
    setProductData(prev => ({
      ...prev,
      images: prev.images.filter((_: any, i: number) => i !== index),
    }));
    setHasChanges(true);
  };
  
  // إنشاء رمز SKU تلقائي
  const generateSku = () => {
    if (!productData.name || !productData.categoryId) {
      toast({
        title: 'تعذر إنشاء الرمز',
        description: 'يرجى إدخال اسم المنتج والفئة أولاً',
        variant: 'destructive',
      });
      return;
    }
    
    const category = mockCategories.find(c => c.id === productData.categoryId);
    if (!category) return;
    
    // استخراج الأحرف الأولى من اسم الفئة
    const categoryPrefix = category.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
    
    // استخراج الأحرف الأولى من اسم المنتج
    const productPrefix = productData.name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
    
    // إنشاء رقم عشوائي
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    
    const sku = `${categoryPrefix}-${productPrefix}-${randomNum}`;
    updateProductData('sku', sku);
  };
  
  // إنشاء باركود تلقائي
  const generateBarcode = () => {
    // إنشاء رقم عشوائي من 13 رقم (مثل EAN-13)
    const barcode = Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('');
    updateProductData('barcode', barcode);
  };
  
  // حفظ المنتج
  const handleSaveProduct = async () => {
    // التحقق من البيانات المطلوبة
    if (!productData.name) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم المنتج',
        variant: 'destructive',
      });
      setActiveTab('basic');
      return;
    }
    
    if (!productData.categoryId) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار فئة المنتج',
        variant: 'destructive',
      });
      setActiveTab('basic');
      return;
    }
    
    if (productData.price <= 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال سعر صحيح للمنتج',
        variant: 'destructive',
      });
      setActiveTab('pricing');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // في الواقع، سنستخدم updateProductMutation.mutateAsync
      // لكن هنا سنحاكي العملية
      
      setTimeout(() => {
        toast({
          title: 'تم تحديث المنتج بنجاح',
          description: 'تم تحديث بيانات المنتج بنجاح',
          variant: 'default',
        });
        
        setIsSaving(false);
        router.push(`/inventory/${params.productId}`);
      }, 1500);
    } catch (error) {
      setIsSaving(false);
      console.error('خطأ في تحديث المنتج:', error);
    }
  };
  
  // إلغاء تعديل المنتج
  const handleCancel = () => {
    if (hasChanges) {
      if (confirm('هل أنت متأكد من رغبتك في إلغاء التعديلات؟ سيتم فقدان جميع التغييرات.')) {
        router.push(`/inventory/${params.productId}`);
      }
    } else {
      router.push(`/inventory/${params.productId}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!productData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">المنتج غير موجود</h2>
        <p className="text-muted-foreground mb-6">لم يتم العثور على المنتج المطلوب</p>
        <Button onClick={() => router.push('/inventory')}>
          <ArrowLeft className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> العودة إلى المخزون
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full"
              onClick={() => router.push(`/inventory/${params.productId}`)}
            >
              <ArrowLeft className="h-4 w-4 icon-directional" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">تعديل المنتج</h1>
          </div>
          <p className="text-muted-foreground mt-1">{productData.sku}</p>
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
            onClick={handleSaveProduct}
            disabled={isSaving || !hasChanges}
          >
            <Save className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> حفظ التغييرات
            {isSaving && (
              <Loader2 className="ml-2 rtl:mr-2 h-4 w-4 animate-spin" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="basic">معلومات أساسية</TabsTrigger>
              <TabsTrigger value="pricing">التسعير</TabsTrigger>
              <TabsTrigger value="inventory">المخزون</TabsTrigger>
              <TabsTrigger value="additional">معلومات إضافية</TabsTrigger>
            </TabsList>
            
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Info className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" />
                    المعلومات الأساسية
                  </CardTitle>
                  <CardDescription>
                    تعديل المعلومات الأساسية للمنتج
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">اسم المنتج *</Label>
                    <Input
                      id="name"
                      value={productData.name}
                      onChange={(e) => updateProductData('name', e.target.value)}
                      placeholder="أدخل اسم المنتج"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">الفئة *</Label>
                    <Select
                      value={productData.categoryId}
                      onValueChange={(value) => updateProductData('categoryId', value)}
                    >
                      <SelectTrigger id="category" className="w-full">
                        <SelectValue placeholder="اختر فئة المنتج" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockCategories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sku">رمز المنتج (SKU)</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={generateSku}
                          type="button"
                        >
                          إنشاء تلقائي
                        </Button>
                      </div>
                      <Input
                        id="sku"
                        value={productData.sku}
                        onChange={(e) => updateProductData('sku', e.target.value)}
                        placeholder="أدخل رمز المنتج"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="barcode">الباركود</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={generateBarcode}
                          type="button"
                        >
                          إنشاء تلقائي
                        </Button>
                      </div>
                      <Input
                        id="barcode"
                        value={productData.barcode}
                        onChange={(e) => updateProductData('barcode', e.target.value)}
                        placeholder="أدخل باركود المنتج"
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">وصف المنتج</Label>
                    <Textarea
                      id="description"
                      value={productData.description}
                      onChange={(e) => updateProductData('description', e.target.value)}
                      placeholder="أدخل وصف المنتج"
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>صور المنتج</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                      {productData.images.map((image: string, index: number) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-muted rounded-md flex items-center justify-center overflow-hidden">
                            <img
                              src={image}
                              alt={`صورة المنتج ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        className="aspect-square flex flex-col items-center justify-center gap-2 border-dashed"
                        onClick={handleAddImage}
                      >
                        <ImagePlus className="h-6 w-6" />
                        <span className="text-xs">إضافة صورة</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" />
                    معلومات التسعير
                  </CardTitle>
                  <CardDescription>
                    تعديل معلومات تسعير المنتج
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">سعر البيع *</Label>
                      <div className="relative">
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={productData.price}
                          onChange={(e) => updateProductData('price', parseFloat(e.target.value) || 0)}
                          placeholder="أدخل سعر البيع"
                          className="w-full pl-12 rtl:pr-12 rtl:pl-4"
                        />
                        <div className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto flex items-center px-3 pointer-events-none bg-muted rounded-l-md rtl:rounded-l-none rtl:rounded-r-md border-r rtl:border-r-0 rtl:border-l border-input">
                          ر.س
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="costPrice">سعر التكلفة *</Label>
                      <div className="relative">
                        <Input
                          id="costPrice"
                          type="number"
                          min="0"
                          step="0.01"
                          value={productData.costPrice}
                          onChange={(e) => updateProductData('costPrice', parseFloat(e.target.value) || 0)}
                          placeholder="أدخل سعر التكلفة"
                          className="w-full pl-12 rtl:pr-12 rtl:pl-4"
                        />
                        <div className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto flex items-center px-3 pointer-events-none bg-muted rounded-l-md rtl:rounded-l-none rtl:rounded-r-md border-r rtl:border-r-0 rtl:border-l border-input">
                          ر.س
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">نسبة الضريبة (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      min="0"
                      max="100"
                      value={productData.taxRate}
                      onChange={(e) => updateProductData('taxRate', parseFloat(e.target.value) || 0)}
                      placeholder="أدخل نسبة الضريبة"
                      className="w-full"
                    />
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">ملخص التسعير</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">سعر التكلفة</p>
                        <p className="font-medium">{productData.costPrice.toFixed(2)} ر.س</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">سعر البيع</p>
                        <p className="font-medium">{productData.price.toFixed(2)} ر.س</p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">هامش الربح</p>
                        <p className="font-medium">
                          {productData.costPrice > 0
                            ? ((productData.price - productData.costPrice) / productData.costPrice * 100).toFixed(2)
                            : '0.00'
                          }%
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">السعر شامل الضريبة</p>
                        <p className="font-medium">
                          {(productData.price * (1 + productData.taxRate / 100)).toFixed(2)} ر.س
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="inventory" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" />
                    معلومات المخزون
                  </CardTitle>
                  <CardDescription>
                    تعديل معلومات مخزون المنتج
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock">الكمية الحالية *</Label>
                      <Input
                        id="stock"
                        type="number"
                        min="0"
                        value={productData.stock}
                        onChange={(e) => updateProductData('stock', parseInt(e.target.value) || 0)}
                        placeholder="أدخل الكمية الحالية"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="minStock">الحد الأدنى للمخزون</Label>
                      <Input
                        id="minStock"
                        type="number"
                        min="0"
                        value={productData.minStock}
                        onChange={(e) => updateProductData('minStock', parseInt(e.target.value) || 0)}
                        placeholder="أدخل الحد الأدنى"
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxStock">الحد الأقصى للمخزون</Label>
                      <Input
                        id="maxStock"
                        type="number"
                        min="0"
                        value={productData.maxStock}
                        onChange={(e) => updateProductData('maxStock', parseInt(e.target.value) || 0)}
                        placeholder="أدخل الحد الأقصى"
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="unit">وحدة القياس</Label>
                    <Select
                      value={productData.unit}
                      onValueChange={(value) => updateProductData('unit', value)}
                    >
                      <SelectTrigger id="unit" className="w-full">
                        <SelectValue placeholder="اختر وحدة القياس" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="قطعة">قطعة</SelectItem>
                        <SelectItem value="كجم">كجم</SelectItem>
                        <SelectItem value="لتر">لتر</SelectItem>
                        <SelectItem value="متر">متر</SelectItem>
                        <SelectItem value="علبة">علبة</SelectItem>
                        <SelectItem value="زوج">زوج</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">حالة المنتج</Label>
                    <Select
                      value={productData.status}
                      onValueChange={(value) => updateProductData('status', value)}
                    >
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue placeholder="اختر حالة المنتج" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">نشط</SelectItem>
                        <SelectItem value="OUT_OF_STOCK">نفذ من المخزون</SelectItem>
                        <SelectItem value="LOW_STOCK">مخزون منخفض</SelectItem>
                        <SelectItem value="DISCONTINUED">متوقف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Switch
                      id="hasVariants"
                      checked={productData.hasVariants}
                      onCheckedChange={(checked) => updateProductData('hasVariants', checked)}
                    />
                    <Label htmlFor="hasVariants">هذا المنتج له متغيرات (ألوان، أحجام، إلخ)</Label>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="additional" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Tag className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" />
                    معلومات إضافية
                  </CardTitle>
                  <CardDescription>
                    تعديل معلومات إضافية للمنتج
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">الوزن (كجم)</Label>
                    <Input
                      id="weight"
                      type="number"
                      min="0"
                      step="0.01"
                      value={productData.weight}
                      onChange={(e) => updateProductData('weight', parseFloat(e.target.value) || 0)}
                      placeholder="أدخل وزن المنتج"
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>الأبعاد (سم)</Label>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="length">الطول</Label>
                        <Input
                          id="length"
                          type="number"
                          min="0"
                          step="0.1"
                          value={productData.dimensions.length}
                          onChange={(e) => updateDimension('length', parseFloat(e.target.value) || 0)}
                          placeholder="الطول"
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="width">العرض</Label>
                        <Input
                          id="width"
                          type="number"
                          min="0"
                          step="0.1"
                          value={productData.dimensions.width}
                          onChange={(e) => updateDimension('width', parseFloat(e.target.value) || 0)}
                          placeholder="العرض"
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="height">الارتفاع</Label>
                        <Input
                          id="height"
                          type="number"
                          min="0"
                          step="0.1"
                          value={productData.dimensions.height}
                          onChange={(e) => updateDimension('height', parseFloat(e.target.value) || 0)}
                          placeholder="الارتفاع"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        id="isActive"
                        checked={productData.isActive}
                        onCheckedChange={(checked) => updateProductData('isActive', checked)}
                      />
                      <Label htmlFor="isActive">المنتج نشط</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        id="isFeatured"
                        checked={productData.isFeatured}
                        onCheckedChange={(checked) => updateProductData('isFeatured', checked)}
                      />
                      <Label htmlFor="isFeatured">منتج مميز</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch
                        id="isDigital"
                        checked={productData.isDigital}
                        onCheckedChange={(checked) => updateProductData('isDigital', checked)}
                      />
                      <Label htmlFor="isDigital">منتج رقمي (غير مادي)</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ملخص المنتج</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {productData.images && productData.images.length > 0 ? (
                  <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    <img
                      src={productData.images[0]}
                      alt={productData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-lg">{productData.name}</h3>
                  <p className="text-sm text-muted-foreground">{productData.sku}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الكمية الحالية:</span>
                  <span className="font-medium">{productData.stock} {productData.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">سعر البيع:</span>
                  <span className="font-medium">{productData.price.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">سعر التكلفة:</span>
                  <span className="font-medium">{productData.costPrice.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">قيمة المخزون:</span>
                  <span className="font-medium">{(productData.stock * productData.costPrice).toFixed(2)} ر.س</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">الحالة:</span>
                  <span className="font-medium">
                    {productData.status === 'ACTIVE' ? 'نشط' :
                     productData.status === 'OUT_OF_STOCK' ? 'نفذ من المخزون' :
                     productData.status === 'LOW_STOCK' ? 'مخزون منخفض' :
                     'متوقف'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">الفئة:</span>
                  <span className="font-medium">
                    {mockCategories.find(c => c.id === productData.categoryId)?.name}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button className="w-full" onClick={handleSaveProduct} disabled={isSaving || !hasChanges}>
                <Save className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> حفظ التغييرات
                {isSaving && (
                  <Loader2 className="ml-2 rtl:mr-2 h-4 w-4 animate-spin" />
                )}
              </Button>
              <Button variant="outline" className="w-full" onClick={handleCancel} disabled={isSaving}>
                <X className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> إلغاء
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>نصائح</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">معلومات المنتج</h4>
                <p className="text-muted-foreground">
                  تأكد من إدخال اسم منتج واضح ووصف مفصل لتسهيل البحث والتصنيف.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">الصور</h4>
                <p className="text-muted-foreground">
                  أضف صوراً عالية الجودة للمنتج من زوايا مختلفة لعرض أفضل للمنتج.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">التسعير</h4>
                <p className="text-muted-foreground">
                  حدد سعر البيع وسعر التكلفة بدقة لحساب هامش الربح بشكل صحيح.
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">المخزون</h4>
                <p className="text-muted-foreground">
                  ضبط الحد الأدنى للمخزون يساعد في تنبيهك عندما تحتاج إلى إعادة الطلب.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}