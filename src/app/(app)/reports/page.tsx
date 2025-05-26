import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChartBig } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">التقارير والتحليلات</h1>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChartBig className="ml-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على التقارير
          </CardTitle>
          <CardDescription>
            إنشاء تقارير أعمال ثاقبة حول المبيعات، والنفقات، والأرباح والخسائر، والميزانيات العمومية، والمزيد. هذا القسم قيد التطوير حاليًا.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-8 text-center">
            <BarChartBig className="h-16 w-16 text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">وحدة التقارير قادمة قريبًا!</h3>
            <p className="text-muted-foreground max-w-md">
              يجري بناء ميزات تقارير وتحليلات قوية لتزويدك برؤى أعمال قيمة.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
