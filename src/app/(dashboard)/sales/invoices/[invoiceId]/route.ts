/**
 * واجهة برمجة التطبيقات (API) لفاتورة محددة
 * تتعامل مع طلبات GET (جلب تفاصيل الفاتورة)، PUT (تحديث الفاتورة)، DELETE (حذف الفاتورة)
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/db';
import { Schema, CommonQueries } from '@/lib/db-schema';
import { validateUser, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { Invoice, InvoiceItem } from '@/lib/types';

interface RouteParams {
  params: {
    invoiceId: string;
  };
}

/**
 * جلب تفاصيل فاتورة محددة
 * GET /sales/invoices/[invoiceId]
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    // التحقق من المستخدم
    const { error, user } = await validateUser(req);
    if (error) return error;

    // التحقق من وجود معرف الفاتورة
    const { invoiceId } = params;
    if (!invoiceId || isNaN(parseInt(invoiceId))) {
      return createErrorResponse('معرف الفاتورة غير صالح');
    }

    // جلب تفاصيل الفاتورة
    const invoiceQuery = CommonQueries.getInvoiceWithDetails;
    const invoice = await executeQuery<Invoice[]>(invoiceQuery, { invoiceId: parseInt(invoiceId) });

    // التحقق من وجود الفاتورة
    if (!invoice || invoice.length === 0) {
      return createErrorResponse('الفاتورة غير موجودة', '', 404);
    }

    // التحقق من أن الفاتورة تنتمي إلى نفس الشركة
    if (invoice[0].companyId !== user.companyId) {
      return createErrorResponse('غير مصرح لك بالوصول إلى هذه الفاتورة', '', 403);
    }

    // جلب بنود الفاتورة
    const itemsQuery = CommonQueries.getInvoiceItems;
    const items = await executeQuery<InvoiceItem[]>(itemsQuery, { invoiceId: parseInt(invoiceId) });

    // إعداد الاستجابة
    const response = {
      invoice: invoice[0],
      items,
    };

    return createSuccessResponse(response);
  } catch (error: any) {
    console.error(`[sales/invoices/[invoiceId]/route.ts] خطأ في جلب تفاصيل الفاتورة:`, error);
    return createErrorResponse('حدث خطأ أثناء جلب تفاصيل الفاتورة', error.message);
  }
}

/**
 * تحديث فاتورة محددة
 * PUT /sales/invoices/[invoiceId]
 */
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    // التحقق من المستخدم
    const { error, user } = await validateUser(req);
    if (error) return error;

    // التحقق من وجود معرف الفاتورة
    const { invoiceId } = params;
    if (!invoiceId || isNaN(parseInt(invoiceId))) {
      return createErrorResponse('معرف الفاتورة غير صالح');
    }

    // استخراج بيانات الفاتورة من الطلب
    const body = await req.json();
    
    console.log(`[sales/invoices/[invoiceId]/route.ts] بيانات تحديث الفاتورة:`, body);
    
    // التحقق من وجود بيانات الفاتورة
    if (!body.invoice) {
      return createErrorResponse('بيانات الفاتورة غير صالحة');
    }

    // التحقق من وجود الفاتورة
    const checkInvoiceQuery = `
      SELECT ${Schema.columns.invoices.id}, ${Schema.columns.invoices.companyId}
      FROM ${Schema.tables.invoices}
      WHERE ${Schema.columns.invoices.id} = @invoiceId
    `;
    
    const existingInvoice = await executeQuery<any[]>(checkInvoiceQuery, { invoiceId: parseInt(invoiceId) });
    
    if (!existingInvoice || existingInvoice.length === 0) {
      return createErrorResponse('الفاتورة غير موجودة', '', 404);
    }
    
    // التحقق من أن الفاتورة تنتمي إلى نفس الشركة
    if (existingInvoice[0].companyId !== user.companyId) {
      return createErrorResponse('غير مصرح لك بتحديث هذه الفاتورة', '', 403);
    }

    // بناء استعلام تحديث الفاتورة
    let updateQuery = `
      UPDATE ${Schema.tables.invoices}
      SET ${Schema.columns.invoices.updatedAt} = GETDATE()
    `;
    
    const updateParams: any = {
      invoiceId: parseInt(invoiceId),
    };

    // إضافة الحقول المراد تحديثها
    const updateFields = [];
    
    if (body.invoice.status !== undefined) {
      updateFields.push(`${Schema.columns.invoices.status} = @status`);
      updateParams.status = body.invoice.status;
    }
    
    if (body.invoice.amountPaid !== undefined) {
      updateFields.push(`${Schema.columns.invoices.amountPaid} = @amountPaid`);
      updateParams.amountPaid = body.invoice.amountPaid;
      
      // تحديث المبلغ المستحق
      updateFields.push(`${Schema.columns.invoices.amountDue} = ${Schema.columns.invoices.totalAmount} - @amountPaid`);
    }
    
    if (body.invoice.notes !== undefined) {
      updateFields.push(`${Schema.columns.invoices.notes} = @notes`);
      updateParams.notes = body.invoice.notes;
    }
    
    // إضافة الحقول إلى استعلام التحديث
    if (updateFields.length > 0) {
      updateQuery += `, ${updateFields.join(', ')}`;
    }
    
    // إضافة شرط التحديث
    updateQuery += ` WHERE ${Schema.columns.invoices.id} = @invoiceId`;
    
    // تنفيذ استعلام التحديث
    await executeQuery(updateQuery, updateParams);
    
    // جلب الفاتورة المحدثة
    const invoiceQuery = CommonQueries.getInvoiceWithDetails;
    const updatedInvoice = await executeQuery<Invoice[]>(invoiceQuery, { invoiceId: parseInt(invoiceId) });
    
    // جلب بنود الفاتورة
    const itemsQuery = CommonQueries.getInvoiceItems;
    const items = await executeQuery<InvoiceItem[]>(itemsQuery, { invoiceId: parseInt(invoiceId) });
    
    // إعداد الاستجابة
    const response = {
      invoice: updatedInvoice[0],
      items,
    };
    
    return createSuccessResponse(response, 'تم تحديث الفاتورة بنجاح');
  } catch (error: any) {
    console.error(`[sales/invoices/[invoiceId]/route.ts] خطأ في تحديث الفاتورة:`, error);
    return createErrorResponse('حدث خطأ أثناء تحديث الفاتورة', error.message);
  }
}

