
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react"; // Renamed to avoid conflict

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">إعدادات التطبيق</h1>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على الإعدادات
          </CardTitle>
          <CardDescription>
            تكوين تفضيلات التطبيق، وأدوار المستخدمين وصلاحياتهم، وتفاصيل الشركة، وإعدادات الضرائب، والتكاملات. هذا القسم قيد التطوير حاليًا.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-8 text-center">
            <SettingsIcon className="h-16 w-16 text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">وحدة الإعدادات قادمة قريبًا!</h3>
            <p className="text-muted-foreground max-w-md">
              نحن نعمل على توفير خيارات إعدادات شاملة لتطبيقك. يرجى التحقق مرة أخرى قريبًا.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
