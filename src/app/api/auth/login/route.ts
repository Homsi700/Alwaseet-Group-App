import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // البحث عن المستخدم
        const users = await executeQuery(`
            SELECT UserId, Username, PasswordHash, Role, CompanyId 
            FROM settings.Users 
            WHERE Username = @username AND IsActive = 1`,
            { username }
        );

        if (users.length === 0) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const user = users[0];

        // التحقق من كلمة المرور
        const isValid = await compare(password, user.PasswordHash);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // تحديث وقت آخر تسجيل دخول
        await executeQuery(`
            UPDATE settings.Users 
            SET LastLogin = GETDATE() 
            WHERE UserId = @userId`,
            { userId: user.UserId }
        );

        // إنشاء رمز JWT
        const token = jwt.sign(
            {
                userId: user.UserId,
                username: user.Username,
                role: user.Role,
                companyId: user.CompanyId
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        return NextResponse.json({
            token,
            user: {
                userId: user.UserId,
                username: user.Username,
                role: user.Role,
                companyId: user.CompanyId
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Error during login' },
            { status: 500 }
        );
    }
}
