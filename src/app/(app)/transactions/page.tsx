
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/date-range-picker";
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Eye, 
  Edit, 
  Trash2, 
  FileText, 
  CreditCard, 
  Banknote, 
  BarChart4, 
  Calendar, 
  RefreshCw
} from "lucide-react";
import { 
  Transaction, 
  TransactionType, 
  TransactionStatus, 
  PaymentMethod, 
  EntityType, 
  ReferenceType 
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
  },
  {
    transactionId: 4,
    transactionNumber: "TRX-2024-004",
    transactionDate: "2024-07-12T14:30:00Z",
    transactionType: TransactionType.INCOME,
    amount: 7500,
    description: "إيرادات متنوعة",
    paymentMethod: PaymentMethod.CASH,
    accountId: 2,
    accountName: "الصندوق النقدي",
    entityType: EntityType.OTHER,
    entityId: 0,
    entityName: "إيرادات متنوعة",
    status: TransactionStatus.COMPLETED,
    companyId: 1,
    createdAt: "2024-07-12T14:30:00Z",
    updatedAt: "2024-07-12T14:30:00Z",
    createdBy: 1,
    isReconciled: false
  },
  {
    transactionId: 5,
    transactionNumber: "TRX-2024-005",
    transactionDate: "2024-07-11T16:20:00Z",
    transactionType: TransactionType.TRANSFER,
    amount: 50000,
    description: "تحويل من الصندوق النقدي إلى الحساب البنكي",
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    accountId: 1,
    accountName: "الحساب البنكي الرئيسي",
    entityType: EntityType.COMPANY,
    entityId: 1,
    entityName: "الشركة",
    notes: "إيداع نقدي في البنك",
    status: TransactionStatus.COMPLETED,
    companyId: 1,
    createdAt: "2024-07-11T16:20:00Z",
    updatedAt: "2024-07-11T16:20:00Z",
    createdBy: 1,
    isReconciled: true,
    reconciledDate: "2024-07-16T14:20:00Z",
    reconciledBy: 1
  },
  {
    transactionId: 6,
    transactionNumber: "TRX-2024-006",
    transactionDate: "2024-07-10T13:10:00Z",
    transactionType: TransactionType.PAYMENT_RECEIVED,
    amount: 15000,
    description: "دفعة من فاتورة المبيعات #INV-2024-098",
    referenceNumber: "INV-2024-098",
    referenceType: ReferenceType.INVOICE,
    referenceId: 98,
    paymentMethod: PaymentMethod.CASH,
    accountId: 2,
    accountName: "الصندوق النقدي",
    entityType: EntityType.CUSTOMER,
    entityId: 2,
    entityName: "مؤسسة النور للتجارة",
    status: TransactionStatus.COMPLETED,
    companyId: 1,
    createdAt: "2024-07-10T13:10:00Z",
    updatedAt: "2024-07-10T13:10:00Z",
    createdBy: 1,
    isReconciled: false
  },
  {
    transactionId: 7,
    transactionNumber: "TRX-2024-007",
    transactionDate: "2024-07-09T10:00:00Z",
    transactionType: TransactionType.EXPENSE,
    amount: 3500,
    description: "مصاريف كهرباء",
    paymentMethod: PaymentMethod.ONLINE_PAYMENT,
    accountId: 1,
    accountName: "الحساب البنكي الرئيسي",
    entityType: EntityType.OTHER,
    entityId: 0,
    entityName: "مرافق",
    notes: "فاتورة كهرباء شهر يونيو 2024",
    status: TransactionStatus.COMPLETED,
    companyId: 1,
    createdAt: "2024-07-09T10:00:00Z",
    updatedAt: "2024-07-09T10:00:00Z",
    createdBy: 1,
    isReconciled: true,
    reconciledDate: "2024-07-16T14:20:00Z",
    reconciledBy: 1
  },
  {
    transactionId: 8,
    transactionNumber: "TRX-2024-008",
    transactionDate: "2024-07-08T15:45:00Z",
    transactionType: TransactionType.REFUND,
    amount: 2000,
    description: "استرداد مبلغ من المورد",
    referenceNumber: "PO-2024-002",
    referenceType: ReferenceType.PURCHASE_ORDER,
    referenceId: 2,
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    accountId: 1,
    accountName: "الحساب البنكي الرئيسي",
    entityType: EntityType.SUPPLIER,
    entityId: 2,
    entityName: "الشركة العالمية للتوريدات",
    notes: "استرداد مبلغ لبضاعة معيبة",
    status: TransactionStatus.COMPLETED,
    companyId: 1,
    createdAt: "2024-07-08T15:45:00Z",
    updatedAt: "2024-07-08T15:45:00Z",
    createdBy: 1,
    isReconciled: true,
    reconciledDate: "2024-07-16T14:20:00Z",
    reconciledBy: 1
  }
];

