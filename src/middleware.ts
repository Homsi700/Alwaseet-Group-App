import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

// المسارات التي لا تحتاج إلى مصادقة
const publicPaths = ['/api/auth/login', '/login'];

// المسارات التي تتطلب مصادقة
const protectedPaths = [
  '/dashboard',
  '/products',
  '/customers',
  '/sales',
  '/purchases',
  '/inventory',
  '/finance',
  '/reports',
  '/settings'
];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;    // التحقق إذا كان المسار عام
    if (publicPaths.includes(path)) {
        return NextResponse.next();
    }

    // التحقق من التوكن
    const token = isPageRequest 
        ? request.cookies.get('token')?.value 
        : request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
        // إذا كان طلب صفحة، قم بالتوجيه إلى صفحة تسجيل الدخول
        if (isPageRequest) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
        // إذا كان طلب API، أرجع خطأ 401
        return new NextResponse(
            JSON.stringify({ error: 'Authentication required' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        // التحقق من صحة الـ token
        const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // إضافة معلومات المستخدم إلى الطلب
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('user', JSON.stringify(decoded));

        // المتابعة مع الطلب
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    } catch (error) {
        return new NextResponse(
            JSON.stringify({ error: 'Invalid token' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

export const config = {
    matcher: '/api/:path*'
};
