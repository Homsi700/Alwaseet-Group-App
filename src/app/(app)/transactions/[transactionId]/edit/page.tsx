"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, X, Upload, AlertTriangle } from "lucide-react";
import { 
  Transaction, 
  TransactionType, 
  TransactionStatus, 
  PaymentMethod, 
  EntityType, 
  ReferenceType,
  Supplier,
  Customer,
  Account,
  AccountType
} from "@/lib/types";

// بيانات وهمية للحركات المالية
const mockTransactions: Transaction[] = [
  {
    transactionId: 1,
    transactionNumber: "TRX-2024-001",
    transactionDate: "2024-07-15T10:30:00Z",
    transactionType: TransactionType.PAYMENT_RECEIVED,
    amount: 25000,
    description: "دفعة من فاتورة المبيعات #INV-2024-105",
    referenceNumber: "INV-2024-105",
    referenceType: ReferenceType.INVOICE,
    referenceId: 105,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    accountId: 1,
    accountName: "الحساب البنكي الرئيسي",
    entityType: EntityType.CUSTOMER,
    entityId: 1,
    entityName: "شركة الأمل للتجارة",
    notes: "تم استلام الدفعة بالكامل",
    status: TransactionStatus.COMPLETED,
    companyId: 1,
    createdAt: "2024-07-15T10:30:00Z",
    updatedAt: "2024-07-15T10:30:00Z",
    createdBy: 1,
    isReconciled: true,
    reconciledDate: "2024-07-16T14:20:00Z",
    reconciledBy: 1
  },
  {
    transactionId: 2,
    transactionNumber: "TRX-2024-002",
    transactionDate: "2024-07-14T11:45:00Z",
    transactionType: TransactionType.PAYMENT_MADE,
    amount: 13110,
    description: "دفعة لأمر الشراء #PO-2024-001",
    referenceNumber: "PO-2024-001",
    referenceType: ReferenceType.PURCHASE_ORDER,
    referenceId: 1,
    paymentMethod: PaymentMethod.CHEQUE,
    accountId: 1,
    accountName: "الحساب البنكي الرئيسي",
    entityType: EntityType.SUPPLIER,
    entityId: 1,
    entityName: "مورد النخبة للأجهزة",
    notes: "شيك رقم 123456",
    status: TransactionStatus.COMPLETED,
    companyId: 1,
    createdAt: "2024-07-14T11:45:00Z",
    updatedAt: "2024-07-14T11:45:00Z",
    createdBy: 1,
    isReconciled: true,
    reconciledDate: "2024-07-16T14:20:00Z",
    reconciledBy: 1
  },
  {
    transactionId: 3,
    transactionNumber: "TRX-2024-003",
    transactionDate: "2024-07-13T09:15:00Z",
    transactionType: TransactionType.EXPENSE,
    amount: 5000,
    description: "مصاريف إيجار المكتب",
    paymentMethod: PaymentMethod.CASH,
    accountId: 2,
    accountName: "الصندوق النقدي",
    entityType: EntityType.OTHER,
    entityId: 0,
    entityName: "إيجارات",
    notes: "إيجار شهر يوليو 2024",
    status: TransactionStatus.COMPLETED,
    companyId: 1,
    createdAt: "2024-07-13T09:15:00Z",
    updatedAt: "2024-07-13T09:15:00Z",
    createdBy: 1,
    isReconciled: false
  }
];

// بيانات وهمية للحسابات المالية
const mockAccounts: Account[] = [
  { 
    accountId: 1, 
    accountNumber: "ACC001", 
    name: "الحساب البنكي الرئيسي", 
    type: AccountType.BANK, 
    balance: 350000, 
    currency: "SYP", 
    isActive: true, 
    description: "الحساب البنكي الرئيسي للشركة", 
    bankName: "بنك سورية الدولي الإسلامي", 
    bankBranch: "دمشق - المزة", 
    companyId: 1, 
    createdAt: "2024-01-01T00:00:00Z", 
    updatedAt: "2024-07-16T14:20:00Z", 
    createdBy: 1 
  },
  { 
    accountId: 2, 
    accountNumber: "ACC002", 
    name: "الصندوق النقدي", 
    type: AccountType.CASH, 
    balance: 75000, 
    currency: "SYP", 
    isActive: true, 
    description: "الصندوق النقدي للشركة", 
    companyId: 1, 
    createdAt: "2024-01-01T00:00:00Z", 
    updatedAt: "2024-07-16T14:20:00Z", 
    createdBy: 1 
  },
  { 
    accountId: 3, 
    accountNumber: "ACC003", 
    name: "حساب بطاقة الائتمان", 
    type: AccountType.CREDIT_CARD, 
    balance: -15000, 
    currency: "SYP", 
    isActive: true, 
    description: "حساب بطاقة الائتمان للشركة", 
    bankName: "بنك سورية الدولي الإسلامي", 
    companyId: 1, 
    createdAt: "2024-01-01T00:00:00Z", 
    updatedAt: "2024-07-16T14:20:00Z", 
    createdBy: 1 
  }
];

