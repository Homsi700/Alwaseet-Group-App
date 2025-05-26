<<<<<<< HEAD
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // For future redirection
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AppLogoIcon } from "@/components/layout/nav-items"; // Assuming AppLogoIcon is exported
import { Mail, Lock } from "lucide-react";

const loginFormSchema = z.object({
  username: z.string().min(1, { message: "اسم المستخدم مطلوب" }),
  // username: z.string().email({ message: "البريد الإلكتروني غير صالح" }), // if using email
  password: z.string().min(6, { message: "كلمة المرور يجب أن لا تقل عن 6 أحرف" }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;
=======
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import Image from 'next/image';
>>>>>>> 3d88a798466ad1d2ce8a70dd09c736b3c7330b1d

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
<<<<<<< HEAD
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    // console.log("Login data:", data);
=======
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
>>>>>>> 3d88a798466ad1d2ce8a70dd09c736b3c7330b1d

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
<<<<<<< HEAD
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بعودتك!",
        });
        // TODO: Store the token (e.g., in localStorage or context)
        // Example: localStorage.setItem('authToken', result.token);
        router.push("/"); // Redirect to dashboard or intended page
      } else {
        toast({
          title: "فشل تسجيل الدخول",
          description: result.error || "بيانات الاعتماد غير صحيحة أو حدث خطأ ما.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الشبكة",
        description: "تعذر الاتصال بالخادم. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
=======
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'خطأ في تسجيل الدخول');
      }      // استخدام مزود المصادقة لتسجيل الدخول
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
>>>>>>> 3d88a798466ad1d2ce8a70dd09c736b3c7330b1d
      });
    } finally {
      setIsLoading(false);
    }
<<<<<<< HEAD
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl rounded-xl border-border">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <AppLogoIcon className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">محاسبة الوسيط</CardTitle>
          <CardDescription className="text-muted-foreground">
            قم بتسجيل الدخول إلى حسابك للمتابعة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <div className="relative">
                <Mail className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="username"
                  placeholder="اسم المستخدم الخاص بك"
                  {...form.register("username")}
                  className="pl-10 rtl:pr-10 rtl:pl-3 rounded-md"
                  autoComplete="username"
                />
              </div>
              {form.formState.errors.username && (
                <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">كلمة المرور</Label>
                <Link
                  href="#" // Replace with actual forgot password link
                  className="text-sm text-primary hover:underline"
                  tabIndex={-1}
                >
                  هل نسيت كلمة المرور؟
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  {...form.register("password")}
                  className="pl-10 rtl:pr-10 rtl:pl-3 rounded-md"
                  autoComplete="current-password"
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full rounded-md bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3" disabled={isLoading}>
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2 pt-6">
          <p className="text-sm text-muted-foreground">
            ليس لديك حساب؟{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">
              إنشاء حساب جديد
            </Link>
          </p>
        </CardFooter>
=======
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <Card className="w-[400px]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Image
              src="/logo.png"
              alt="Alwaseet Group"
              width={120}
              height={120}
              className="mx-auto"
            />
          </div>
          <CardTitle className="text-2xl">تسجيل الدخول</CardTitle>
          <CardDescription>
            قم بتسجيل الدخول للوصول إلى لوحة التحكم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="username"
                placeholder="اسم المستخدم"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="كلمة المرور"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>
        </CardContent>
>>>>>>> 3d88a798466ad1d2ce8a70dd09c736b3c7330b1d
      </Card>
    </div>
  );
}
