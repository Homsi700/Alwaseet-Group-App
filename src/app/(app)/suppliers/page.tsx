
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck } from "lucide-react";

export default function SuppliersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">إدارة الموردين</h1>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على الموردين
          </CardTitle>
          <CardDescription>
            تتبع مورديك، وإدارة معلومات الاتصال، ومراقبة سجل الشراء، وتقييم أداء الموردين. هذا القسم قيد التطوير حاليًا.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-8 text-center">
            <Truck className="h-16 w-16 text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">وحدة الموردين قادمة قريبًا!</h3>
            <p className="text-muted-foreground max-w-md">
              نحن نعزز أدوات إدارة الموردين لدينا. ستتوفر الميزات الكاملة قريبًا.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
