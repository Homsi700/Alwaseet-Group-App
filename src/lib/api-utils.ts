/**
 * وظائف مساعدة للتعامل مع طلبات API
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from './db';
import { getUserFromRequest } from './auth';
import { Schema, CommonQueries } from './db-schema';
import { ApiError, ApiSuccess, InvoiceStatus } from './types';

/**
 * التحقق من المستخدم وإرجاع خطأ إذا لم يكن مصرحًا له
 */
export async function validateUser(req: NextRequest) {
  const user = getUserFromRequest(req);
  
  if (!user) {
    return {
      error: NextResponse.json<ApiError>({ message: 'غير مصرح لك بالوصول' }, { status: 401 }),
      user: null
    };
  }
  
  return { error: null, user };
}

/**
 * التحقق من وجود عميل في قاعدة البيانات
 */
export async function validateCustomer(customerId: number | string) {
  if (!customerId) return { valid: true, customerId: null };
  
  try {
    const customerIdNum = typeof customerId === 'string' ? parseInt(customerId) : customerId;
    
    if (isNaN(customerIdNum)) {
      return { valid: false, error: `معرف العميل غير صالح: ${customerId}` };
    }
    
    const result = await executeQuery<any[]>(CommonQueries.checkCustomerExists, { customerId: customerIdNum });
    
    if (!result || result.length === 0) {
      // استخدام العميل النقدي (معرف 2) إذا لم يتم العثور على العميل
      console.log(`[api-utils] العميل بالمعرف ${customerIdNum} غير موجود، سيتم استخدام العميل النقدي (معرف 2)`);
      return { valid: true, customerId: 2 };
    }
    
    return { valid: true, customerId: customerIdNum };
  } catch (error) {
    console.error(`[api-utils] خطأ في التحقق من وجود العميل:`, error);
    // استخدام العميل النقدي (معرف 2) في حالة حدوث خطأ
    return { valid: true, customerId: 2 };
  }
}

/**
 * التحقق من وجود منتج في قاعدة البيانات
 */
export async function validateProduct(productId: number | string) {
  try {
    const productIdNum = typeof productId === 'string' ? parseInt(productId) : productId;
    
    if (isNaN(productIdNum) || productIdNum <= 0) {
      return { valid: false, error: `معرف المنتج غير صالح: ${productId}` };
    }
    
    const result = await executeQuery<any[]>(CommonQueries.checkProductExists, { productId: productIdNum });
    
    if (!result || result.length === 0) {
      return { valid: false, error: `المنتج بالمعرف ${productIdNum} غير موجود في قاعدة البيانات` };
    }
    
    return { valid: true, productId: productIdNum };
  } catch (error) {
    console.error(`[api-utils] خطأ في التحقق من وجود المنتج:`, error);
    return { valid: false, error: `خطأ في التحقق من وجود المنتج: ${error}` };
  }
}

/**
 * التحقق من وجود مجموعة من المنتجات في قاعدة البيانات
 */
export async function validateProducts(items: any[]) {
  if (!items || items.length === 0) {
    return { valid: false, error: 'لا توجد منتجات في الطلب', validItems: [] };
  }
  
  const validItems = [];
  
  for (const item of items) {
    const productId = typeof item.productId === 'string' ? parseInt(item.productId) : item.productId;
    
    if (isNaN(productId) || productId <= 0) {
      console.error(`[api-utils] معرف المنتج غير صالح: ${item.productId}`);
      continue;
    }
    
    try {
      const result = await executeQuery<any[]>(CommonQueries.checkProductExists, { productId });
      
      if (!result || result.length === 0) {
        console.error(`[api-utils] المنتج بالمعرف ${productId} غير موجود في قاعدة البيانات وسيتم تخطيه`);
      } else {
        console.log(`[api-utils] تم التحقق من وجود المنتج بالمعرف ${productId}`);
        validItems.push({
          ...item,
          productId
        });
      }
    } catch (error) {
      console.error(`[api-utils] خطأ في التحقق من وجود المنتج بالمعرف ${productId}:`, error);
    }
  }
  
  if (validItems.length === 0) {
    return { valid: false, error: 'لا توجد منتجات صالحة في الطلب', validItems: [] };
  }
  
  return { valid: true, validItems };
}

/**
 * إنشاء رقم فاتورة فريد
 */
export function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `INV-${year}${month}${day}-${random}`;
}

/**
 * حساب إجماليات الفاتورة
 */
export function calculateInvoiceTotals(items: any[]) {
  let subTotal = 0;
  let totalDiscountAmount = 0;
  let totalTaxAmount = 0;
  
  items.forEach(item => {
    const lineTotal = item.quantity * item.unitPrice;
    const discountAmount = (lineTotal * (item.discountPercent || 0)) / 100;
    const taxAmount = ((lineTotal - discountAmount) * (item.taxPercent || 0)) / 100;
    
    subTotal += lineTotal;
    totalDiscountAmount += discountAmount;
    totalTaxAmount += taxAmount;
  });
  
  const totalAmount = subTotal - totalDiscountAmount + totalTaxAmount;
  
  return {
    subTotal,
    totalDiscountAmount,
    totalTaxAmount,
    totalAmount
  };
}

/**
 * تحديد حالة الفاتورة بناءً على المبلغ المدفوع
 */
export function determineInvoiceStatus(totalAmount: number, amountPaid: number, requestedStatus?: string): InvoiceStatus {
  if (requestedStatus) {
    // التحقق من أن الحالة المطلوبة هي قيمة صالحة من InvoiceStatus
    if (Object.values(InvoiceStatus).includes(requestedStatus as InvoiceStatus)) {
      return requestedStatus as InvoiceStatus;
    }
  }
  
  // تحديد الحالة تلقائيًا بناءً على المبلغ المدفوع
  if (amountPaid <= 0) {
    return InvoiceStatus.Unpaid;
  } else if (amountPaid < totalAmount) {
    return InvoiceStatus.PartiallyPaid;
  } else {
    return InvoiceStatus.Paid;
  }
}

/**
 * إنشاء استجابة API ناجحة
 */
export function createSuccessResponse<T>(data: T, message?: string, status: number = 200) {
  return NextResponse.json<ApiSuccess<T>>({ data, message }, { status });
}

/**
 * إنشاء استجابة API خاطئة
 */
export function createErrorResponse(message: string, error?: string, status: number = 400) {
  return NextResponse.json<ApiError>({ message, error }, { status });
}