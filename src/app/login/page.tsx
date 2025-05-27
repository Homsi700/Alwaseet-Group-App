
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { AppLogoIcon } from '@/components/layout/nav-items'; // Assuming AppLogoIcon is defined here
import { Mail, Lock, Loader2, LogIn } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  username: z.string().min(1, { message: 'اسم المستخدم مطلوب' }),
  password: z.string().min(1, { message: 'كلمة المرور مطلوبة' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login: authLogin, isLoading: authLoading } = useAuth(); // Renamed to avoid conflict
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        authLogin(result.token, result.user); // Use the login function from AuthContext
        toast({
          title: 'تم تسجيل الدخول بنجاح',
          description: `مرحباً بعودتك، ${result.user.firstName || result.user.username}!`,
        });
        router.push('/'); // Redirect to dashboard or home page
      } else {
        toast({
          title: 'فشل تسجيل الدخول',
          description: result.message || 'اسم المستخدم أو كلمة المرور غير صحيحة.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'خطأ في الاتصال',
        description: 'لم نتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-lg shadow-2xl rounded-xl overflow-hidden border-border/40">
        <CardHeader className="bg-card p-8 text-center">
          <div className="flex flex-col items-center mb-6">
            <AppLogoIcon className="h-16 w-16 text-primary mb-3" />
            <CardTitle className="text-3xl font-bold text-primary">محاسبة الوسيط</CardTitle>
            <CardDescription className="text-muted-foreground mt-2 text-md">
              مرحباً بعودتك! يرجى تسجيل الدخول للمتابعة.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-md font-medium text-foreground">اسم المستخدم</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground icon-directional" />
                <Input
                  id="username"
                  type="text"
                  placeholder="ادخل اسم المستخدم الخاص بك"
                  className="pl-10 pr-3 py-3 text-md rounded-lg border-border/60 focus:border-primary focus:ring-primary"
                  {...form.register('username')}
                />
              </div>
              {form.formState.errors.username && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.username.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-md font-medium text-foreground">كلمة المرور</Label>
                <Link href="#" className="text-sm text-primary hover:underline">
                  هل نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground icon-directional" />
                <Input
                  id="password"
                  type="password"
                  placeholder="ادخل كلمة المرور"
                  className="pl-10 pr-3 py-3 text-md rounded-lg border-border/60 focus:border-primary focus:ring-primary"
                  {...form.register('password')}
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full text-lg py-3.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="ml-2 h-5 w-5 animate-spin icon-directional" />
              ) : (
                <LogIn className="ml-2 h-5 w-5 icon-directional" />
              )}
              تسجيل الدخول
            </Button>
          </form>
        </CardContent>
        <CardFooter className="p-8 pt-4 bg-card border-t border-border/20">
          <p className="text-center text-sm text-muted-foreground w-full">
            ليس لديك حساب؟{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              إنشاء حساب جديد
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
