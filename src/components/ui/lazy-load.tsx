import React, { useState, useEffect, Suspense } from 'react';
import { LoadingState } from './loading-state';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
  minHeight?: string;
}

/**
 * مكون للتحميل البطيء للمحتوى
 * يستخدم لتحسين أداء التطبيق عن طريق تأخير تحميل المكونات الثقيلة
 */
export function LazyLoad({ 
  children, 
  fallback = <LoadingState />, 
  delay = 0,
  minHeight = "200px"
}: LazyLoadProps) {
  const [isClient, setIsClient] = useState(false);
  const [shouldRender, setShouldRender] = useState(delay === 0);

  useEffect(() => {
    setIsClient(true);
    
    if (delay > 0) {
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!isClient) {
    return <div style={{ minHeight }}>{fallback}</div>;
  }

  if (!shouldRender) {
    return <div style={{ minHeight }}>{fallback}</div>;
  }

  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

/**
 * مكون للتحميل البطيء للصور
 * يستخدم لتحسين أداء التطبيق عن طريق تحميل الصور فقط عندما تكون في نطاق الرؤية
 */
export function LazyImage({ 
  src, 
  alt, 
  className,
  width,
  height,
  ...props 
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(imgRef.current);
    
    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  return (
    <div 
      ref={imgRef} 
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          {...props}
        />
      )}
      {(!isInView || !isLoaded) && (
        <div 
          className="absolute inset-0 bg-muted/20 animate-pulse"
          style={{ width, height }}
        />
      )}
    </div>
  );
}