"use client";

import type { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LanguageProvider } from './LanguageProvider';
import { AuthProvider } from './AuthProvider';

export function AppProviders({ children, ...props }: ThemeProviderProps & { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider delayDuration={0}>
            {children}
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </NextThemesProvider>
  );
}
