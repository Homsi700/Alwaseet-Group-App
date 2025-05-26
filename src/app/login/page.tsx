'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { motion } from 'framer-motion';
import { UserCircleIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'خطأ في تسجيل الدخول');
      }
      
      login(data.token, data.user);

      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً ${data.user.username}`,
      });

      router.push('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div id="mainContainer" className="min-h-screen relative overflow-hidden">
      {/* النجوم المتحركة */}
      <div className="starsec"></div>
      <div className="starthird"></div>
      <div className="starfourth"></div>
      <div className="starfifth"></div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-400 dark:bg-indigo-600 blur-3xl"
      />
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md wow-bg border-0">
          <div className="p-6">
            <h3 className="text-2xl font-bold text-center mb-2 colorboard">تسجيل الدخول</h3>
            <p className="text-center text-gray-500 mb-6">الدخول إلى حسابك</p>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <UserCircleIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="username"
                    placeholder="اسم المستخدم"
                    className="pr-10 text-right"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="relative">
                  <LockClosedIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="كلمة المرور"
                    className="pr-10 text-right"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                </Button>
              </form>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                نظام إدارة الشركات المتكامل
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}