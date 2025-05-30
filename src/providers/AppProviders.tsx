"use client";

import type { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { TooltipProvider } from '@/components/ui/tooltip';
import { LanguageProvider } from './LanguageProvider';
import { AuthProvider } from './AuthProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function AppProviders({ children, ...props }: ThemeProviderProps & { children: ReactNode }) {
  // Ensure QueryClient is only created once and persists across re-renders
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem {...props}>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider delayDuration={0}>
              {children}
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
}
