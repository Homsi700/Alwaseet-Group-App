/**
 * واجهة برمجة التطبيقات (API) لاستدعاء الإجراء المخزن لإنشاء فاتورة
 * POST /api/rpc/sales/createInvoice
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeProcedure } from '@/lib/db';
import { Schema } from '@/lib/db-schema';
import { validateUser, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { CreateInvoiceRequest, CreateInvoiceResponse } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    // التحقق من المستخدم
    const { error, user } = await validateUser(req);
    if (error) return error;

    // استخراج بيانات الفاتورة من الطلب
    const body = await req.json() as CreateInvoiceRequest;
    
    console.log('[api/rpc/sales/createInvoice.ts] بيانات الفاتورة المستلمة:', body);
    
    // التحقق من وجود بيانات الفاتورة والمنتجات
    if (!body.invoice || !body.items || !Array.isArray(body.items)) {
      return createErrorResponse('بيانات الفاتورة غير صالحة');
    }
    
    // إعداد معلمات الإجراء المخزن
    const params = {
      // معلومات الفاتورة
      InvoiceNumber: body.invoice.invoiceNumber,
      InvoiceDate: body.invoice.invoiceDate || new Date().toISOString(),
      CustomerId: body.invoice.customerId,
      PaymentMethod: body.invoice.paymentMethod || 'نقدي',
      DiscountPercent: body.invoice.discountPercent || 0,
      TaxPercent: body.invoice.taxPercent || 0,
      AmountPaid: body.invoice.amountPaid || 0,
      Status: body.invoice.status || 'Unpaid',
      Notes: body.invoice.notes || null,
      CompanyId: user.companyId,
      CreatedBy: user.userId,
      
      // معلومات المنتجات (يتم تمريرها كسلسلة JSON)
      ItemsJson: JSON.stringify(body.items.map(item => ({
        ProductId: item.productId,
        Quantity: item.quantity,
        UnitPrice: item.unitPrice,
        DiscountPercent: item.discountPercent || 0,
        TaxPercent: item.taxPercent || 0
      })))
    };
    
    // استدعاء الإجراء المخزن
    const result = await executeProcedure<any>(Schema.procedures.createInvoice, params);
    
    console.log('[api/rpc/sales/createInvoice.ts] نتيجة الإجراء المخزن:', result);
    
    // التحقق من وجود نتائج
    if (!result || !result[0]) {
      throw new Error('لم يتم إرجاع أي نتائج من الإجراء المخزن');
    }
    
    // إعداد الاستجابة
    const response: CreateInvoiceResponse = {
      invoice: result[0].invoice,
      items: result[0].items || []
    };
    
    return createSuccessResponse(response, 'تم إنشاء الفاتورة بنجاح', 201);
  } catch (error: any) {
    console.error('[api/rpc/sales/createInvoice.ts] خطأ في إنشاء الفاتورة:', error);
    return createErrorResponse('حدث خطأ أثناء إنشاء الفاتورة', error.message);
  }
}