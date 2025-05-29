import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface EnhancedTabsProps {
  defaultValue?: string;
  tabs: {
    value: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
    disabled?: boolean;
  }[];
  queryParamName?: string;
  className?: string;
  tabsListClassName?: string;
  tabsTriggerClassName?: string;
  tabsContentClassName?: string;
  onChange?: (value: string) => void;
  preserveState?: boolean;
}

/**
 * مكون تبويب محسن مع دعم لحفظ الحالة في عنوان URL
 * ودعم للأيقونات والتخصيص
 */
export function EnhancedTabs({
  defaultValue,
  tabs,
  queryParamName = 'tab',
  className,
  tabsListClassName,
  tabsTriggerClassName,
  tabsContentClassName,
  onChange,
  preserveState = true,
}: EnhancedTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // استخراج قيمة التبويب من عنوان URL أو استخدام القيمة الافتراضية
  const initialValue = preserveState 
    ? searchParams.get(queryParamName) || defaultValue || tabs[0]?.value
    : defaultValue || tabs[0]?.value;
    
  const [activeTab, setActiveTab] = useState(initialValue);

  // تحديث عنوان URL عند تغيير التبويب
  useEffect(() => {
    if (preserveState && activeTab) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.set(queryParamName, activeTab);
      
      // تحديث عنوان URL بدون إعادة تحميل الصفحة
      router.push(`?${newParams.toString()}`, { scroll: false });
    }
  }, [activeTab, preserveState, queryParamName, router, searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <Tabs
      defaultValue={activeTab}
      value={activeTab}
      onValueChange={handleTabChange}
      className={cn("w-full", className)}
    >
      <TabsList className={cn("grid grid-flow-col auto-cols-fr", tabsListClassName)}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            disabled={tab.disabled}
            className={cn("flex items-center gap-2", tabsTriggerClassName)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.value}
          value={tab.value}
          className={cn("mt-4", tabsContentClassName)}
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}