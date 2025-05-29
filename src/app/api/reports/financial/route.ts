import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// الحصول على التقرير المالي
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
    
    // الحصول على إجمالي الإيرادات (المبيعات)
    const revenueSummary = await prisma.sale.aggregate({
      where: dateFilter,
      _sum: {
        total: true,
        discount: true,
        tax: true,
      },
    });
    
    // الحصول على إجمالي المصروفات (المشتريات)
    const expenseSummary = await prisma.purchase.aggregate({
      where: dateFilter,
      _sum: {
        total: true,
        discount: true,
        tax: true,
      },
    });
    
    // حساب صافي الربح
    const revenue = revenueSummary._sum.total || 0;
    const expenses = expenseSummary._sum.total || 0;
    const profit = revenue - expenses;
    const taxAmount = (revenueSummary._sum.tax || 0) - (expenseSummary._sum.tax || 0);
    
    // الحصول على البيانات المالية حسب الفترة
    let financialByPeriod = [];
    
    if (period === 'monthly') {
      // البيانات المالية الشهرية
      const revenueByMonth = await prisma.$queryRaw`
        SELECT 
          EXTRACT(YEAR FROM date) as year,
          EXTRACT(MONTH FROM date) as month,
          SUM(total) as revenue
        FROM "Sale"
        WHERE "userId" = ${session.user.id}
          ${startDate ? `AND date >= '${startDate}'` : ''}
          ${endDate ? `AND date <= '${endDate}'` : ''}
        GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
        ORDER BY year, month
      `;
      
      const expensesByMonth = await prisma.$queryRaw`
        SELECT 
          EXTRACT(YEAR FROM date) as year,
          EXTRACT(MONTH FROM date) as month,
          SUM(total) as expenses
        FROM "Purchase"
        WHERE "userId" = ${session.user.id}
          ${startDate ? `AND date >= '${startDate}'` : ''}
          ${endDate ? `AND date <= '${endDate}'` : ''}
        GROUP BY EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date)
        ORDER BY year, month
      `;
      
      // دمج البيانات
      const months: any = {};
      
      revenueByMonth.forEach((item: any) => {
        const key = `${item.year}-${item.month}`;
        if (!months[key]) {
          months[key] = {
            year: item.year,
            month: item.month,
            revenue: 0,
            expenses: 0,
            profit: 0,
          };
        }
        months[key].revenue = parseFloat(item.revenue);
      });
      
      expensesByMonth.forEach((item: any) => {
        const key = `${item.year}-${item.month}`;
        if (!months[key]) {
          months[key] = {
            year: item.year,
            month: item.month,
            revenue: 0,
            expenses: 0,
            profit: 0,
          };
        }
        months[key].expenses = parseFloat(item.expenses);
      });
      
      // حساب الربح وتحويل البيانات إلى مصفوفة
      financialByPeriod = Object.values(months).map((item: any) => {
        const monthNames = [
          'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
          'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];
        
        return {
          month: monthNames[item.month - 1],
          revenue: item.revenue,
          expenses: item.expenses,
          profit: item.revenue - item.expenses,
        };
      });
    }
    
    // الحصول على فئات المصروفات
    // في هذا المثال، سنستخدم بيانات وهمية لفئات المصروفات
    const expenseCategories = [
      { category: 'رواتب', amount: expenses * 0.5 },
      { category: 'إيجار', amount: expenses * 0.15 },
      { category: 'مرافق', amount: expenses * 0.05 },
      { category: 'تسويق', amount: expenses * 0.1 },
      { category: 'مشتريات', amount: expenses * 0.15 },
      { category: 'أخرى', amount: expenses * 0.05 },
    ];
    
    // الحصول على مصادر الإيرادات
    // في هذا المثال، سنستخدم بيانات وهمية لمصادر الإيرادات
    const revenueStreams = [
      { stream: 'مبيعات التجزئة', amount: revenue * 0.6 },
      { stream: 'مبيعات الجملة', amount: revenue * 0.3 },
      { stream: 'خدمات', amount: revenue * 0.08 },
      { stream: 'أخرى', amount: revenue * 0.02 },
    ];
    
    return NextResponse.json({
      summary: {
        revenue,
        expenses,
        profit,
        taxAmount,
      },
      monthly: financialByPeriod,
      expenseCategories,
      revenueStreams,
    });
  } catch (error) {
    console.error('خطأ في الحصول على التقرير المالي:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء الحصول على التقرير المالي' }, { status: 500 });
  }
}