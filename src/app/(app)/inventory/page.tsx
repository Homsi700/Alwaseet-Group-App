
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  FileText, 
  ArrowUpDown, 
  Package, 
  AlertTriangle, 
  BarChart4, 
  Filter, 
  Download, 
  Upload, 
  RefreshCw,
  Archive,
  Repeat,
  PackageSearch
} from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { DataTable } from '@/components/data-table';
import { DataTableColumnHeader } from '@/components/data-table/column-header';
import { DataTableViewOptions } from '@/components/data-table/view-options';
import { DataTablePagination } from '@/components/data-table/pagination';
import { DataTableFacetedFilter } from '@/components/data-table/faceted-filter';
import { ExportData } from '@/components/export/export-data';

// بيانات وهمية للمنتجات
const mockProducts = [
  {
    id: 'product-1',
    name: 'لابتوب HP ProBook',
    sku: 'HP-PB-001',
    barcode: '123456789',
    description: 'لابتوب HP ProBook بمعالج Core i7 وذاكرة 16GB',
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
    images: ['https://example.com/image1.jpg'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-06-20'),
  },
  {
    id: 'product-2',
    name: 'طابعة Canon',
    sku: 'CN-PR-001',
    barcode: '987654321',
    description: 'طابعة Canon ليزر ملونة',
    price: 700,
    costPrice: 500,
    stock: 15,
    minStock: 5,
    maxStock: 30,
    unit: 'قطعة',
    categoryId: 'category-2',
    category: {
      id: 'category-2',
      name: 'طابعات',
    },
    status: 'ACTIVE',
    images: ['https://example.com/image2.jpg'],
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-06-15'),
  },
  {
    id: 'product-3',
    name: 'جهاز عرض Epson',
    sku: 'EP-PJ-001',
    barcode: '456789123',
    description: 'جهاز عرض Epson بدقة عالية',
    price: 3000,
    costPrice: 2500,
    stock: 5,
    minStock: 2,
    maxStock: 10,
    unit: 'قطعة',
    categoryId: 'category-3',
    category: {
      id: 'category-3',
      name: 'أجهزة عرض',
    },
    status: 'ACTIVE',
    images: ['https://example.com/image3.jpg'],
    createdAt: new Date('2024-03-05'),
    updatedAt: new Date('2024-06-10'),
  },
  {
    id: 'product-4',
    name: 'هاتف Samsung Galaxy',
    sku: 'SG-PH-001',
    barcode: '789123456',
    description: 'هاتف Samsung Galaxy S23',
    price: 1000,
    costPrice: 800,
    stock: 20,
    minStock: 5,
    maxStock: 40,
    unit: 'قطعة',
    categoryId: 'category-4',
    category: {
      id: 'category-4',
      name: 'هواتف',
    },
    status: 'ACTIVE',
    images: ['https://example.com/image4.jpg'],
    createdAt: new Date('2024-04-20'),
    updatedAt: new Date('2024-06-05'),
  },
  {
    id: 'product-5',
    name: 'كمبيوتر مكتبي Dell',
    sku: 'DL-PC-001',
    barcode: '321654987',
    description: 'كمبيوتر مكتبي Dell بمعالج Core i9',
    price: 7000,
    costPrice: 6000,
    stock: 3,
    minStock: 1,
    maxStock: 8,
    unit: 'قطعة',
    categoryId: 'category-1',
    category: {
      id: 'category-1',
      name: 'أجهزة كمبيوتر',
    },
    status: 'ACTIVE',
    images: ['https://example.com/image5.jpg'],
    createdAt: new Date('2024-05-15'),
    updatedAt: new Date('2024-06-01'),
  },
  {
    id: 'product-6',
    name: 'شاشة LG',
    sku: 'LG-MN-001',
    barcode: '654987321',
    description: 'شاشة LG بحجم 27 بوصة',
    price: 1500,
    costPrice: 1200,
    stock: 8,
    minStock: 3,
    maxStock: 15,
    unit: 'قطعة',
    categoryId: 'category-5',
    category: {
      id: 'category-5',
      name: 'شاشات',
    },
    status: 'ACTIVE',
    images: ['https://example.com/image6.jpg'],
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-05-20'),
  },
  {
    id: 'product-7',
    name: 'ماوس Logitech',
    sku: 'LG-MS-001',
    barcode: '987321654',
    description: 'ماوس Logitech لاسلكي',
    price: 150,
    costPrice: 100,
    stock: 30,
    minStock: 10,
    maxStock: 50,
    unit: 'قطعة',
    categoryId: 'category-6',
    category: {
      id: 'category-6',
      name: 'ملحقات',
    },
    status: 'ACTIVE',
    images: ['https://example.com/image7.jpg'],
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-05-15'),
  },
  {
    id: 'product-8',
    name: 'لوحة مفاتيح Microsoft',
    sku: 'MS-KB-001',
    barcode: '321987654',
    description: 'لوحة مفاتيح Microsoft لاسلكية',
    price: 200,
    costPrice: 150,
    stock: 25,
    minStock: 8,
    maxStock: 40,
    unit: 'قطعة',
    categoryId: 'category-6',
    category: {
      id: 'category-6',
      name: 'ملحقات',
    },
    status: 'ACTIVE',
    images: ['https://example.com/image8.jpg'],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-05-10'),
  },
  {
    id: 'product-9',
    name: 'سماعات Sony',
    sku: 'SN-HP-001',
    barcode: '159753456',
    description: 'سماعات Sony لاسلكية',
    price: 350,
    costPrice: 250,
    stock: 0,
    minStock: 5,
    maxStock: 20,
    unit: 'قطعة',
    categoryId: 'category-7',
    category: {
      id: 'category-7',
      name: 'سماعات',
    },
    status: 'OUT_OF_STOCK',
    images: ['https://example.com/image9.jpg'],
    createdAt: new Date('2024-04-10'),
    updatedAt: new Date('2024-05-05'),
  },
  {
    id: 'product-10',
    name: 'كاميرا Canon',
    sku: 'CN-CM-001',
    barcode: '753159456',
    description: 'كاميرا Canon احترافية',
    price: 5000,
    costPrice: 4000,
    stock: 2,
    minStock: 1,
    maxStock: 5,
    unit: 'قطعة',
    categoryId: 'category-8',
    category: {
      id: 'category-8',
      name: 'كاميرات',
    },
    status: 'LOW_STOCK',
    images: ['https://example.com/image10.jpg'],
    createdAt: new Date('2024-05-05'),
    updatedAt: new Date('2024-05-01'),
  },
];

export default function InventoryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  // في الواقع، سنستخدم useProducts hook
  // لكن هنا سنحاكي العملية
  const products = mockProducts;
  
  // تصفية المنتجات حسب البحث
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.includes(searchQuery) ||
    product.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // تصفية المنتجات حسب التبويب النشط
  const tabFilteredProducts = filteredProducts.filter(product => {
    switch (activeTab) {
      case 'low-stock':
        return product.stock <= product.minStock && product.stock > 0;
      case 'out-of-stock':
        return product.stock === 0;
      case 'active':
        return product.status === 'ACTIVE';
      default:
        return true;
    }
  });
  
  // إحصائيات المخزون
  const totalProducts = products.length;
  const lowStockProducts = products.filter(p => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const activeProducts = products.filter(p => p.status === 'ACTIVE').length;
  
  // استيراد المنتجات
  const handleImportProducts = () => {
    toast({
      title: 'استيراد المنتجات',
      description: 'سيتم فتح نافذة لاختيار ملف الاستيراد',
      variant: 'default',
    });
  };
  
  // تصدير المنتجات
  const handleExportProducts = () => {
    toast({
      title: 'تصدير المنتجات',
      description: 'جاري تصدير بيانات المنتجات',
      variant: 'default',
    });
  };
  
  // تحديث المخزون
  const handleRefreshInventory = () => {
    toast({
      title: 'تحديث المخزون',
      description: 'جاري تحديث بيانات المخزون',
      variant: 'default',
    });
  };
  
  // إجراء جرد مخزني
  const handleInventoryCount = () => {
    router.push('/inventory/count');
  };
  
  // تعديل كميات المخزون
  const handleAdjustStock = () => {
    router.push('/inventory/adjust');
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">إدارة المخزون</h1>
          <p className="text-muted-foreground mt-1">إدارة المنتجات والمخزون</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={handleImportProducts}
          >
            <Upload className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> استيراد
          </Button>
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={handleExportProducts}
          >
            <Download className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> تصدير
          </Button>
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={handleRefreshInventory}
          >
            <RefreshCw className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> تحديث
          </Button>
          <Button 
            className="rounded-md"
            onClick={() => router.push('/inventory/new')}
          >
            <Plus className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إضافة منتج
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20" onClick={() => setActiveTab('all')} style={{ cursor: 'pointer' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">إجمالي المنتجات</h3>
                <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{totalProducts}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-yellow-50 dark:bg-yellow-900/20" onClick={() => setActiveTab('low-stock')} style={{ cursor: 'pointer' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">مخزون منخفض</h3>
                <p className="text-2xl font-bold mt-1 text-yellow-600 dark:text-yellow-400">{lowStockProducts}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 dark:bg-red-900/20" onClick={() => setActiveTab('out-of-stock')} style={{ cursor: 'pointer' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">نفذ من المخزون</h3>
                <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">{outOfStockProducts}</p>
              </div>
              <Package className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-green-50 dark:bg-green-900/20" onClick={() => setActiveTab('active')} style={{ cursor: 'pointer' }}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">منتجات نشطة</h3>
                <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{activeProducts}</p>
              </div>
              <BarChart4 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          className="rounded-md"
          onClick={handleInventoryCount}
        >
          <Repeat className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إجراء جرد مخزني
        </Button>
        <Button 
          variant="outline" 
          className="rounded-md"
          onClick={handleAdjustStock}
        >
          <Edit className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> تعديل كميات
        </Button>
        <Button 
          variant="outline" 
          className="rounded-md"
          onClick={() => router.push('/inventory/stock-movements')}
        >
          <ArrowUpDown className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> حركة المخزون
        </Button>
      </div>
      
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Archive className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على المخزون
          </CardTitle>
          <CardDescription>
            مراقبة مستويات المخزون، تتبع حركات المخزون، إدارة تنوعات المنتجات، وإجراء تعديلات على المخزون.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">الكل</TabsTrigger>
                <TabsTrigger value="low-stock">مخزون منخفض</TabsTrigger>
                <TabsTrigger value="out-of-stock">نفذ من المخزون</TabsTrigger>
                <TabsTrigger value="active">نشط</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="بحث عن منتج..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-3 pr-10 w-[250px]"
                  />
                </div>
              </div>
            </Tabs>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المنتج</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead className="text-center">الكمية الحالية</TableHead>
                  <TableHead>الوحدة</TableHead>
                  <TableHead className="text-right rtl:text-left">سعر البيع</TableHead>
                  <TableHead className="text-right rtl:text-left">قيمة المخزون</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tabFilteredProducts.map((product) => {
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
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.sku}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{product.category?.name}</TableCell>
                      <TableCell className="text-center">{product.stock}</TableCell>
                      <TableCell>{product.unit}</TableCell>
                      <TableCell className="text-right rtl:text-left">{product.price.toFixed(2)} ر.س</TableCell>
                      <TableCell className="text-right rtl:text-left">{inventoryValue.toFixed(2)} ر.س</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={statusVariant as any}>
                          {stockStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">فتح القائمة</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => router.push(`/inventory/${product.id}`)}
                            >
                              <FileText className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" />
                              عرض التفاصيل
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/inventory/${product.id}/edit`)}
                            >
                              <Edit className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" />
                              تعديل
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => router.push(`/inventory/stock-movements?productId=${product.id}`)}
                            >
                              <ArrowUpDown className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" />
                              حركة المخزون
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => {
                                if (confirm(`هل أنت متأكد من رغبتك في حذف المنتج "${product.name}"؟`)) {
                                  // حذف المنتج
                                  toast({
                                    title: 'تم حذف المنتج',
                                    description: `تم حذف المنتج "${product.name}" بنجاح`,
                                    variant: 'default',
                                  });
                                }
                              }}
                            >
                              <Trash2 className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {tabFilteredProducts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      لا توجد منتجات مطابقة للبحث
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              variant="outline" 
              className="rounded-md"
              onClick={handleExportProducts}
            >
              <Download className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تصدير البيانات
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
