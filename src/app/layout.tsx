
import type { Metadata } from 'next';
// استخدام خطوط بديلة حتى يتم تثبيت حزمة geist
// import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AppProviders } from '@/providers/AppProviders';

export const metadata: Metadata = {
  title: 'محاسبي | مجموعة الوسيط جروب',
  description: 'نظام محاسبي متكامل مقدم من مجموعة الوسيط جروب',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
