
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter as FilterIcon, Calendar as CalendarIcon, Download } from "lucide-react"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar'; 
import { format, isValid } from 'date-fns';
import { arSA } from 'date-fns/locale'; 
import { DateRange } from 'react-day-picker';

interface Transaction {
  id: string;
  date: string; 
  type: "بيع" | "شراء" | "مصروف" | "إيراد"; // تم تعديل الأنواع لتكون عربية
  description: string;
  amount: number;
  reference?: string;
}

// بيانات وهمية محدثة بالعربية
const initialTransactionsData: Transaction[] = [
  { id: "txn1", date: new Date("2024-07-15T10:30:00Z").toISOString(), type: "بيع", description: "بيع المنتج أ (فاتورة #INV001)", amount: 109.90, reference: "INV001" },
  { id: "txn2", date: new Date("2024-07-14T14:00:00Z").toISOString(), type: "شراء", description: "تجديد المخزون (طلب شراء #PO025)", amount: -550.00, reference: "PO025" },
  { id: "txn3", date: new Date("2024-07-14T09:15:00Z").toISOString(), type: "مصروف", description: "لوازم مكتبية وقرطاسية", amount: -45.50 },
  { id: "txn4", date: new Date("2024-07-13T16:45:00Z").toISOString(), type: "بيع", description: "بيع المنتج ب والمنتج ج (فاتورة #INV002)", amount: 75.20, reference: "INV002" },
  { id: "txn5", date: new Date("2024-07-12T11:00:00Z").toISOString(), type: "إيراد", description: "خدمات استشارية مقدمة (مرجع #CS001)", amount: 1200.00, reference: "CS001" },
  { id: "txn6", date: new Date("2024-06-20T11:00:00Z").toISOString(), type: "مصروف", description: "دفعة إيجار شهرية", amount: -800.00, reference: "RENT-JUN24" },
];


export default function TransactionsLogPage() {
  const [transactions] = useState<Transaction[]>(initialTransactionsData); 
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  const filteredTransactions = useMemo(() => {
    let data = [...transactions];

    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      data = data.filter(item =>
        item.description.toLowerCase().includes(lowercasedFilter) ||
        (item.reference && item.reference.toLowerCase().includes(lowercasedFilter)) ||
        String(item.amount).includes(lowercasedFilter)
      );
    }

    if (filterType !== "all") {
      data = data.filter(item => item.type === filterType);
    }

    if (dateRange?.from && isValid(dateRange.from)) {
        data = data.filter(item => new Date(item.date) >= dateRange.from!);
    }
    if (dateRange?.to && isValid(dateRange.to)) {
      const inclusiveToDate = new Date(dateRange.to);
      inclusiveToDate.setHours(23, 59, 59, 999); 
      data = data.filter(item => new Date(item.date) <= inclusiveToDate);
    }
    
    return data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchTerm, filterType, dateRange, transactions]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setDateRange(undefined);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "PPPp", { locale: arSA }); 
  };


  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">سجل الحركات المالية</h1>
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>جميع الحركات المالية</CardTitle>
          <CardDescription>عرض وبحث وتصفية جميع الحركات المسجلة. تم العثور على {filteredTransactions.length} حركة.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6 items-center">
            <div className="relative flex-grow min-w-[200px]">
              <Search className="absolute left-2.5 rtl:right-2.5 rtl:left-auto top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search" placeholder="ابحث في الوصف، المرجع، المبلغ..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 rtl:pr-8 rtl:pl-2 w-full rounded-md"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType} dir="rtl">
              <SelectTrigger className="w-full sm:w-auto min-w-[160px] rounded-md">
                <SelectValue placeholder="تصفية حسب النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="بيع">بيع</SelectItem>
                <SelectItem value="شراء">شراء</SelectItem>
                <SelectItem value="مصروف">مصروف</SelectItem>
                <SelectItem value="إيراد">إيراد</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto min-w-[240px] justify-start text-left rtl:text-right font-normal rounded-md">
                  <CalendarIcon className="ml-2 rtl:mr-2 icon-directional h-4 w-4" />
                  {dateRange?.from ? 
                    (dateRange.to ? `${format(dateRange.from, "PPP", {locale: arSA})} - ${format(dateRange.to, "PPP", {locale: arSA})}` : format(dateRange.from, "PPP", {locale: arSA})) 
                    : <span>اختر نطاق التاريخ</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range" selected={dateRange} onSelect={setDateRange}
                  initialFocus numberOfMonths={2}
                  locale={arSA} dir="rtl"
                />
              </PopoverContent>
            </Popover>
            {(searchTerm || filterType !== "all" || dateRange?.from || dateRange?.to) && (
                <Button variant="ghost" onClick={clearFilters} className="rounded-md">مسح الفلاتر</Button>
            )}
            <Button variant="outline" className="w-full sm:w-auto rounded-md mr-auto rtl:ml-auto rtl:mr-0"> 
              <Download className="ml-2 rtl:mr-2 icon-directional h-4 w-4" /> تصدير CSV
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>قائمة زمنية بجميع الحركات.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">التاريخ</TableHead>
                  <TableHead className="min-w-[100px]">النوع</TableHead>
                  <TableHead className="min-w-[250px]">الوصف</TableHead>
                  <TableHead className="min-w-[120px]">المرجع</TableHead>
                  <TableHead className="text-right rtl:text-left min-w-[100px]">المبلغ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        transaction.type === "بيع" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        transaction.type === "إيراد" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                        transaction.type === "شراء" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                        transaction.type === "مصروف" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}>
                        {transaction.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>{transaction.reference || "لا يوجد"}</TableCell>
                    <TableCell className={`text-right rtl:text-left font-semibold ${transaction.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {transaction.amount >= 0 ? '+' : '-'}{Math.abs(transaction.amount).toFixed(2)} ر.س
                    </TableCell>
                  </TableRow>
                ))}
                 {filteredTransactions.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            لم يتم العثور على حركات تطابق معاييرك.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
