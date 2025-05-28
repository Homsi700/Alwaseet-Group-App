
import { IconCard } from "@/components/ui/IconCard";
import { dashboardGridItems, dashboardQuickAccessItems } from "@/components/layout/nav-items";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";

interface Kpi {
  title: string;
  value: string;
  icon: React.ElementType;
  change?: string;
  changeType?: 'positive' | 'negative';
  description?: string;
}

// تم تحديث البيانات لتكون باللغة العربية
const kpis: Kpi[] = [
  { title: "إجمالي الإيرادات", value: "١٢٥٬٦٧٠ ر.س", icon: DollarSign, change: "+٥.٢٪ هذا الشهر", changeType: 'positive', description: "الإيرادات المتولدة من جميع المبيعات" },
  { title: "إجمالي المبيعات", value: "١٬٢٨٠", icon: ShoppingCart, change: "+٨.١٪ هذا الشهر", changeType: 'positive', description: "عدد معاملات البيع" },
  { title: "العملاء النشطون", value: "٣٥٠", icon: Users, change: "-١.٥٪ هذا الشهر", changeType: 'negative', description: "العملاء ذوو النشاط الأخير" },
  { title: "المنتجات في المخزن", value: "٢٬٤٠٠", icon: Package, change: "+٢٠٠ وحدة", changeType: 'positive', description: "إجمالي كمية المنتجات المتاحة" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          لوحة تحكم محاسبي
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          مرحباً بعودتك! إليك نظرة عامة على عملك.
        </p>
      </header>
      
      <section aria-labelledby="kpi-title">
        <h2 id="kpi-title" className="text-2xl font-semibold mb-4 text-foreground sr-only">مؤشرات الأداء الرئيسية</h2>
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title} className="shadow-md rounded-lg border-border hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <kpi.icon className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl md:text-3xl font-bold text-primary">{kpi.value}</div>
                {kpi.change && (
                  <p className={`text-xs mt-1 ${kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="quick-access-title">
        <h2 id="quick-access-title" className="text-2xl font-semibold mb-4 text-foreground">وصول سريع</h2>
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardQuickAccessItems.map(item => (
            item.description && ( // التأكد من وجود الوصف قبل عرض البطاقة
              <IconCard
                key={item.href}
                title={item.title}
                description={item.description}
                icon={item.icon}
                href={item.href}
              />
            )
          ))}
        </div>
      </section>

      <section aria-labelledby="modules-title">
        <h2 id="modules-title" className="text-2xl font-semibold mb-4 text-foreground">الوحدات النمطية</h2>
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {dashboardGridItems.map(item => (
             item.description && ( // التأكد من وجود الوصف قبل عرض البطاقة
              <IconCard
                key={item.href}
                title={item.title}
                description={item.description}
                icon={item.icon}
                href={item.href}
              />
            )
          ))}
        </div>
      </section>
    </div>
  );
}
