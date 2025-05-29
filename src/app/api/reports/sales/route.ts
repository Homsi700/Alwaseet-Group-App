import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// الحصول على تقرير المبيعات
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 401 });
    }
    
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const period = searchParams.get('period') || 'monthly';
    
    // تحديد نطاق التاريخ
    const dateFilter: any = {
      userId: session.user.id,
    };
    
    if (startDate) {
      dateFilter.date = {
        ...dateFilter.date,
        gte: new Date(startDate),
      };
    }
    
    if (endDate) {
      dateFilter.date = {
        ...dateFilter.date,
        lte: new Date(endDate),
      };
    }
    
    // الحصول على إجمالي المبيعات
    const salesSummary = await prisma.sale.aggregate({
      where: dateFilter,
      _sum: {
        total: true,
        discount: true,
        tax: true,
      },
      _count: {
        id: true,
      },
    });
    
    // الحصول على المبيعات حسب الفترة
    let salesByPeriod = [];
    
    if (period === 'daily') {
      // المبيعات اليومية
      salesByPeriod = await prisma.$queryRaw`
        SELECT 
          DATE(date) as day,
          SUM(total) as sales,
          COUNT(*) as orders,
          SUM(total - discount) as profit
        FROM "Sale"
        WHERE "userId" = ${session.user.id}
          ${startDate ? `AND date >= '${startDate}'` : ''}
          ${endDate ? `AND date <= '${endDate}'` : ''}
        GROUP BY DATE(date)
        ORDER BY day
      `;
    } else if (period === 'monthly') {
      // المبيعات الشهرية
      salesByPeriod = await prisma.$queryRaw`
        SELECT 
          EXTRACT(YEAR FROM date) as year,
          EXTRACT(MONTH FROM date) as month,
          SUM(total) as sales,
          COUNT(*) as orders,
          SUM(total - discount) as profit
        FROM "Sale"
        WHERE "userId" = ${session.user.id}
          ${startDate ? `AND date >= '${startDate}'` : ''}
          ${endDate ? `AND date <= '${endDate}'` : ''}
        GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
        ORDER BY year, month
      `;
    }
    
    // الحصول على المبيعات حسب العملاء
    const salesByCustomer = await prisma.sale.groupBy({
      by: ['customerId'],
      where: dateFilter,
      _sum: {
        total: true,
      },
      _count: {
        id: true,
      },
    });
    
    // الحصول على تفاصيل العملاء
    const customerIds = salesByCustomer.map(item => item.customerId).filter(Boolean) as string[];
    const customers = customerIds.length > 0 ? await prisma.customer.findMany({
      where: {
        id: {
          in: customerIds,
        },
      },
    }) : [];
    
    // دمج بيانات العملاء مع المبيعات
    const salesByCustomerWithDetails = salesByCustomer.map(item => {
      const customer = item.customerId ? customers.find(c => c.id === item.customerId) : null;
      return {
        customerId: item.customerId,
        customerName: customer?.name || 'عميل غير مسجل',
        totalSales: item._sum.total,
        orderCount: item._count.id,
      };
    });
    
    // الحصول على المنتجات الأكثر مبيعاً
    const topProducts = await prisma.saleItem.groupBy({
      by: ['productId'],
      where: {
        sale: dateFilter,
      },
      _sum: {
        quantity: true,
        total: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          total: 'desc',
        },
      },
      take: 10,
    });
    
    // الحصول على تفاصيل المنتجات
    const productIds = topProducts.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });
    
    // دمج بيانات المنتجات مع المبيعات
    const topProductsWithDetails = topProducts.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        productId: item.productId,
        productName: product?.name || 'منتج غير معروف',
        sku: product?.sku || '',
        quantity: item._sum.quantity || 0,
        sales: item._sum.total || 0,
      };
    });
    
    return NextResponse.json({
      summary: {
        totalSales: salesSummary._sum.total || 0,
        totalOrders: salesSummary._count.id || 0,
        totalDiscount: salesSummary._sum.discount || 0,
        totalTax: salesSummary._sum.tax || 0,
        netSales: (salesSummary._sum.total || 0) - (salesSummary._sum.discount || 0),
      },
      salesByPeriod,
      salesByCustomer: salesByCustomerWithDetails,
      topProducts: topProductsWithDetails,
    });
  } catch (error) {
    console.error('خطأ في الحصول على تقرير المبيعات:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء الحصول على تقرير المبيعات' }, { status: 500 });
  }
}