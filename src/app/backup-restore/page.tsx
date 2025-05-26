"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle, Download, Upload } from "lucide-react"; // Changed AlertCircle to AlertTriangle for warning
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
    // Simulate backup process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate file download
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
      title: "Backup Initiated",
      description: "Your data backup 'alwasit_backup.zip' is downloading.",
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
          title: "Invalid File Type",
          description: "Please select a .zip backup file.",
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
        title: "No File Selected",
        description: "Please select a backup file to restore.",
        variant: "destructive",
      });
      return;
    }

    setIsRestoring(true);
    // Simulate restore process
    await new Promise(resolve => setTimeout(resolve, 2500));
    toast({
      title: "Restore Successful",
      description: `Data has been restored from ${backupFile.name}. The application might need to reload.`,
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
      <h1 className="text-3xl font-bold text-foreground">Backup and Restore Data</h1>
      
      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center"><Download className="mr-2 h-6 w-6 text-primary" /> Backup Data</CardTitle>
          <CardDescription>
            Create a backup of your application data. This will generate a compressed .zip file
            containing all your important information. Store this file in a safe and secure location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Backups typically include: Products, transactions, customer & supplier data, and essential settings.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleBackup} disabled={isBackingUp} className="w-full sm:w-auto rounded-md bg-primary hover:bg-primary/90 text-primary-foreground">
            <Download className="mr-2 h-4 w-4" /> {isBackingUp ? "Backing up..." : "Backup Data to File"}
          </Button>
        </CardFooter>
      </Card>

      <Separator />

      <Card className="shadow-lg rounded-lg border-border">
        <CardHeader>
          <CardTitle className="flex items-center"><Upload className="mr-2 h-6 w-6 text-accent" /> Restore Data</CardTitle>
          <CardDescription>
            Restore your application data from a previously created backup file (.zip).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-md flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive/90">
              <span className="font-semibold">Warning:</span> Restoring data will overwrite any existing data in the application.
              This action cannot be undone. Proceed with caution and ensure you have selected the correct backup file.
            </p>
          </div>
          <div>
            <Label htmlFor="backupFile" className="block mb-2 text-sm font-medium">Select Backup File (.zip)</Label>
            <Input 
              id="backupFile" 
              ref={fileInputRef}
              type="file" 
              accept=".zip,application/zip,application/x-zip-compressed" 
              onChange={handleFileChange} 
              className="rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            {backupFile && <p className="text-sm text-muted-foreground mt-2">Selected file: {backupFile.name} ({(backupFile.size / 1024).toFixed(2)} KB)</p>}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRestore} disabled={!backupFile || isRestoring} className="w-full sm:w-auto rounded-md bg-accent hover:bg-accent/90 text-accent-foreground">
            <Upload className="mr-2 h-4 w-4" /> {isRestoring ? "Restoring..." : "Restore Data from File"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
