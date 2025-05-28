
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Landmark, BookOpen, FilePlus, Banknote, LineChart } from "lucide-react";
import Link from "next/link";

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">الإدارة المالية</h1>
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Landmark className="ml-3 rtl:mr-3 h-7 w-7 text-primary icon-directional" />
            نظرة عامة على المالية
          </CardTitle>
          <CardDescription>
            إدارة دليل الحسابات الخاص بك، تسجيل قيود اليومية، تسوية كشوفات الحساب البنكية، ومراقبة الوضع المالي العام.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link href="/finance/chart-of-accounts" passHref>
              <Button variant="outline" className="w-full h-20 text-lg rounded-md justify-start p-4 hover:bg-accent/10">
                <BookOpen className="ml-3 rtl:mr-3 h-6 w-6 text-accent icon-directional" /> دليل الحسابات
              </Button>
            </Link>
            <Link href="/finance/journal-entries" passHref>
              <Button variant="outline" className="w-full h-20 text-lg rounded-md justify-start p-4 hover:bg-accent/10">
                <FilePlus className="ml-3 rtl:mr-3 h-6 w-6 text-accent icon-directional" /> قيود اليومية
              </Button>
            </Link>
             <Link href="/finance/bank-reconciliation" passHref>
              <Button variant="outline" className="w-full h-20 text-lg rounded-md justify-start p-4 hover:bg-accent/10">
                <Banknote className="ml-3 rtl:mr-3 h-6 w-6 text-accent icon-directional" /> المطابقات البنكية
              </Button>
            </Link>
            <Link href="/finance/financial-statements" passHref>
              <Button variant="outline" className="w-full h-20 text-lg rounded-md justify-start p-4 hover:bg-accent/10">
                <LineChart className="ml-3 rtl:mr-3 h-6 w-6 text-accent icon-directional" /> القوائم المالية
              </Button>
            </Link>
          </div>
           <p className="text-sm text-muted-foreground mt-8">
            هذه الوحدة هي قلب النظام المحاسبي، حيث يمكنك إدارة جميع معاملاتك المالية بدقة وكفاءة،
            واستخراج التقارير اللازمة لاتخاذ قرارات مستنيرة.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
