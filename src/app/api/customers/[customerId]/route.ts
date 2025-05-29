import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// الحصول على عميل محدد
export async function GET(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }
    
    const customerId = params.customerId;
    
    // التحقق من وجود العميل
    const customer = await prisma.customer.findUnique({
      where: {
        id: customerId,
        userId: session.user.id,
      },
      include: {
        sales: {
          orderBy: {
            date: 'desc',
          },
          take: 10,
        },
      },
    });
    
    if (!customer) {
      return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 });
    }
    
    return NextResponse.json(customer);
  } catch (error) {
    console.error('خطأ في الحصول على العميل:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء الحصول على العميل' }, { status: 500 });
  }
}

// تحديث عميل محدد
export async function PUT(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }
    
    const customerId = params.customerId;
    const data = await req.json();
    
    // التحقق من وجود العميل
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        id: customerId,
        userId: session.user.id,
      },
    });
    
    if (!existingCustomer) {
      return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 });
    }
    
    // تحديث العميل
    const updatedCustomer = await prisma.customer.update({
      where: {
        id: customerId,
      },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        vatNumber: data.vatNumber,
        notes: data.notes,
      },
    });
    
    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error('خطأ في تحديث العميل:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث العميل' }, { status: 500 });
  }
}

// حذف عميل محدد
export async function DELETE(
  req: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }
    
    const customerId = params.customerId;
    
    // التحقق من وجود العميل
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        id: customerId,
        userId: session.user.id,
      },
      include: {
        sales: true,
      },
    });
    
    if (!existingCustomer) {
      return NextResponse.json({ error: 'العميل غير موجود' }, { status: 404 });
    }
    
    // التحقق من عدم وجود مبيعات مرتبطة بالعميل
    if (existingCustomer.sales.length > 0) {
      return NextResponse.json({ error: 'لا يمكن حذف العميل لأنه مرتبط بمبيعات' }, { status: 400 });
    }
    
    // حذف العميل
    await prisma.customer.delete({
      where: {
        id: customerId,
      },
    });
    
    return NextResponse.json({ message: 'تم حذف العميل بنجاح' });
  } catch (error) {
    console.error('خطأ في حذف العميل:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف العميل' }, { status: 500 });
  }
}