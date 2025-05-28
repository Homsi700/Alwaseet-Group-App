
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Download, Upload } from "lucide-react"; 
import { useToast } from "@/hooks/use-toast";
import React, { useState, useRef } from "react";

export default function BackupRestorePage() {
  const { toast } = useToast();
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    setIsBackingUp(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const dummyContent = "This is a dummy backup file for Al Wasit Accounting.";
    const blob = new Blob([dummyContent], { type: "application/zip" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `alwasit_backup_${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "بدء النسخ الاحتياطي",
      description: "جاري تنزيل النسخة الاحتياطية 'alwasit_backup.zip'.",
      action: <CheckCircle className="text-green-500" />,
    });
    setIsBackingUp(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      if (event.target.files[0].type === "application/zip" || event.target.files[0].name.endsWith(".zip")) {
        setBackupFile(event.target.files[0]);
      } else {
        toast({
          title: "نوع ملف غير صالح",
          description: "الرجاء تحديد ملف نسخ احتياطي من نوع .zip.",
          variant: "destructive",
        });
        setBackupFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = ""; 
        }
      }
    } else {
      setBackupFile(null);
    }
  };

  const handleRestore = async () => {
    if (!backupFile) {
      toast({
        title: "لم يتم تحديد ملف",
        description: "الرجاء تحديد ملف نسخ احتياطي للاستعادة.",
        variant: "destructive",
      });
      return;
    }

    setIsRestoring(true);
    await new Promise(resolve => setTimeout(resolve, 2500));
    toast({
      title: "نجحت الاستعادة",
      description: `تمت استعادة البيانات من ${backupFile.name}. قد يحتاج التطبيق إلى إعادة التحميل.`,
      action: <CheckCircle className="text-green-500" />,
    });
    setBackupFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; 
    }
    setIsRestoring(false);
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-foreground">النسخ الاحتياطي واستعادة البيانات</h1>
      
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center"><Download className="ml-2 rtl:mr-2 h-6 w-6 text-primary icon-directional" /> نسخ البيانات احتياطياً</CardTitle>
          <CardDescription>
            قم بإنشاء نسخة احتياطية من بيانات التطبيق الخاصة بك. سيؤدي هذا إلى إنشاء ملف مضغوط بامتداد .zip
            يحتوي على جميع معلوماتك الهامة. قم بتخزين هذا الملف في مكان آمن.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            تتضمن النسخ الاحتياطية عادةً: المنتجات، المعاملات، بيانات العملاء والموردين، والإعدادات الأساسية.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleBackup} disabled={isBackingUp} className="w-full sm:w-auto rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
            <Download className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> {isBackingUp ? "جاري النسخ الاحتياطي..." : "نسخ البيانات إلى ملف"}
          </Button>
        </CardFooter>
      </Card>

      <Separator />

      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center"><Upload className="ml-2 rtl:mr-2 h-6 w-6 text-accent icon-directional" /> استعادة البيانات</CardTitle>
          <CardDescription>
            استعد بيانات التطبيق الخاصة بك من ملف نسخ احتياطي تم إنشاؤه مسبقًا (.zip).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md flex items-start space-x-3 rtl:space-x-reverse">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive/90">
              <span className="font-semibold">تحذير:</span> ستؤدي استعادة البيانات إلى الكتابة فوق أي بيانات موجودة في التطبيق.
              لا يمكن التراجع عن هذا الإجراء. تابع بحذر وتأكد من تحديد ملف النسخ الاحتياطي الصحيح.
            </p>
          </div>
          <div>
            <Label htmlFor="backupFile" className="block mb-2 text-sm font-medium">حدد ملف النسخ الاحتياطي (.zip)</Label>
            <Input 
              id="backupFile" 
              ref={fileInputRef}
              type="file" 
              accept=".zip,application/zip,application/x-zip-compressed" 
              onChange={handleFileChange} 
              className="rounded-md file:ml-4 file:mr-0 rtl:file:mr-4 rtl:file:ml-0 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            {backupFile && <p className="text-sm text-muted-foreground mt-2">الملف المحدد: {backupFile.name} ({(backupFile.size / 1024).toFixed(2)} كيلوبايت)</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRestore} disabled={!backupFile || isRestoring} className="w-full sm:w-auto rounded-md bg-accent hover:bg-accent/90 text-accent-foreground">
            <Upload className="ml-2 rtl:mr-2 h-4 w-4 icon-directional" /> {isRestoring ? "جاري الاستعادة..." : "استعادة البيانات من ملف"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
