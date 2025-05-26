
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { AppLogoIcon } from "@/components/layout/nav-items";
import { Mail, Lock } from "lucide-react";
import { useAuth } from '@/providers/AuthProvider';

const loginFormSchema = z.object({
  username: z.string().min(1, { message: "اسم المستخدم مطلوب" }),
  password: z.string().min(6, { message: "كلمة المرور يجب أن لا تقل عن 6 أحرف" }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();
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
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.token && result.user) {
        login(result.token, result.user);
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً ${result.user.username}!`,
        });
        router.push("/"); // Redirect to dashboard or intended page
      } else {
        toast({
          title: "فشل تسجيل الدخول",
          description: result.error || "بيانات الاعتماد غير صحيحة أو حدث خطأ ما.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "خطأ في الاتصال",
        description: error.message || "تعذر الاتصال بالخادم. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                <Mail className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground icon-directional" />
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
                <Lock className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground icon-directional" />
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
      </Card>
    </div>
  );
}
