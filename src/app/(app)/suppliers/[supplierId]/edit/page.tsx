"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, X, AlertTriangle } from "lucide-react";
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

export default function EditSupplierPage({ params }: { params: { supplierId: string } }) {
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // محاكاة جلب بيانات المورد
    const supplierId = parseInt(params.supplierId);
    const foundSupplier = mockSuppliers.find(s => s.supplierId === supplierId);
    
    if (foundSupplier) {
      setSupplier({ ...foundSupplier });
    }
    
    setIsLoading(false);
  }, [params.supplierId]);

  // تحديث بيانات المورد
  const handleInputChange = (field: string, value: any) => {
    if (supplier) {
      setSupplier({ ...supplier, [field]: value });
      setHasChanges(true);
    }
  };

  // حفظ التغييرات
  const handleSave = () => {
    if (!supplier) return;
    
    if (!supplier.name) {
      alert("اسم المورد مطلوب");
      return;
    }
    
    setIsSaving(true);
    
    // محاكاة عملية الحفظ
    setTimeout(() => {
      alert("تم حفظ التغييرات بنجاح");
      setIsSaving(false);
      setHasChanges(false);
      router.push(`/suppliers/${supplier.supplierId}`);
    }, 1000);
  };

  // إلغاء التغييرات
  const handleCancel = () => {
    if (hasChanges) {
      if (confirm("هل أنت متأكد من رغبتك في إلغاء التغييرات؟")) {
        router.push(`/suppliers/${supplier?.supplierId}`);
      }
    } else {
      router.push(`/suppliers/${supplier?.supplierId}`);
    }
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
              onClick={() => router.push(`/suppliers/${supplier.supplierId}`)}
            >
              <ArrowLeft className="h-4 w-4 icon-directional" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">تعديل المورد</h1>
          </div>
          <p className="text-muted-foreground mt-1">{supplier.supplierCode} - {supplier.name}</p>
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
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            <Save className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> حفظ التغييرات
            {isSaving && (
              <div className="ml-2 rtl:mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            )}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>المعلومات الأساسية</CardTitle>
          <CardDescription>
            المعلومات الأساسية للمورد. الحقول المميزة بعلامة * مطلوبة.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المورد *</Label>
                <Input
                  id="name"
                  value={supplier.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="أدخل اسم المورد"
                  className="rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPerson">مسؤول الاتصال</Label>
                <Input
                  id="contactPerson"
                  value={supplier.contactPerson || ""}
                  onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                  placeholder="أدخل اسم مسؤول الاتصال"
                  className="rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">رقم الهاتف</Label>
                <Input
                  id="phoneNumber"
                  value={supplier.phoneNumber || ""}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder="أدخل رقم الهاتف"
                  className="rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={supplier.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="أدخل البريد الإلكتروني"
                  className="rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">الموقع الإلكتروني</Label>
                <Input
                  id="website"
                  value={supplier.website || ""}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="أدخل الموقع الإلكتروني"
                  className="rounded-md"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">الفئة</Label>
                <Select 
                  value={supplier.category || ""} 
                  onValueChange={(value) => handleInputChange("category", value)}
                >
                  <SelectTrigger className="rounded-md">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">اختر الفئة</SelectItem>
                    {supplierCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                <Input
                  id="taxNumber"
                  value={supplier.taxNumber || ""}
                  onChange={(e) => handleInputChange("taxNumber", e.target.value)}
                  placeholder="أدخل الرقم الضريبي"
                  className="rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Textarea
                  id="address"
                  value={supplier.address || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="أدخل العنوان"
                  className="rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={supplier.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="أدخل ملاحظات إضافية"
                  className="rounded-md"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>المعلومات المالية</CardTitle>
          <CardDescription>
            المعلومات المالية والشروط التجارية للمورد
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="paymentTerms">شروط الدفع</Label>
              <Input
                id="paymentTerms"
                value={supplier.paymentTerms || ""}
                onChange={(e) => handleInputChange("paymentTerms", e.target.value)}
                placeholder="مثال: صافي 30 يوم"
                className="rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="creditLimit">الحد الائتماني (ل.س)</Label>
              <Input
                id="creditLimit"
                type="number"
                value={supplier.creditLimit || 0}
                onChange={(e) => handleInputChange("creditLimit", parseFloat(e.target.value))}
                placeholder="0.00"
                className="rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="balance">الرصيد الحالي (ل.س)</Label>
              <Input
                id="balance"
                type="number"
                value={supplier.balance || 0}
                onChange={(e) => handleInputChange("balance", parseFloat(e.target.value))}
                placeholder="0.00"
                className="rounded-md"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                يتم تحديث الرصيد تلقائياً بناءً على المعاملات المالية
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>إعدادات إضافية</CardTitle>
          <CardDescription>
            إعدادات إضافية للمورد
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="isActive">حالة المورد</Label>
              <Select 
                value={supplier.isActive ? "active" : "inactive"} 
                onValueChange={(value) => handleInputChange("isActive", value === "active")}
              >
                <SelectTrigger className="rounded-md">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between">
          <p className="text-sm text-muted-foreground">
            آخر تحديث: {new Date(supplier.updatedAt || "").toLocaleDateString('ar-SA')}
          </p>
          <Button 
            className="rounded-md"
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
          >
            <Save className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> حفظ التغييرات
            {isSaving && (
              <div className="ml-2 rtl:mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}