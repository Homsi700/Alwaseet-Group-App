import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">إدارة العملاء</h1>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="ml-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على العملاء
          </CardTitle>
          <CardDescription>
            قم بإدارة قاعدة بيانات عملائك، وتتبع سجل الشراء، وإدارة الاتصالات، وتقسيم العملاء. هذا القسم قيد التطوير حاليًا.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-8 text-center">
            <Users className="h-16 w-16 text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">وحدة العملاء قادمة قريبًا!</h3>
            <p className="text-muted-foreground max-w-md">
              ميزات إدارة علاقات العملاء المتقدمة في طريقها إليك. شكرا لك على صبرك.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
