
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

export default function PurchasesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">إدارة المشتريات</h1>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBag className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على المشتريات
          </CardTitle>
          <CardDescription>
            إدارة أوامر الشراء، وتتبع فواتير الموردين، وتسجيل المدفوعات، والإشراف على عمليات الشراء. هذا القسم قيد التطوير حاليًا.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-8 text-center">
            <ShoppingBag className="h-16 w-16 text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">وحدة المشتريات قادمة قريبًا!</h3>
            <p className="text-muted-foreground max-w-md">
              يقوم فريقنا بتطوير ميزات لإدارة المشتريات بكفاءة. تحقق مرة أخرى للحصول على التحديثات.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
