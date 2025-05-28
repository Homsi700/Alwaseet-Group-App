
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, Building, Users2, Palette, ShieldCheck, Percent } from "lucide-react"; // Renamed to avoid conflict
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground">إعدادات التطبيق</h1>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على الإعدادات
          </CardTitle>
          <CardDescription>
            تكوين تفضيلات التطبيق، وأدوار المستخدمين وصلاحياتهم، وتفاصيل الشركة، وإعدادات الضرائب، والتكاملات.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* قسم إعدادات الشركة */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Building className="h-6 w-6 text-accent"/>
              <h3 className="text-xl font-semibold text-foreground">إعدادات الشركة</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              إدارة معلومات شركتك الأساسية مثل الاسم، العنوان، الرقم الضريبي، والشعار.
            </p>
            <Button variant="outline" className="rounded-md">تعديل معلومات الشركة</Button>
          </div>

          <Separator />

          {/* قسم إدارة المستخدمين والصلاحيات */}
          <div className="space-y-3">
             <div className="flex items-center gap-3">
              <Users2 className="h-6 w-6 text-accent"/>
              <h3 className="text-xl font-semibold text-foreground">إدارة المستخدمين والصلاحيات</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              إضافة مستخدمين جدد، تعديل معلومات المستخدمين الحاليين، وتعيين الأدوار والصلاحيات لكل مستخدم.
            </p>
            <Link href="/settings/users-roles" passHref>
                <Button variant="outline" className="rounded-md">الانتقال إلى إدارة المستخدمين</Button>
            </Link>
          </div>
          
          <Separator />

          {/* قسم التخصيص والمظهر */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Palette className="h-6 w-6 text-accent"/>
              <h3 className="text-xl font-semibold text-foreground">التخصيص والمظهر</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              تخصيص مظهر التطبيق، بما في ذلك الألوان (السمات)، وإعدادات اللغة الافتراضية.
            </p>
            {/* أزرار تبديل اللغة والسمة موجودة في الرأس حالياً */}
             <Button variant="outline" className="rounded-md">إعدادات التنسيق واللغة</Button>
          </div>

          <Separator />

           {/* قسم الضرائب */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Percent className="h-6 w-6 text-accent"/>
              <h3 className="text-xl font-semibold text-foreground">إعدادات الضرائب</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              تكوين نسب الضرائب المطبقة (مثل ضريبة القيمة المضافة) وكيفية حسابها في الفواتير.
            </p>
            <Button variant="outline" className="rounded-md">إدارة إعدادات الضرائب</Button>
          </div>


        </CardContent>
        <CardFooter>
            <p className="text-xs text-muted-foreground">
                سيتم إضافة المزيد من خيارات الإعدادات المتقدمة في التحديثات القادمة.
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
