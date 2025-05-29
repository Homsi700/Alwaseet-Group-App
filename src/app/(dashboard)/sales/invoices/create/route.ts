/**
 * واجهة برمجة التطبيقات (API) لإنشاء فاتورة جديدة
 * تتعامل مع طلبات POST لإنشاء فاتورة جديدة
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/db';
import { Schema, CommonQueries } from '@/lib/db-schema';
import { 
  validateUser, 
  validateCustomer, 
  validateProducts, 
  generateInvoiceNumber, 
  calculateInvoiceTotals,
  determineInvoiceStatus,
  createSuccessResponse, 
  createErrorResponse 
} from '@/lib/api-utils';
import { CreateInvoiceRequest, CreateInvoiceResponse, InvoiceStatus } from '@/lib/types';

/**
 * إنشاء فاتورة جديدة
 * POST /sales/invoices/create
 */
export async function POST(req: NextRequest) {
  try {
    // التحقق من المستخدم
    const { error, user } = await validateUser(req);
    if (error) return error;

    // استخراج بيانات الفاتورة من الطلب
    const body = await req.json() as CreateInvoiceRequest;
    
    console.log('[sales/invoices/create/route.ts] بيانات الفاتورة المستلمة:', body);
    
    // التحقق من وجود بيانات الفاتورة والمنتجات
    if (!body.invoice || !body.items || !Array.isArray(body.items)) {
      return createErrorResponse('بيانات الفاتورة غير صالحة');
    }
    
    // التحقق من وجود العميل
    const customerValidation = await validateCustomer(body.invoice.customerId);
    if (!customerValidation.valid) {
      return createErrorResponse(customerValidation.error || 'العميل غير صالح');
    }
    
    // التحقق من وجود المنتجات
    const productsValidation = await validateProducts(body.items);
    if (!productsValidation.valid) {
      return createErrorResponse(productsValidation.error || 'المنتجات غير صالحة');
    }
    
    // استخدام المنتجات الصالحة فقط
    const validItems = productsValidation.validItems;
    
    // إنشاء رقم فاتورة فريد إذا لم يتم توفيره
    const invoiceNumber = body.invoice.invoiceNumber || generateInvoiceNumber();
    
    // حساب إجماليات الفاتورة
    const { subTotal, totalDiscountAmount, totalTaxAmount, totalAmount } = calculateInvoiceTotals(validItems);
    
    // تحديد المبلغ المدفوع والمبلغ المستحق
    const amountPaid = body.invoice.amountPaid || 0;
    const amountDue = totalAmount - amountPaid;
    
    // تحديد حالة الفاتورة
    const status = determineInvoiceStatus(totalAmount, amountPaid, body.invoice.status);
    
    // إعداد معاملة قاعدة البيانات
    try {
      // إعداد استعلامات المعاملة
      const transactionQueries = [];
      
      // استعلام إدراج الفاتورة
      const insertInvoiceQuery = CommonQueries.createInvoice;
      
      // معلمات الفاتورة
      const invoiceParams = {
        invoiceNumber,
        invoiceDate: body.invoice.invoiceDate || new Date().toISOString(),
        customerId: customerValidation.customerId,
        paymentMethod: body.invoice.paymentMethod || 'نقدي',
        subTotal,
        discountPercent: body.invoice.discountPercent || 0,
        discountAmount: totalDiscountAmount,
        taxPercent: body.invoice.taxPercent || 0,
        taxAmount: totalTaxAmount,
        totalAmount,
        amountPaid,
        amountDue,
        status,
        notes: body.invoice.notes || null,
        companyId: user.companyId,
        createdBy: user.userId
      };
      
      // إضافة استعلام إدراج الفاتورة إلى المعاملة
      transactionQueries.push({ query: insertInvoiceQuery, params: invoiceParams });
      
      // تنفيذ المعاملة لإنشاء الفاتورة
      const transactionResults = await executeTransaction(transactionQueries);
      
      // التحقق من وجود نتائج
      if (!transactionResults || !transactionResults.length) {
        throw new Error('لم يتم إرجاع أي نتائج من قاعدة البيانات');
      }
      
      console.log('[sales/invoices/create/route.ts] نتيجة إدراج الفاتورة:', transactionResults[0]);
      
      // استخراج معرف الفاتورة الجديدة
      let newInvoiceId;
      
      try {
        // التحقق من شكل البيانات المرجعة
        if (Array.isArray(transactionResults[0]) && transactionResults[0].length > 0) {
          // إذا كانت النتيجة مصفوفة من السجلات
          newInvoiceId = transactionResults[0][0]?.invoiceId;
          console.log('[sales/invoices/create/route.ts] معرف الفاتورة من المصفوفة:', newInvoiceId);
        } else if (transactionResults[0] && typeof transactionResults[0] === 'object') {
          // إذا كانت النتيجة كائن واحد
          const firstResult = transactionResults[0] as any;
          // البحث عن خاصية تحتوي على معرف الفاتورة
          newInvoiceId = firstResult.invoiceId || firstResult.InvoiceId || firstResult.id || firstResult.Id;
          console.log('[sales/invoices/create/route.ts] معرف الفاتورة من الكائن:', newInvoiceId);
        }
        
        // محاولة أخرى للحصول على معرف الفاتورة إذا لم يتم العثور عليه
        if (!newInvoiceId && transactionResults[0]) {
          console.log('[sales/invoices/create/route.ts] محاولة استخراج معرف الفاتورة من:', JSON.stringify(transactionResults[0]));
          
          // محاولة البحث عن أي خاصية تحتوي على كلمة "id" أو "Id"
          const firstResultStr = JSON.stringify(transactionResults[0]);
          const idMatch = firstResultStr.match(/"([^"]*[iI]d)":\s*(\d+)/);
          if (idMatch && idMatch.length >= 3) {
            newInvoiceId = parseInt(idMatch[2]);
            console.log('[sales/invoices/create/route.ts] تم استخراج معرف الفاتورة من النص:', newInvoiceId);
          }
        }
      } catch (error) {
        console.error('[sales/invoices/create/route.ts] خطأ في استخراج معرف الفاتورة:', error);
      }
      
      // التحقق من وجود معرف الفاتورة
      if (!newInvoiceId) {
        throw new Error('لم يتم العثور على معرف الفاتورة الجديدة');
      }
      
      // إدراج بنود الفاتورة
      const itemsQueries = [];
      
      // إدراج عناصر الفاتورة
      for (const item of validItems) {
        // التأكد من أن معرف المنتج هو رقم صحيح
        const productId = typeof item.productId === 'string' ? parseInt(item.productId) : item.productId;
        
        // حساب قيم البند
        const quantity = item.quantity;
        const unitPrice = item.unitPrice || 0;
        const lineTotal = quantity * unitPrice;
        const discountPercent = item.discountPercent || 0;
        const discountAmount = (lineTotal * discountPercent) / 100;
        const taxPercent = item.taxPercent || 0;
        const taxAmount = ((lineTotal - discountAmount) * taxPercent) / 100;
        const finalLineTotal = lineTotal - discountAmount + taxAmount;
        
        // استعلام إدراج بند الفاتورة
        const insertItemQuery = CommonQueries.addInvoiceItem;
        
        // معلمات بند الفاتورة
        const itemParams = {
          invoiceId: newInvoiceId,
          productId,
          quantity,
          unitPrice,
          discountPercent,
          discountAmount,
          taxPercent,
          taxAmount,
          lineTotal: finalLineTotal
        };
        
        // إضافة استعلام إدراج بند الفاتورة إلى قائمة الاستعلامات
        itemsQueries.push({ query: insertItemQuery, params: itemParams });
        
        // تحديث كمية المنتج في المخزون
        const updateQuantityQuery = CommonQueries.updateProductQuantity;
        const updateQuantityParams = {
          productId,
          quantity
        };
        
        // إضافة استعلام تحديث كمية المنتج إلى قائمة الاستعلامات
        itemsQueries.push({ query: updateQuantityQuery, params: updateQuantityParams });
      }
      
      // تنفيذ استعلامات إدراج بنود الفاتورة وتحديث كميات المنتجات
      if (itemsQueries.length > 0) {
        await executeTransaction(itemsQueries);
      }
      
      // جلب الفاتورة المنشأة مع بنودها
      const invoiceQuery = CommonQueries.getInvoiceWithDetails;
      const invoice = await executeQuery(invoiceQuery, { invoiceId: newInvoiceId });
      
      const itemsQuery = CommonQueries.getInvoiceItems;
      const items = await executeQuery(itemsQuery, { invoiceId: newInvoiceId });
      
      // إعداد الاستجابة
      const response: CreateInvoiceResponse = {
        invoice: invoice[0],
        items
      };
      
      return createSuccessResponse(response, 'تم إنشاء الفاتورة بنجاح', 201);
    } catch (error: any) {
      console.error('[sales/invoices/create/route.ts] خطأ في إنشاء الفاتورة:', error);
      return createErrorResponse('حدث خطأ أثناء إنشاء الفاتورة', error.message);
    }
  } catch (error: any) {
    console.error('[sales/invoices/create/route.ts] خطأ عام:', error);
    return createErrorResponse('حدث خطأ غير متوقع', error.message);
  }
}