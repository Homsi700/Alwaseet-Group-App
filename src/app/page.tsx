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

const kpis: Kpi[] = [
  { title: "Total Revenue", value: "$125,670", icon: DollarSign, change: "+5.2% this month", changeType: 'positive', description: "Revenue generated from all sales" },
  { title: "Total Sales", value: "1,280", icon: ShoppingCart, change: "+8.1% this month", changeType: 'positive', description: "Number of sales transactions" },
  { title: "Active Customers", value: "350", icon: Users, change: "-1.5% this month", changeType: 'negative', description: "Customers with recent activity" },
  { title: "Products in Stock", value: "2,400", icon: Package, change: "+200 units", changeType: 'positive', description: "Total quantity of products available" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Al Wasit Accounting Dashboard
        </h1>
        <p className="text-lg text-muted-foreground mt-1">
          Welcome back! Here's an overview of your business.
        </p>
      </header>
      
      <section aria-labelledby="kpi-title">
        <h2 id="kpi-title" className="text-2xl font-semibold mb-4 text-foreground sr-only">Key Performance Indicators</h2>
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
        <h2 id="quick-access-title" className="text-2xl font-semibold mb-4 text-foreground">Quick Access</h2>
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardQuickAccessItems.map(item => (
            item.description && (
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
        <h2 id="modules-title" className="text-2xl font-semibold mb-4 text-foreground">Modules</h2>
        <div className="grid gap-4 md:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {dashboardGridItems.map(item => (
             item.description && (
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
