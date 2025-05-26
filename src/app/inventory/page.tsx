import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Archive } from "lucide-react";

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Archive className="mr-3 h-7 w-7 text-primary" />
            Inventory Overview
          </CardTitle>
          <CardDescription>
            Monitor stock levels, track inventory movements, manage product variations, and perform stock adjustments. This section is currently under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-8 text-center">
            <Archive className="h-16 w-16 text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Inventory Module Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              We're building robust inventory management tools. Please check back later for full functionality.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
