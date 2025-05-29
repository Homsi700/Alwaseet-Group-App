import { useState, useEffect, useCallback } from 'react';

interface FetchOptions extends RequestInit {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  withAuth?: boolean;
}

interface FetchResponse<T> {
  data: T | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * دالة مساعدة للتعامل مع طلبات الشبكة مع دعم إعادة المحاولة والمهلة
 */
export async function fetchWithRetry<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const {
    baseUrl = '',
    timeout = 10000,
    retries = 3,
    retryDelay = 1000,
    withAuth = true,
    ...fetchOptions
  } = options;

  // إضافة التوكن إذا كان مطلوباً
  if (withAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      fetchOptions.headers = {
        ...fetchOptions.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  // إضافة مهلة للطلب
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // تنفيذ الطلب مع إعادة المحاولة
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const fullUrl = `${baseUrl}${url}`;
      const response = await fetch(fullUrl, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || `فشل الطلب بكود الحالة ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error as Error;
      
      // إذا كان الخطأ بسبب إلغاء الطلب، لا نعيد المحاولة
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('انتهت مهلة الطلب');
      }
      
      // إذا كانت هذه آخر محاولة، نرمي الخطأ
      if (attempt === retries - 1) {
        throw lastError;
      }
      
      // انتظار قبل إعادة المحاولة
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw lastError || new Error('فشل الطلب لسبب غير معروف');
}

/**
 * Hook لجلب البيانات مع دعم إعادة المحاولة والتحميل والأخطاء
 */
export function useFetch<T>(
  url: string,
  options: FetchOptions = {}
): FetchResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const result = await fetchWithRetry<T>(url, options);
      setData(result);
    } catch (err) {
      setIsError(true);
      setError(err as Error);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [url, options]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, isError, error, refetch: fetchData };
}

/**
 * دالة مساعدة لإرسال طلبات POST
 */
export async function postData<T, R = any>(
  url: string,
  data: T,
  options: FetchOptions = {}
): Promise<R> {
  return fetchWithRetry<R>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * دالة مساعدة لإرسال طلبات PUT
 */
export async function putData<T, R = any>(
  url: string,
  data: T,
  options: FetchOptions = {}
): Promise<R> {
  return fetchWithRetry<R>(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * دالة مساعدة لإرسال طلبات DELETE
 */
export async function deleteData<R = any>(
  url: string,
  options: FetchOptions = {}
): Promise<R> {
  return fetchWithRetry<R>(url, {
    method: 'DELETE',
    ...options,
  });
}

/**
 * Hook لإدارة حالة النموذج مع التحميل والأخطاء
 */
export function useFormSubmit<T, R = any>(
  submitFn: (data: T) => Promise<R>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<R | null>(null);

  const submit = async (data: T) => {
    setIsSubmitting(true);
    setIsSuccess(false);
    setError(null);

    try {
      const response = await submitFn(data);
      setResult(response);
      setIsSuccess(true);
      return response;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submit, isSubmitting, isSuccess, error, result };
}