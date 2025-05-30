"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, PlusCircle, Filter, FileText, Search, UserPlus, BadgeCheck, Banknote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// بيانات موظفين وهمية
const mockEmployees = [
  { id: "EMP001", name: "أحمد محمد", position: "مدير مبيعات", department: "المبيعات", joinDate: "2023-01-15", salary: 5000, status: "نشط" },
  { id: "EMP002", name: "فاطمة علي", position: "محاسب", department: "المالية", joinDate: "2023-03-10", salary: 4500, status: "نشط" },
  { id: "EMP003", name: "محمد خالد", position: "مندوب مبيعات", department: "المبيعات", joinDate: "2023-05-20", salary: 3500, status: "نشط" },
  { id: "EMP004", name: "نورة سعيد", position: "مدير موارد بشرية", department: "الموارد البشرية", joinDate: "2023-02-01", salary: 5500, status: "إجازة" },
  { id: "EMP005", name: "عبدالله عمر", position: "فني مخزن", department: "المستودعات", joinDate: "2023-04-05", salary: 3000, status: "نشط" },
];

// بيانات كشوف رواتب وهمية
const mockPayrolls = [
  { id: "PAY001", month: "يوليو 2024", totalSalaries: 21500, status: "مدفوع", paymentDate: "2024-07-30" },
  { id: "PAY002", month: "يونيو 2024", totalSalaries: 21500, status: "مدفوع", paymentDate: "2024-06-30" },
  { id: "PAY003", month: "مايو 2024", totalSalaries: 20000, status: "مدفوع", paymentDate: "2024-05-30" },
  { id: "PAY004", month: "أبريل 2024", totalSalaries: 20000, status: "مدفوع", paymentDate: "2024-04-30" },
];

// بيانات الأقسام
const departments = [
  "المبيعات",
  "المالية",
  "الموارد البشرية",
  "المستودعات",
  "خدمة العملاء",
  "تكنولوجيا المعلومات"
];