// بيانات وهمية للموردين
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
  }
];

// بيانات وهمية للعملاء
const mockCustomers: Customer[] = [
  {
    customerId: 1,
    customerCode: "CUS001",
    name: "شركة الأمل للتجارة",
    contactPerson: "محمد عبدالله",
    phoneNumber: "0944444444",
    email: "info@alamal.com",
    address: "دمشق - شارع بغداد",
    taxNumber: "9876543210",
    notes: "عميل رئيسي",
    creditLimit: 1000000,
    balance: 25000,
    companyId: 1,
    createdAt: "2024-01-10T08:30:00Z",
    updatedAt: "2024-07-15T10:30:00Z",
    createdBy: 1,
    isActive: true,
    category: "تجارة عامة"
  },
  {
    customerId: 2,
    customerCode: "CUS002",
    name: "مؤسسة النور للتجارة",
    contactPerson: "سارة أحمد",
    phoneNumber: "0955555555",
    email: "info@alnoor.com",
    address: "حلب - شارع النصر",
    taxNumber: "5432109876",
    notes: "عميل منتظم",
    creditLimit: 500000,
    balance: 15000,
    companyId: 1,
    createdAt: "2024-02-05T09:45:00Z",
    updatedAt: "2024-07-10T13:10:00Z",
    createdBy: 1,
    isActive: true,
    category: "تجارة تجزئة"
  }
];

// ترجمة أنواع الحركات المالية
const transactionTypeLabels: Record<TransactionType, string> = {
  [TransactionType.INCOME]: "إيراد",
  [TransactionType.EXPENSE]: "مصروف",
  [TransactionType.TRANSFER]: "تحويل",
  [TransactionType.PAYMENT_RECEIVED]: "دفعة واردة",
  [TransactionType.PAYMENT_MADE]: "دفعة صادرة",
  [TransactionType.REFUND]: "استرداد",
  [TransactionType.ADJUSTMENT]: "تسوية"
};

// ترجمة طرق الدفع
const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: "نقدي",
  [PaymentMethod.BANK_TRANSFER]: "تحويل بنكي",
  [PaymentMethod.CREDIT_CARD]: "بطاقة ائتمان",
  [PaymentMethod.CHEQUE]: "شيك",
  [PaymentMethod.ONLINE_PAYMENT]: "دفع إلكتروني",
  [PaymentMethod.OTHER]: "أخرى"
};

// ترجمة أنواع الكيانات
const entityTypeLabels: Record<EntityType, string> = {
  [EntityType.CUSTOMER]: "عميل",
  [EntityType.SUPPLIER]: "مورد",
  [EntityType.EMPLOYEE]: "موظف",
  [EntityType.COMPANY]: "الشركة",
  [EntityType.OTHER]: "أخرى"
};

// ترجمة حالات الحركات المالية
const transactionStatusLabels: Record<TransactionStatus, string> = {
  [TransactionStatus.PENDING]: "قيد الانتظار",
  [TransactionStatus.COMPLETED]: "مكتملة",
  [TransactionStatus.FAILED]: "فاشلة",
  [TransactionStatus.CANCELLED]: "ملغاة",
  [TransactionStatus.RECONCILED]: "مطابقة"
};

