/**
 * واجهة برمجة التطبيقات (API) للفواتير
 * تتعامل مع طلبات GET (جلب قائمة الفواتير)
 */

import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { Schema } from '@/lib/db-schema';
import { validateUser, createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { Invoice, PaginatedResponse, SearchCriteria } from '@/lib/types';

/**
 * جلب قائمة الفواتير
 * GET /sales/invoices
 */
export async function GET(req: NextRequest) {
  try {
    // التحقق من المستخدم
    const { error, user } = await validateUser(req);
    if (error) return error;

    // استخراج معايير البحث من الاستعلام
    const searchParams = req.nextUrl.searchParams;
    const searchCriteria: SearchCriteria = {
      searchTerm: searchParams.get('search') || undefined,
      startDate: searchParams.get('startDate') || undefined,
      endDate: searchParams.get('endDate') || undefined,
      status: searchParams.get('status') || undefined,
      customerId: searchParams.get('customerId') ? parseInt(searchParams.get('customerId')!) : undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 10,
      sortBy: searchParams.get('sortBy') || 'invoiceDate',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    // بناء استعلام SQL
    let query = `
      SELECT 
        i.${Schema.columns.invoices.id} as invoiceId,
        i.${Schema.columns.invoices.invoiceNumber} as invoiceNumber,
        i.${Schema.columns.invoices.invoiceDate} as invoiceDate,
        i.${Schema.columns.invoices.customerId} as customerId,
        c.${Schema.columns.customers.name} as customerName,
        i.${Schema.columns.invoices.totalAmount} as totalAmount,
        i.${Schema.columns.invoices.amountPaid} as amountPaid,
        i.${Schema.columns.invoices.amountDue} as amountDue,
        i.${Schema.columns.invoices.status} as status,
        i.${Schema.columns.invoices.createdAt} as createdAt
      FROM ${Schema.tables.invoices} i
      LEFT JOIN ${Schema.tables.customers} c ON i.${Schema.columns.invoices.customerId} = c.${Schema.columns.customers.id}
      WHERE i.${Schema.columns.invoices.companyId} = @companyId
    `;

    const queryParams: any = {
      companyId: user.companyId,
    };

    // إضافة شروط البحث
    if (searchCriteria.searchTerm) {
      query += ` AND (
        i.${Schema.columns.invoices.invoiceNumber} LIKE @searchTerm
        OR c.${Schema.columns.customers.name} LIKE @searchTerm
      )`;
      queryParams.searchTerm = `%${searchCriteria.searchTerm}%`;
    }

    if (searchCriteria.startDate) {
      query += ` AND i.${Schema.columns.invoices.invoiceDate} >= @startDate`;
      queryParams.startDate = searchCriteria.startDate;
    }

    if (searchCriteria.endDate) {
      query += ` AND i.${Schema.columns.invoices.invoiceDate} <= @endDate`;
      queryParams.endDate = searchCriteria.endDate;
    }

    if (searchCriteria.status) {
      query += ` AND i.${Schema.columns.invoices.status} = @status`;
      queryParams.status = searchCriteria.status;
    }

    if (searchCriteria.customerId) {
      query += ` AND i.${Schema.columns.invoices.customerId} = @customerId`;
      queryParams.customerId = searchCriteria.customerId;
    }

    // استعلام لحساب إجمالي عدد السجلات
    const countQuery = `
      SELECT COUNT(*) as totalCount
      FROM (${query}) as countQuery
    `;

    // تنفيذ استعلام العدد
    const countResult = await executeQuery<{ totalCount: number }[]>(countQuery, queryParams);
    const totalItems = countResult[0]?.totalCount || 0;
    const totalPages = Math.ceil(totalItems / searchCriteria.pageSize!);

    // إضافة الترتيب والصفحات
    query += ` ORDER BY i.${searchCriteria.sortBy === 'customerName' ? 
      'c.' + Schema.columns.customers.name : 
      'i.' + Schema.columns.invoices[searchCriteria.sortBy as keyof typeof Schema.columns.invoices] || Schema.columns.invoices.invoiceDate
    } ${searchCriteria.sortOrder}`;

    query += ` OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY`;
    queryParams.offset = (searchCriteria.page! - 1) * searchCriteria.pageSize!;
    queryParams.pageSize = searchCriteria.pageSize;

    // تنفيذ الاستعلام الرئيسي
    const invoices = await executeQuery<Invoice[]>(query, queryParams);

    // إعداد الاستجابة
    const response: PaginatedResponse<Invoice> = {
      items: invoices,
      totalItems,
      totalPages,
      currentPage: searchCriteria.page!,
    };

    return createSuccessResponse(response);
  } catch (error: any) {
    console.error('[sales/invoices/route.ts] خطأ في جلب الفواتير:', error);
    return createErrorResponse('حدث خطأ أثناء جلب الفواتير', error.message);
  }
}