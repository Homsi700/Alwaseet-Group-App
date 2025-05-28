
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Landmark } from "lucide-react";

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">الإدارة المالية</h1>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Landmark className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على المالية
          </CardTitle>
          <CardDescription>
            إدارة دليل الحسابات الخاص بك، وتسجيل قيود اليومية، وتسوية كشوفات الحساب البنكية، ومراقبة الوضع المالي العام. هذا القسم قيد التطوير حاليًا.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-8 text-center">
            <Landmark className="h-16 w-16 text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">الوحدة المالية قادمة قريبًا!</h3>
            <p className="text-muted-foreground max-w-md">
              يجري تطوير أدوات إدارة مالية شاملة. ترقبوا التحديثات المثيرة.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
