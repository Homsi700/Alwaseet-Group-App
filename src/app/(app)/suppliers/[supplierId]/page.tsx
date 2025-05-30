"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Truck, Edit, Trash2, ShoppingCart, Star, StarHalf, Phone, Mail, Globe, MapPin, FileText, ArrowLeft, AlertTriangle } from "lucide-react";
import { Supplier } from "@/lib/types";

// بيانات موردين وهمية
const mockSuppliers: Supplier[] = [
  { 
    supplierId: 1, 
    supplierCode: "SUP001", 
    name: "مورد النخبة للأجهزة", 
    contactPerson: "أحمد خالد", 
    phoneNumber: "0911111111", 
    email: "sales@elite.com",
    address: "دمشق - شارع الثورة",
    taxNumber: "1234567890",
    website: "www.elite-supplier.com",
    notes: "مورد أجهزة إلكترونية وكمبيوتر",
    paymentTerms: "صافي 30 يوم",
    creditLimit: 500000,
    balance: 120000,
    companyId: 1,
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-07-10T14:20:00Z",
    createdBy: 1,
    isActive: true,
    rating: 4.5,
    category: "إلكترونيات"
  },
  { 
    supplierId: 2, 
    supplierCode: "SUP002", 
    name: "الشركة العالمية للتوريدات", 
    contactPerson: "فاطمة علي", 
    phoneNumber: "0922222222", 
    email: "global@supplies.com",
    address: "حلب - المنطقة الصناعية",
    taxNumber: "0987654321",
    website: "www.global-supplies.com",
    notes: "مورد مواد مكتبية وقرطاسية",
    paymentTerms: "صافي 15 يوم",
    creditLimit: 300000,
    balance: 75000,
    companyId: 1,
    createdAt: "2024-02-20T09:15:00Z",
    updatedAt: "2024-07-05T11:45:00Z",
    createdBy: 1,
    isActive: true,
    rating: 3.8,
    category: "قرطاسية"
  },
  { 
    supplierId: 3, 
    supplierCode: "SUP003", 
    name: "مؤسسة الإمداد السريع", 
    contactPerson: "عمر ياسين", 
    phoneNumber: "0933333333", 
    email: "info@fastsupply.co",
    address: "اللاذقية - شارع الجمهورية",
    taxNumber: "5678901234",
    website: "www.fastsupply.co",
    notes: "مورد أثاث مكتبي ومستلزمات",
    paymentTerms: "دفع فوري",
    creditLimit: 200000,
    balance: 0,
    companyId: 1,
    createdAt: "2024-03-10T13:40:00Z",
    updatedAt: "2024-06-28T16:30:00Z",
    createdBy: 1,
    isActive: true,
    rating: 4.2,
    category: "أثاث"
  },
];

// بيانات أوامر الشراء الوهمية
const mockPurchaseOrders = [
  {
    id: 1,
    orderNumber: "PO-2024-001",
    date: "2024-07-01",
    status: "قيد التنفيذ",
    totalAmount: 13110,
    paidAmount: 0,
  },
  {
    id: 2,
    orderNumber: "PO-2024-002",
    date: "2024-06-15",
    status: "مكتمل",
    totalAmount: 5750,
    paidAmount: 5750,
  },
  {
    id: 3,
    orderNumber: "PO-2024-003",
    date: "2024-05-20",
    status: "مكتمل",
    totalAmount: 8280,
    paidAmount: 8280,
  },
];

// بيانات تقييمات المورد الوهمية
const mockRatings = [
  {
    id: 1,
    date: "2024-06-15",
    qualityScore: 4.5,
    deliveryScore: 4.0,
    priceScore: 3.5,
    serviceScore: 5.0,
    overallScore: 4.25,
    comments: "جودة ممتازة للمنتجات، وخدمة عملاء متميزة. الأسعار مرتفعة قليلاً مقارنة بالمنافسين.",
  },
  {
    id: 2,
    date: "2024-03-10",
    qualityScore: 4.0,
    deliveryScore: 3.5,
    priceScore: 3.0,
    serviceScore: 4.5,
    overallScore: 3.75,
    comments: "تأخر في التسليم لبعض الطلبات، لكن الجودة جيدة بشكل عام.",
  },
];

