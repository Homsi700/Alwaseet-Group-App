/**
 * وظائف مساعدة للتعامل مع العملة
 */

// رمز العملة الافتراضي
export const DEFAULT_CURRENCY_CODE = 'SYP';

// رمز العملة الافتراضي
export const DEFAULT_CURRENCY_SYMBOL = 'ل.س';

// تنسيق المبالغ المالية
export const formatCurrency = (value: number, locale: string = 'ar-SY', symbol: string = DEFAULT_CURRENCY_SYMBOL): string => {
  // تنسيق الرقم بالفواصل
  const formattedNumber = value.toLocaleString(locale);
  
  // إضافة رمز العملة
  return `${formattedNumber} ${symbol}`;
};

// تحويل النص إلى رقم
export const parseCurrency = (value: string): number => {
  // إزالة رمز العملة والفواصل
  const numericValue = value.replace(/[^\d.-]/g, '');
  
  // تحويل النص إلى رقم
  return parseFloat(numericValue) || 0;
};

// الحصول على رمز العملة من الشركة
export const getCurrencySymbol = (company?: { currencySymbol?: string }): string => {
  return company?.currencySymbol || DEFAULT_CURRENCY_SYMBOL;
};

// الحصول على رمز العملة من الشركة
export const getCurrencyCode = (company?: { currencyCode?: string }): string => {
  return company?.currencyCode || DEFAULT_CURRENCY_CODE;
};