'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Package, 
  Barcode, 
  Tag, 
  DollarSign, 
  ShoppingCart, 
  ArrowUpDown, 
  AlertTriangle, 
  Loader2, 
  Calendar, 
  Info, 
  History, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Truck, 
  ShoppingBag 
} from "lucide-react";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useProduct, useDeleteProduct } from '@/hooks/use-products';

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

// بيانات وهمية لحركة المخزون
const mockStockMovements = [
  {
    id: 'movement-1',
    date: new Date('2024-06-20'),
    type: 'PURCHASE',
    quantity: 5,
    reference: 'PO-2024-001',
    notes: 'شراء من المورد',
    user: 'أحمد محمد',
  },
  {
    id: 'movement-2',
    date: new Date('2024-06-18'),
    type: 'SALE',
    quantity: -2,
    reference: 'INV-2024-001',
    notes: 'بيع للعميل',
    user: 'محمد علي',
  },
  {
    id: 'movement-3',
    date: new Date('2024-06-15'),
    type: 'ADJUSTMENT',
    quantity: 1,
    reference: 'ADJ-2024-001',
    notes: 'تعديل بعد الجرد',
    user: 'أحمد محمد',
  },
  {
    id: 'movement-4',
    date: new Date('2024-06-10'),
    type: 'RETURN',
    quantity: 1,
    reference: 'RET-2024-001',
    notes: 'مرتجع من العميل',
    user: 'محمد علي',
  },
  {
    id: 'movement-5',
    date: new Date('2024-06-05'),
    type: 'PURCHASE',
    quantity: 10,
    reference: 'PO-2024-002',
    notes: 'شراء أولي',
    user: 'أحمد محمد',
  },
];

// بيانات وهمية للمبيعات
const mockSales = [
  {
    id: 'sale-1',
    date: new Date('2024-06-18'),
    invoiceNumber: 'INV-2024-001',
    customer: 'شركة الأمل للتجارة',
    quantity: 2,
    price: 1500,
    total: 3000,
  },
  {
    id: 'sale-2',
    date: new Date('2024-06-05'),
    invoiceNumber: 'INV-2024-002',
    customer: 'مؤسسة النجاح الحديثة',
    quantity: 1,
    price: 1500,
    total: 1500,
  },
];

// بيانات وهمية للمشتريات
const mockPurchases = [
  {
    id: 'purchase-1',
    date: new Date('2024-06-20'),
    poNumber: 'PO-2024-001',
    supplier: 'شركة التقنية الحديثة',
    quantity: 5,
    price: 1200,
    total: 6000,
  },
  {
    id: 'purchase-2',
    date: new Date('2024-06-05'),
    poNumber: 'PO-2024-002',
    supplier: 'شركة التقنية الحديثة',
    quantity: 10,
    price: 1200,
    total: 12000,
  },
];

// تنسيق التاريخ
const formatDate = (date: string | Date) => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ar });
};

