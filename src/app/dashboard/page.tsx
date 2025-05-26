'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconCard } from '@/components/ui/IconCard';
import { dashboardGridItems, dashboardQuickAccessItems } from '@/components/layout/nav-items';
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react';

interface Kpi {
  title: string;
  value: string;
  icon: React.ElementType;
  change?: string;
  changeType?: 'positive' | 'negative';
  description?: string;
}

const kpis: Kpi[] = [
  { title: "إجمالي المبيعات", value: "125,670 ريال", icon: DollarSign, change: "+5.2% هذا الشهر", changeType: 'positive', description: "إجمالي المبيعات من جميع الفروع" },
  { title: "عدد الفواتير", value: "1,280", icon: ShoppingCart, change: "+8.1% هذا الشهر", changeType: 'positive', description: "عدد عمليات البيع" },
  { title: "العملاء النشطين", value: "350", icon: Users, change: "-1.5% هذا الشهر", changeType: 'negative', description: "العملاء ذوو النشاط الحديث" },
  { title: "المنتجات المتوفرة", value: "2,400", icon: Package, change: "+200 صنف", changeType: 'positive', description: "إجمالي المنتجات المتوفرة" },
];

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">لوحة التحكم</h1>
      </div>

      <section aria-labelledby="kpi-title">
        <h2 id="kpi-title" className="text-2xl font-semibold mb-4 text-foreground sr-only">مؤشرات الأداء الرئيسية</h2>
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
                <kpi.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                {kpi.change && (
                  <p className={`text-xs ${kpi.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                    {kpi.change}
                  </p>
                )}
                {kpi.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {kpi.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="quick-access-title">
        <h2 id="quick-access-title" className="text-2xl font-semibold mb-4 text-foreground">الوصول السريع</h2>
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardQuickAccessItems.map((item) => (
            <IconCard
              key={item.title}
              title={item.title}
              icon={item.icon}
              href={item.href}
              description={item.description}
              variant="default"
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="modules-title">
        <h2 id="modules-title" className="text-2xl font-semibold mb-4 text-foreground">وحدات النظام</h2>
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {dashboardGridItems.map((item) => (
            <IconCard
              key={item.title}
              title={item.title}
              icon={item.icon}
              href={item.href}
              description={item.description}
              variant="outline"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
