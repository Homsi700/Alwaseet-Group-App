import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// الحصول على قائمة المبيعات
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
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
      userId: session.user.id,
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
    
    // الحصول على المبيعات مع تضمين بيانات العميل
    const sales = await prisma.sale.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                barcode: true,
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
    
    return NextResponse.json(sales);
  } catch (error) {
    console.error('خطأ في الحصول على المبيعات:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء الحصول على المبيعات' }, { status: 500 });
  }
}

// إنشاء مبيعة جديدة
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
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
    
    // إنشاء المبيعة مع عناصرها
    const sale = await prisma.sale.create({
      data: {
        invoiceNumber: data.invoiceNumber,
        date: data.date ? new Date(data.date) : new Date(),
        total: total + tax,
        discount: discount,
        tax: tax,
        notes: data.notes,
        status: data.status || 'COMPLETED',
        paymentMethod: data.paymentMethod || 'CASH',
        customerId: data.customerId,
        userId: session.user.id,
        items: {
          create: items,
        },
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    // تحديث كمية المنتجات في المخزون
    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            decrement: item.quantity,
          },
        },
      });
    }
    
    return NextResponse.json(sale);
  } catch (error) {
    console.error('خطأ في إنشاء المبيعة:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء المبيعة' }, { status: 500 });
  }
}