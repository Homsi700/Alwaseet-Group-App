import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import type { Customer } from '@/types';

// الحصول على قائمة العملاء
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('searchTerm') || '';
    const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
    
    console.log("[customers/route.ts] Received GET request for customers");
    console.log("[customers/route.ts] Search term:", searchTerm);
    
    // بناء استعلام SQL
    let query = `
      SELECT 
        CustomerId as customerId,
        Name as name,
        ContactPerson as contactPerson,
        PhoneNumber as phoneNumber,
        Email as email,
        Address as address,
        TaxNumber as taxNumber,
        CreditLimit as creditLimit,
        Balance as balance,
        CompanyId as companyId,
        CreatedAt as createdAt,
        UpdatedAt as updatedAt,
        CreatedBy as createdBy,
        IsActive as isActive
      FROM sales.Customers
      WHERE CompanyId = @companyId AND IsActive = 1
    `;
    
    const params: Record<string, any> = { companyId };
    
    // إضافة شروط البحث إذا كانت موجودة
    if (searchTerm) {
      query += ` AND (
        Name LIKE @searchPattern OR
        ContactPerson LIKE @searchPattern OR
        PhoneNumber LIKE @searchPattern OR
        Email LIKE @searchPattern OR
        TaxNumber LIKE @searchPattern
      )`;
      params.searchPattern = `%${searchTerm}%`;
    }
    
    // إضافة ترتيب النتائج
    query += ` ORDER BY Name`;
    
    console.log("[customers/route.ts] Executing SQL query:", query);
    console.log("[customers/route.ts] With parameters:", params);
    
    // تنفيذ الاستعلام
    const customers = await executeQuery<Customer[]>(query, params);
    console.log("[customers/route.ts] Customers fetched from database, count:", customers.length);
    
    return NextResponse.json(customers);
  } catch (error) {
    console.error('خطأ في الحصول على العملاء:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء الحصول على العملاء' }, { status: 500 });
  }
}

// إنشاء عميل جديد
export async function POST(req: NextRequest) {
  try {
    console.log("[customers/route.ts] Received POST request for new customer");
    
    // Parse request body
    const data = await req.json();
    console.log("[customers/route.ts] Request body:", data);
    
    // التحقق من البيانات المطلوبة
    if (!data.name) {
      return NextResponse.json({ error: 'يجب تحديد اسم العميل' }, { status: 400 });
    }
    
    // إدخال العميل الجديد في قاعدة البيانات
    try {
      const companyId = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
      const createdBy = 1; // في المستقبل، يمكن الحصول على هذه القيمة من جلسة المستخدم
      
      const insertQuery = `
        INSERT INTO sales.Customers (
          Name, 
          ContactPerson, 
          PhoneNumber, 
          Email, 
          Address, 
          TaxNumber, 
          CreditLimit, 
          Balance, 
          CompanyId, 
          CreatedAt, 
          CreatedBy, 
          IsActive
        )
        VALUES (
          @name, 
          @contactPerson, 
          @phoneNumber, 
          @email, 
          @address, 
          @taxNumber, 
          @creditLimit, 
          @balance, 
          @companyId, 
          GETDATE(), 
          @createdBy, 
          1
        );
        
        SELECT SCOPE_IDENTITY() AS customerId;
      `;
      
      const result = await executeQuery<any[]>(insertQuery, {
        name: data.name,
        contactPerson: data.contactPerson || null,
        phoneNumber: data.phoneNumber || data.phone || null,
        email: data.email || null,
        address: data.address || null,
        taxNumber: data.taxNumber || data.vatNumber || null,
        creditLimit: data.creditLimit || 0,
        balance: data.balance || 0,
        companyId,
        createdBy
      });
      
      console.log("[customers/route.ts] Database insert result:", result);
      
      // الحصول على معرف العميل الجديد
      const newCustomerId = result && result.length > 0 ? result[0].customerId : null;
      
      if (!newCustomerId) {
        throw new Error("لم يتم إرجاع معرف العميل الجديد من قاعدة البيانات");
      }
      
      // جلب العميل الجديد من قاعدة البيانات للتأكد من أنه تم إنشاؤه بنجاح
      const newCustomerQuery = `
        SELECT 
          CustomerId as customerId,
          Name as name,
          ContactPerson as contactPerson,
          PhoneNumber as phoneNumber,
          Email as email,
          Address as address,
          TaxNumber as taxNumber,
          CreditLimit as creditLimit,
          Balance as balance,
          CompanyId as companyId,
          CreatedAt as createdAt,
          UpdatedAt as updatedAt,
          CreatedBy as createdBy,
          IsActive as isActive
        FROM sales.Customers
        WHERE CustomerId = @customerId
      `;
      
      const newCustomers = await executeQuery<Customer[]>(newCustomerQuery, { customerId: newCustomerId });
      
      if (!newCustomers || newCustomers.length === 0) {
        throw new Error("لم يتم العثور على العميل الجديد بعد إنشائه");
      }
      
      const newCustomer = newCustomers[0];
      console.log("[customers/route.ts] Created new customer in database:", newCustomer);
      
      return NextResponse.json(newCustomer, { status: 201 });
    } catch (dbError) {
      console.error("[customers/route.ts] Database error:", dbError);
      return NextResponse.json({ error: "خطأ في إنشاء العميل: " + (dbError as Error).message }, { status: 500 });
    }
  } catch (error) {
    console.error('خطأ في إنشاء العميل:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء العميل' }, { status: 500 });
  }
}