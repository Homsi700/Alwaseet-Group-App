import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
// AppLayout is removed from here
import { AppProviders } from '@/providers/AppProviders';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Al Wasit Accounting',
  description: 'Comprehensive Accounting Solution by Al Wasit',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Set Arabic as the default language and direction for initial server render
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        <AppProviders>
          {/* AppLayout is no longer here, it will be in (app)/layout.tsx */}
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
