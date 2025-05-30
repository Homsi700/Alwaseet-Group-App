'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/date-range-picker";
import { 
  ArrowLeft, 
  Download, 
  Search, 
  ArrowUpDown, 
  Package, 
  Filter, 
  Calendar, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown 
} from "lucide-react";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useStockMovements } from '@/hooks/use-inventory';
import { useProducts } from '@/hooks/use-products';
import { ExportData } from '@/components/export/export-data';

// بيانات وهمية للمنتجات
const mockProducts = [
  { id: 'product-1', name: 'لابتوب HP ProBook', sku: 'HP-PB-001' },
  { id: 'product-2', name: 'طابعة Canon', sku: 'CN-PR-001' },
  { id: 'product-3', name: 'جهاز عرض Epson', sku: 'EP-PJ-001' },
  { id: 'product-4', name: 'هاتف Samsung Galaxy', sku: 'SG-PH-001' },
  { id: 'product-5', name: 'كمبيوتر مكتبي Dell', sku: 'DL-PC-001' },
  { id: 'product-6', name: 'شاشة LG', sku: 'LG-MN-001' },
  { id: 'product-7', name: 'ماوس Logitech', sku: 'LG-MS-001' },
  { id: 'product-8', name: 'لوحة مفاتيح Microsoft', sku: 'MS-KB-001' },
  { id: 'product-9', name: 'سماعات Sony', sku: 'SN-HP-001' },
  { id: 'product-10', name: 'كاميرا Canon', sku: 'CN-CM-001' },
];

// بيانات وهمية لحركة المخزون
const mockStockMovements = [
  {
    id: 'movement-1',
    date: new Date('2024-06-20'),
    productId: 'product-1',
    product: {
      id: 'product-1',
      name: 'لابتوب HP ProBook',
      sku: 'HP-PB-001',
    },
    type: 'PURCHASE',
    quantity: 5,
    reference: 'PO-2024-001',
    notes: 'شراء من المورد',
    user: 'أحمد محمد',
  },
  {
    id: 'movement-2',
    date: new Date('2024-06-18'),
    productId: 'product-1',
    product: {
      id: 'product-1',
      name: 'لابتوب HP ProBook',
      sku: 'HP-PB-001',
    },
    type: 'SALE',
    quantity: -2,
    reference: 'INV-2024-001',
    notes: 'بيع للعميل',
    user: 'محمد علي',
  },
  {
    id: 'movement-3',
    date: new Date('2024-06-15'),
    productId: 'product-1',
    product: {
      id: 'product-1',
      name: 'لابتوب HP ProBook',
      sku: 'HP-PB-001',
    },
    type: 'ADJUSTMENT',
    quantity: 1,
    reference: 'ADJ-2024-001',
    notes: 'تعديل بعد الجرد',
    user: 'أحمد محمد',
  },
  {
    id: 'movement-4',
    date: new Date('2024-06-10'),
    productId: 'product-1',
    product: {
      id: 'product-1',
      name: 'لابتوب HP ProBook',
      sku: 'HP-PB-001',
    },
    type: 'RETURN',
    quantity: 1,
    reference: 'RET-2024-001',
    notes: 'مرتجع من العميل',
    user: 'محمد علي',
  },
  {
    id: 'movement-5',
    date: new Date('2024-06-05'),
    productId: 'product-1',
    product: {
      id: 'product-1',
      name: 'لابتوب HP ProBook',
      sku: 'HP-PB-001',
    },
    type: 'PURCHASE',
    quantity: 10,
    reference: 'PO-2024-002',
    notes: 'شراء أولي',
    user: 'أحمد محمد',
  },
  {
    id: 'movement-6',
    date: new Date('2024-06-19'),
    productId: 'product-2',
    product: {
      id: 'product-2',
      name: 'طابعة Canon',
      sku: 'CN-PR-001',
    },
    type: 'PURCHASE',
    quantity: 8,
    reference: 'PO-2024-003',
    notes: 'شراء من المورد',
    user: 'أحمد محمد',
  },
  {
    id: 'movement-7',
    date: new Date('2024-06-17'),
    productId: 'product-2',
    product: {
      id: 'product-2',
      name: 'طابعة Canon',
      sku: 'CN-PR-001',
    },
    type: 'SALE',
    quantity: -3,
    reference: 'INV-2024-002',
    notes: 'بيع للعميل',
    user: 'محمد علي',
  },
  {
    id: 'movement-8',
    date: new Date('2024-06-12'),
    productId: 'product-3',
    product: {
      id: 'product-3',
      name: 'جهاز عرض Epson',
      sku: 'EP-PJ-001',
    },
    type: 'PURCHASE',
    quantity: 5,
    reference: 'PO-2024-004',
    notes: 'شراء من المورد',
    user: 'أحمد محمد',
  },
  {
    id: 'movement-9',
    date: new Date('2024-06-08'),
    productId: 'product-3',
    product: {
      id: 'product-3',
      name: 'جهاز عرض Epson',
      sku: 'EP-PJ-001',
    },
    type: 'SALE',
    quantity: -1,
    reference: 'INV-2024-003',
    notes: 'بيع للعميل',
    user: 'محمد علي',
  },
  {
    id: 'movement-10',
    date: new Date('2024-06-03'),
    productId: 'product-4',
    product: {
      id: 'product-4',
      name: 'هاتف Samsung Galaxy',
      sku: 'SG-PH-001',
    },
    type: 'ADJUSTMENT',
    quantity: -2,
    reference: 'ADJ-2024-002',
    notes: 'تعديل بعد الجرد - نقص',
    user: 'أحمد محمد',
  },
];

