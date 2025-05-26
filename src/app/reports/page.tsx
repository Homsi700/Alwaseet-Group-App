import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChartBig } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChartBig className="mr-3 h-7 w-7 text-primary" />
            Reporting Overview
          </CardTitle>
          <CardDescription>
            Generate insightful business reports on sales, expenses, profit & loss, balance sheets, and more. This section is currently under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-8 text-center">
            <BarChartBig className="h-16 w-16 text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Reporting Module Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              Powerful reporting and analytics features are under construction to provide you with valuable business insights.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
