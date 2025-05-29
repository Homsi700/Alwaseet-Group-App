
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, PlusCircle, Filter, FileText, Search, Loader2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { useCustomers, useCreateCustomer, useDeleteCustomer, Customer } from '@/hooks/use-customers';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { useToast } from '@/hooks/use-toast';
import { ExportData } from '@/components/export/export-data';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// إنشاء عميل React Query
const queryClient = new QueryClient();

function CustomersContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  // استخدام hooks للعملاء
  const { data: customers = [], isLoading, isError, error } = useCustomers(searchTerm);
  const createCustomerMutation = useCreateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();
  
  // إضافة عميل جديد
  const handleAddCustomer = async (customerData: Customer) => {
    try {
      await createCustomerMutation.mutateAsync(customerData);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('خطأ في إضافة العميل:', error);
    }
  };
  
  // حذف عميل
  const handleDeleteCustomer = async () => {
    if (!selectedCustomerId) return;
    
    try {
      await deleteCustomerMutation.mutateAsync(selectedCustomerId);
      setIsDeleteDialogOpen(false);
      setSelectedCustomerId(null);
    } catch (error) {
      console.error('خطأ في حذف العميل:', error);
    }
  };
  
  // حساب رصيد العميل (من خلال المبيعات)
  const calculateCustomerBalance = (customer: any) => {
    // في الواقع، يجب حساب الرصيد من خلال المبيعات والمدفوعات
    // هنا نستخدم قيمة عشوائية للتجربة
    return Math.random() * 2000 - 1000;
  };
  
  // تصدير البيانات
  const exportData = customers.map((customer: any) => ({
    'اسم العميل': customer.name,
    'رقم الهاتف': customer.phone || '-',
    'البريد الإلكتروني': customer.email || '-',
    'العنوان': customer.address || '-',
    'الرقم الضريبي': customer.vatNumber || '-',
  }));
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">إدارة العملاء</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
              <PlusCircle className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إضافة عميل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>إضافة عميل جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات العميل الجديد. اضغط على حفظ عند الانتهاء.
              </DialogDescription>
            </DialogHeader>
            <CustomerForm
              onSubmit={handleAddCustomer}
              isSubmitting={createCustomerMutation.isPending}
              mode="create"
            />
          </DialogContent>
        </Dialog>
      </div>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على العملاء
          </CardTitle>
          <CardDescription>
            إدارة قاعدة بيانات عملائك، تتبع سجل الشراء، وإدارة الاتصالات، وتقسيم العملاء.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في العملاء..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-3 pr-10 w-full"
                />
              </div>
              <Button variant="outline" className="rounded-md">
                <Filter className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تصفية
              </Button>
            </div>
            <ExportData
              title="قائمة العملاء"
              data={exportData}
              columns={[
                { header: 'اسم العميل', accessor: 'اسم العميل' },
                { header: 'رقم الهاتف', accessor: 'رقم الهاتف' },
                { header: 'البريد الإلكتروني', accessor: 'البريد الإلكتروني' },
                { header: 'العنوان', accessor: 'العنوان' },
                { header: 'الرقم الضريبي', accessor: 'الرقم الضريبي' },
              ]}
              fileName="customers-list"
            />
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم العميل</TableHead>
                  <TableHead>رقم الهاتف</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead className="text-right rtl:text-left">الرصيد (ر.س)</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary ml-2" />
                        <span>جاري تحميل البيانات...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex justify-center items-center text-destructive">
                        <AlertCircle className="h-6 w-6 ml-2" />
                        <span>حدث خطأ أثناء تحميل البيانات: {error?.message}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      لا يوجد عملاء لعرضهم. قم بإضافة عميل جديد.
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((customer: any) => {
                    const balance = calculateCustomerBalance(customer);
                    return (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone || "-"}</TableCell>
                        <TableCell>{customer.email || "-"}</TableCell>
                        <TableCell className={`text-right rtl:text-left font-semibold ${balance > 0 ? "text-green-600 dark:text-green-400" : balance < 0 ? "text-red-600 dark:text-red-400" : ""}`}>
                          {balance.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-md"
                            onClick={() => window.location.href = `/customers/${customer.id}`}
                          >
                            عرض
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-md"
                            onClick={() => window.location.href = `/customers/${customer.id}?edit=true`}
                          >
                            تعديل
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-md text-destructive hover:text-destructive/90"
                            onClick={() => {
                              setSelectedCustomerId(customer.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            حذف
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            يتيح لك هذا القسم إدارة جميع جوانب علاقاتك مع العملاء، بما في ذلك معلومات الاتصال، سجل المعاملات،
            وإدارة الأرصدة والديون.
          </p>
        </CardContent>
      </Card>
      
      {/* نافذة تأكيد الحذف */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من رغبتك في حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.
              <br />
              <span className="text-destructive font-medium mt-2 block">
                ملاحظة: لا يمكن حذف العميل إذا كان مرتبطاً بمبيعات.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteCustomer}
              disabled={deleteCustomerMutation.isPending}
            >
              {deleteCustomerMutation.isPending && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CustomersPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <CustomersContent />
    </QueryClientProvider>
  );
}
