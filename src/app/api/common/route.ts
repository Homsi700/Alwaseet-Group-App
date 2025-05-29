/**
 * واجهة برمجة التطبيقات (API) للبيانات المشتركة
 * GET /api/common
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateUser, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { InvoiceStatus } from '@/lib/types';

/**
 * الحصول على البيانات المشتركة
 * GET /api/common
 */
export async function GET(req: NextRequest) {
  try {
    // التحقق من المستخدم
    const { error, user } = await validateUser(req);
    if (error) return error;

    // استخراج نوع البيانات المطلوبة من الاستعلام
    const searchParams = req.nextUrl.searchParams;
    const dataType = searchParams.get('type');
    
    // التحقق من وجود نوع البيانات
    if (!dataType) {
      return createErrorResponse('يجب تحديد نوع البيانات المطلوبة');
    }
    
    // إعداد البيانات المطلوبة
    let data;
    
    switch (dataType) {
      case 'paymentMethods':
        // قائمة طرق الدفع
        data = [
          { id: 'cash', name: 'نقدي' },
          { id: 'creditCard', name: 'بطاقة ائتمان' },
          { id: 'bankTransfer', name: 'تحويل بنكي' },
          { id: 'check', name: 'شيك' },
        ];
        break;
        
      case 'invoiceStatuses':
        // قائمة حالات الفواتير
        data = Object.values(InvoiceStatus).map(status => {
          let name;
          switch (status) {
            case InvoiceStatus.Draft:
              name = 'مسودة';
              break;
            case InvoiceStatus.Pending:
              name = 'معلقة';
              break;
            case InvoiceStatus.Completed:
              name = 'مكتملة';
              break;
            case InvoiceStatus.Cancelled:
              name = 'ملغاة';
              break;
            case InvoiceStatus.Refunded:
              name = 'مستردة';
              break;
            case InvoiceStatus.Unpaid:
              name = 'غير مدفوعة';
              break;
            case InvoiceStatus.PartiallyPaid:
              name = 'مدفوعة جزئياً';
              break;
            case InvoiceStatus.Paid:
              name = 'مدفوعة';
              break;
            default:
              name = status;
          }
          
          return { id: status, name };
        });
        break;
        
      case 'currencies':
        // قائمة العملات
        data = [
          { code: 'SAR', symbol: 'ر.س', name: 'ريال سعودي' },
          { code: 'USD', symbol: '$', name: 'دولار أمريكي' },
          { code: 'EUR', symbol: '€', name: 'يورو' },
          { code: 'GBP', symbol: '£', name: 'جنيه إسترليني' },
          { code: 'AED', symbol: 'د.إ', name: 'درهم إماراتي' },
          { code: 'KWD', symbol: 'د.ك', name: 'دينار كويتي' },
          { code: 'BHD', symbol: 'د.ب', name: 'دينار بحريني' },
          { code: 'QAR', symbol: 'ر.ق', name: 'ريال قطري' },
          { code: 'OMR', symbol: 'ر.ع', name: 'ريال عماني' },
          { code: 'EGP', symbol: 'ج.م', name: 'جنيه مصري' },
          { code: 'JOD', symbol: 'د.أ', name: 'دينار أردني' },
        ];
        break;
        
      case 'unitsOfMeasure':
        // قائمة وحدات القياس
        data = [
          { id: 'piece', name: 'قطعة' },
          { id: 'box', name: 'صندوق' },
          { id: 'kg', name: 'كيلوجرام' },
          { id: 'g', name: 'جرام' },
          { id: 'l', name: 'لتر' },
          { id: 'ml', name: 'مليلتر' },
          { id: 'm', name: 'متر' },
          { id: 'cm', name: 'سنتيمتر' },
          { id: 'mm', name: 'مليمتر' },
          { id: 'm2', name: 'متر مربع' },
          { id: 'm3', name: 'متر مكعب' },
          { id: 'hour', name: 'ساعة' },
          { id: 'day', name: 'يوم' },
          { id: 'month', name: 'شهر' },
          { id: 'year', name: 'سنة' },
        ];
        break;
        
      default:
        return createErrorResponse(`نوع البيانات غير معروف: ${dataType}`);
    }
    
    return createSuccessResponse(data);
  } catch (error: any) {
    console.error('[api/common/route.ts] خطأ في الحصول على البيانات المشتركة:', error);
    return createErrorResponse('حدث خطأ أثناء الحصول على البيانات المشتركة', error.message);
  }
}