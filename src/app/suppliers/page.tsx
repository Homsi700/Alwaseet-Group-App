import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Truck } from "lucide-react";

export default function SuppliersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Supplier Management</h1>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="mr-3 h-7 w-7 text-primary" />
            Suppliers Overview
          </CardTitle>
          <CardDescription>
            Keep track of your suppliers, manage contact information, monitor purchase history, and evaluate supplier performance. This section is currently under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-8 text-center">
            <Truck className="h-16 w-16 text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Supplier Module Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              We are enhancing our supplier management tools. Full features will be available soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
