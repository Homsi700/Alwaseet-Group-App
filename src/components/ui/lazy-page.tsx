import React, { Suspense } from 'react';
import { LoadingState } from './loading-state';
import { EnhancedBreadcrumb } from './enhanced-breadcrumb';

interface LazyPageProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  breadcrumbs?: {
    href: string;
    label: string;
    icon?: React.ReactNode;
  }[];
  actions?: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | string;
  onRetry?: () => void;
  className?: string;
}

/**
 * مكون للصفحات مع دعم التحميل البطيء والتنقل بين الصفحات
 */
export function LazyPage({
  children,
  title,
  description,
  breadcrumbs,
  actions,
  isLoading,
  isError,
  error,
  onRetry,
  className,
}: LazyPageProps) {
  return (
    <div className={className}>
      {/* رأس الصفحة مع التنقل بين الصفحات والعنوان والإجراءات */}
      <div className="mb-6">
        {breadcrumbs && (
          <div className="mb-4">
            <EnhancedBreadcrumb items={breadcrumbs} />
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            {title && <h1 className="text-3xl font-bold text-foreground">{title}</h1>}
            {description && <p className="text-muted-foreground mt-1">{description}</p>}
          </div>
          
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </div>
      
      {/* محتوى الصفحة مع حالات التحميل والخطأ */}
      <Suspense fallback={<LoadingState fullPage text="جاري تحميل الصفحة..." />}>
        {isLoading ? (
          <LoadingState fullPage text="جاري تحميل البيانات..." />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
            <div className="text-destructive mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-12 w-12"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">حدث خطأ أثناء تحميل الصفحة</h2>
            <p className="text-muted-foreground mb-4 max-w-md">
              {typeof error === 'string' ? error : error?.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'}
            </p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                إعادة المحاولة
              </button>
            )}
          </div>
        ) : (
          children
        )}
      </Suspense>
    </div>
  );
}