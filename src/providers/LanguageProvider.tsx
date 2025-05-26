"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

type Locale = 'en' | 'ar';
type Direction = 'ltr' | 'rtl';

interface LanguageContextType {
  locale: Locale;
  direction: Direction;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [direction, setDirection] = useState<Direction>('ltr');

  useEffect(() => {
    // You could load preference from localStorage here
    const initialLang = (localStorage.getItem('alwasit-lang') as Locale) || 'en';
    setLocaleState(initialLang);
    if (initialLang === 'ar') {
      setDirection('rtl');
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    } else {
      setDirection('ltr');
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('alwasit-lang', newLocale);
    if (newLocale === 'ar') {
      setDirection('rtl');
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    } else {
      setDirection('ltr');
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    }
  }, []);
  
  const toggleLocale = useCallback(() => {
    setLocale(locale === 'en' ? 'ar' : 'en');
  }, [locale, setLocale]);

  return (
    <LanguageContext.Provider value={{ locale, direction, setLocale, toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
