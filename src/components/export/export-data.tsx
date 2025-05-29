import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// تعريف أنواع البيانات
interface ExportDataProps {
  title: string;
  data: any[];
  columns: {
    header: string;
    accessor: string;
    format?: (value: any) => string;
  }[];
  fileName?: string;
  summary?: Record<string, any>;
  logo?: string;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function ExportData({
  title,
  data,
  columns,
  fileName = 'export',
  summary,
  logo,
  variant = 'outline',
  size = 'default',
}: ExportDataProps) {
  // تصدير إلى PDF
  const exportToPdf = () => {
    try {
      // إنشاء مستند PDF
      const doc = new jsPDF('p', 'mm', 'a4');
      
      // إضافة العنوان والتاريخ
      const currentDate = new Date().toLocaleDateString('ar-SA');
      
      // إضافة الشعار إذا كان متوفراً
      if (logo) {
        doc.addImage(logo, 'JPEG', 10, 10, 30, 30);
        doc.setFontSize(18);
        doc.text(title, 50, 25);
        doc.setFontSize(10);
        doc.text(`تاريخ التصدير: ${currentDate}`, 50, 35);
      } else {
        doc.setFontSize(18);
        doc.text(title, 10, 20);
        doc.setFontSize(10);
        doc.text(`تاريخ التصدير: ${currentDate}`, 10, 30);
      }
      
      // تحضير البيانات للجدول
      const tableData = data.map(item => {
        return columns.map(column => {
          const value = item[column.accessor];
          return column.format ? column.format(value) : value;
        });
      });
      
      // إضافة الجدول
      autoTable(doc, {
        head: [columns.map(column => column.header)],
        body: tableData,
        startY: logo ? 45 : 40,
        styles: {
          font: 'courier',
          fontSize: 10,
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
        margin: { top: 10 },
      });
      
      // إضافة ملخص إذا كان متوفراً
      if (summary) {
        const finalY = (doc as any).lastAutoTable.finalY || 40;
        doc.setFontSize(12);
        doc.text('الملخص:', 10, finalY + 10);
        
        let yPos = finalY + 20;
        Object.entries(summary).forEach(([key, value]) => {
          doc.text(`${key}: ${value}`, 20, yPos);
          yPos += 7;
        });
      }
      
      // حفظ الملف
      doc.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('خطأ في تصدير PDF:', error);
      alert('حدث خطأ أثناء تصدير البيانات إلى PDF');
    }
  };
  
  // تصدير إلى Excel
  const exportToExcel = () => {
    try {
      // تحضير البيانات
      const excelData = data.map(item => {
        const row: Record<string, any> = {};
        columns.forEach(column => {
          const value = item[column.accessor];
          row[column.header] = column.format ? column.format(value) : value;
        });
        return row;
      });
      
      // إضافة الملخص إذا كان متوفراً
      if (summary) {
        excelData.push({});  // صف فارغ
        excelData.push({ [columns[0].header]: 'الملخص:' });
        
        Object.entries(summary).forEach(([key, value]) => {
          excelData.push({ [columns[0].header]: `${key}: ${value}` });
        });
      }
      
      // إنشاء ورقة عمل
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // إنشاء مصنف عمل
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, title);
      
      // حفظ الملف
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
    } catch (error) {
      console.error('خطأ في تصدير Excel:', error);
      alert('حدث خطأ أثناء تصدير البيانات إلى Excel');
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          {size === 'icon' ? (
            <Download className="h-4 w-4" />
          ) : (
            <>
              <Download className="ml-2 h-4 w-4" />
              تصدير
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPdf}>
          <FileText className="ml-2 h-4 w-4" />
          <span>تصدير كـ PDF</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="ml-2 h-4 w-4" />
          <span>تصدير كـ Excel</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}