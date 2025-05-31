import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, executeTransaction } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

// الحصول على قائمة المبيعات
export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('searchTerm') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    
    // بناء شروط البحث
    const where: any = {
      userId: user.userId,
    };
    
    // إضافة شرط البحث بالنص
    if (searchTerm) {
      where.OR = [
        { invoiceNumber: { contains: searchTerm, mode: 'insensitive' } },
        { notes: { contains: searchTerm, mode: 'insensitive' } },
        { customer: { name: { contains: searchTerm, mode: 'insensitive' } } },
      ];
    }
    
    // إضافة شرط تاريخ البداية
    if (startDate) {
      where.date = {
        ...where.date,
        gte: new Date(startDate),
      };
    }
    
    // إضافة شرط تاريخ النهاية
    if (endDate) {
      where.date = {
        ...where.date,
        lte: new Date(endDate),
      };
    }
    
    // إضافة شرط الحالة
    if (status) {
      where.status = status;
    }
    
    // إضافة شرط العميل
    if (customerId) {
      where.customerId = customerId;
    }
    
    // بناء استعلام SQL للحصول على المبيعات
    let sqlQuery = `
      SELECT 
        s.Id as id,
        s.InvoiceNumber as invoiceNumber,
        s.Date as date,
        s.Total as total,
        s.Discount as discount,
        s.Tax as tax,
        s.Notes as notes,
        s.Status as status,
        s.PaymentMethod as paymentMethod,
        s.CreatedAt as createdAt,
        s.UpdatedAt as updatedAt,
        c.Id as customerId,
        c.Name as customerName,
        c.Phone as customerPhone,
        c.Email as customerEmail
      FROM sales.Sales s
      LEFT JOIN sales.Customers c ON s.CustomerId = c.Id
      WHERE s.UserId = @userId
    `;
    
    // إضافة شروط البحث إلى الاستعلام
    const queryParams: any = { userId: user.userId };
    
    if (searchTerm) {
      sqlQuery += ` AND (
        s.InvoiceNumber LIKE @searchTerm
        OR s.Notes LIKE @searchTerm
        OR c.Name LIKE @searchTerm
      )`;
      queryParams.searchTerm = `%${searchTerm}%`;
    }
    
    if (startDate) {
      sqlQuery += ` AND s.Date >= @startDate`;
      queryParams.startDate = new Date(startDate);
    }
    
    if (endDate) {
      sqlQuery += ` AND s.Date <= @endDate`;
      queryParams.endDate = new Date(endDate);
    }
    
    if (status) {
      sqlQuery += ` AND s.Status = @status`;
      queryParams.status = status;
    }
    
    if (customerId) {
      sqlQuery += ` AND s.CustomerId = @customerId`;
      queryParams.customerId = customerId;
    }
    
    sqlQuery += ` ORDER BY s.Date DESC`;
    
    // تنفيذ الاستعلام
    const salesResult = await executeQuery<any[]>(sqlQuery, queryParams);
    
    // الحصول على عناصر المبيعات
    const salesWithItems = await Promise.all(salesResult.map(async (sale: any) => {
      const itemsQuery = `
        SELECT 
          si.Id as id,
          si.Quantity as quantity,
          si.Price as price,
          si.Discount as discount,
          si.Total as total,
          p.Id as productId,
          p.Name as productName,
          p.SKU as productSku,
          p.Barcode as productBarcode
        FROM sales.SaleItems si
        JOIN inventory.Products p ON si.ProductId = p.Id
        WHERE si.SaleId = @saleId
      `;
      
      const items = await executeQuery(itemsQuery, { saleId: sale.id });
      
      return {
        ...sale,
        customer: sale.customerId ? {
          id: sale.customerId,
          name: sale.customerName,
          phone: sale.customerPhone,
          email: sale.customerEmail
        } : null,
        items: items.map((item: any) => ({
          ...item,
          product: {
            id: item.productId,
            name: item.productName,
            sku: item.productSku,
            barcode: item.productBarcode
          }
        }))
      };
    }));
    
    const sales = salesWithItems;
    
    // حساب الإحصائيات
    const totalSales = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
    const totalInvoices = sales.length;
    const averageInvoiceValue = totalInvoices > 0 ? totalSales / totalInvoices : 0;
    
    // تصنيف المبيعات حسب الحالة
    const completedSales = sales.filter(sale => sale.status === 'COMPLETED').length;
    const pendingSales = sales.filter(sale => sale.status === 'PENDING').length;
    const cancelledSales = sales.filter(sale => sale.status === 'CANCELLED').length;
    const refundedSales = sales.filter(sale => sale.status === 'REFUNDED').length;
    
    // إرجاع البيانات مع الإحصائيات
    return NextResponse.json({
      sales,
      summary: {
        totalSales,
        totalInvoices,
        averageInvoiceValue,
        completedSales,
        pendingSales,
        cancelledSales,
        refundedSales
      }
    });
  } catch (error) {
    console.error('خطأ في الحصول على المبيعات:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء الحصول على المبيعات' }, { status: 500 });
  }
}

