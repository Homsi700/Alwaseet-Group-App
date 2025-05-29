import React, { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InfiniteScrollProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  fetchMore: () => Promise<void>;
  hasMore: boolean;
  isLoading?: boolean;
  loadingText?: string;
  endMessage?: React.ReactNode;
  className?: string;
  itemClassName?: string;
  threshold?: number;
  direction?: 'vertical' | 'horizontal';
  loadMoreOnMount?: boolean;
}

export function InfiniteScroll<T>({
  items,
  renderItem,
  fetchMore,
  hasMore,
  isLoading = false,
  loadingText = 'جاري تحميل المزيد...',
  endMessage,
  className,
  itemClassName,
  threshold = 200,
  direction = 'vertical',
  loadMoreOnMount = false,
}: InfiniteScrollProps<T>) {
  const [isFetching, setIsFetching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  // تحميل المزيد من العناصر
  const loadMore = async () => {
    if (isFetching || isLoading || !hasMore) return;
    
    setIsFetching(true);
    try {
      await fetchMore();
    } finally {
      setIsFetching(false);
    }
  };

  // إعداد مراقب التقاطع لتحميل المزيد عند الوصول إلى نهاية القائمة
  useEffect(() => {
    if (!loadingRef.current) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isFetching && !isLoading) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: `0px 0px ${threshold}px 0px`,
        threshold: 0.1,
      }
    );
    
    observerRef.current.observe(loadingRef.current);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isFetching, isLoading, threshold]);

  // تحميل المزيد عند التركيب إذا كان مطلوباً
  useEffect(() => {
    if (loadMoreOnMount && hasMore && items.length === 0 && !isLoading) {
      loadMore();
    }
  }, []);

  // التعامل مع التمرير اليدوي
  const handleScroll = () => {
    if (!containerRef.current || isFetching || isLoading || !hasMore) return;
    
    const container = containerRef.current;
    
    if (direction === 'vertical') {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      if (scrollHeight - scrollTop - clientHeight < threshold) {
        loadMore();
      }
    } else {
      const scrollLeft = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const clientWidth = container.clientWidth;
      
      if (scrollWidth - scrollLeft - clientWidth < threshold) {
        loadMore();
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        direction === 'vertical' ? 'overflow-y-auto' : 'overflow-x-auto',
        className
      )}
      onScroll={handleScroll}
    >
      <div
        className={cn(
          direction === 'vertical' ? 'flex flex-col' : 'flex flex-row',
          'w-full'
        )}
      >
        {items.map((item, index) => (
          <div key={index} className={itemClassName}>
            {renderItem(item, index)}
          </div>
        ))}
        
        <div ref={loadingRef} className="w-full">
          {(isLoading || isFetching) && hasMore && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2 rtl:ml-2 rtl:mr-0" />
              <span className="text-sm text-muted-foreground">{loadingText}</span>
            </div>
          )}
          
          {!hasMore && endMessage && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              {endMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}