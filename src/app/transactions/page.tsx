"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableCaption, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Filter as FilterIcon, Calendar as CalendarIcon, Download } from "lucide-react"; // Renamed Calendar to CalendarIcon
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar'; // Shadcn Calendar component
import { format, isValid } from 'date-fns';

interface Transaction {
  id: string;
  date: string; 
  type: "Sale" | "Purchase" | "Expense" | "Income";
  description: string;
  amount: number;
  reference?: string;
}

const initialTransactionsData: Transaction[] = [
  { id: "txn1", date: new Date("2024-07-15T10:30:00Z").toISOString(), type: "Sale", description: "Sale of Product A (Invoice #INV001)", amount: 109.90, reference: "INV001" },
  { id: "txn2", date: new Date("2024-07-14T14:00:00Z").toISOString(), type: "Purchase", description: "Stock replenishment (Order #PO025)", amount: -550.00, reference: "PO025" },
  { id: "txn3", date: new Date("2024-07-14T09:15:00Z").toISOString(), type: "Expense", description: "Office Supplies and Stationery", amount: -45.50 },
  { id: "txn4", date: new Date("2024-07-13T16:45:00Z").toISOString(), type: "Sale", description: "Sale of Product B & Product C (Invoice #INV002)", amount: 75.20, reference: "INV002" },
  { id: "txn5", date: new Date("2024-07-12T11:00:00Z").toISOString(), type: "Income", description: "Consulting Services Rendered (Ref #CS001)", amount: 1200.00, reference: "CS001" },
  { id: "txn6", date: new Date("2024-06-20T11:00:00Z").toISOString(), type: "Expense", description: "Monthly Rent Payment", amount: -800.00, reference: "RENT-JUN24" },
];


export default function TransactionsLogPage() {
  const [transactions] = useState<Transaction[]>(initialTransactionsData); // Keep original data immutable for easier reset
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  
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

    if (dateRange.from && isValid(dateRange.from)) {
        data = data.filter(item => new Date(item.date) >= dateRange.from!);
    }
    if (dateRange.to && isValid(dateRange.to)) {
      const inclusiveToDate = new Date(dateRange.to);
      inclusiveToDate.setHours(23, 59, 59, 999); // Ensure end of day for 'to' date
      data = data.filter(item => new Date(item.date) <= inclusiveToDate);
    }
    
    return data.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date descending
  }, [searchTerm, filterType, dateRange, transactions]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setDateRange({});
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Transactions Log</h1>
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle>All Financial Transactions</CardTitle>
          <CardDescription>View, search, and filter all recorded transactions. Found {filteredTransactions.length} transaction(s).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6 items-center">
            <div className="relative flex-grow min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search" placeholder="Search description, ref, amount..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full rounded-md"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-auto min-w-[160px] rounded-md">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Sale">Sale</SelectItem>
                <SelectItem value="Purchase">Purchase</SelectItem>
                <SelectItem value="Expense">Expense</SelectItem>
                <SelectItem value="Income">Income</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto min-w-[240px] justify-start text-left font-normal rounded-md">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange.from ? 
                    (dateRange.to ? `${format(dateRange.from, "LLL dd, y")} - ${format(dateRange.to, "LLL dd, y")}` : format(dateRange.from, "LLL dd, y")) 
                    : <span>Pick a date range</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range" selected={dateRange} onSelect={setDateRange}
                  initialFocus numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
            {(searchTerm || filterType !== "all" || dateRange.from || dateRange.to) && (
                <Button variant="ghost" onClick={clearFilters} className="rounded-md">Clear Filters</Button>
            )}
            <Button variant="outline" className="w-full sm:w-auto rounded-md ml-auto"> 
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableCaption>A chronological list of all transactions.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Date</TableHead>
                  <TableHead className="min-w-[100px]">Type</TableHead>
                  <TableHead className="min-w-[250px]">Description</TableHead>
                  <TableHead className="min-w-[120px]">Reference</TableHead>
                  <TableHead className="text-right min-w-[100px]">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{format(new Date(transaction.date), "MMM dd, yyyy hh:mm a")}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        transaction.type === "Sale" || transaction.type === "Income" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                        transaction.type === "Purchase" || transaction.type === "Expense" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" :
                        "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}>
                        {transaction.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{transaction.description}</TableCell>
                    <TableCell>{transaction.reference || "N/A"}</TableCell>
                    <TableCell className={`text-right font-semibold ${transaction.amount >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {transaction.amount >= 0 ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                 {filteredTransactions.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No transactions found matching your criteria.
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