export default function EditTransactionPage({ params }: { params: { transactionId: string } }) {
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // محاكاة جلب بيانات الحركة المالية
    const transactionId = parseInt(params.transactionId);
    const foundTransaction = mockTransactions.find(t => t.transactionId === transactionId);
    
    if (foundTransaction) {
      setTransaction({ ...foundTransaction });
    }
    
    setIsLoading(false);
  }, [params.transactionId]);

  // تحديث بيانات الحركة المالية
  const handleInputChange = (field: string, value: any) => {
    if (transaction) {
      setTransaction({ ...transaction, [field]: value });
      setHasChanges(true);
    }
  };

  // تحديث الكيان (العميل أو المورد) عند اختياره
  const handleEntityChange = (entityId: string, entityType: EntityType) => {
    if (!transaction) return;
    
    let entityName = "";
    
    if (entityType === EntityType.CUSTOMER) {
      const customer = mockCustomers.find(c => c.customerId === parseInt(entityId));
      if (customer) {
        entityName = customer.name;
      }
    } else if (entityType === EntityType.SUPPLIER) {
      const supplier = mockSuppliers.find(s => s.supplierId === parseInt(entityId));
      if (supplier) {
        entityName = supplier.name;
      }
    }
    
    setTransaction({ 
      ...transaction, 
      entityId: parseInt(entityId),
      entityName,
      entityType
    });
    
    setHasChanges(true);
  };

  // حفظ التغييرات
  const handleSave = () => {
    if (!transaction) return;
    
    if (!transaction.amount || transaction.amount <= 0) {
      alert("يرجى إدخال مبلغ صحيح");
      return;
    }
    
    if (!transaction.accountId) {
      alert("يرجى اختيار الحساب");
      return;
    }
    
    setIsSaving(true);
    
    // محاكاة عملية الحفظ
    setTimeout(() => {
      alert("تم حفظ التغييرات بنجاح");
      setIsSaving(false);
      setHasChanges(false);
      router.push(`/transactions/${transaction.transactionId}`);
    }, 1000);
  };

  // إلغاء التغييرات
  const handleCancel = () => {
    if (hasChanges) {
      if (confirm("هل أنت متأكد من رغبتك في إلغاء التغييرات؟")) {
        router.push(`/transactions/${transaction?.transactionId}`);
      }
    } else {
      router.push(`/transactions/${transaction?.transactionId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">الحركة المالية غير موجودة</h2>
        <p className="text-muted-foreground mb-6">لم يتم العثور على الحركة المالية المطلوبة</p>
        <Button onClick={() => router.push("/transactions")}>
          <ArrowLeft className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> العودة إلى قائمة الحركات المالية
        </Button>
      </div>
    );
  }

  // التحقق مما إذا كانت الحركة المالية قابلة للتعديل
  const isEditable = transaction.status !== TransactionStatus.RECONCILED;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-full"
              onClick={() => router.push(`/transactions/${transaction.transactionId}`)}
            >
              <ArrowLeft className="h-4 w-4 icon-directional" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">تعديل الحركة المالية</h1>
          </div>
          <p className="text-muted-foreground mt-1">{transaction.transactionNumber}</p>
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
            disabled={isSaving || !hasChanges || !isEditable}
          >
            <Save className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> حفظ التغييرات
            {isSaving && (
              <div className="ml-2 rtl:mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            )}
          </Button>
        </div>
      </div>
      
      {!isEditable && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 ml-2 rtl:mr-2 icon-directional" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">تنبيه</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                هذه الحركة المالية تمت مطابقتها ولا يمكن تعديلها. يمكنك فقط عرض تفاصيلها.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>تعديل معلومات الحركة المالية</CardTitle>
          <CardDescription>
            تعديل معلومات الحركة المالية رقم {transaction.transactionNumber}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transactionType">نوع الحركة</Label>
                <Select 
                  value={transaction.transactionType} 
                  onValueChange={(value) => handleInputChange("transactionType", value)}
                  disabled={!isEditable}
                >
                  <SelectTrigger className="rounded-md">
                    <SelectValue placeholder="اختر نوع الحركة" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(transactionTypeLabels).map(([type, label]) => (
                      <SelectItem key={type} value={type}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transactionDate">التاريخ *</Label>
                <Input
                  id="transactionDate"
                  type="date"
                  value={transaction.transactionDate.toString().split('T')[0]}
                  onChange={(e) => handleInputChange("transactionDate", e.target.value)}
                  className="rounded-md"
                  disabled={!isEditable}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">المبلغ *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={transaction.amount}
                  onChange={(e) => handleInputChange("amount", parseFloat(e.target.value))}
                  placeholder="0.00"
                  className="rounded-md"
                  disabled={!isEditable}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">طريقة الدفع *</Label>
                <Select 
                  value={transaction.paymentMethod} 
                  onValueChange={(value) => handleInputChange("paymentMethod", value)}
                  disabled={!isEditable}
                >
                  <SelectTrigger className="rounded-md">
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(paymentMethodLabels).map(([method, label]) => (
                      <SelectItem key={method} value={method}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountId">الحساب *</Label>
                <Select 
                  value={transaction.accountId.toString()} 
                  onValueChange={(value) => handleInputChange("accountId", parseInt(value))}
                  disabled={!isEditable}
                >
                  <SelectTrigger className="rounded-md">
                    <SelectValue placeholder="اختر الحساب" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockAccounts.map((account) => (
                      <SelectItem key={account.accountId} value={account.accountId.toString()}>
                        {account.name} ({account.balance.toLocaleString()} ل.س)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="entityType">نوع الجهة</Label>
                <Select 
                  value={transaction.entityType} 
                  onValueChange={(value) => handleInputChange("entityType", value)}
                  disabled={!isEditable}
                >
                  <SelectTrigger className="rounded-md">
                    <SelectValue placeholder="اختر نوع الجهة" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(entityTypeLabels).map(([type, label]) => (
                      <SelectItem key={type} value={type}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {transaction.entityType === EntityType.CUSTOMER && (
                <div className="space-y-2">
                  <Label htmlFor="entityId">العميل</Label>
                  <Select 
                    value={transaction.entityId?.toString()} 
                    onValueChange={(value) => handleEntityChange(value, EntityType.CUSTOMER)}
                    disabled={!isEditable}
                  >
                    <SelectTrigger className="rounded-md">
                      <SelectValue placeholder="اختر العميل" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCustomers.map((customer) => (
                        <SelectItem key={customer.customerId} value={customer.customerId.toString()}>
                          {customer.name} ({customer.customerCode})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {transaction.entityType === EntityType.SUPPLIER && (
                <div className="space-y-2">
                  <Label htmlFor="entityId">المورد</Label>
                  <Select 
                    value={transaction.entityId?.toString()} 
                    onValueChange={(value) => handleEntityChange(value, EntityType.SUPPLIER)}
                    disabled={!isEditable}
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
              )}
              
              {transaction.entityType === EntityType.OTHER && (
                <div className="space-y-2">
                  <Label htmlFor="entityName">اسم الجهة</Label>
                  <Input
                    id="entityName"
                    value={transaction.entityName || ""}
                    onChange={(e) => handleInputChange("entityName", e.target.value)}
                    placeholder="أدخل اسم الجهة"
                    className="rounded-md"
                    disabled={!isEditable}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="description">الوصف</Label>
                <Textarea
                  id="description"
                  value={transaction.description || ""}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="أدخل وصفاً للحركة المالية"
                  className="rounded-md"
                  disabled={!isEditable}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={transaction.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="أدخل ملاحظات إضافية"
                  className="rounded-md"
                  disabled={!isEditable}
                />
              </div>
              
              {isEditable && (
                <div className="space-y-2">
                  <Label htmlFor="status">الحالة</Label>
                  <Select 
                    value={transaction.status} 
                    onValueChange={(value) => handleInputChange("status", value)}
                  >
                    <SelectTrigger className="rounded-md">
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(transactionStatusLabels)
                        .filter(([status]) => status !== TransactionStatus.RECONCILED)
                        .map(([status, label]) => (
                          <SelectItem key={status} value={status}>{label}</SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
          
          {isEditable && (
            <div className="mt-6">
              <Label>المرفقات</Label>
              <div className="mt-2 border-2 border-dashed border-muted-foreground/25 rounded-md p-8 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  اسحب وأفلت الملفات هنا، أو انقر لاختيار الملفات
                </p>
                <Button variant="outline" className="mt-4 rounded-md">
                  اختيار الملفات
                </Button>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-6 flex justify-between">
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={handleCancel}
            disabled={isSaving}
          >
            <X className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إلغاء
          </Button>
          {isEditable && (
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
          )}
        </CardFooter>
      </Card>
    </div>
  );
}