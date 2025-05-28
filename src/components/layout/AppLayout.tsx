
"use client"; 

import type { ReactNode } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "./SidebarNav";
import { Toaster } from "@/components/ui/toaster";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navItems } from './nav-items';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '@/providers/LanguageProvider';


const AppBreadcrumb = () => {
  const pathname = usePathname();
  const { locale } = useLanguage();
  
  // إيجاد عنصر التنقل الحالي بناءً على المسار
  // مع الأخذ في الاعتبار أن href قد لا يكون مطابقاً تماماً للمسار (مثال: /products/new)
  const currentTopLevelNavItem = navItems.find(item => 
    item.href === '/' ? pathname === '/' : (item.href !== '/' && pathname.startsWith(item.href))
  );

  const pageTitle = currentTopLevelNavItem?.title; // العنوان سيكون بالفعل مترجماً من nav-items.ts

  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">{locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pageTitle && currentTopLevelNavItem?.href !== '/' && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {/* إذا كان المسار الحالي هو نفس مسار العنصر، فهو صفحة. وإلا فهو رابط. */}
              {pathname === currentTopLevelNavItem?.href ? (
                <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={currentTopLevelNavItem?.href || pathname}>{pageTitle}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </>
        )}
        {/* قد نحتاج لإضافة مستوى آخر للتنقل إذا كان المسار أعمق، مثال: /products/edit/123 */}
      </BreadcrumbList>
    </Breadcrumb>
  );
};


interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true} defaultSide="right">
      <SidebarNav />
      <SidebarInset className="flex flex-col bg-background">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
          <SidebarTrigger className="sm:hidden text-foreground" />
          <AppBreadcrumb />
          <div className="ml-auto rtl:mr-auto rtl:ml-0 flex items-center gap-2"> {/* تعديل RTL */}
            <LanguageToggle />
            <ThemeToggle />
            {/* إضافات مستقبلية: قائمة منسدلة للمستخدم */}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
          <div className="max-w-full mx-auto">
             {children}
          </div>
        </main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
