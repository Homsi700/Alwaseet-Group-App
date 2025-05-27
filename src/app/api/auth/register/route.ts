
import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password, firstName, lastName, email, role = 'User', companyId } = body;

        if (!username || !password || !companyId) {
            return NextResponse.json(
                { message: 'اسم المستخدم وكلمة المرور ومعرف الشركة مطلوبون' },
                { status: 400 }
            );
        }

        // التحقق من وجود المستخدم
        const existingUser = await executeQuery<any[]>(`
            SELECT UserId FROM settings.Users WHERE Username = @username
        `, { username });

        if (existingUser.length > 0) {
            return NextResponse.json(
                { message: 'اسم المستخدم موجود بالفعل' },
                { status: 409 } // 409 Conflict
            );
        }

        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash(password, 10);

        // إنشاء المستخدم
        const result = await executeQuery<any[]>(`
            INSERT INTO settings.Users (
                Username, PasswordHash, FirstName, LastName,
                Email, Role, CompanyId, IsActive, CreatedAt
            )
            OUTPUT INSERTED.UserId
            VALUES (
                @username, @hashedPassword, @firstName, @lastName,
                @email, @role, @companyId, 1, GETDATE()
            )`,
            {
                username,
                hashedPassword,
                firstName: firstName || null,
                lastName: lastName || null,
                email: email || null,
                role,
                companyId
            }
        );
        
        if (!result || result.length === 0 || !result[0].UserId) {
            console.error('Failed to insert user or retrieve UserId:', result);
            return NextResponse.json(
                { message: 'فشل في إنشاء المستخدم، لم يتم إرجاع معرف المستخدم' },
                { status: 500 }
            );
        }


        return NextResponse.json({ 
            message: 'تم إنشاء المستخدم بنجاح',
            userId: result[0].UserId
        }, { status: 201 });

    } catch (error) {
        console.error('خطأ في التسجيل:', error);
        const errorMessage = error instanceof Error ? error.message : 'خطأ غير متوقع';
        return NextResponse.json(
            { message: 'خطأ في إنشاء المستخدم: ' + errorMessage },
            { status: 500 }
        );
    }
}
