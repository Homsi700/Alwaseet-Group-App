import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// الحصول على مبيعة محددة
export async function GET(
  req: NextRequest,
  { params }: { params: { saleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }
    
    const saleId = params.saleId;
    
    // التحقق من وجود المبيعة
    const sale = await prisma.sale.findUnique({
      where: {
        id: saleId,
        userId: session.user.id,
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
    
    if (!sale) {
      return NextResponse.json({ error: 'المبيعة غير موجودة' }, { status: 404 });
    }
    
    return NextResponse.json(sale);
  } catch (error) {
    console.error('خطأ في الحصول على المبيعة:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء الحصول على المبيعة' }, { status: 500 });
  }
}

// تحديث مبيعة محددة
export async function PUT(
  req: NextRequest,
  { params }: { params: { saleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }
    
    const saleId = params.saleId;
    const data = await req.json();
    
    // التحقق من وجود المبيعة
    const existingSale = await prisma.sale.findUnique({
      where: {
        id: saleId,
        userId: session.user.id,
      },
      include: {
        items: true,
      },
    });
    
    if (!existingSale) {
      return NextResponse.json({ error: 'المبيعة غير موجودة' }, { status: 404 });
    }
    
    // تحديث المبيعة بدون عناصرها
    const updatedSale = await prisma.sale.update({
      where: {
        id: saleId,
      },
      data: {
        invoiceNumber: data.invoiceNumber,
        date: data.date ? new Date(data.date) : undefined,
        total: data.total,
        discount: data.discount,
        tax: data.tax,
        notes: data.notes,
        status: data.status,
        paymentMethod: data.paymentMethod,
        customerId: data.customerId,
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
    
    // إذا تم توفير عناصر جديدة، قم بتحديثها
    if (data.items && Array.isArray(data.items)) {
      // استعادة كميات المنتجات القديمة
      for (const item of existingSale.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              increment: item.quantity,
            },
          },
        });
      }
      
      // حذف العناصر القديمة
      await prisma.saleItem.deleteMany({
        where: {
          saleId: saleId,
        },
      });
      
      // إنشاء العناصر الجديدة
      for (const item of data.items) {
        await prisma.saleItem.create({
          data: {
            saleId: saleId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount || 0,
            total: (item.price * item.quantity) - (item.discount || 0),
          },
        });
        
        // تحديث كمية المنتج
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }
    }
    
    return NextResponse.json(updatedSale);
  } catch (error) {
    console.error('خطأ في تحديث المبيعة:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث المبيعة' }, { status: 500 });
  }
}

// حذف مبيعة محددة
export async function DELETE(
  req: NextRequest,
  { params }: { params: { saleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }
    
    const saleId = params.saleId;
    
    // التحقق من وجود المبيعة
    const existingSale = await prisma.sale.findUnique({
      where: {
        id: saleId,
        userId: session.user.id,
      },
      include: {
        items: true,
      },
    });
    
    if (!existingSale) {
      return NextResponse.json({ error: 'المبيعة غير موجودة' }, { status: 404 });
    }
    
    // استعادة كميات المنتجات
    for (const item of existingSale.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          quantity: {
            increment: item.quantity,
          },
        },
      });
    }
    
    // حذف المبيعة (سيتم حذف العناصر تلقائياً بسبب onDelete: Cascade)
    await prisma.sale.delete({
      where: {
        id: saleId,
      },
    });
    
    return NextResponse.json({ message: 'تم حذف المبيعة بنجاح' });
  } catch (error) {
    console.error('خطأ في حذف المبيعة:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف المبيعة' }, { status: 500 });
  }
}