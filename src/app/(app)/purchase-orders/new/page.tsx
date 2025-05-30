"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Save, X, Plus, Trash2, Calculator } from "lucide-react";
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

// بيانات المنتجات الوهمية
const mockProducts = [
  { id: 101, name: "جهاز كمبيوتر مكتبي", price: 4000, unit: "قطعة" },
  { id: 102, name: "شاشة كمبيوتر", price: 2000, unit: "قطعة" },
  { id: 103, name: "لوحة مفاتيح", price: 500, unit: "قطعة" },
  { id: 104, name: "فأرة", price: 300, unit: "قطعة" },
  { id: 201, name: "أوراق طباعة A4", price: 300, unit: "صندوق" },
  { id: 202, name: "أقلام حبر", price: 10, unit: "قطعة" },
  { id: 203, name: "دفاتر ملاحظات", price: 25, unit: "قطعة" },
  { id: 301, name: "كرسي مكتبي", price: 1000, unit: "قطعة" },
  { id: 302, name: "مكتب عمل", price: 2000, unit: "قطعة" },
];

// حالات أمر الشراء
const purchaseOrderStatuses = [
  { value: "Draft", label: "مسودة" },
  { value: "Pending", label: "قيد الانتظار" },
  { value: "Approved", label: "معتمد" },
  { value: "Ordered", label: "تم الطلب" },
];

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);
  
  // بيانات أمر الشراء
  const [orderData, setOrderData] = useState({
    supplierId: "",
    expectedDeliveryDate: "",
    status: "Draft",
    discountPercent: 0,
    taxPercent: 15,
    notes: "",
  });
  
  // بيانات المورد المحدد
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  
  // بنود أمر الشراء
  const [orderItems, setOrderItems] = useState<any[]>([
    { id: 1, productId: "", productName: "", quantity: 1, unitPrice: 0, unitOfMeasure: "", discountPercent: 0, taxPercent: 15 }
  ]);
  
  // إجماليات أمر الشراء
  const [totals, setTotals] = useState({
    subTotal: 0,
    discountAmount: 0,
    taxAmount: 0,
    totalAmount: 0,
  });

  // تحميل بيانات المورد من معلمات البحث
  useEffect(() => {
    const supplierId = searchParams.get("supplierId");
    if (supplierId) {
      const supplier = mockSuppliers.find(s => s.supplierId === parseInt(supplierId));
      if (supplier) {
        setOrderData(prev => ({ ...prev, supplierId: supplierId }));
        setSelectedSupplier(supplier);
      }
    }
    
    // تعيين تاريخ التسليم المتوقع افتراضياً بعد أسبوعين
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);
    setOrderData(prev => ({ 
      ...prev, 
      expectedDeliveryDate: twoWeeksLater.toISOString().split('T')[0]
    }));
  }, [searchParams]);

  // تحديث بيانات أمر الشراء
  const handleOrderDataChange = (field: string, value: any) => {
    setOrderData({ ...orderData, [field]: value });
    calculateTotals();
  };

  // تحديث بيانات بند أمر الشراء
  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...orderItems];
    
    if (field === "productId" && value) {
      const product = mockProducts.find(p => p.id === parseInt(value));
      if (product) {
        updatedItems[index] = {
          ...updatedItems[index],
          productId: value,
          productName: product.name,
          unitPrice: product.price,
          unitOfMeasure: product.unit,
        };
      }
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }
    
    setOrderItems(updatedItems);
    calculateTotals();
  };

  // إضافة بند جديد
  const handleAddItem = () => {
    setOrderItems([
      ...orderItems,
      { 
        id: orderItems.length + 1, 
        productId: "", 
        productName: "", 
        quantity: 1, 
        unitPrice: 0, 
        unitOfMeasure: "", 
        discountPercent: 0, 
        taxPercent: orderData.taxPercent 
      }
    ]);
  };

  // حذف بند
  const handleRemoveItem = (index: number) => {
    if (orderItems.length > 1) {
      const updatedItems = orderItems.filter((_, i) => i !== index);
      setOrderItems(updatedItems);
      calculateTotals();
    }
  };

  // حساب الإجماليات
  const calculateTotals = () => {
    let subTotal = 0;
    
    orderItems.forEach(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      subTotal += quantity * unitPrice;
    });
    
    const discountPercent = parseFloat(orderData.discountPercent) || 0;
    const discountAmount = (subTotal * discountPercent) / 100;
    
    const taxPercent = parseFloat(orderData.taxPercent) || 0;
    const taxAmount = ((subTotal - discountAmount) * taxPercent) / 100;
    
    const totalAmount = subTotal - discountAmount + taxAmount;
    
    setTotals({
      subTotal,
      discountAmount,
      taxAmount,
      totalAmount,
    });
  };

  // حفظ أمر الشراء
  const handleSaveOrder = () => {
    if (!orderData.supplierId) {
      alert("يرجى اختيار المورد");
      return;
    }
    
    if (orderItems.some(item => !item.productId)) {
      alert("يرجى اختيار المنتجات لجميع البنود");
      return;
    }
    
    setIsSaving(true);
    
    // محاكاة عملية الحفظ
    setTimeout(() => {
      alert("تم حفظ أمر الشراء بنجاح");
      setIsSaving(false);
      router.push("/purchase-orders");
    }, 1000);
  };

  // إلغاء أمر الشراء
  const handleCancel = () => {
    if (confirm("هل أنت متأكد من رغبتك في إلغاء أمر الشراء؟")) {
      router.push("/purchase-orders");
    }
  };

  // تحديث الإجماليات عند تغيير البيانات
  useEffect(() => {
    calculateTotals();
  }, [orderItems, orderData.discountPercent, orderData.taxPercent]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full"
              onClick={() => router.push("/purchase-orders")}
            >
              <ArrowLeft className="h-4 w-4 icon-directional" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">أمر شراء جديد</h1>
          </div>
          <p className="text-muted-foreground mt-1">إنشاء أمر شراء جديد</p>
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
            onClick={handleSaveOrder}
            disabled={isSaving}
          >
            <Save className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> حفظ أمر الشراء
            {isSaving && (
              <div className="ml-2 rtl:mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            )}
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>معلومات المورد</CardTitle>
          <CardDescription>
            اختر المورد وأدخل معلومات أمر الشراء الأساسية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplierId">المورد *</Label>
                <Select 
                  value={orderData.supplierId} 
                  onValueChange={(value) => {
                    handleOrderDataChange("supplierId", value);
                    const supplier = mockSuppliers.find(s => s.supplierId === parseInt(value));
                    setSelectedSupplier(supplier || null);
                  }}
                >
                  <SelectTrigger className="rounded-md">
                    <SelectValue placeholder="اختر المورد" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSuppliers.map((supplier) => (
                      <SelectItem key={supplier.supplierId} value={supplier.supplierId.toString()}>
                        {supplier.name} ({supplier.supplierCode})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedSupplier && (
                <div className="bg-muted p-4 rounded-md space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">مسؤول الاتصال:</span>
                    <span>{selectedSupplier.contactPerson || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">رقم الهاتف:</span>
                    <span>{selectedSupplier.phoneNumber || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">البريد الإلكتروني:</span>
                    <span>{selectedSupplier.email || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">شروط الدفع:</span>
                    <span>{selectedSupplier.paymentTerms || "-"}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="expectedDeliveryDate">تاريخ التسليم المتوقع</Label>
                <Input
                  id="expectedDeliveryDate"
                  type="date"
                  value={orderData.expectedDeliveryDate}
                  onChange={(e) => handleOrderDataChange("expectedDeliveryDate", e.target.value)}
                  className="rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">حالة أمر الشراء</Label>
                <Select 
                  value={orderData.status} 
                  onValueChange={(value) => handleOrderDataChange("status", value)}
                >
                  <SelectTrigger className="rounded-md">
                    <SelectValue placeholder="اختر الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    {purchaseOrderStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={orderData.notes}
                  onChange={(e) => handleOrderDataChange("notes", e.target.value)}
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
          <CardTitle className="flex items-center justify-between">
            <span>بنود أمر الشراء</span>
            <Button 
              className="rounded-md"
              onClick={handleAddItem}
            >
              <Plus className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> إضافة بند
            </Button>
          </CardTitle>
          <CardDescription>
            أدخل المنتجات والكميات المطلوبة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead style={{ width: "30%" }}>المنتج</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>الوحدة</TableHead>
                  <TableHead>السعر</TableHead>
                  <TableHead>الخصم %</TableHead>
                  <TableHead>الضريبة %</TableHead>
                  <TableHead>الإجمالي</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.map((item, index) => {
                  const quantity = parseFloat(item.quantity) || 0;
                  const unitPrice = parseFloat(item.unitPrice) || 0;
                  const lineTotal = quantity * unitPrice;
                  const discountPercent = parseFloat(item.discountPercent) || 0;
                  const discountAmount = (lineTotal * discountPercent) / 100;
                  const taxPercent = parseFloat(item.taxPercent) || 0;
                  const taxAmount = ((lineTotal - discountAmount) * taxPercent) / 100;
                  const finalLineTotal = lineTotal - discountAmount + taxAmount;
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Select 
                          value={item.productId.toString()} 
                          onValueChange={(value) => handleItemChange(index, "productId", value)}
                        >
                          <SelectTrigger className="rounded-md">
                            <SelectValue placeholder="اختر المنتج" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockProducts.map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="rounded-md w-20"
                        />
                      </TableCell>
                      <TableCell>
                        {item.unitOfMeasure}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, "unitPrice", e.target.value)}
                          className="rounded-md w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discountPercent}
                          onChange={(e) => handleItemChange(index, "discountPercent", e.target.value)}
                          className="rounded-md w-16"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.taxPercent}
                          onChange={(e) => handleItemChange(index, "taxPercent", e.target.value)}
                          className="rounded-md w-16"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {finalLineTotal.toLocaleString()} ل.س
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-full text-destructive"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>ملخص أمر الشراء</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discountPercent">نسبة الخصم الإجمالي (%)</Label>
                <Input
                  id="discountPercent"
                  type="number"
                  min="0"
                  max="100"
                  value={orderData.discountPercent}
                  onChange={(e) => handleOrderDataChange("discountPercent", e.target.value)}
                  className="rounded-md"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="taxPercent">نسبة الضريبة الإجمالية (%)</Label>
                <Input
                  id="taxPercent"
                  type="number"
                  min="0"
                  max="100"
                  value={orderData.taxPercent}
                  onChange={(e) => handleOrderDataChange("taxPercent", e.target.value)}
                  className="rounded-md"
                />
              </div>
            </div>
            
            <div className="bg-muted p-4 rounded-md space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المجموع الفرعي:</span>
                <span>{totals.subTotal.toLocaleString()} ل.س</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الخصم ({orderData.discountPercent}%):</span>
                <span>{totals.discountAmount.toLocaleString()} ل.س</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الضريبة ({orderData.taxPercent}%):</span>
                <span>{totals.taxAmount.toLocaleString()} ل.س</span>
              </div>
              <div className="border-t pt-4 flex justify-between font-bold">
                <span>الإجمالي:</span>
                <span>{totals.totalAmount.toLocaleString()} ل.س</span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between">
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={() => calculateTotals()}
          >
            <Calculator className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> إعادة حساب
          </Button>
          <Button 
            className="rounded-md"
            onClick={handleSaveOrder}
            disabled={isSaving}
          >
            <Save className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> حفظ أمر الشراء
            {isSaving && (
              <div className="ml-2 rtl:mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}