import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // التحقق من وجود المستخدم
        const existingUser = await executeQuery(`
            SELECT UserId, Username 
            FROM settings.Users 
            WHERE Username = @username`,
            { username }
        );

        if (existingUser.length > 0) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 400 }
            );
        }

        // تشفير كلمة المرور
        const hashedPassword = await hash(password, 10);

        // إنشاء المستخدم
        const result = await executeQuery(`
            INSERT INTO settings.Users (
                Username, PasswordHash, FirstName, LastName,
                Email, Role, CompanyId, CreatedAt, IsActive
            )
            OUTPUT INSERTED.UserId
            VALUES (
                @username, @hashedPassword, @firstName, @lastName,
                @email, @role, @companyId, GETDATE(), 1
            )`,
            {
                username,
                hashedPassword,
                firstName: body.firstName || null,
                lastName: body.lastName || null,
                email: body.email || null,
                role: body.role || 'User',
                companyId: body.companyId
            }
        );

        return NextResponse.json({ 
            message: 'User created successfully',
            userId: result[0].UserId
        });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Error creating user' },
            { status: 500 }
        );
    }
}