// إنشاء مبيعة جديدة
export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }
    
    const data = await req.json();
    
    // التحقق من البيانات المطلوبة
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      return NextResponse.json({ error: 'يجب تحديد عناصر المبيعة' }, { status: 400 });
    }
    
    // إنشاء رقم فاتورة فريد إذا لم يتم توفيره
    if (!data.invoiceNumber) {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      
      data.invoiceNumber = `INV-${year}${month}${day}-${random}`;
    }
    
    // حساب إجمالي المبيعة
    let total = 0;
    let tax = 0;
    let discount = 0;
    
    // تحضير عناصر المبيعة
    const items = data.items.map((item: any) => {
      const itemTotal = (item.price * item.quantity) - (item.discount || 0);
      total += itemTotal;
      discount += item.discount || 0;
      
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
        total: itemTotal,
      };
    });
    
    // حساب الضريبة إذا تم توفيرها
    if (data.tax) {
      tax = data.tax;
    } else if (data.taxRate) {
      tax = total * (data.taxRate / 100);
    }
    
    // إنشاء المبيعة باستخدام المعاملات (Transactions)
    const insertSaleQuery = `
      INSERT INTO sales.Sales (
        InvoiceNumber, Date, Total, Discount, Tax, Notes, Status, PaymentMethod, CustomerId, UserId, CreatedAt, UpdatedAt
      )
      OUTPUT INSERTED.Id
      VALUES (
        @invoiceNumber, @date, @total, @discount, @tax, @notes, @status, @paymentMethod, @customerId, @userId, GETDATE(), GETDATE()
      )
    `;
    
    const saleParams = {
      invoiceNumber: data.invoiceNumber,
      date: data.date ? new Date(data.date) : new Date(),
      total: total + tax,
      discount: discount,
      tax: tax,
      notes: data.notes,
      status: data.status || 'COMPLETED',
      paymentMethod: data.paymentMethod || 'CASH',
      customerId: data.customerId,
      userId: user.userId
    };
    
    // إعداد قائمة الاستعلامات للمعاملة
    const transactionQueries = [
      { query: insertSaleQuery, params: saleParams }
    ];
    
    // تنفيذ المعاملة
    const transactionResults = await executeTransaction(transactionQueries);
    const saleId = transactionResults[0][0].Id;
    
    // إنشاء استعلامات لعناصر المبيعة وتحديث المخزون
    const itemQueries = [];
    
    // إضافة استعلامات عناصر المبيعة
    for (const item of items) {
      const insertItemQuery = `
        INSERT INTO sales.SaleItems (
          SaleId, ProductId, Quantity, Price, Discount, Total, CreatedAt, UpdatedAt
        )
        VALUES (
          @saleId, @productId, @quantity, @price, @discount, @total, GETDATE(), GETDATE()
        )
      `;
      
      itemQueries.push({
        query: insertItemQuery,
        params: {
          saleId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          total: item.total
        }
      });
    }
    
    // إضافة استعلامات تحديث المخزون
    for (const item of data.items) {
      const updateProductQuery = `
        UPDATE inventory.Products
        SET Quantity = Quantity - @quantity, UpdatedAt = GETDATE()
        WHERE Id = @productId
      `;
      
      itemQueries.push({
        query: updateProductQuery,
        params: {
          productId: item.productId,
          quantity: item.quantity
        }
      });
    }
    
    // تنفيذ استعلامات العناصر وتحديث المخزون في معاملة واحدة
    await executeTransaction(itemQueries);
    
    // Define the types for the sale and item data
    interface SaleData {
      id: string;
      invoiceNumber: string;
      date: Date;
      total: number;
      discount: number;
      tax: number;
      notes: string;
      status: string;
      paymentMethod: string;
      createdAt: Date;
      updatedAt: Date;
      customerId: string | null;
      customerName: string | null;
      customerPhone: string | null;
      customerEmail: string | null;
    }
    
    interface ItemData {
      id: string;
      quantity: number;
      price: number;
      discount: number;
      total: number;
      productId: string;
      productName: string;
      productSku: string;
      productBarcode: string;
    }
    
    // الحصول على المبيعة المنشأة مع بياناتها الكاملة
    const getSaleQuery = `
      SELECT 
        s.Id as id,
        s.InvoiceNumber as invoiceNumber,
        s.Date as date,
        s.Total as total,
        s.Discount as discount,
        s.Tax as tax,
        s.Notes as notes,
        s.Status as status,
        s.PaymentMethod as paymentMethod,
        s.CreatedAt as createdAt,
        s.UpdatedAt as updatedAt,
        c.Id as customerId,
        c.Name as customerName,
        c.Phone as customerPhone,
        c.Email as customerEmail
      FROM sales.Sales s
      LEFT JOIN sales.Customers c ON s.CustomerId = c.Id
      WHERE s.Id = @saleId
    `;
    
    // الحصول على عناصر المبيعة
    const getItemsQuery = `
      SELECT 
        si.Id as id,
        si.Quantity as quantity,
        si.Price as price,
        si.Discount as discount,
        si.Total as total,
        p.Id as productId,
        p.Name as productName,
        p.SKU as productSku,
        p.Barcode as productBarcode
      FROM sales.SaleItems si
      JOIN inventory.Products p ON si.ProductId = p.Id
      WHERE si.SaleId = @saleId
    `;
    
    // استخدام استعلامات منفصلة للحصول على البيانات بعد إتمام المعاملات
    const saleData = await executeQuery<SaleData[]>(getSaleQuery, { saleId });
    const itemsData = await executeQuery<ItemData[]>(getItemsQuery, { saleId });
    
    // تنسيق البيانات للإرجاع
    const sale = {
      ...saleData[0],
      customer: saleData[0].customerId ? {
        id: saleData[0].customerId,
        name: saleData[0].customerName,
        phone: saleData[0].customerPhone,
        email: saleData[0].customerEmail
      } : null,
      items: itemsData.map((item) => ({
        ...item,
        product: {
          id: item.productId,
          name: item.productName,
          sku: item.productSku,
          barcode: item.productBarcode
        }
      }))
    };
    
    return NextResponse.json(sale);
  } catch (error) {
    console.error('خطأ في إنشاء المبيعة:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء المبيعة' }, { status: 500 });
  }
}