export default function EmployeesPage() {
  const [activeTab, setActiveTab] = useState("employees");
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    position: "",
    department: "",
    salary: "",
    joinDate: ""
  });
  const { toast } = useToast();

  // تصفية الموظفين
  const filteredEmployees = mockEmployees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || employee.status === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // إضافة موظف جديد
  const handleAddEmployee = () => {
    // في التطبيق الحقيقي، هنا سيتم إرسال البيانات إلى API
    toast({
      title: "تمت إضافة الموظف",
      description: `تمت إضافة ${newEmployee.name} بنجاح.`,
    });
    setIsAddEmployeeOpen(false);
    setNewEmployee({
      name: "",
      position: "",
      department: "",
      salary: "",
      joinDate: ""
    });
  };

  // تغيير قيمة في نموذج الموظف الجديد
  const handleEmployeeFormChange = (field: string, value: string) => {
    setNewEmployee(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-foreground">إدارة الموظفين</h1>
        <div className="flex gap-2">
          <Button className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => setIsAddEmployeeOpen(true)}>
            <UserPlus className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إضافة موظف جديد
          </Button>
        </div>
      </div>

      <Tabs defaultValue="employees" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full md:w-[400px] rounded-md">
          <TabsTrigger value="employees" className="rounded-sm">
            <Users className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> الموظفين
          </TabsTrigger>
          <TabsTrigger value="payroll" className="rounded-sm">
            <Banknote className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> كشوف الرواتب
          </TabsTrigger>
        </TabsList>

        {/* قسم الموظفين */}
        <TabsContent value="employees" className="mt-6">
          <Card className="shadow-lg rounded-lg border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
                قائمة الموظفين
              </CardTitle>
              <CardDescription>
                إدارة بيانات الموظفين، تتبع المعلومات الشخصية والوظيفية، وإدارة الإجازات والمستحقات.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 rtl:right-2.5 rtl:left-auto top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="ابحث عن موظف..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 rtl:pr-8 rtl:pl-2 rounded-md"
                  />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter} dir="rtl">
                  <SelectTrigger className="w-full md:w-[180px] rounded-md">
                    <SelectValue placeholder="القسم" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأقسام</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter} dir="rtl">
                  <SelectTrigger className="w-full md:w-[180px] rounded-md">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="نشط">نشط</SelectItem>
                    <SelectItem value="إجازة">إجازة</SelectItem>
                    <SelectItem value="معلق">معلق</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="rounded-md">
                  <FileText className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تصدير القائمة
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>المنصب</TableHead>
                      <TableHead>القسم</TableHead>
                      <TableHead>تاريخ التعيين</TableHead>
                      <TableHead className="text-right rtl:text-left">الراتب (ل.س)</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.position}</TableCell>
                        <TableCell>{employee.department}</TableCell>
                        <TableCell>{new Date(employee.joinDate).toLocaleDateString('ar-SA')}</TableCell>
                        <TableCell className="text-right rtl:text-left">{employee.salary.toLocaleString('ar-SA')}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            employee.status === "نشط" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                            employee.status === "إجازة" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}>
                            {employee.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="sm" className="rounded-md">عرض</Button>
                          <Button variant="ghost" size="sm" className="rounded-md">تعديل</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredEmployees.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          لا يوجد موظفين مطابقين لمعايير البحث.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* قسم كشوف الرواتب */}
        <TabsContent value="payroll" className="mt-6">
          <Card className="shadow-lg rounded-lg border-border">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Banknote className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
                كشوف الرواتب
              </CardTitle>
              <CardDescription>
                إدارة كشوف الرواتب الشهرية، حساب المستحقات والخصومات، وتوليد تقارير الرواتب.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-2">
                <Button className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
                  <PlusCircle className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إنشاء كشف رواتب جديد
                </Button>
                <Button variant="outline" className="rounded-md">
                  <FileText className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تصدير القائمة
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الشهر</TableHead>
                      <TableHead className="text-right rtl:text-left">إجمالي الرواتب (ل.س)</TableHead>
                      <TableHead>حالة الدفع</TableHead>
                      <TableHead>تاريخ الدفع</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPayrolls.map((payroll) => (
                      <TableRow key={payroll.id}>
                        <TableCell className="font-medium">{payroll.month}</TableCell>
                        <TableCell className="text-right rtl:text-left">{payroll.totalSalaries.toLocaleString('ar-SA')}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            payroll.status === "مدفوع" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                            payroll.status === "معلق" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          }`}>
                            {payroll.status}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(payroll.paymentDate).toLocaleDateString('ar-SA')}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="sm" className="rounded-md">عرض</Button>
                          <Button variant="ghost" size="sm" className="rounded-md">طباعة</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* نافذة إضافة موظف جديد */}
      <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <UserPlus className="ml-2 rtl:mr-2 h-5 w-5 icon-directional" /> إضافة موظف جديد
            </DialogTitle>
            <DialogDescription>
              أدخل بيانات الموظف الجديد. جميع الحقول المميزة بعلامة * مطلوبة.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-left rtl:text-right">الاسم الكامل *</Label>
              <Input 
                id="name" 
                value={newEmployee.name} 
                onChange={(e) => handleEmployeeFormChange('name', e.target.value)} 
                className="col-span-3 rounded-md" 
                placeholder="أدخل الاسم الكامل للموظف" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="position" className="text-left rtl:text-right">المنصب *</Label>
              <Input 
                id="position" 
                value={newEmployee.position} 
                onChange={(e) => handleEmployeeFormChange('position', e.target.value)} 
                className="col-span-3 rounded-md" 
                placeholder="المسمى الوظيفي" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-left rtl:text-right">القسم *</Label>
              <Select 
                value={newEmployee.department} 
                onValueChange={(value) => handleEmployeeFormChange('department', value)} 
                dir="rtl"
              >
                <SelectTrigger id="department" className="col-span-3 rounded-md">
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="salary" className="text-left rtl:text-right">الراتب (ل.س) *</Label>
              <Input 
                id="salary" 
                type="number" 
                value={newEmployee.salary} 
                onChange={(e) => handleEmployeeFormChange('salary', e.target.value)} 
                className="col-span-3 rounded-md" 
                placeholder="أدخل الراتب الشهري" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="joinDate" className="text-left rtl:text-right">تاريخ التعيين *</Label>
              <Input 
                id="joinDate" 
                type="date" 
                value={newEmployee.joinDate} 
                onChange={(e) => handleEmployeeFormChange('joinDate', e.target.value)} 
                className="col-span-3 rounded-md" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddEmployeeOpen(false)} className="rounded-md">إلغاء</Button>
            <Button 
              onClick={handleAddEmployee} 
              className="rounded-md bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!newEmployee.name || !newEmployee.position || !newEmployee.department || !newEmployee.salary || !newEmployee.joinDate}
            >
              <BadgeCheck className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> إضافة الموظف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}