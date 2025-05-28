import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { SignJWT } from 'jose';
import type { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: Request) {
  console.log("[Login API] Received login request.");
  try {
    const { username, password } = await request.json();
    console.log(`[Login API] Attempting login for username: ${username}`);

    // تعطيل التحقق من كلمة المرور مؤقتاً - نبحث فقط عن اسم المستخدم
    const users = await executeQuery<User[]>(`
      SELECT 
        UserId as userId, 
        Username as username, 
        Role as role,
        CompanyId as companyId,
        FirstName as firstName,
        LastName as lastName,
        Email as email,
        IsActive as isActive
      FROM settings.Users 
      WHERE Username = @username
    `, { 
      username
    });

    if (!users || users.length === 0) {
      console.log(`[Login API] User not found: ${username}`);
      return NextResponse.json(
        { message: 'المستخدم غير موجود' },
        { status: 401 }
      );
    }

    const user = users[0];
    console.log(`[Login API] User found:`, { id: user.userId, role: user.role });

    // Create and sign JWT
    const token = await new SignJWT({
      userId: user.userId,
      username: user.username,
      role: user.role
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(new TextEncoder().encode(JWT_SECRET));    // Prepare response
    const response = NextResponse.json({
      user: {
        id: user.userId,
        username: user.username,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      },
      token // إضافة التوكن للاستجابة
    });

    // Set JWT cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7200 // 2 hours
    });

    console.log(`[Login API] Login successful for user: ${username}`);
    return response;

  } catch (error) {
    console.error('[Login API] Error:', error);
    return NextResponse.json(
      { message: 'حدث خطأ في تسجيل الدخول' },
      { status: 500 }
    );
  }
}