export default function SupplierDetailsPage({ params }: { params: { supplierId: string } }) {
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // محاكاة جلب بيانات المورد
    const supplierId = parseInt(params.supplierId);
    const foundSupplier = mockSuppliers.find(s => s.supplierId === supplierId);
    
    if (foundSupplier) {
      setSupplier(foundSupplier);
    }
    
    setIsLoading(false);
  }, [params.supplierId]);

  // حذف المورد (محاكاة)
  const handleDeleteSupplier = () => {
    alert("تم حذف المورد بنجاح");
    setIsDeleteDialogOpen(false);
    router.push("/suppliers");
  };

  // إضافة تقييم جديد (محاكاة)
  const handleAddRating = () => {
    alert("تم إضافة التقييم بنجاح");
    setIsRatingDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">المورد غير موجود</h2>
        <p className="text-muted-foreground mb-6">لم يتم العثور على المورد المطلوب</p>
        <Button onClick={() => router.push("/suppliers")}>
          <ArrowLeft className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> العودة إلى قائمة الموردين
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
              onClick={() => router.push("/suppliers")}
            >
              <ArrowLeft className="h-4 w-4 icon-directional" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">{supplier.name}</h1>
          </div>
          <p className="text-muted-foreground mt-1">{supplier.supplierCode}</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={() => router.push(`/purchase-orders/new?supplierId=${supplier.supplierId}`)}
          >
            <ShoppingCart className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> طلب شراء جديد
          </Button>
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={() => router.push(`/suppliers/${supplier.supplierId}/edit`)}
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="orders">أوامر الشراء</TabsTrigger>
          <TabsTrigger value="ratings">التقييمات</TabsTrigger>
          <TabsTrigger value="financial">المعلومات المالية</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>معلومات المورد</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">الفئة</h3>
                      <Badge variant="outline" className="mt-1">{supplier.category || "غير محدد"}</Badge>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">مسؤول الاتصال</h3>
                      <p>{supplier.contactPerson || "غير محدد"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">رقم الهاتف</h3>
                      <div className="flex items-center mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground ml-2 rtl:mr-2 icon-directional" />
                        <p>{supplier.phoneNumber || "غير محدد"}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">البريد الإلكتروني</h3>
                      <div className="flex items-center mt-1">
                        <Mail className="h-4 w-4 text-muted-foreground ml-2 rtl:mr-2 icon-directional" />
                        <p>{supplier.email || "غير محدد"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">الموقع الإلكتروني</h3>
                      <div className="flex items-center mt-1">
                        <Globe className="h-4 w-4 text-muted-foreground ml-2 rtl:mr-2 icon-directional" />
                        <p>{supplier.website || "غير محدد"}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">الرقم الضريبي</h3>
                      <p>{supplier.taxNumber || "غير محدد"}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">العنوان</h3>
                      <div className="flex items-start mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground ml-2 rtl:mr-2 icon-directional mt-1" />
                        <p>{supplier.address || "غير محدد"}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">التقييم</h3>
                      <div className="flex items-center mt-1">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const rating = supplier.rating || 0;
                          if (i < Math.floor(rating)) {
                            return <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />;
                          } else if (i < Math.ceil(rating) && !Number.isInteger(rating)) {
                            return <StarHalf key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />;
                          } else {
                            return <Star key={i} className="h-4 w-4 text-muted-foreground" />;
                          }
                        })}
                        <span className="ml-2 rtl:mr-2">{supplier.rating || 0}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="ml-2 rtl:mr-2 text-xs"
                          onClick={() => setIsRatingDialogOpen(true)}
                        >
                          إضافة تقييم
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">ملاحظات</h3>
                  <div className="bg-muted p-4 rounded-md min-h-[100px]">
                    {supplier.notes || "لا توجد ملاحظات"}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>ملخص النشاط</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">إجمالي أوامر الشراء</h3>
                  <p className="text-2xl font-bold mt-1">{mockPurchaseOrders.length}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">إجمالي المشتريات</h3>
                  <p className="text-2xl font-bold mt-1">
                    {mockPurchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()} ل.س
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">الرصيد الحالي</h3>
                  <p className="text-2xl font-bold mt-1 text-destructive">
                    {supplier.balance?.toLocaleString() || 0} ل.س
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">آخر نشاط</h3>
                  <p className="mt-1">
                    {new Date(supplier.updatedAt || "").toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full rounded-md"
                  onClick={() => setActiveTab("financial")}
                >
                  <FileText className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> عرض التفاصيل المالية
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>أحدث أوامر الشراء</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>المبلغ الإجمالي</TableHead>
                    <TableHead>المبلغ المدفوع</TableHead>
                    <TableHead className="text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPurchaseOrders.slice(0, 3).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === "مكتمل" ? "success" : "outline"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.totalAmount.toLocaleString()} ل.س</TableCell>
                      <TableCell>{order.paidAmount.toLocaleString()} ل.س</TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-md"
                          onClick={() => router.push(`/purchase-orders/${order.id}`)}
                        >
                          عرض
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {mockPurchaseOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        لا توجد أوامر شراء لعرضها.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              {mockPurchaseOrders.length > 3 && (
                <div className="flex justify-center mt-4">
                  <Button 
                    variant="outline" 
                    className="rounded-md"
                    onClick={() => setActiveTab("orders")}
                  >
                    عرض جميع أوامر الشراء
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>أوامر الشراء</span>
                <Button 
                  className="rounded-md"
                  onClick={() => router.push(`/purchase-orders/new?supplierId=${supplier.supplierId}`)}
                >
                  <ShoppingCart className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> طلب شراء جديد
                </Button>
              </CardTitle>
              <CardDescription>
                جميع أوامر الشراء الخاصة بهذا المورد
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>المبلغ الإجمالي</TableHead>
                    <TableHead>المبلغ المدفوع</TableHead>
                    <TableHead>المبلغ المتبقي</TableHead>
                    <TableHead className="text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPurchaseOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === "مكتمل" ? "success" : "outline"}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.totalAmount.toLocaleString()} ل.س</TableCell>
                      <TableCell>{order.paidAmount.toLocaleString()} ل.س</TableCell>
                      <TableCell>{(order.totalAmount - order.paidAmount).toLocaleString()} ل.س</TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-md"
                          onClick={() => router.push(`/purchase-orders/${order.id}`)}
                        >
                          <Eye className="h-4 w-4 ml-1 rtl:mr-1 icon-directional" /> عرض
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-md"
                          onClick={() => router.push(`/purchase-orders/${order.id}/edit`)}
                        >
                          <Edit className="h-4 w-4 ml-1 rtl:mr-1 icon-directional" /> تعديل
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {mockPurchaseOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        لا توجد أوامر شراء لعرضها.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>إحصائيات أوامر الشراء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="text-sm font-medium text-muted-foreground">إجمالي أوامر الشراء</h3>
                  <p className="text-2xl font-bold mt-2">{mockPurchaseOrders.length}</p>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="text-sm font-medium text-muted-foreground">إجمالي المشتريات</h3>
                  <p className="text-2xl font-bold mt-2">
                    {mockPurchaseOrders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()} ل.س
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="text-sm font-medium text-muted-foreground">المبالغ المستحقة</h3>
                  <p className="text-2xl font-bold mt-2 text-destructive">
                    {mockPurchaseOrders.reduce((sum, order) => sum + (order.totalAmount - order.paidAmount), 0).toLocaleString()} ل.س
                  </p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-4">توزيع حالات أوامر الشراء</h3>
                <div className="h-40 bg-muted rounded-md flex items-center justify-center">
                  <p className="text-muted-foreground">سيتم عرض رسم بياني هنا</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="ratings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>تقييمات المورد</span>
                <Button 
                  className="rounded-md"
                  onClick={() => setIsRatingDialogOpen(true)}
                >
                  <Star className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> إضافة تقييم جديد
                </Button>
              </CardTitle>
              <CardDescription>
                تقييمات أداء المورد على مر الزمن
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 mb-6">
                <div className="bg-muted p-4 rounded-md text-center">
                  <h3 className="text-sm font-medium text-muted-foreground">التقييم العام</h3>
                  <div className="flex items-center justify-center mt-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold ml-2 rtl:mr-2">{supplier.rating || 0}</span>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-md text-center">
                  <h3 className="text-sm font-medium text-muted-foreground">الجودة</h3>
                  <div className="flex items-center justify-center mt-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold ml-2 rtl:mr-2">
                      {mockRatings.length > 0 
                        ? (mockRatings.reduce((sum, r) => sum + r.qualityScore, 0) / mockRatings.length).toFixed(1) 
                        : 0}
                    </span>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-md text-center">
                  <h3 className="text-sm font-medium text-muted-foreground">التسليم</h3>
                  <div className="flex items-center justify-center mt-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold ml-2 rtl:mr-2">
                      {mockRatings.length > 0 
                        ? (mockRatings.reduce((sum, r) => sum + r.deliveryScore, 0) / mockRatings.length).toFixed(1) 
                        : 0}
                    </span>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-md text-center">
                  <h3 className="text-sm font-medium text-muted-foreground">السعر</h3>
                  <div className="flex items-center justify-center mt-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold ml-2 rtl:mr-2">
                      {mockRatings.length > 0 
                        ? (mockRatings.reduce((sum, r) => sum + r.priceScore, 0) / mockRatings.length).toFixed(1) 
                        : 0}
                    </span>
                  </div>
                </div>
                
                <div className="bg-muted p-4 rounded-md text-center">
                  <h3 className="text-sm font-medium text-muted-foreground">الخدمة</h3>
                  <div className="flex items-center justify-center mt-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-2xl font-bold ml-2 rtl:mr-2">
                      {mockRatings.length > 0 
                        ? (mockRatings.reduce((sum, r) => sum + r.serviceScore, 0) / mockRatings.length).toFixed(1) 
                        : 0}
                    </span>
                  </div>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-4">سجل التقييمات</h3>
              
              {mockRatings.map((rating) => (
                <Card key={rating.id} className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < rating.overallScore ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} 
                            />
                          ))}
                          <span className="ml-2 rtl:mr-2 font-medium">{rating.overallScore}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(rating.date).toLocaleDateString('ar-SA')}
                        </p>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">الجودة</p>
                          <p className="font-medium">{rating.qualityScore}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">التسليم</p>
                          <p className="font-medium">{rating.deliveryScore}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">السعر</p>
                          <p className="font-medium">{rating.priceScore}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">الخدمة</p>
                          <p className="font-medium">{rating.serviceScore}</p>
                        </div>
                      </div>
                    </div>
                    
                    {rating.comments && (
                      <div className="mt-4 bg-muted p-3 rounded-md">
                        <p className="text-sm">{rating.comments}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {mockRatings.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  لا توجد تقييمات لعرضها. قم بإضافة تقييم جديد.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>المعلومات المالية</CardTitle>
              <CardDescription>
                معلومات مالية مفصلة عن المورد
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="text-sm font-medium text-muted-foreground">الرصيد الحالي</h3>
                  <p className="text-2xl font-bold mt-2 text-destructive">
                    {supplier.balance?.toLocaleString() || 0} ل.س
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="text-sm font-medium text-muted-foreground">الحد الائتماني</h3>
                  <p className="text-2xl font-bold mt-2">
                    {supplier.creditLimit?.toLocaleString() || 0} ل.س
                  </p>
                </div>
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="text-sm font-medium text-muted-foreground">شروط الدفع</h3>
                  <p className="text-lg font-medium mt-2">
                    {supplier.paymentTerms || "غير محدد"}
                  </p>
                </div>
              </div>
              
              <h3 className="text-lg font-medium mb-4">سجل المعاملات المالية</h3>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>رقم المرجع</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الرصيد</TableHead>
                    <TableHead className="text-center">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>2024-07-01</TableCell>
                    <TableCell>PO-2024-001</TableCell>
                    <TableCell>أمر شراء</TableCell>
                    <TableCell className="text-destructive">13,110 ل.س</TableCell>
                    <TableCell>13,110 ل.س</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" className="rounded-md">عرض</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2024-06-15</TableCell>
                    <TableCell>PO-2024-002</TableCell>
                    <TableCell>أمر شراء</TableCell>
                    <TableCell className="text-destructive">5,750 ل.س</TableCell>
                    <TableCell>18,860 ل.س</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" className="rounded-md">عرض</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>2024-06-20</TableCell>
                    <TableCell>PAY-2024-001</TableCell>
                    <TableCell>دفعة</TableCell>
                    <TableCell className="text-green-600">5,750 ل.س</TableCell>
                    <TableCell>13,110 ل.س</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" className="rounded-md">عرض</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* نافذة تأكيد الحذف */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف هذا المورد؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="font-medium">{supplier.name}</p>
            <p className="text-sm text-muted-foreground">{supplier.supplierCode}</p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              className="rounded-md"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              variant="destructive" 
              className="rounded-md"
              onClick={handleDeleteSupplier}
            >
              <Trash2 className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* نافذة إضافة تقييم */}
      <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة تقييم جديد</DialogTitle>
            <DialogDescription>
              قم بتقييم أداء المورد في المجالات المختلفة.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>جودة المنتجات</Label>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Button key={i} variant="ghost" size="sm" className="p-1">
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>سرعة التسليم</Label>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Button key={i} variant="ghost" size="sm" className="p-1">
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>تنافسية الأسعار</Label>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Button key={i} variant="ghost" size="sm" className="p-1">
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>جودة الخدمة</Label>
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Button key={i} variant="ghost" size="sm" className="p-1">
                    <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>ملاحظات (اختياري)</Label>
              <textarea 
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px]"
                placeholder="أدخل ملاحظاتك حول أداء المورد..."
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              className="rounded-md"
              onClick={() => setIsRatingDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              className="rounded-md"
              onClick={handleAddRating}
            >
              <Star className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> إضافة التقييم
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}