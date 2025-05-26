import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Customer Management</h1>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="mr-3 h-7 w-7 text-primary" />
            Customers Overview
          </CardTitle>
          <CardDescription>
            Maintain your customer database, track purchase history, manage communications, and segment customers. This section is currently under development.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="min-h-[300px] flex flex-col items-center justify-center bg-muted/30 rounded-md p-8 text-center">
            <Users className="h-16 w-16 text-primary/50 mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Customer Module Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
              Advanced customer relationship management features are on their way. Thank you for your patience.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
