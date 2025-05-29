import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Filter, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

// واجهة الخصائص
interface ProductFiltersProps {
  categories: any[];
  onFilterChange: (filters: ProductFilters) => void;
  isLoadingCategories: boolean;
}

// واجهة الفلاتر
export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  lowStock?: boolean;
  sortBy?: 'name' | 'price' | 'quantity' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export function ProductFilters({ categories, onFilterChange, isLoadingCategories }: ProductFiltersProps) {
  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // تحديث الفلاتر
  const updateFilter = (key: keyof ProductFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // تحديث قائمة الفلاتر النشطة
    updateActiveFilters(key, value);
    
    // إرسال الفلاتر المحدثة
    onFilterChange(newFilters);
  };
  
  // تحديث قائمة الفلاتر النشطة
  const updateActiveFilters = (key: keyof ProductFilters, value: any) => {
    const newActiveFilters = [...activeFilters];
    
    // إزالة الفلتر القديم إذا كان موجوداً
    const existingIndex = newActiveFilters.findIndex(filter => filter.startsWith(`${key}:`));
    if (existingIndex !== -1) {
      newActiveFilters.splice(existingIndex, 1);
    }
    
    // إضافة الفلتر الجديد إذا كانت له قيمة
    if (value !== undefined && value !== '' && value !== false) {
      let filterLabel = '';
      
      switch (key) {
        case 'categoryId':
          const category = categories.find(c => c.id === value || c.categoryId === value);
          filterLabel = `الفئة: ${category ? category.name : value}`;
          break;
        case 'minPrice':
          filterLabel = `السعر من: ${value} ريال`;
          break;
        case 'maxPrice':
          filterLabel = `السعر إلى: ${value} ريال`;
          break;
        case 'inStock':
          if (value) filterLabel = 'متوفر في المخزون';
          break;
        case 'lowStock':
          if (value) filterLabel = 'مخزون منخفض';
          break;
        case 'sortBy':
          const sortLabels: Record<string, string> = {
            'name': 'الاسم',
            'price': 'السعر',
            'quantity': 'الكمية',
            'createdAt': 'تاريخ الإضافة',
          };
          const orderLabels: Record<string, string> = {
            'asc': 'تصاعدي',
            'desc': 'تنازلي',
          };
          const order = filters.sortOrder || 'asc';
          filterLabel = `ترتيب حسب: ${sortLabels[value]} (${orderLabels[order]})`;
          break;
        default:
          filterLabel = `${key}: ${value}`;
      }
      
      if (filterLabel) {
        newActiveFilters.push(`${key}:${filterLabel}`);
      }
    }
    
    setActiveFilters(newActiveFilters);
  };
  
  // إعادة تعيين الفلاتر
  const resetFilters = () => {
    setFilters({
      sortBy: 'name',
      sortOrder: 'asc',
    });
    setPriceRange([0, 1000]);
    setActiveFilters([]);
    onFilterChange({
      sortBy: 'name',
      sortOrder: 'asc',
    });
    setIsOpen(false);
  };
  
  // إزالة فلتر محدد
  const removeFilter = (filterKey: string) => {
    const key = filterKey.split(':')[0] as keyof ProductFilters;
    const newFilters = { ...filters };
    
    // إزالة الفلتر
    delete newFilters[key];
    
    // تحديث الحالة
    setFilters(newFilters);
    
    // تحديث قائمة الفلاتر النشطة
    const newActiveFilters = activeFilters.filter(filter => !filter.startsWith(`${key}:`));
    setActiveFilters(newActiveFilters);
    
    // إرسال الفلاتر المحدثة
    onFilterChange(newFilters);
  };
  
  // تحديث نطاق السعر
  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
    updateFilter('minPrice', values[0]);
    updateFilter('maxPrice', values[1]);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="rounded-md">
              <Filter className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> تصفية المنتجات
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="start">
            <div className="space-y-4">
              <h4 className="font-medium">تصفية المنتجات</h4>
              
              <div className="space-y-2">
                <Label htmlFor="category">الفئة</Label>
                <Select
                  value={filters.categoryId}
                  onValueChange={(value) => updateFilter('categoryId', value)}
                  disabled={isLoadingCategories}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="جميع الفئات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">جميع الفئات</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id || category.categoryId} value={category.id || category.categoryId}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>نطاق السعر</Label>
                <div className="pt-4">
                  <Slider
                    value={priceRange}
                    min={0}
                    max={1000}
                    step={10}
                    onValueChange={handlePriceRangeChange}
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>{priceRange[0]} ريال</span>
                    <span>{priceRange[1]} ريال</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>حالة المخزون</Label>
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox
                      id="inStock"
                      checked={filters.inStock}
                      onCheckedChange={(checked) => updateFilter('inStock', checked)}
                    />
                    <Label htmlFor="inStock" className="cursor-pointer">متوفر في المخزون</Label>
                  </div>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Checkbox
                      id="lowStock"
                      checked={filters.lowStock}
                      onCheckedChange={(checked) => updateFilter('lowStock', checked)}
                    />
                    <Label htmlFor="lowStock" className="cursor-pointer">مخزون منخفض</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sortBy">ترتيب حسب</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: any) => updateFilter('sortBy', value)}
                >
                  <SelectTrigger id="sortBy">
                    <SelectValue placeholder="اختر طريقة الترتيب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">الاسم</SelectItem>
                    <SelectItem value="price">السعر</SelectItem>
                    <SelectItem value="quantity">الكمية</SelectItem>
                    <SelectItem value="createdAt">تاريخ الإضافة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sortOrder">اتجاه الترتيب</Label>
                <Select
                  value={filters.sortOrder}
                  onValueChange={(value: any) => updateFilter('sortOrder', value)}
                >
                  <SelectTrigger id="sortOrder">
                    <SelectValue placeholder="اختر اتجاه الترتيب" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">تصاعدي</SelectItem>
                    <SelectItem value="desc">تنازلي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  إعادة تعيين
                </Button>
                <Button size="sm" onClick={() => setIsOpen(false)}>
                  تطبيق
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        
        {/* عرض الفلاتر النشطة */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            {activeFilters.map((filter) => {
              const [key, label] = filter.split(':', 2);
              return (
                <Badge key={filter} variant="secondary" className="rounded-full">
                  {label}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1 rtl:mr-1 hover:bg-transparent"
                    onClick={() => removeFilter(key)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
            
            {activeFilters.length > 1 && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-7 px-2 text-xs">
                مسح الكل
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}