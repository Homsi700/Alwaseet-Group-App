"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, X, Upload, CreditCard, Banknote, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";
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

// بيانات وهمية للفواتير
const mockInvoices = [
  { id: 105, number: "INV-2024-105", customer: "شركة الأمل للتجارة", amount: 25000, balance: 0, date: "2024-07-10" },
  { id: 98, number: "INV-2024-098", customer: "مؤسسة النور للتجارة", amount: 15000, balance: 0, date: "2024-07-05" }
];

// بيانات وهمية لأوامر الشراء
const mockPurchaseOrders = [
  { id: 1, number: "PO-2024-001", supplier: "مورد النخبة للأجهزة", amount: 13110, balance: 0, date: "2024-07-01" },
  { id: 2, number: "PO-2024-002", supplier: "الشركة العالمية للتوريدات", amount: 5750, balance: 0, date: "2024-06-15" }
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

// ترجمة أنواع المراجع
const referenceTypeLabels: Record<ReferenceType, string> = {
  [ReferenceType.INVOICE]: "فاتورة مبيعات",
  [ReferenceType.PURCHASE_ORDER]: "أمر شراء",
  [ReferenceType.SALES_ORDER]: "أمر بيع",
  [ReferenceType.EXPENSE_CLAIM]: "مطالبة مصروفات",
  [ReferenceType.BILL]: "فاتورة مشتريات",
  [ReferenceType.MANUAL]: "يدوي"
};

export default function NewTransactionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("income");
  const [isSaving, setIsSaving] = useState(false);
  
  // بيانات الحركة المالية
  const [transactionData, setTransactionData] = useState<Partial<Transaction>>({
    transactionDate: new Date().toISOString().split('T')[0],
    transactionType: TransactionType.INCOME,
    amount: 0,
    paymentMethod: PaymentMethod.CASH,
    accountId: 2, // الصندوق النقدي افتراضياً
    entityType: EntityType.CUSTOMER,
    status: TransactionStatus.COMPLETED,
    companyId: 1
  });
  
  // تحديث نوع الحركة عند تغيير التبويب
  useEffect(() => {
    let transactionType: TransactionType;
    let entityType: EntityType = EntityType.OTHER;
    
    switch (activeTab) {
      case "income":
        transactionType = TransactionType.INCOME;
        break;
      case "expense":
        transactionType = TransactionType.EXPENSE;
        break;
      case "payment_received":
        transactionType = TransactionType.PAYMENT_RECEIVED;
        entityType = EntityType.CUSTOMER;
        break;
      case "payment_made":
        transactionType = TransactionType.PAYMENT_MADE;
        entityType = EntityType.SUPPLIER;
        break;
      case "transfer":
        transactionType = TransactionType.TRANSFER;
        entityType = EntityType.COMPANY;
        break;
      default:
        transactionType = TransactionType.INCOME;
    }
    
    setTransactionData(prev => ({ 
      ...prev, 
      transactionType,
      entityType,
      referenceType: undefined,
      referenceId: undefined,
      referenceNumber: undefined,
      entityId: undefined,
      entityName: undefined
    }));
  }, [activeTab]);

  // تحديث بيانات الحركة المالية
  const handleInputChange = (field: string, value: any) => {
    setTransactionData({ ...transactionData, [field]: value });
  };

  // تحديث الكيان (العميل أو المورد) عند اختياره
  const handleEntityChange = (entityId: string, entityType: EntityType) => {
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
    
    setTransactionData(prev => ({ 
      ...prev, 
      entityId: parseInt(entityId),
      entityName
    }));
  };

  // تحديث المرجع (الفاتورة أو أمر الشراء) عند اختياره
  const handleReferenceChange = (referenceId: string, referenceType: ReferenceType) => {
    let referenceNumber = "";
    
    if (referenceType === ReferenceType.INVOICE) {
      const invoice = mockInvoices.find(i => i.id === parseInt(referenceId));
      if (invoice) {
        referenceNumber = invoice.number;
        handleInputChange("amount", invoice.balance);
      }
    } else if (referenceType === ReferenceType.PURCHASE_ORDER) {
      const purchaseOrder = mockPurchaseOrders.find(p => p.id === parseInt(referenceId));
      if (purchaseOrder) {
        referenceNumber = purchaseOrder.number;
        handleInputChange("amount", purchaseOrder.balance);
      }
    }
    
    setTransactionData(prev => ({ 
      ...prev, 
      referenceId: parseInt(referenceId),
      referenceNumber,
      referenceType
    }));
  };

  // حفظ الحركة المالية
  const handleSaveTransaction = () => {
    if (!transactionData.amount || transactionData.amount <= 0) {
      alert("يرجى إدخال مبلغ صحيح");
      return;
    }
    
    if (!transactionData.accountId) {
      alert("يرجى اختيار الحساب");
      return;
    }
    
    if (transactionData.transactionType === TransactionType.PAYMENT_RECEIVED && !transactionData.entityId) {
      alert("يرجى اختيار العميل");
      return;
    }
    
    if (transactionData.transactionType === TransactionType.PAYMENT_MADE && !transactionData.entityId) {
      alert("يرجى اختيار المورد");
      return;
    }
    
    setIsSaving(true);
    
    // محاكاة عملية الحفظ
    setTimeout(() => {
      alert("تم حفظ الحركة المالية بنجاح");
      setIsSaving(false);
      router.push("/transactions");
    }, 1000);
  };

  // إلغاء الحركة المالية
  const handleCancel = () => {
    if (confirm("هل أنت متأكد من رغبتك في إلغاء الحركة المالية؟")) {
      router.push("/transactions");
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
              onClick={() => router.push("/transactions")}
            >
              <ArrowLeft className="h-4 w-4 icon-directional" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">إضافة حركة مالية جديدة</h1>
          </div>
          <p className="text-muted-foreground mt-1">إنشاء حركة مالية جديدة في النظام</p>
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
            onClick={handleSaveTransaction}
            disabled={isSaving}
          >
            <Save className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> حفظ الحركة المالية
            {isSaving && (
              <div className="ml-2 rtl:mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
            )}
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="income" className="flex items-center">
            <ArrowUpRight className="ml-2 rtl:mr-2 h-4 w-4 text-green-600 icon-directional" /> إيراد
          </TabsTrigger>
          <TabsTrigger value="expense" className="flex items-center">
            <ArrowDownLeft className="ml-2 rtl:mr-2 h-4 w-4 text-red-600 icon-directional" /> مصروف
          </TabsTrigger>
          <TabsTrigger value="payment_received" className="flex items-center">
            <ArrowUpRight className="ml-2 rtl:mr-2 h-4 w-4 text-green-600 icon-directional" /> دفعة واردة
          </TabsTrigger>
          <TabsTrigger value="payment_made" className="flex items-center">
            <ArrowDownLeft className="ml-2 rtl:mr-2 h-4 w-4 text-red-600 icon-directional" /> دفعة صادرة
          </TabsTrigger>
          <TabsTrigger value="transfer" className="flex items-center">
            <RefreshCw className="ml-2 rtl:mr-2 h-4 w-4 text-blue-600 icon-directional" /> تحويل
          </TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "income" && "إضافة إيراد جديد"}
              {activeTab === "expense" && "إضافة مصروف جديد"}
              {activeTab === "payment_received" && "إضافة دفعة واردة من عميل"}
              {activeTab === "payment_made" && "إضافة دفعة صادرة لمورد"}
              {activeTab === "transfer" && "إضافة تحويل بين الحسابات"}
            </CardTitle>
            <CardDescription>
              {activeTab === "income" && "إضافة إيراد جديد إلى النظام المالي"}
              {activeTab === "expense" && "إضافة مصروف جديد إلى النظام المالي"}
              {activeTab === "payment_received" && "تسجيل دفعة مستلمة من عميل"}
              {activeTab === "payment_made" && "تسجيل دفعة مدفوعة لمورد"}
              {activeTab === "transfer" && "تحويل الأموال بين الحسابات المختلفة"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionDate">التاريخ *</Label>
                  <Input
                    id="transactionDate"
                    type="date"
                    value={transactionData.transactionDate?.toString().split('T')[0]}
                    onChange={(e) => handleInputChange("transactionDate", e.target.value)}
                    className="rounded-md"
                  />
                </div>
                
                {activeTab === "payment_received" && (
                  <div className="space-y-2">
                    <Label htmlFor="entityId">العميل *</Label>
                    <Select 
                      value={transactionData.entityId?.toString()} 
                      onValueChange={(value) => handleEntityChange(value, EntityType.CUSTOMER)}
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
                
                {activeTab === "payment_made" && (
                  <div className="space-y-2">
                    <Label htmlFor="entityId">المورد *</Label>
                    <Select 
                      value={transactionData.entityId?.toString()} 
                      onValueChange={(value) => handleEntityChange(value, EntityType.SUPPLIER)}
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
                
                {activeTab !== "transfer" && (
                  <div className="space-y-2">
                    <Label htmlFor="accountId">الحساب *</Label>
                    <Select 
                      value={transactionData.accountId?.toString()} 
                      onValueChange={(value) => handleInputChange("accountId", parseInt(value))}
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
                )}
                
                {activeTab === "transfer" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fromAccountId">من حساب *</Label>
                      <Select 
                        value={transactionData.accountId?.toString()} 
                        onValueChange={(value) => handleInputChange("accountId", parseInt(value))}
                      >
                        <SelectTrigger className="rounded-md">
                          <SelectValue placeholder="اختر الحساب المصدر" />
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="toAccountId">إلى حساب *</Label>
                      <Select 
                        value={transactionData.entityId?.toString()} 
                        onValueChange={(value) => handleInputChange("entityId", parseInt(value))}
                      >
                        <SelectTrigger className="rounded-md">
                          <SelectValue placeholder="اختر الحساب الهدف" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockAccounts
                            .filter(account => account.accountId !== transactionData.accountId)
                            .map((account) => (
                              <SelectItem key={account.accountId} value={account.accountId.toString()}>
                                {account.name} ({account.balance.toLocaleString()} ل.س)
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                
                {(activeTab === "payment_received" || activeTab === "payment_made") && (
                  <div className="space-y-2">
                    <Label htmlFor="referenceId">المرجع</Label>
                    <Select 
                      value={transactionData.referenceId?.toString()} 
                      onValueChange={(value) => handleReferenceChange(
                        value, 
                        activeTab === "payment_received" ? ReferenceType.INVOICE : ReferenceType.PURCHASE_ORDER
                      )}
                    >
                      <SelectTrigger className="rounded-md">
                        <SelectValue placeholder={activeTab === "payment_received" ? "اختر الفاتورة" : "اختر أمر الشراء"} />
                      </SelectTrigger>
                      <SelectContent>
                        {activeTab === "payment_received" ? (
                          mockInvoices
                            .filter(invoice => invoice.customer === transactionData.entityName)
                            .map((invoice) => (
                              <SelectItem key={invoice.id} value={invoice.id.toString()}>
                                {invoice.number} ({invoice.amount.toLocaleString()} ل.س)
                              </SelectItem>
                            ))
                        ) : (
                          mockPurchaseOrders
                            .filter(order => order.supplier === transactionData.entityName)
                            .map((order) => (
                              <SelectItem key={order.id} value={order.id.toString()}>
                                {order.number} ({order.amount.toLocaleString()} ل.س)
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">المبلغ *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={transactionData.amount}
                    onChange={(e) => handleInputChange("amount", parseFloat(e.target.value))}
                    placeholder="0.00"
                    className="rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">طريقة الدفع *</Label>
                  <Select 
                    value={transactionData.paymentMethod} 
                    onValueChange={(value) => handleInputChange("paymentMethod", value)}
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
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea
                    id="description"
                    value={transactionData.description || ""}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="أدخل وصفاً للحركة المالية"
                    className="rounded-md"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={transactionData.notes || ""}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="أدخل ملاحظات إضافية"
                    className="rounded-md"
                  />
                </div>
              </div>
            </div>
            
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
            <Button 
              className="rounded-md"
              onClick={handleSaveTransaction}
              disabled={isSaving}
            >
              <Save className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> حفظ الحركة المالية
              {isSaving && (
                <div className="ml-2 rtl:mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              )}
            </Button>
          </CardFooter>
        </Card>
      </Tabs>
    </div>
  );
}