// بيانات وهمية للحسابات المالية
const mockAccounts = [
  { accountId: 1, name: "الحساب البنكي الرئيسي", balance: 350000 },
  { accountId: 2, name: "الصندوق النقدي", balance: 75000 },
  { accountId: 3, name: "حساب بطاقة الائتمان", balance: -15000 }
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

// ترجمة حالات الحركات المالية
const transactionStatusLabels: Record<TransactionStatus, string> = {
  [TransactionStatus.PENDING]: "قيد الانتظار",
  [TransactionStatus.COMPLETED]: "مكتملة",
  [TransactionStatus.FAILED]: "فاشلة",
  [TransactionStatus.CANCELLED]: "ملغاة",
  [TransactionStatus.RECONCILED]: "مطابقة"
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

export default function TransactionsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransactionType, setSelectedTransactionType] = useState<string>("all");
  const [selectedAccount, setSelectedAccount] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // إجمالي الإيرادات
  const totalIncome = mockTransactions
    .filter(t => t.transactionType === TransactionType.INCOME || t.transactionType === TransactionType.PAYMENT_RECEIVED)
    .reduce((sum, t) => sum + t.amount, 0);
  
  // إجمالي المصروفات
  const totalExpenses = mockTransactions
    .filter(t => t.transactionType === TransactionType.EXPENSE || t.transactionType === TransactionType.PAYMENT_MADE)
    .reduce((sum, t) => sum + t.amount, 0);
  
  // الرصيد الإجمالي
  const totalBalance = mockAccounts.reduce((sum, account) => sum + account.balance, 0);

  // تصفية الحركات المالية
  const filteredTransactions = mockTransactions.filter(transaction => {
    // تصفية حسب البحث
    const matchesSearch = searchTerm === "" || 
      transaction.transactionNumber.includes(searchTerm) || 
      transaction.description?.includes(searchTerm) || 
      transaction.entityName?.includes(searchTerm) ||
      transaction.referenceNumber?.includes(searchTerm);
    
    // تصفية حسب نوع الحركة
    const matchesType = selectedTransactionType === "all" || transaction.transactionType === selectedTransactionType;
    
    // تصفية حسب الحساب
    const matchesAccount = selectedAccount === "all" || transaction.accountId === parseInt(selectedAccount);
    
    // تصفية حسب الحالة
    const matchesStatus = selectedStatus === "all" || transaction.status === selectedStatus;
    
    // تصفية حسب التاريخ
    const transactionDate = new Date(transaction.transactionDate);
    const matchesDateRange = 
      (!selectedDateRange.from || transactionDate >= selectedDateRange.from) && 
      (!selectedDateRange.to || transactionDate <= selectedDateRange.to);
    
    // تصفية حسب التبويب النشط
    let matchesTab = true;
    if (activeTab === "income") {
      matchesTab = transaction.transactionType === TransactionType.INCOME || 
                  transaction.transactionType === TransactionType.PAYMENT_RECEIVED;
    } else if (activeTab === "expense") {
      matchesTab = transaction.transactionType === TransactionType.EXPENSE || 
                  transaction.transactionType === TransactionType.PAYMENT_MADE;
    } else if (activeTab === "transfer") {
      matchesTab = transaction.transactionType === TransactionType.TRANSFER;
    }
    
    return matchesSearch && matchesType && matchesAccount && matchesStatus && matchesDateRange && matchesTab;
  });

  // إضافة حركة مالية جديدة
  const handleAddTransaction = () => {
    router.push("/transactions/new");
  };

  // تصدير الحركات المالية
  const handleExportTransactions = () => {
    alert("تم تصدير الحركات المالية بنجاح");
  };

  // عرض تفاصيل الحركة المالية
  const handleViewTransaction = (transactionId: number) => {
    router.push(`/transactions/${transactionId}`);
  };

  // تعديل الحركة المالية
  const handleEditTransaction = (transactionId: number) => {
    router.push(`/transactions/${transactionId}/edit`);
  };

  // حذف الحركة المالية
  const handleDeleteTransaction = (transactionId: number) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف هذه الحركة المالية؟")) {
      alert("تم حذف الحركة المالية بنجاح");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">الحركات المالية</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={() => router.push("/transactions/reports")}
          >
            <BarChart4 className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> التقارير المالية
          </Button>
          <Button 
            className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={handleAddTransaction}
          >
            <PlusCircle className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إضافة حركة مالية
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-green-50 dark:bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</h3>
                <p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{totalIncome.toLocaleString()} ل.س</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">إجمالي المصروفات</h3>
                <p className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">{totalExpenses.toLocaleString()} ل.س</p>
              </div>
              <ArrowDownLeft className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">الرصيد الإجمالي</h3>
                <p className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{totalBalance.toLocaleString()} ل.س</p>
              </div>
              <Banknote className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            الحركات المالية
          </CardTitle>
          <CardDescription>
            إدارة ومراقبة جميع الحركات المالية في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="all">الكل</TabsTrigger>
              <TabsTrigger value="income">الإيرادات</TabsTrigger>
              <TabsTrigger value="expense">المصروفات</TabsTrigger>
              <TabsTrigger value="transfer">التحويلات</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  className="pl-10 rounded-md w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={selectedTransactionType} onValueChange={setSelectedTransactionType}>
                  <SelectTrigger className="rounded-md w-full sm:w-40">
                    <SelectValue placeholder="نوع الحركة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    {Object.entries(transactionTypeLabels).map(([type, label]) => (
                      <SelectItem key={type} value={type}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="rounded-md w-full sm:w-40">
                    <SelectValue placeholder="الحساب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحسابات</SelectItem>
                    {mockAccounts.map((account) => (
                      <SelectItem key={account.accountId} value={account.accountId.toString()}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="rounded-md w-full sm:w-40">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    {Object.entries(transactionStatusLabels).map(([status, label]) => (
                      <SelectItem key={status} value={status}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <DateRangePicker
                value={selectedDateRange}
                onValueChange={setSelectedDateRange}
                align="end"
                locale="ar"
                placeholder="تحديد الفترة"
                className="w-full sm:w-auto"
              />
              
              <Button 
                variant="outline" 
                className="rounded-md w-full sm:w-auto"
                onClick={handleExportTransactions}
              >
                <Download className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تصدير
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>رقم الحركة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>النوع</TableHead>
                  <TableHead>الوصف</TableHead>
                  <TableHead>الجهة</TableHead>
                  <TableHead>الحساب</TableHead>
                  <TableHead>المبلغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.transactionId}>
                    <TableCell className="font-medium">{transaction.transactionNumber}</TableCell>
                    <TableCell>{new Date(transaction.transactionDate).toLocaleDateString('ar-SA')}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          transaction.transactionType === TransactionType.INCOME || 
                          transaction.transactionType === TransactionType.PAYMENT_RECEIVED
                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                            : transaction.transactionType === TransactionType.EXPENSE || 
                              transaction.transactionType === TransactionType.PAYMENT_MADE
                              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                              : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                        }
                      >
                        {transactionTypeLabels[transaction.transactionType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{transaction.description}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-2">
                          {entityTypeLabels[transaction.entityType]}
                        </Badge>
                        <span>{transaction.entityName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.accountName}</TableCell>
                    <TableCell className={
                      transaction.transactionType === TransactionType.INCOME || 
                      transaction.transactionType === TransactionType.PAYMENT_RECEIVED ||
                      transaction.transactionType === TransactionType.REFUND
                        ? "text-green-600 dark:text-green-400 font-medium"
                        : transaction.transactionType === TransactionType.EXPENSE || 
                          transaction.transactionType === TransactionType.PAYMENT_MADE
                          ? "text-red-600 dark:text-red-400 font-medium"
                          : ""
                    }>
                      {transaction.amount.toLocaleString()} ل.س
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        transaction.status === TransactionStatus.COMPLETED || 
                        transaction.status === TransactionStatus.RECONCILED
                          ? "success"
                          : transaction.status === TransactionStatus.PENDING
                            ? "outline"
                            : "destructive"
                      }>
                        {transactionStatusLabels[transaction.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-md"
                        onClick={() => handleViewTransaction(transaction.transactionId)}
                      >
                        <Eye className="h-4 w-4 ml-1 rtl:mr-1 icon-directional" /> عرض
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-md"
                        onClick={() => handleEditTransaction(transaction.transactionId)}
                      >
                        <Edit className="h-4 w-4 ml-1 rtl:mr-1 icon-directional" /> تعديل
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-md text-destructive hover:text-destructive"
                        onClick={() => handleDeleteTransaction(transaction.transactionId)}
                      >
                        <Trash2 className="h-4 w-4 ml-1 rtl:mr-1 icon-directional" /> حذف
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      لا توجد حركات مالية لعرضها. قم بإضافة حركة مالية جديدة.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockAccounts.map((account) => (
              <Card key={account.accountId} className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium">{account.name}</h3>
                      <p className={`text-xl font-bold mt-2 ${account.balance >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                        {account.balance.toLocaleString()} ل.س
                      </p>
                    </div>
                    {account.accountId === 1 ? (
                      <Banknote className="h-10 w-10 text-primary" />
                    ) : account.accountId === 2 ? (
                      <Banknote className="h-10 w-10 text-primary" />
                    ) : (
                      <CreditCard className="h-10 w-10 text-primary" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground mt-6">
            يساعدك هذا القسم على إدارة ومراقبة جميع الحركات المالية في النظام، بما في ذلك الإيرادات والمصروفات والتحويلات.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
