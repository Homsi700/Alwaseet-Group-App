
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans'; // استخدام GeistSans مباشرة
import { GeistMono } from 'geist/font/mono'; // استخدام GeistMono مباشرة
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
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
