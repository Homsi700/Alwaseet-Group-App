import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
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
    const salesResult = await executeQuery(sqlQuery, queryParams);
    
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
    
    return NextResponse.json(sales);
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
    
    // إنشاء المبيعة
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
    
    const saleResult = await executeQuery(insertSaleQuery, saleParams);
    const saleId = saleResult[0].Id;
    
    // إنشاء عناصر المبيعة
    for (const item of items) {
      const insertItemQuery = `
        INSERT INTO sales.SaleItems (
          SaleId, ProductId, Quantity, Price, Discount, Total, CreatedAt, UpdatedAt
        )
        VALUES (
          @saleId, @productId, @quantity, @price, @discount, @total, GETDATE(), GETDATE()
        )
      `;
      
      await executeQuery(insertItemQuery, {
        saleId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount,
        total: item.total
      });
    }
    
    // تحديث كمية المنتجات في المخزون
    for (const item of data.items) {
      const updateProductQuery = `
        UPDATE inventory.Products
        SET Quantity = Quantity - @quantity, UpdatedAt = GETDATE()
        WHERE Id = @productId
      `;
      
      await executeQuery(updateProductQuery, {
        productId: item.productId,
        quantity: item.quantity
      });
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
    
    const saleData = await executeQuery(getSaleQuery, { saleId });
    
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
    
    const itemsData = await executeQuery(getItemsQuery, { saleId });
    
    // تنسيق البيانات للإرجاع
    const sale = {
      ...saleData[0],
      customer: saleData[0].customerId ? {
        id: saleData[0].customerId,
        name: saleData[0].customerName,
        phone: saleData[0].customerPhone,
        email: saleData[0].customerEmail
      } : null,
      items: itemsData.map((item: any) => ({
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