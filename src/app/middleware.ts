import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // المسارات التي لا تحتاج إلى مصادقة
  const publicPaths = ['/login', '/api/auth/login'];
  const path = request.nextUrl.pathname;

  // السماح بالوصول إلى المسارات العامة
  if (publicPaths.some(publicPath => path.startsWith(publicPath))) {
    return NextResponse.next();
  }

  // التحقق من وجود جلسة المستخدم
  const token = request.cookies.get('token');

  // إذا لم يكن هناك توكن، قم بالتوجيه إلى صفحة تسجيل الدخول
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// تحديد المسارات التي سيتم تطبيق middleware عليها
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
