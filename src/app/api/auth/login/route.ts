import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db'; // تأكد من أن هذا المسار صحيح
import bcrypt from 'bcrypt';
import { SignJWT } from 'jose';
import type { User } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables. Please add it to .env.local');
}

async function getJwtSecretKey() {
  return new TextEncoder().encode(JWT_SECRET);
}

export async function POST(request: Request) {
  console.log("[Login API] Received login request.");
  try {
    const { username, password } = await request.json();
    console.log(`[Login API] Attempting login for username: ${username}`);

    if (!username || !password) {
      return NextResponse.json(
        { message: 'اسم المستخدم وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    // استعلام لجلب المستخدم مع كلمة المرور المشفرة
    const users = await executeQuery<User[]>(`
      SELECT 
        UserId as userId, 
        Username as username, 
        PasswordHash, -- جلب كلمة المرور المشفرة
        Role as role,
        CompanyId as companyId,
        FirstName as firstName,
        LastName as lastName,
        Email as email,
        IsActive as isActive
      FROM settings.Users 
      WHERE Username = @username AND IsActive = 1
    `, { 
      username
    });

    if (!users || users.length === 0) {
      console.log(`[Login API] User not found or not active: ${username}`);
      return NextResponse.json(
        { message: 'اسم المستخدم أو كلمة المرور غير صحيحة أو الحساب غير نشط' },
        { status: 401 }
      );
    }

    const user = users[0];
    
    // --- تعطيل مقارنة كلمة المرور مؤقتاً لمرحلة التطوير ---
    const passwordIsValid = true; // تجاوز التحقق من كلمة المرور
    /*
    // --- هذا هو الكود الصحيح لمقارنة كلمة المرور (سيتم إعادة تفعيله لاحقاً) ---
    if (!user.PasswordHash) {
      console.error(`[Login API] PasswordHash is missing for user: ${username}`);
      return NextResponse.json(
        { message: 'خطأ في إعدادات الحساب، يرجى الاتصال بالدعم.' },
        { status: 500 }
      );
    }
    const passwordIsValid = await bcrypt.compare(password, user.PasswordHash);
    */
    // --- نهاية الجزء المعطل مؤقتاً ---

    if (!passwordIsValid) {
      console.log(`[Login API] Invalid password for user: ${username}`);
      return NextResponse.json(
        { message: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    console.log(`[Login API] User found and password valid:`, { id: user.userId, role: user.role });

    // تحديث تاريخ آخر تسجيل دخول (اختياري)
    try {
      await executeQuery(`
        UPDATE settings.Users
        SET LastLogin = GETDATE()
        WHERE UserId = @userId
      `, { userId: user.userId });
      console.log(`[Login API] Updated LastLogin for user: ${user.userId}`);
    } catch (updateError) {
      console.error(`[Login API] Failed to update LastLogin for user ${user.userId}:`, updateError);
      // لا توقف العملية بسبب هذا الخطأ
    }

    // إنشاء توكن JWT
    const token = await new SignJWT({
      userId: user.userId,
      username: user.username,
      role: user.role,
      companyId: user.companyId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h') // صلاحية التوكن ساعتان
    .sign(await getJwtSecretKey());

    // إعداد الاستجابة مع بيانات المستخدم والتوكن
    const response = NextResponse.json({
      user: {
        userId: user.userId,
        username: user.username,
        role: user.role,
        companyId: user.companyId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive // إضافة حالة الحساب
      },
      token, // إرجاع التوكن في الجسم أيضاً إذا كانت الواجهة الأمامية تحتاجه مباشرة
      message: 'تم تسجيل الدخول بنجاح' // إضافة رسالة نجاح
    });

    // تعيين التوكن في كوكيز HTTPOnly
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // أو 'strict' لمزيد من الأمان
      path: '/',
      maxAge: 60 * 60 * 2, // ساعتان بالثواني
    });

    console.log(`[Login API] Login successful for user: ${username}. Token set in cookie.`);
    return response;

  } catch (error) {
    console.error('[Login API] Critical error during login process:', error);
    // تجنب إرسال تفاصيل الخطأ الحساسة إلى العميل في بيئة الإنتاج
    return NextResponse.json(
      { message: 'حدث خطأ غير متوقع أثناء محاولة تسجيل الدخول. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
  }
}
