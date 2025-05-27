import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { username } = await request.json();

        if (!username) {
            return NextResponse.json({ error: 'اسم المستخدم مطلوب' }, { status: 400 });
        }

        // تم تبسيط الاستعلام بدون تشفير مؤقتاً
        const users = await executeQuery<any[]>(`
            SELECT UserId, Username, Role, CompanyId 
            FROM settings.Users 
            WHERE Username = @username AND IsActive = 1`,
            { username }
        );

        if (!users || users.length === 0) {
            return NextResponse.json({ error: 'اسم المستخدم غير صحيح' }, { status: 401 });
        }

        const user = users[0];

        // إرجاع بيانات المستخدم
        return NextResponse.json({
            userId: user.UserId,
            username: user.Username,
            role: user.Role,
            companyId: user.CompanyId
        });

    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        return NextResponse.json(
            { error: 'حدث خطأ في عملية تسجيل الدخول' },
            { status: 500 }
        );
    }
}
