
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">إدارة المبيعات</h1>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على المبيعات
          </CardTitle>
          <CardDescription>
            تتبع طلبات المبيعات، وإنشاء الفواتير، وإدارة مدفوعات العملاء، وتحليل أداء المبيعات. هذا القسم قيد التطوير حاليًا.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-8 text-center">
            <TrendingUp className="h-16 w-16 text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">وحدة المبيعات قادمة قريبًا!</h3>
            <p className="text-muted-foreground max-w-md">
              نحن نعمل بجد لنقدم لك تجربة إدارة مبيعات شاملة. ترقبوا التحديثات.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
