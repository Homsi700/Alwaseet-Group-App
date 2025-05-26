import type { ReactNode } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';

// This is the new layout for the main application parts that require the sidebar and header
export default function AuthenticatedAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppLayout>{children}</AppLayout>;
}