/**
 * حذف فاتورة محددة
 * DELETE /sales/invoices/[invoiceId]
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    // التحقق من المستخدم
    const { error, user } = await validateUser(req);
    if (error) return error;

    // التحقق من وجود معرف الفاتورة
    const { invoiceId } = params;
    if (!invoiceId || isNaN(parseInt(invoiceId))) {
      return createErrorResponse('معرف الفاتورة غير صالح');
    }

    // التحقق من وجود الفاتورة
    const checkInvoiceQuery = `
      SELECT ${Schema.columns.invoices.id}, ${Schema.columns.invoices.companyId}, ${Schema.columns.invoices.status}
      FROM ${Schema.tables.invoices}
      WHERE ${Schema.columns.invoices.id} = @invoiceId
    `;
    
    const existingInvoice = await executeQuery<any[]>(checkInvoiceQuery, { invoiceId: parseInt(invoiceId) });
    
    if (!existingInvoice || existingInvoice.length === 0) {
      return createErrorResponse('الفاتورة غير موجودة', '', 404);
    }
    
    // التحقق من أن الفاتورة تنتمي إلى نفس الشركة
    if (existingInvoice[0].companyId !== user.companyId) {
      return createErrorResponse('غير مصرح لك بحذف هذه الفاتورة', '', 403);
    }
    
    // التحقق من حالة الفاتورة (لا يمكن حذف الفواتير المدفوعة أو المكتملة)
    const invoiceStatus = existingInvoice[0].status;
    if (invoiceStatus === 'Paid' || invoiceStatus === 'Completed') {
      return createErrorResponse('لا يمكن حذف الفواتير المدفوعة أو المكتملة', '', 400);
    }

    // إعداد معاملة قاعدة البيانات
    const transactionQueries = [];
    
    // استعلام لاسترجاع بنود الفاتورة (لاسترجاع كميات المنتجات)
    const getItemsQuery = `
      SELECT ${Schema.columns.invoiceItems.productId}, ${Schema.columns.invoiceItems.quantity}
      FROM ${Schema.tables.invoiceItems}
      WHERE ${Schema.columns.invoiceItems.invoiceId} = @invoiceId
    `;
    
    const invoiceItems = await executeQuery<any[]>(getItemsQuery, { invoiceId: parseInt(invoiceId) });
    
    // استعلام لحذف بنود الفاتورة
    const deleteItemsQuery = `
      DELETE FROM ${Schema.tables.invoiceItems}
      WHERE ${Schema.columns.invoiceItems.invoiceId} = @invoiceId
    `;
    
    transactionQueries.push({ query: deleteItemsQuery, params: { invoiceId: parseInt(invoiceId) } });
    
    // استعلام لحذف الفاتورة
    const deleteInvoiceQuery = `
      DELETE FROM ${Schema.tables.invoices}
      WHERE ${Schema.columns.invoices.id} = @invoiceId
    `;
    
    transactionQueries.push({ query: deleteInvoiceQuery, params: { invoiceId: parseInt(invoiceId) } });
    
    // استعلامات لاسترجاع كميات المنتجات
    for (const item of invoiceItems) {
      const restoreQuantityQuery = `
        UPDATE ${Schema.tables.products}
        SET ${Schema.columns.products.quantity} = ${Schema.columns.products.quantity} + @quantity,
            ${Schema.columns.products.updatedAt} = GETDATE()
        WHERE ${Schema.columns.products.id} = @productId
      `;
      
      transactionQueries.push({
        query: restoreQuantityQuery,
        params: {
          productId: item.productId,
          quantity: item.quantity,
        },
      });
    }
    
    // تنفيذ المعاملة
    await executeTransaction(transactionQueries);
    
    return createSuccessResponse({ success: true }, 'تم حذف الفاتورة بنجاح');
  } catch (error: any) {
    console.error(`[sales/invoices/[invoiceId]/route.ts] خطأ في حذف الفاتورة:`, error);
    return createErrorResponse('حدث خطأ أثناء حذف الفاتورة', error.message);
  }
}