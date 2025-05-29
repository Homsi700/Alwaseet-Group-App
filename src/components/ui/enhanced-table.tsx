import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/loading-state';
import { Search, SortAsc, SortDesc, Filter, Download, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
  headerClassName?: string;
}

interface EnhancedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | string;
  onRetry?: () => void;
  emptyState?: {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
  };
  pagination?: {
    pageSize: number;
    pageIndex: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    sortBy: string | null;
    sortDirection: 'asc' | 'desc' | null;
    onSortChange: (column: string, direction: 'asc' | 'desc') => void;
  };
  filtering?: {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    searchPlaceholder?: string;
  };
  actions?: React.ReactNode;
  exportData?: {
    onExport: () => void;
    isExporting?: boolean;
  };
  className?: string;
  tableClassName?: string;
  rowClassName?: (item: T) => string;
  onRowClick?: (item: T) => void;
}

export function EnhancedTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading = false,
  isError = false,
  error,
  onRetry,
  emptyState = {
    title: 'لا توجد بيانات',
    description: 'لم يتم العثور على بيانات لعرضها.',
  },
  pagination,
  sorting,
  filtering,
  actions,
  exportData,
  className,
  tableClassName,
  rowClassName,
  onRowClick,
}: EnhancedTableProps<T>) {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(filtering?.searchTerm || '');

  // تأخير البحث لتحسين الأداء
  useEffect(() => {
    if (!filtering) return;
    
    const handler = setTimeout(() => {
      filtering.onSearchChange(debouncedSearchTerm);
    }, 300);
    
    return () => clearTimeout(handler);
  }, [debouncedSearchTerm, filtering]);

  // التعامل مع تغيير الترتيب
  const handleSort = (column: Column<T>) => {
    if (!sorting || !column.sortable) return;
    
    const isCurrentSortColumn = sorting.sortBy === column.accessorKey;
    const newDirection = isCurrentSortColumn && sorting.sortDirection === 'asc' ? 'desc' : 'asc';
    
    sorting.onSortChange(column.accessorKey as string, newDirection);
  };

  // الحصول على قيمة الخلية
  const getCellValue = (item: T, accessorKey: keyof T | string) => {
    if (typeof accessorKey === 'string' && accessorKey.includes('.')) {
      return accessorKey.split('.').reduce((obj, key) => obj?.[key], item as any);
    }
    return item[accessorKey as keyof T];
  };

  // عرض حالة التحميل
  if (isLoading) {
    return <LoadingState fullPage text="جاري تحميل البيانات..." />;
  }

  // عرض حالة الخطأ
  if (isError) {
    return <ErrorState error={error} retry={onRetry} />;
  }

  // عرض حالة البيانات الفارغة
  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyState.title}
        description={emptyState.description}
        icon={emptyState.icon}
        action={emptyState.action}
      />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* شريط الأدوات */}
      {(filtering || actions || exportData) && (
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          {filtering && (
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-2.5 rtl:right-2.5 rtl:left-auto top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={filtering.searchPlaceholder || "بحث..."}
                value={debouncedSearchTerm}
                onChange={(e) => setDebouncedSearchTerm(e.target.value)}
                className="pl-8 rtl:pr-8 rtl:pl-2 rounded-md"
              />
            </div>
          )}
          <div className="flex gap-2 ml-auto rtl:mr-auto rtl:ml-0">
            {actions}
            {exportData && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportData.onExport}
                disabled={exportData.isExporting}
                className="rounded-md"
              >
                {exportData.isExporting ? (
                  <Loader2 className="ml-2 rtl:mr-2 h-4 w-4 animate-spin icon-directional" />
                ) : (
                  <Download className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" />
                )}
                تصدير
              </Button>
            )}
          </div>
        </div>
      )}

      {/* الجدول */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table className={tableClassName}>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    className={cn(
                      column.sortable && "cursor-pointer select-none",
                      column.headerClassName
                    )}
                    onClick={() => column.sortable && sorting && handleSort(column)}
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {column.sortable && sorting && sorting.sortBy === column.accessorKey && (
                        sorting.sortDirection === 'asc' ? (
                          <SortAsc className="h-4 w-4" />
                        ) : (
                          <SortDesc className="h-4 w-4" />
                        )
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={cn(
                    onRowClick && "cursor-pointer hover:bg-muted/50",
                    rowClassName && rowClassName(item)
                  )}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={column.className}>
                      {column.cell
                        ? column.cell(item)
                        : getCellValue(item, column.accessorKey)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* التصفح */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              {pagination.pageIndex === 0 ? (
                <span className="flex h-9 items-center gap-1 pl-2.5 rtl:pr-2.5 rtl:pl-3 text-muted-foreground">
                  <ChevronLeft className="h-4 w-4 rtl:hidden" />
                  <ChevronRight className="h-4 w-4 hidden rtl:block" />
                  <span>السابق</span>
                </span>
              ) : (
                <PaginationPrevious
                  onClick={() => pagination.onPageChange(pagination.pageIndex - 1)}
                />
              )}
            </PaginationItem>
            
            {Array.from({ length: pagination.totalPages }).map((_, index) => {
              // عرض الصفحات المجاورة للصفحة الحالية فقط
              if (
                index === 0 ||
                index === pagination.totalPages - 1 ||
                Math.abs(index - pagination.pageIndex) <= 1
              ) {
                return (
                  <PaginationItem key={index}>
                    <PaginationLink
                      isActive={pagination.pageIndex === index}
                      onClick={() => pagination.onPageChange(index)}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              
              // عرض نقاط الحذف
              if (
                (index === 1 && pagination.pageIndex > 2) ||
                (index === pagination.totalPages - 2 && pagination.pageIndex < pagination.totalPages - 3)
              ) {
                return (
                  <PaginationItem key={index}>
                    <span className="flex h-9 w-9 items-center justify-center">...</span>
                  </PaginationItem>
                );
              }
              
              return null;
            })}
            
            <PaginationItem>
              {pagination.pageIndex === pagination.totalPages - 1 ? (
                <span className="flex h-9 items-center gap-1 pr-2.5 rtl:pl-2.5 rtl:pr-3 text-muted-foreground">
                  <span>التالي</span>
                  <ChevronRight className="h-4 w-4 rtl:hidden" />
                  <ChevronLeft className="h-4 w-4 hidden rtl:block" />
                </span>
              ) : (
                <PaginationNext
                  onClick={() => pagination.onPageChange(pagination.pageIndex + 1)}
                />
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}