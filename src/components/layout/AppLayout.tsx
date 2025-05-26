import type { ReactNode } from 'react';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "./SidebarNav";
import { Toaster } from "@/components/ui/toaster";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"; // Assuming breadcrumb exists or is simple
import Link from 'next/link';

// A simple Breadcrumb component for placeholder.
// In a real app, you might use a library or a more complex custom component.
const AppBreadcrumb = ({ pageTitle }: { pageTitle?: string }) => {
  // This is a very basic breadcrumb. Real implementation would involve route parsing.
  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Dashboard</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pageTitle && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};


interface AppLayoutProps {
  children: ReactNode;
  pageTitle?: string; // Optional: to pass current page title for breadcrumbs or header
}

export function AppLayout({ children, pageTitle }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <SidebarNav />
      <SidebarInset className="flex flex-col bg-background">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
          <SidebarTrigger className="sm:hidden text-foreground" />
          <AppBreadcrumb pageTitle={pageTitle} />
          {/* Future additions: Search bar, user menu dropdown */}
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
