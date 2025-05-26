import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";

export default function PurchasesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Purchases Management</h1>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingBag className="mr-3 h-7 w-7 text-primary" />
            Purchases Overview
          </CardTitle>
          <CardDescription>
            Manage purchase orders, track supplier bills, record payments, and oversee procurement. This section is currently under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-8 text-center">
            <ShoppingBag className="h-16 w-16 text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Purchases Module Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              Our team is developing features for efficient purchase management. Check back for updates.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
