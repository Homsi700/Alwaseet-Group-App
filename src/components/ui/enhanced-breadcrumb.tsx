import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

interface EnhancedBreadcrumbProps {
  items?: BreadcrumbItem[];
  homeHref?: string;
  homeLabel?: string;
  separator?: React.ReactNode;
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  showHome?: boolean;
  isRtl?: boolean;
  autoGenerate?: boolean;
  pathMap?: Record<string, string>;
}

export function EnhancedBreadcrumb({
  items,
  homeHref = '/',
  homeLabel = 'الرئيسية',
  separator,
  className,
  itemClassName,
  activeItemClassName,
  showHome = true,
  isRtl = true,
  autoGenerate = false,
  pathMap = {},
}: EnhancedBreadcrumbProps) {
  const pathname = usePathname();
  
  // توليد عناصر التنقل تلقائياً من المسار الحالي
  const generateBreadcrumbItems = (): BreadcrumbItem[] => {
    if (!autoGenerate) return items || [];
    
    const pathSegments = pathname.split('/').filter(Boolean);
    let currentPath = '';
    
    return pathSegments.map((segment) => {
      currentPath += `/${segment}`;
      
      // استخدام الاسم المخصص من خريطة المسارات إذا كان متاحاً
      const label = pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      return {
        href: currentPath,
        label,
      };
    });
  };
  
  const breadcrumbItems = generateBreadcrumbItems();
  const Separator = separator || (
    isRtl ? <ChevronLeft className="h-4 w-4 mx-1 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
  );

  return (
    <nav aria-label="breadcrumb" className={cn("flex items-center text-sm", className)}>
      <ol className="flex items-center">
        {showHome && (
          <li className="flex items-center">
            <Link
              href={homeHref}
              className={cn(
                "flex items-center text-muted-foreground hover:text-foreground transition-colors",
                itemClassName
              )}
            >
              <Home className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
              <span>{homeLabel}</span>
            </Link>
            {(breadcrumbItems.length > 0) && Separator}
          </li>
        )}
        
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={item.href} className="flex items-center">
              {isLast ? (
                <span
                  className={cn(
                    "font-medium text-foreground",
                    itemClassName,
                    activeItemClassName
                  )}
                  aria-current="page"
                >
                  {item.icon && (
                    <span className="mr-1 rtl:ml-1 rtl:mr-0">{item.icon}</span>
                  )}
                  {item.label}
                </span>
              ) : (
                <>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-muted-foreground hover:text-foreground transition-colors flex items-center",
                      itemClassName
                    )}
                  >
                    {item.icon && (
                      <span className="mr-1 rtl:ml-1 rtl:mr-0">{item.icon}</span>
                    )}
                    {item.label}
                  </Link>
                  {Separator}
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}