export default function ProductDetailsPage({ params }: { params: { productId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  
  // في الواقع، سنستخدم useProduct hook
  // لكن هنا سنحاكي العملية
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // محاكاة جلب البيانات
        if (params.productId === mockProduct.id) {
          setProduct(mockProduct);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('خطأ في جلب بيانات المنتج:', error);
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [params.productId]);
  
  // حذف المنتج
  const handleDeleteProduct = async () => {
    try {
      // في الواقع، سنستخدم deleteProductMutation.mutateAsync
      // لكن هنا سنحاكي العملية
      
      toast({
        title: 'تم حذف المنتج بنجاح',
        variant: 'default',
      });
      
      setIsDeleteDialogOpen(false);
      router.push('/inventory');
    } catch (error) {
      console.error('خطأ في حذف المنتج:', error);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!product) {
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
  
  // حساب قيمة المخزون
  const inventoryValue = product.stock * product.costPrice;
  
  // تحديد حالة المخزون
  let stockStatus = "نشط";
  let statusVariant = "default";
  
  if (product.stock === 0) {
    stockStatus = "نفذ";
    statusVariant = "destructive";
  } else if (product.stock <= product.minStock) {
    stockStatus = "منخفض";
    statusVariant = "warning";
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
              onClick={() => router.push('/inventory')}
            >
              <ArrowLeft className="h-4 w-4 icon-directional" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">تفاصيل المنتج</h1>
          </div>
          <p className="text-muted-foreground mt-1">{product.sku}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={() => router.push(`/inventory/stock-movements?productId=${product.id}`)}
          >
            <ArrowUpDown className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> حركة المخزون
          </Button>
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={() => router.push(`/inventory/${product.id}/edit`)}
          >
            <Edit className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> تعديل
          </Button>
          <Button 
            variant="destructive" 
            className="rounded-md"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> حذف
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <CardDescription className="mt-1 flex items-center">
                    <Barcode className="h-4 w-4 ml-1 rtl:mr-1 icon-directional" />
                    {product.sku} {product.barcode && `| ${product.barcode}`}
                  </CardDescription>
                </div>
                <Badge variant={statusVariant as any} className="text-center">
                  {stockStatus}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="details">التفاصيل</TabsTrigger>
                  <TabsTrigger value="stock">المخزون</TabsTrigger>
                  <TabsTrigger value="sales">المبيعات</TabsTrigger>
                  <TabsTrigger value="purchases">المشتريات</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">معلومات المنتج</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">الوصف</p>
                            <p className="font-medium">{product.description || 'لا يوجد وصف'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">الفئة</p>
                            <p className="font-medium">{product.category?.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                            <p className="font-medium">{formatDate(product.createdAt)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">آخر تحديث</p>
                            <p className="font-medium">{formatDate(product.updatedAt)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-lg mb-3">معلومات التسعير</h3>
                      <div className="space-y-4">
                        <div className="flex items-start gap-2">
                          <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">سعر البيع</p>
                            <p className="font-medium">{product.price.toFixed(2)} ر.س</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">سعر التكلفة</p>
                            <p className="font-medium">{product.costPrice.toFixed(2)} ر.س</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">هامش الربح</p>
                            <p className="font-medium">
                              {product.costPrice > 0
                                ? ((product.price - product.costPrice) / product.costPrice * 100).toFixed(2)
                                : '0.00'
                              }%
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">السعر شامل الضريبة ({product.taxRate}%)</p>
                            <p className="font-medium">
                              {(product.price * (1 + product.taxRate / 100)).toFixed(2)} ر.س
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-3">معلومات إضافية</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">الوزن</p>
                        <p className="font-medium">{product.weight} كجم</p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">الأبعاد (طول × عرض × ارتفاع)</p>
                        <p className="font-medium">
                          {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} سم
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">الوسوم</p>
                        <div className="flex flex-wrap gap-2">
                          {product.tags && product.tags.length > 0 ? (
                            product.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="outline">{tag}</Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground">لا توجد وسوم</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-3">الصور</h3>
                    {product.images && product.images.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {product.images.map((image: string, index: number) => (
                          <div key={index} className="aspect-square bg-muted rounded-md flex items-center justify-center overflow-hidden">
                            <img
                              src={image}
                              alt={`صورة المنتج ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground border border-dashed rounded-md">
                        <p>لا توجد صور للمنتج</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="stock" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">الكمية الحالية</p>
                            <p className="text-2xl font-bold">{product.stock} {product.unit}</p>
                          </div>
                          <Package className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">قيمة المخزون</p>
                            <p className="text-2xl font-bold">{inventoryValue.toFixed(2)} ر.س</p>
                          </div>
                          <DollarSign className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">حدود المخزون</p>
                            <p className="text-lg font-bold">
                              <span className="text-yellow-600 dark:text-yellow-400">{product.minStock}</span>
                              {' - '}
                              <span className="text-green-600 dark:text-green-400">{product.maxStock}</span>
                            </p>
                          </div>
                          <AlertTriangle className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-3">حركة المخزون</h3>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>التاريخ</TableHead>
                            <TableHead>النوع</TableHead>
                            <TableHead className="text-center">الكمية</TableHead>
                            <TableHead>المرجع</TableHead>
                            <TableHead>الملاحظات</TableHead>
                            <TableHead>المستخدم</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockStockMovements.map((movement) => (
                            <TableRow key={movement.id}>
                              <TableCell>{formatDate(movement.date)}</TableCell>
                              <TableCell>
                                <Badge variant={
                                  movement.type === 'PURCHASE' ? 'default' :
                                  movement.type === 'SALE' ? 'destructive' :
                                  movement.type === 'ADJUSTMENT' ? 'outline' :
                                  'secondary'
                                }>
                                  {movement.type === 'PURCHASE' ? 'شراء' :
                                   movement.type === 'SALE' ? 'بيع' :
                                   movement.type === 'ADJUSTMENT' ? 'تعديل' :
                                   movement.type === 'RETURN' ? 'مرتجع' : movement.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className={
                                  movement.quantity > 0 ? 'text-green-600 dark:text-green-400' :
                                  movement.quantity < 0 ? 'text-red-600 dark:text-red-400' : ''
                                }>
                                  {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                                </span>
                              </TableCell>
                              <TableCell>{movement.reference}</TableCell>
                              <TableCell>{movement.notes}</TableCell>
                              <TableCell>{movement.user}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => router.push(`/inventory/stock-movements?productId=${product.id}`)}
                      >
                        <History className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> عرض كل الحركات
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="sales" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">إجمالي المبيعات</p>
                            <p className="text-2xl font-bold">
                              {mockSales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)} ر.س
                            </p>
                          </div>
                          <ShoppingBag className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">عدد الوحدات المباعة</p>
                            <p className="text-2xl font-bold">
                              {mockSales.reduce((sum, sale) => sum + sale.quantity, 0)} {product.unit}
                            </p>
                          </div>
                          <ShoppingCart className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">عدد الفواتير</p>
                            <p className="text-2xl font-bold">{mockSales.length}</p>
                          </div>
                          <FileText className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-3">فواتير المبيعات</h3>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>التاريخ</TableHead>
                            <TableHead>رقم الفاتورة</TableHead>
                            <TableHead>العميل</TableHead>
                            <TableHead className="text-center">الكمية</TableHead>
                            <TableHead className="text-right rtl:text-left">السعر</TableHead>
                            <TableHead className="text-right rtl:text-left">الإجمالي</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockSales.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                لا توجد مبيعات لهذا المنتج
                              </TableCell>
                            </TableRow>
                          ) : (
                            mockSales.map((sale) => (
                              <TableRow key={sale.id}>
                                <TableCell>{formatDate(sale.date)}</TableCell>
                                <TableCell>{sale.invoiceNumber}</TableCell>
                                <TableCell>{sale.customer}</TableCell>
                                <TableCell className="text-center">{sale.quantity}</TableCell>
                                <TableCell className="text-right rtl:text-left">{sale.price.toFixed(2)} ر.س</TableCell>
                                <TableCell className="text-right rtl:text-left font-bold">{sale.total.toFixed(2)} ر.س</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="purchases" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">إجمالي المشتريات</p>
                            <p className="text-2xl font-bold">
                              {mockPurchases.reduce((sum, purchase) => sum + purchase.total, 0).toFixed(2)} ر.س
                            </p>
                          </div>
                          <Truck className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">عدد الوحدات المشتراة</p>
                            <p className="text-2xl font-bold">
                              {mockPurchases.reduce((sum, purchase) => sum + purchase.quantity, 0)} {product.unit}
                            </p>
                          </div>
                          <Package className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">عدد أوامر الشراء</p>
                            <p className="text-2xl font-bold">{mockPurchases.length}</p>
                          </div>
                          <FileText className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-3">أوامر الشراء</h3>
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>التاريخ</TableHead>
                            <TableHead>رقم أمر الشراء</TableHead>
                            <TableHead>المورد</TableHead>
                            <TableHead className="text-center">الكمية</TableHead>
                            <TableHead className="text-right rtl:text-left">السعر</TableHead>
                            <TableHead className="text-right rtl:text-left">الإجمالي</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockPurchases.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                لا توجد مشتريات لهذا المنتج
                              </TableCell>
                            </TableRow>
                          ) : (
                            mockPurchases.map((purchase) => (
                              <TableRow key={purchase.id}>
                                <TableCell>{formatDate(purchase.date)}</TableCell>
                                <TableCell>{purchase.poNumber}</TableCell>
                                <TableCell>{purchase.supplier}</TableCell>
                                <TableCell className="text-center">{purchase.quantity}</TableCell>
                                <TableCell className="text-right rtl:text-left">{purchase.price.toFixed(2)} ر.س</TableCell>
                                <TableCell className="text-right rtl:text-left font-bold">{purchase.total.toFixed(2)} ر.س</TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ملخص المنتج</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {product.images && product.images.length > 0 ? (
                  <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-lg">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category?.name}</p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الكمية الحالية:</span>
                  <span className="font-medium">{product.stock} {product.unit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">سعر البيع:</span>
                  <span className="font-medium">{product.price.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">سعر التكلفة:</span>
                  <span className="font-medium">{product.costPrice.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">قيمة المخزون:</span>
                  <span className="font-medium">{inventoryValue.toFixed(2)} ر.س</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">الحالة:</span>
                  <Badge variant={statusVariant as any}>
                    {stockStatus}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">الحد الأدنى:</span>
                  <span className="font-medium">{product.minStock} {product.unit}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">الحد الأقصى:</span>
                  <span className="font-medium">{product.maxStock} {product.unit}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button 
                className="w-full" 
                onClick={() => router.push(`/inventory/${product.id}/edit`)}
              >
                <Edit className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تعديل المنتج
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/inventory/adjust?productId=${product.id}`)}
              >
                <RefreshCw className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تعديل المخزون
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/inventory/stock-movements?productId=${product.id}`)}
              >
                <ArrowUpDown className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> عرض حركة المخزون
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/purchases/new?productId=${product.id}`)}
              >
                <Truck className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> إنشاء أمر شراء
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push(`/sales/new?productId=${product.id}`)}
              >
                <ShoppingCart className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> إنشاء فاتورة مبيعات
              </Button>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> حذف المنتج
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* نافذة تأكيد الحذف */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="border rounded-md p-3">
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-muted-foreground">{product.sku}</p>
              <p className="text-sm mt-2">الكمية الحالية: {product.stock} {product.unit}</p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteProduct}
            >
              <Trash2 className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// مكونات إضافية
function FileText(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
      <line x1="10" x2="8" y1="9" y2="9" />
    </svg>
  );
}