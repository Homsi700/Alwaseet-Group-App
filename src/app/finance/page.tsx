import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Landmark } from "lucide-react";

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Finance Management</h1>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Landmark className="mr-3 h-7 w-7 text-primary" />
            Finance Overview
          </CardTitle>
          <CardDescription>
            Manage your chart of accounts, record journal entries, reconcile bank statements, and monitor overall financial health. This section is currently under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-8 text-center">
            <Landmark className="h-16 w-16 text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Finance Module Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              Comprehensive financial management tools are being developed. Stay tuned for exciting updates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
