
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';
import type { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-is-very-secret-and-long-enough';
const JWT_EXPIRATION_TIME = '2h';

async function getJwtSecretKey() {
  if (!JWT_SECRET) {
    throw new Error('JWT Secret key is not set in environment variables');
  }
  return new TextEncoder().encode(JWT_SECRET);
}

export async function POST(request: Request) {
  console.log("[Login API] Received login request.");
  try {
    const { username, password } = await request.json();
    console.log(`[Login API] Attempting login for username: ${username}`);

    if (!username || !password) {
      console.log("[Login API] Missing username or password.");
      return NextResponse.json({ message: 'اسم المستخدم وكلمة المرور مطلوبان' }, { status: 400 });
    }

    // تأكدي أن الاستعلام صحيح وأن أسماء الأعمدة (UserId, Username, etc.) تطابق ما في قاعدة بياناتك
    // وأن `settings.Users` هو المسار الصحيح للجدول
    const users = await executeQuery<any[]>(`
      SELECT UserId, Username, PasswordHash, Role, CompanyId, FirstName, LastName, Email, IsActive
      FROM settings.Users 
      WHERE Username = @username
    `, { username }); // Pass params as an object

    if (!users || users.length === 0) {
      console.log(`[Login API] User not found or query returned no results for: ${username}`);
      return NextResponse.json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    const userFromDb = users[0];
    console.log(`[Login API] User found in DB:`, { userId: userFromDb.UserId, isActive: userFromDb.IsActive });


    if (!userFromDb.IsActive) {
        console.log(`[Login API] User ${username} is not active.`);
        return NextResponse.json({ message: 'هذا الحساب غير نشط. يرجى الاتصال بالمسؤول.' }, { status: 403 });
    }
    
    // تحقق من وجود PasswordHash قبل المقارنة
    if (!userFromDb.PasswordHash) {
        console.error(`[Login API] PasswordHash is missing for user: ${username}`);
        return NextResponse.json({ message: 'خطأ في تكوين حساب المستخدم. يرجى الاتصال بالدعم.' }, { status: 500 });
    }

    const passwordMatch = await bcrypt.compare(password, userFromDb.PasswordHash);

    if (!passwordMatch) {
      console.log(`[Login API] Password mismatch for user: ${username}`);
      return NextResponse.json({ message: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, { status: 401 });
    }

    console.log(`[Login API] Password match for user: ${username}. Attempting to update LastLogin.`);
    try {
        await executeQuery(`
            UPDATE settings.Users
            SET LastLogin = GETDATE()
            WHERE UserId = @userId
        `, { userId: userFromDb.UserId }); // Pass params as an object
        console.log(`[Login API] LastLogin updated for UserId: ${userFromDb.UserId}`);
    } catch (updateError) {
        console.error("[Login API] Failed to update LastLogin:", updateError);
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
    
    console.log(`[Login API] JWT generated for user: ${username}`);

    const response = NextResponse.json({
      message: 'تم تسجيل الدخول بنجاح',
      user: userPayload,
      token: token,
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 2, // 2 hours in seconds
      path: '/',
    });
    console.log(`[Login API] Login successful for user: ${username}. Token cookie set.`);
    return response;

  } catch (error) {
    console.error('[Login API] Critical error during login process:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع أثناء محاولة تسجيل الدخول.';
    return NextResponse.json(
      { message: 'فشل تسجيل الدخول: ' + errorMessage },
      { status: 500 }
    );
  }
}

    