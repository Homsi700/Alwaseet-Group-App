import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// الحصول على قائمة العملاء
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('searchTerm') || '';
    
    // بناء شروط البحث
    const where: any = {
      userId: session.user.id,
    };
    
    // إضافة شرط البحث بالنص
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { phone: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } },
        { notes: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }
    
    // الحصول على العملاء
    const customers = await prisma.customer.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });
    
    return NextResponse.json(customers);
  } catch (error) {
    console.error('خطأ في الحصول على العملاء:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء الحصول على العملاء' }, { status: 500 });
  }
}

// إنشاء عميل جديد
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }
    
    const data = await req.json();
    
    // التحقق من البيانات المطلوبة
    if (!data.name) {
      return NextResponse.json({ error: 'يجب تحديد اسم العميل' }, { status: 400 });
    }
    
    // إنشاء العميل
    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        vatNumber: data.vatNumber,
        notes: data.notes,
        userId: session.user.id,
      },
    });
    
    return NextResponse.json(customer);
  } catch (error) {
    console.error('خطأ في إنشاء العميل:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء العميل' }, { status: 500 });
  }
}