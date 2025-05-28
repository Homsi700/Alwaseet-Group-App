
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
  const [locale, setLocaleState] = useState<Locale>('ar'); // الافتراضي هو العربية
  const [direction, setDirection] = useState<Direction>('rtl'); // الافتراضي هو من اليمين لليسار

  const updateDocumentAttributes = (currentLocale: Locale) => {
    if (currentLocale === 'ar') {
      setDirection('rtl');
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    } else {
      setDirection('ltr');
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    }
  };
  
  useEffect(() => {
    // هذه الدالة ستُنفذ فقط على العميل
    const storedLang = localStorage.getItem('alwasit-lang') as Locale | null;
    const initialLang = storedLang || 'ar'; // إذا لم يكن هناك تفضيل مخزن، استخدم العربية
    setLocaleState(initialLang);
    updateDocumentAttributes(initialLang);
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('alwasit-lang', newLocale);
    updateDocumentAttributes(newLocale);
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
