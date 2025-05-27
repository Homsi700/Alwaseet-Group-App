
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose'; // For creating JWT
import type { User } from '@/types'; // Assuming User type is defined

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Ensure this is in your .env.local
const JWT_EXPIRATION_TIME = '2h'; // Token expiration time

async function getJwtSecretKey() {
  if (!JWT_SECRET) {
    throw new Error('JWT Secret key is not set in environment variables');
  }
  return new TextEncoder().encode(JWT_SECRET);
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ message: 'اسم المستخدم وكلمة المرور مطلوبان' }, { status: 400 });
    }

    const users = await executeQuery<any[]>(`
      SELECT UserId, Username, PasswordHash, Role, CompanyId, FirstName, LastName, Email, IsActive
      FROM settings.Users 
      WHERE Username = @username
    `, { username });

    if (!users || users.length === 0) {
      return NextResponse.json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    const userFromDb = users[0];

    if (!userFromDb.IsActive) {
        return NextResponse.json({ message: 'هذا الحساب غير نشط. يرجى الاتصال بالمسؤول.' }, { status: 403 });
    }

    const passwordMatch = await bcrypt.compare(password, userFromDb.PasswordHash);

    if (!passwordMatch) {
      return NextResponse.json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    // Update LastLogin
    try {
        await executeQuery(`
            UPDATE settings.Users
            SET LastLogin = GETDATE()
            WHERE UserId = @userId
        `, { userId: userFromDb.UserId });
    } catch (updateError) {
        console.error("Failed to update LastLogin:", updateError);
        // Non-critical error, proceed with login
    }
    
    const userPayload: User = {
      userId: userFromDb.UserId,
      username: userFromDb.Username,
      firstName: userFromDb.FirstName,
      lastName: userFromDb.LastName,
      email: userFromDb.Email,
      role: userFromDb.Role,
      companyId: userFromDb.CompanyId,
      isActive: userFromDb.IsActive,
    };

    const token = await new SignJWT(userPayload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(JWT_EXPIRATION_TIME)
      .sign(await getJwtSecretKey());

    const response = NextResponse.json({
      message: 'تم تسجيل الدخول بنجاح',
      user: userPayload,
      token: token, // Sending token in body for client-side storage if needed by AuthProvider
    });

    // Set token in HTTPOnly cookie for security (used by middleware)
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 2, // 2 hours in seconds
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
    return NextResponse.json(
      { message: 'فشل تسجيل الدخول: ' + errorMessage },
      { status: 500 }
    );
  }
}
