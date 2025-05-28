
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Loader2 } from 'lucide-react';

export default function HomeRedirector() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) { // الانتظار حتى ينتهي AuthProvider من التحميل
      if (user) {
        router.push('/dashboard'); // المسار الرئيسي داخل التطبيق بعد تسجيل الدخول
      } else {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  // عرض شاشة تحميل أثناء انتظار AuthProvider أو التوجيه
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted text-foreground">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg">جاري تحميل التطبيق...</p>
    </div>
  );
}
