import type { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

// هذا هو التخطيط للصفحات الداخلية للتطبيق التي تتطلب الشريط الجانبي والرأس
export default function AuthenticatedAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppLayout>{children}</AppLayout>;
}
