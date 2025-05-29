import { QueryClient } from '@tanstack/react-query';

// إعدادات افتراضية محسنة لـ React Query
export const queryClientOptions = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // لا يعيد جلب البيانات عند التركيز على النافذة
      refetchOnMount: true, // يعيد جلب البيانات عند تركيب المكون
      refetchOnReconnect: true, // يعيد جلب البيانات عند إعادة الاتصال
      retry: 1, // عدد محاولات إعادة المحاولة عند فشل الطلب
      staleTime: 5 * 60 * 1000, // 5 دقائق قبل اعتبار البيانات قديمة
      cacheTime: 10 * 60 * 1000, // 10 دقائق قبل إزالة البيانات من ذاكرة التخزين المؤقت
      suspense: false, // لا يستخدم Suspense
    },
    mutations: {
      retry: 1, // عدد محاولات إعادة المحاولة عند فشل الطلب
    },
  },
};

// إنشاء عميل React Query
export const queryClient = new QueryClient(queryClientOptions);

// دالة مساعدة لإعادة تعيين ذاكرة التخزين المؤقت
export const invalidateQueries = async (queryKeys: string[]) => {
  await Promise.all(
    queryKeys.map((key) => queryClient.invalidateQueries({ queryKey: [key] }))
  );
};

// دالة مساعدة لإعادة جلب الاستعلامات
export const refetchQueries = async (queryKeys: string[]) => {
  await Promise.all(
    queryKeys.map((key) => queryClient.refetchQueries({ queryKey: [key] }))
  );
};

// دالة مساعدة لمسح ذاكرة التخزين المؤقت
export const clearCache = () => {
  queryClient.clear();
};