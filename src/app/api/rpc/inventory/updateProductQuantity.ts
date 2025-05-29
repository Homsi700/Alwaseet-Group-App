/**
 * واجهة برمجة التطبيقات (API) لتحديث كمية المنتج
 * POST /api/rpc/inventory/updateProductQuantity
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeProcedure } from '@/lib/db';
import { Schema } from '@/lib/db-schema';
import { validateUser, validateProduct, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';

interface UpdateQuantityRequest {
  productId: number;
  quantity: number;
  operation: 'add' | 'subtract' | 'set';
  reason?: string;
}

export async function POST(req: NextRequest) {
  try {
    // التحقق من المستخدم
    const { error, user } = await validateUser(req);
    if (error) return error;

    // استخراج بيانات الطلب
    const body = await req.json() as UpdateQuantityRequest;
    
    console.log('[api/rpc/inventory/updateProductQuantity.ts] بيانات تحديث الكمية المستلمة:', body);
    
    // التحقق من وجود بيانات المنتج والكمية
    if (!body.productId || body.quantity === undefined) {
      return createErrorResponse('يجب توفير معرف المنتج والكمية');
    }
    
    // التحقق من وجود المنتج
    const productValidation = await validateProduct(body.productId);
    if (!productValidation.valid) {
      return createErrorResponse(productValidation.error || 'المنتج غير صالح');
    }
    
    // الحصول على معلومات المنتج الحالية
    const productQuery = `
      SELECT 
        ${Schema.columns.products.id} as productId,
        ${Schema.columns.products.name} as name,
        ${Schema.columns.products.quantity} as quantity
      FROM ${Schema.tables.products}
      WHERE ${Schema.columns.products.id} = @productId
    `;
    
    const products = await executeQuery<any[]>(productQuery, { productId: body.productId });
    
    if (!products || products.length === 0) {
      return createErrorResponse('المنتج غير موجود');
    }
    
    const product = products[0];
    let newQuantity = 0;
    
    // حساب الكمية الجديدة بناءً على العملية
    switch (body.operation) {
      case 'add':
        newQuantity = product.quantity + body.quantity;
        break;
      case 'subtract':
        newQuantity = product.quantity - body.quantity;
        if (newQuantity < 0) {
          return createErrorResponse('الكمية المطلوبة أكبر من الكمية المتوفرة');
        }
        break;
      case 'set':
        newQuantity = body.quantity;
        break;
      default:
        return createErrorResponse('العملية غير صالحة. يجب أن تكون "add" أو "subtract" أو "set"');
    }
    
    // تحديث كمية المنتج
    const updateQuery = `
      UPDATE ${Schema.tables.products}
      SET ${Schema.columns.products.quantity} = @newQuantity,
          ${Schema.columns.products.updatedAt} = GETDATE()
      WHERE ${Schema.columns.products.id} = @productId
    `;
    
    await executeQuery(updateQuery, {
      productId: body.productId,
      newQuantity,
    });
    
    // تسجيل حركة المخزون (يمكن إضافة هذا لاحقًا)
    // ...
    
    // إعداد الاستجابة
    const response = {
      productId: body.productId,
      productName: product.name,
      previousQuantity: product.quantity,
      newQuantity,
      change: newQuantity - product.quantity,
      operation: body.operation,
      reason: body.reason || null,
      timestamp: new Date().toISOString(),
    };
    
    return createSuccessResponse(response, 'تم تحديث كمية المنتج بنجاح');
  } catch (error: any) {
    console.error('[api/rpc/inventory/updateProductQuantity.ts] خطأ في تحديث كمية المنتج:', error);
    return createErrorResponse('حدث خطأ أثناء تحديث كمية المنتج', error.message);
  }
}