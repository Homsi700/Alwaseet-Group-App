
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Truck, PlusCircle, Filter, FileText, Search, Eye, Edit, Trash2, Star, ShoppingCart, BarChart4, Download } from "lucide-react";
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

// فئات الموردين
const supplierCategories = [
  "إلكترونيات",
  "قرطاسية",
  "أثاث",
  "مواد غذائية",
  "خدمات",
  "أخرى"
];

export default function SuppliersPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: "",
    contactPerson: "",
    phoneNumber: "",
    email: "",
    category: "",
  });

  // تصفية الموردين حسب البحث والفئة
  const filteredSuppliers = mockSuppliers.filter(supplier => {
    const matchesSearch = searchTerm === "" || 
      supplier.name.includes(searchTerm) || 
      supplier.contactPerson?.includes(searchTerm) || 
      supplier.email?.includes(searchTerm) ||
      supplier.phoneNumber?.includes(searchTerm) ||
      supplier.supplierCode.includes(searchTerm);
    
    const matchesCategory = selectedCategory === "" || supplier.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // إضافة مورد جديد (محاكاة)
  const handleAddSupplier = () => {
    if (!newSupplier.name) {
      alert("اسم المورد مطلوب");
      return;
    }
    
    // في التطبيق الحقيقي، سيتم إرسال البيانات إلى API
    console.log("إضافة مورد جديد:", newSupplier);
    
    // إغلاق نافذة الإضافة
    setIsAddDialogOpen(false);
    
    // إعادة تعيين نموذج الإضافة
    setNewSupplier({
      name: "",
      contactPerson: "",
      phoneNumber: "",
      email: "",
      category: "",
    });
  };

  // تصدير قائمة الموردين (محاكاة)
  const handleExportSuppliers = () => {
    alert("تم تصدير قائمة الموردين بنجاح");
  };

  // عرض تفاصيل المورد
  const handleViewSupplier = (supplierId: number) => {
    router.push(`/suppliers/${supplierId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">إدارة الموردين</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={() => router.push("/suppliers/reports")}
          >
            <BarChart4 className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> تقارير الموردين
          </Button>
          <Button 
            className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <PlusCircle className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إضافة مورد جديد
          </Button>
        </div>
      </div>
      
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على الموردين
          </CardTitle>
          <CardDescription>
            تتبع مورديك، وإدارة معلومات الاتصال، ومراقبة سجل الشراء، وتقييم أداء الموردين.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث عن مورد..."
                  className="pl-10 rounded-md w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">جميع الفئات</option>
                {supplierCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <Button 
              variant="outline" 
              className="rounded-md w-full sm:w-auto"
              onClick={handleExportSuppliers}
            >
              <Download className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تصدير القائمة
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الرمز</TableHead>
                  <TableHead>اسم المورد</TableHead>
                  <TableHead>مسؤول الاتصال</TableHead>
                  <TableHead>رقم الهاتف</TableHead>
                  <TableHead>الفئة</TableHead>
                  <TableHead>التقييم</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.supplierId}>
                    <TableCell>{supplier.supplierCode}</TableCell>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.contactPerson || "-"}</TableCell>
                    <TableCell>{supplier.phoneNumber || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{supplier.category || "غير محدد"}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span>{supplier.rating || "-"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-md"
                        onClick={() => handleViewSupplier(supplier.supplierId)}
                      >
                        <Eye className="h-4 w-4 ml-1 rtl:mr-1 icon-directional" /> عرض
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-md"
                        onClick={() => router.push(`/suppliers/${supplier.supplierId}/edit`)}
                      >
                        <Edit className="h-4 w-4 ml-1 rtl:mr-1 icon-directional" /> تعديل
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-md"
                        onClick={() => router.push(`/purchase-orders/new?supplierId=${supplier.supplierId}`)}
                      >
                        <ShoppingCart className="h-4 w-4 ml-1 rtl:mr-1 icon-directional" /> طلب شراء
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSuppliers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      لا يوجد موردون لعرضهم. قم بإضافة مورد جديد.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">إجمالي الموردين</h3>
                    <p className="text-3xl font-bold mt-2">{mockSuppliers.length}</p>
                  </div>
                  <Truck className="h-10 w-10 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">أوامر الشراء النشطة</h3>
                    <p className="text-3xl font-bold mt-2">5</p>
                  </div>
                  <ShoppingCart className="h-10 w-10 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">إجمالي المشتريات</h3>
                    <p className="text-3xl font-bold mt-2">1,250,000 ل.س</p>
                  </div>
                  <BarChart4 className="h-10 w-10 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <p className="text-sm text-muted-foreground mt-6">
            يساعدك هذا القسم على إدارة علاقاتك مع الموردين بفعالية، بما في ذلك تتبع أوامر الشراء والفواتير المستلمة.
          </p>
        </CardContent>
      </Card>
      
      {/* نافذة إضافة مورد جديد */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>إضافة مورد جديد</DialogTitle>
            <DialogDescription>
              أدخل معلومات المورد الجديد. الحقول المميزة بعلامة * مطلوبة.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المورد *</Label>
                <Input
                  id="name"
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
                  placeholder="أدخل اسم المورد"
                  className="rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPerson">مسؤول الاتصال</Label>
                <Input
                  id="contactPerson"
                  value={newSupplier.contactPerson}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contactPerson: e.target.value })}
                  placeholder="أدخل اسم مسؤول الاتصال"
                  className="rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">رقم الهاتف</Label>
                <Input
                  id="phoneNumber"
                  value={newSupplier.phoneNumber}
                  onChange={(e) => setNewSupplier({ ...newSupplier, phoneNumber: e.target.value })}
                  placeholder="أدخل رقم الهاتف"
                  className="rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
                  placeholder="أدخل البريد الإلكتروني"
                  className="rounded-md"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">الفئة</Label>
                <select
                  id="category"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={newSupplier.category}
                  onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                >
                  <option value="">اختر الفئة</option>
                  {supplierCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Textarea
                  id="address"
                  value={newSupplier.address}
                  onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                  placeholder="أدخل العنوان"
                  className="rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={newSupplier.notes}
                  onChange={(e) => setNewSupplier({ ...newSupplier, notes: e.target.value })}
                  placeholder="أدخل ملاحظات إضافية"
                  className="rounded-md"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" className="rounded-md" onClick={() => setIsAddDialogOpen(false)}>
              إلغاء
            </Button>
            <Button className="rounded-md" onClick={handleAddSupplier}>
              إضافة المورد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
