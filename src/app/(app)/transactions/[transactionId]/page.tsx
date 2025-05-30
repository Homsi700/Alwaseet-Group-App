"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Edit, Trash2, Printer, Download, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
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

// ترجمة أنواع المراجع
const referenceTypeLabels: Record<ReferenceType, string> = {
  [ReferenceType.INVOICE]: "فاتورة مبيعات",
  [ReferenceType.PURCHASE_ORDER]: "أمر شراء",
  [ReferenceType.SALES_ORDER]: "أمر بيع",
  [ReferenceType.EXPENSE_CLAIM]: "مطالبة مصروفات",
  [ReferenceType.BILL]: "فاتورة مشتريات",
  [ReferenceType.MANUAL]: "يدوي"
};

export default function TransactionDetailsPage({ params }: { params: { transactionId: string } }) {
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReconcileDialogOpen, setIsReconcileDialogOpen] = useState(false);

  useEffect(() => {
    // محاكاة جلب بيانات الحركة المالية
    const transactionId = parseInt(params.transactionId);
    const foundTransaction = mockTransactions.find(t => t.transactionId === transactionId);
    
    if (foundTransaction) {
      setTransaction(foundTransaction);
    }
    
    setIsLoading(false);
  }, [params.transactionId]);

  // حذف الحركة المالية
  const handleDeleteTransaction = () => {
    alert("تم حذف الحركة المالية بنجاح");
    setIsDeleteDialogOpen(false);
    router.push("/transactions");
  };

  // مطابقة الحركة المالية
  const handleReconcileTransaction = () => {
    alert("تم مطابقة الحركة المالية بنجاح");
    setIsReconcileDialogOpen(false);
    
    if (transaction) {
      setTransaction({
        ...transaction,
        status: TransactionStatus.RECONCILED,
        isReconciled: true,
        reconciledDate: new Date().toISOString(),
        reconciledBy: 1
      });
    }
  };

  // طباعة الحركة المالية
  const handlePrintTransaction = () => {
    alert("جاري طباعة الحركة المالية");
  };

  // تنزيل الحركة المالية
  const handleDownloadTransaction = () => {
    alert("جاري تنزيل الحركة المالية");
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
            <h1 className="text-3xl font-bold text-foreground">تفاصيل الحركة المالية</h1>
          </div>
          <p className="text-muted-foreground mt-1">{transaction.transactionNumber}</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={handlePrintTransaction}
          >
            <Printer className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> طباعة
          </Button>
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={handleDownloadTransaction}
          >
            <Download className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> تنزيل
          </Button>
          <Button 
            variant="outline" 
            className="rounded-md"
            onClick={() => router.push(`/transactions/${transaction.transactionId}/edit`)}
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>معلومات الحركة المالية</span>
              <Badge 
                variant={
                  transaction.status === TransactionStatus.COMPLETED || 
                  transaction.status === TransactionStatus.RECONCILED
                    ? "success"
                    : transaction.status === TransactionStatus.PENDING
                      ? "outline"
                      : "destructive"
                }
                className="text-sm"
              >
                {transactionStatusLabels[transaction.status]}
              </Badge>
            </CardTitle>
            <CardDescription>
              تفاصيل الحركة المالية رقم {transaction.transactionNumber}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">نوع الحركة</h3>
                  <Badge 
                    variant="outline" 
                    className={
                      transaction.transactionType === TransactionType.INCOME || 
                      transaction.transactionType === TransactionType.PAYMENT_RECEIVED
                        ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 mt-1"
                        : transaction.transactionType === TransactionType.EXPENSE || 
                          transaction.transactionType === TransactionType.PAYMENT_MADE
                          ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 mt-1"
                          : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 mt-1"
                    }
                  >
                    {transactionTypeLabels[transaction.transactionType]}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">التاريخ</h3>
                  <p className="mt-1">{new Date(transaction.transactionDate).toLocaleDateString('ar-SA')}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">المبلغ</h3>
                  <p className={`text-xl font-bold mt-1 ${
                    transaction.transactionType === TransactionType.INCOME || 
                    transaction.transactionType === TransactionType.PAYMENT_RECEIVED ||
                    transaction.transactionType === TransactionType.REFUND
                      ? "text-green-600 dark:text-green-400"
                      : transaction.transactionType === TransactionType.EXPENSE || 
                        transaction.transactionType === TransactionType.PAYMENT_MADE
                        ? "text-red-600 dark:text-red-400"
                        : ""
                  }`}>
                    {transaction.amount.toLocaleString()} ل.س
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">طريقة الدفع</h3>
                  <p className="mt-1">{paymentMethodLabels[transaction.paymentMethod]}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">الحساب</h3>
                  <p className="mt-1">{transaction.accountName}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">الجهة</h3>
                  <div className="flex items-center mt-1">
                    <Badge variant="secondary" className="mr-2">
                      {entityTypeLabels[transaction.entityType]}
                    </Badge>
                    <span>{transaction.entityName}</span>
                  </div>
                </div>
                
                {transaction.referenceNumber && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">المرجع</h3>
                    <div className="flex items-center mt-1">
                      <Badge variant="outline" className="mr-2">
                        {transaction.referenceType && referenceTypeLabels[transaction.referenceType]}
                      </Badge>
                      <span>{transaction.referenceNumber}</span>
                    </div>
                  </div>
                )}
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">الوصف</h3>
                  <p className="mt-1">{transaction.description || "لا يوجد وصف"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">ملاحظات</h3>
                  <p className="mt-1">{transaction.notes || "لا توجد ملاحظات"}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">المطابقة</h3>
                  <div className="flex items-center mt-1">
                    {transaction.isReconciled ? (
                      <div className="flex items-center text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        <span>تمت المطابقة بتاريخ {new Date(transaction.reconciledDate || "").toLocaleDateString('ar-SA')}</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <span className="text-muted-foreground">لم تتم المطابقة بعد</span>
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-primary mr-2"
                          onClick={() => setIsReconcileDialogOpen(true)}
                        >
                          مطابقة الآن
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">المرفقات</h3>
              <div className="bg-muted p-4 rounded-md min-h-[100px] flex items-center justify-center">
                <p className="text-muted-foreground">لا توجد مرفقات</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>معلومات النظام</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">تاريخ الإنشاء</h3>
              <p className="mt-1">{new Date(transaction.createdAt || "").toLocaleDateString('ar-SA')}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">تاريخ التحديث</h3>
              <p className="mt-1">{new Date(transaction.updatedAt || "").toLocaleDateString('ar-SA')}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">تم الإنشاء بواسطة</h3>
              <p className="mt-1">المستخدم #{transaction.createdBy}</p>
            </div>
            
            <Separator className="my-2" />
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">الحركات المالية ذات الصلة</h3>
              <div className="mt-2">
                <p className="text-muted-foreground text-sm">لا توجد حركات مالية ذات صلة</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-2">
            <Button 
              variant="outline" 
              className="w-full rounded-md"
              onClick={() => router.push(`/transactions/${transaction.transactionId}/edit`)}
            >
              <Edit className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تعديل الحركة المالية
            </Button>
            
            {!transaction.isReconciled && (
              <Button 
                variant="outline" 
                className="w-full rounded-md"
                onClick={() => setIsReconcileDialogOpen(true)}
              >
                <CheckCircle2 className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> مطابقة الحركة المالية
              </Button>
            )}
            
            <Button 
              variant="destructive" 
              className="w-full rounded-md"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> حذف الحركة المالية
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* نافذة تأكيد الحذف */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف هذه الحركة المالية؟ لا يمكن التراجع عن هذا الإجراء.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="font-medium">{transaction.transactionNumber}</p>
            <p className="text-sm text-muted-foreground">{transaction.description}</p>
            <p className="text-lg font-bold mt-2">{transaction.amount.toLocaleString()} ل.س</p>
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
              onClick={handleDeleteTransaction}
            >
              <Trash2 className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تأكيد الحذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* نافذة تأكيد المطابقة */}
      <Dialog open={isReconcileDialogOpen} onOpenChange={setIsReconcileDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>مطابقة الحركة المالية</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في مطابقة هذه الحركة المالية؟ سيتم تحديث حالة الحركة إلى "مطابقة".
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="font-medium">{transaction.transactionNumber}</p>
            <p className="text-sm text-muted-foreground">{transaction.description}</p>
            <p className="text-lg font-bold mt-2">{transaction.amount.toLocaleString()} ل.س</p>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              className="rounded-md"
              onClick={() => setIsReconcileDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button 
              variant="default" 
              className="rounded-md"
              onClick={handleReconcileTransaction}
            >
              <CheckCircle2 className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تأكيد المطابقة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}