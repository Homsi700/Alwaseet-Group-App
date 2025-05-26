import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Archive } from "lucide-react";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">إدارة المخزون</h1>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Archive className="ml-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على المخزون
          </CardTitle>
          <CardDescription>
            مراقبة مستويات المخزون، وتتبع حركات المخزون، وإدارة تنوعات المنتجات، وإجراء تعديلات على المخزون. هذا القسم قيد التطوير حاليًا.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-8 text-center">
            <Archive className="h-16 w-16 text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">وحدة المخزون قادمة قريبًا!</h3>
            <p className="text-muted-foreground max-w-md">
              نحن نبني أدوات قوية لإدارة المخزون. يرجى التحقق مرة أخرى لاحقًا للحصول على الوظائف الكاملة.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
