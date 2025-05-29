import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// الحصول على تقرير المخزون
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    
    // تحديد فلتر الفئة
    const filter: any = {
      userId: session.user.id,
    };
    
    if (categoryId) {
      filter.categoryId = categoryId;
    }
    
    // الحصول على ملخص المخزون
    const inventorySummary = await prisma.product.aggregate({
      where: filter,
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
    });
    
    // حساب قيمة المخزون
    const products = await prisma.product.findMany({
      where: filter,
      select: {
        id: true,
        quantity: true,
        cost: true,
      },
    });
    
    const totalValue = products.reduce((sum, product) => {
      return sum + (product.quantity * (product.cost || 0));
    }, 0);
    
    // الحصول على المنتجات منخفضة المخزون
    const lowStockProducts = await prisma.product.findMany({
      where: {
        ...filter,
        quantity: {
          lt: prisma.product.fields.minQuantity,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        quantity: 'asc',
      },
    });
    
    // الحصول على المنتجات التي نفذت كميتها
    const outOfStockProducts = await prisma.product.findMany({
      where: {
        ...filter,
        quantity: 0,
      },
      include: {
        category: true,
      },
    });
    
    // الحصول على المخزون حسب الفئة
    const inventoryByCategory = await prisma.product.groupBy({
      by: ['categoryId'],
      where: filter,
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
    });
    
    // الحصول على تفاصيل الفئات
    const categoryIds = inventoryByCategory
      .map(item => item.categoryId)
      .filter(Boolean) as string[];
    
    const categories = categoryIds.length > 0 ? await prisma.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
    }) : [];
    
    // دمج بيانات الفئات مع المخزون
    const inventoryByCategoryWithDetails = inventoryByCategory.map(item => {
      const category = item.categoryId ? categories.find(c => c.id === item.categoryId) : null;
      
      // حساب قيمة المخزون لهذه الفئة
      const categoryProducts = products.filter(p => p.id === item.categoryId);
      const categoryValue = categoryProducts.reduce((sum, product) => {
        return sum + (product.quantity * (product.cost || 0));
      }, 0);
      
      return {
        categoryId: item.categoryId,
        name: category?.name || 'بدون فئة',
        count: item._count.id,
        quantity: item._sum.quantity || 0,
        value: categoryValue,
      };
    });
    
    // الحصول على المنتجات الأعلى قيمة
    const topValueProducts = await prisma.product.findMany({
      where: filter,
      orderBy: [
        {
          quantity: 'desc',
        },
        {
          cost: 'desc',
        },
      ],
      include: {
        category: true,
      },
      take: 10,
    });
    
    // تحويل المنتجات الأعلى قيمة إلى التنسيق المطلوب
    const topValueProductsFormatted = topValueProducts.map(product => ({
      id: product.id,
      name: product.name,
      sku: product.sku || '',
      quantity: product.quantity,
      category: product.category?.name || 'بدون فئة',
      value: product.quantity * (product.cost || 0),
    }));
    
    return NextResponse.json({
      summary: {
        totalItems: inventorySummary._count.id || 0,
        totalQuantity: inventorySummary._sum.quantity || 0,
        totalValue: totalValue,
        lowStock: lowStockProducts.length,
        outOfStock: outOfStockProducts.length,
      },
      categories: inventoryByCategoryWithDetails,
      lowStockItems: lowStockProducts.map(product => ({
        id: product.id,
        name: product.name,
        sku: product.sku || '',
        quantity: product.quantity,
        minQuantity: product.minQuantity,
        category: product.category?.name || 'بدون فئة',
      })),
      topItems: topValueProductsFormatted,
    });
  } catch (error) {
    console.error('خطأ في الحصول على تقرير المخزون:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء الحصول على تقرير المخزون' }, { status: 500 });
  }
}