// تنسيق التاريخ
const formatDate = (date: string | Date) => {
  return format(new Date(date), 'dd/MM/yyyy', { locale: ar });
};

export default function StockMovementsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<{ from?: Date; to?: Date }>({});
  
  // في الواقع، سنستخدم useStockMovements hook
  // لكن هنا سنحاكي العملية
  const [stockMovements, setStockMovements] = useState<any[]>([]);
  
  useEffect(() => {
    const productId = searchParams.get('productId');
    if (productId) {
      setSelectedProductId(productId);
    }
    
    // محاكاة جلب البيانات
    setStockMovements(mockStockMovements);
    setIsLoading(false);
  }, [searchParams]);
  
  // تصفية حركات المخزون
  const filteredMovements = stockMovements.filter(movement => {
    // تصفية حسب المنتج
    if (selectedProductId && movement.productId !== selectedProductId) {
      return false;
    }
    
    // تصفية حسب النوع
    if (selectedType && movement.type !== selectedType) {
      return false;
    }
    
    // تصفية حسب نطاق التاريخ
    if (selectedDateRange.from && new Date(movement.date) < selectedDateRange.from) {
      return false;
    }
    
    if (selectedDateRange.to) {
      const toDate = new Date(selectedDateRange.to);
      toDate.setHours(23, 59, 59, 999);
      if (new Date(movement.date) > toDate) {
        return false;
      }
    }
    
    // تصفية حسب البحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        movement.product.name.toLowerCase().includes(query) ||
        movement.product.sku.toLowerCase().includes(query) ||
        movement.reference.toLowerCase().includes(query) ||
        movement.notes.toLowerCase().includes(query) ||
        movement.user.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setSelectedProductId('');
    setSelectedType('');
    setSelectedDateRange({});
    setSearchQuery('');
  };
  
  // تصدير البيانات
  const handleExportData = () => {
    toast({
      title: 'تصدير البيانات',
      description: 'جاري تصدير بيانات حركة المخزون',
      variant: 'default',
    });
  };
  
  // حساب إجماليات الحركات
  const totalIn = filteredMovements
    .filter(m => m.quantity > 0)
    .reduce((sum, m) => sum + m.quantity, 0);
    
  const totalOut = filteredMovements
    .filter(m => m.quantity < 0)
    .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    
  const netChange = totalIn - totalOut;
  
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
            <h1 className="text-3xl font-bold text-foreground">حركة المخزون</h1>
          </div>
          <p className="text-muted-foreground mt-1">تتبع حركات الدخول والخروج للمخزون</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={resetFilters}
          >
            <RefreshCw className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إعادة تعيين
          </Button>
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={handleExportData}
          >
            <Download className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> تصدير
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>فلترة الحركات</CardTitle>
          <CardDescription>
            تصفية حركات المخزون حسب المنتج والنوع والتاريخ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product">المنتج</Label>
              <Select
                value={selectedProductId}
                onValueChange={setSelectedProductId}
              >
                <SelectTrigger id="product" className="w-full">
                  <SelectValue placeholder="جميع المنتجات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع المنتجات</SelectItem>
                  {mockProducts.map(product => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.sku})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">نوع الحركة</Label>
              <Select
                value={selectedType}
                onValueChange={setSelectedType}
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">جميع الأنواع</SelectItem>
                  <SelectItem value="PURCHASE">شراء</SelectItem>
                  <SelectItem value="SALE">بيع</SelectItem>
                  <SelectItem value="ADJUSTMENT">تعديل</SelectItem>
                  <SelectItem value="RETURN">مرتجع</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label>نطاق التاريخ</Label>
              <DateRangePicker
                value={selectedDateRange}
                onValueChange={setSelectedDateRange}
                align="start"
                locale="ar"
                placeholder="اختر نطاق التاريخ"
                className="w-full"
              />
            </div>
          </div>
          
          <div className="mt-4 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث عن منتج، مرجع، ملاحظات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-3 pr-10 w-full"
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">إجمالي الداخل</h3>
                <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{totalIn}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">إجمالي الخارج</h3>
                <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">{totalOut}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">صافي التغيير</h3>
                <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{netChange}</p>
              </div>
              <ArrowUpDown className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>سجل حركة المخزون</CardTitle>
          <CardDescription>
            عرض جميع حركات الدخول والخروج للمخزون
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المنتج</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead className="text-center">الكمية</TableHead>
                    <TableHead>المرجع</TableHead>
                    <TableHead>الملاحظات</TableHead>
                    <TableHead>المستخدم</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        لا توجد حركات مخزون مطابقة للبحث
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMovements.map((movement) => (
                      <TableRow key={movement.id}>
                        <TableCell>{formatDate(movement.date)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <div className="font-medium">{movement.product.name}</div>
                              <div className="text-xs text-muted-foreground">{movement.product.sku}</div>
                            </div>
                          </div>
                        </TableCell>
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          <div className="flex justify-end mt-4">
            <ExportData
              title="تصدير حركة المخزون"
              data={filteredMovements.map(movement => ({
                'التاريخ': formatDate(movement.date),
                'المنتج': movement.product.name,
                'الرمز': movement.product.sku,
                'النوع': movement.type === 'PURCHASE' ? 'شراء' :
                         movement.type === 'SALE' ? 'بيع' :
                         movement.type === 'ADJUSTMENT' ? 'تعديل' :
                         movement.type === 'RETURN' ? 'مرتجع' : movement.type,
                'الكمية': movement.quantity,
                'المرجع': movement.reference,
                'الملاحظات': movement.notes,
                'المستخدم': movement.user,
              }))}
              columns={[
                { header: 'التاريخ', accessor: 'التاريخ' },
                { header: 'المنتج', accessor: 'المنتج' },
                { header: 'الرمز', accessor: 'الرمز' },
                { header: 'النوع', accessor: 'النوع' },
                { header: 'الكمية', accessor: 'الكمية' },
                { header: 'المرجع', accessor: 'المرجع' },
                { header: 'الملاحظات', accessor: 'الملاحظات' },
                { header: 'المستخدم', accessor: 'المستخدم' },
              ]}
              fileName="stock-movements-export"
              variant="outline"
              size="sm"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}