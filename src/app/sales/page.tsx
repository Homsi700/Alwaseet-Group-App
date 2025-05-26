import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Sales Management</h1>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-3 h-7 w-7 text-primary" />
            Sales Overview
          </CardTitle>
          <CardDescription>
            Track sales orders, create invoices, manage customer payments, and analyze sales performance. This section is currently under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-8 text-center">
            <TrendingUp className="h-16 w-16 text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Sales Module Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              We are working hard to bring you a comprehensive sales management experience. Stay tuned for updates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
