
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChartBig, TrendingUp, Package, Users, LandmarkIcon, FilePieChart } from "lucide-react";
import Link from "next/link";

const reportItems = [
  { title: "تقرير المبيعات", icon: TrendingUp, description: "تحليل المبيعات حسب الفترة، المنتج، أو العميل.", href: "/reports/sales" },
  { title: "تقرير المخزون", icon: Package, description: "عرض حالة المخزون، حركة المواد، وتقييم المخزون.", href: "/reports/inventory" },
  { title: "تقرير العملاء", icon: Users, description: "متابعة أرصدة العملاء وتحليل سلوكهم الشرائي.", href: "/reports/customers" },
  { title: "تقرير الأرباح والخسائر", icon: FilePieChart, description: "عرض قائمة الدخل لفترة محددة.", href: "/reports/profit-loss" },
  { title: "الميزانية العمومية", icon: LandmarkIcon, description: "عرض المركز المالي للشركة في تاريخ معين.", href: "/reports/balance-sheet" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">التقارير والتحليلات</h1>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChartBig className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على التقارير
          </CardTitle>
          <CardDescription>
            إنشاء تقارير أعمال ثاقبة حول المبيعات، والنفقات، والأرباح والخسائر، والميزانيات العمومية، والمزيد.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportItems.map((item) => (
              <Link key={item.title} href={item.href} passHref>
                <Card className="hover:shadow-md transition-shadow rounded-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-md font-medium text-primary">{item.title}</CardTitle>
                    <item.icon className="h-5 w-5 text-accent" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-8">
            استفد من هذه التقارير للحصول على رؤى قيمة حول أداء عملك واتخاذ قرارات استراتيجية.
            سيتم تطوير المزيد من التقارير المخصصة بناءً على احتياجاتك.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
