import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // Replaced jsonwebtoken with jose

// المسارات التي لا تحتاج إلى مصادقة
const publicPaths = [
  // Auth routes
  '/api/auth/login', 
  '/login',
  
  // API routes that should be public
  '/api/categories',
  '/api/products',
  '/api/products/[productId]', // For individual product operations
  '/api/invoices', // مؤقتًا للسماح بإنشاء الفواتير بدون مصادقة
];

// المسارات التي تتطلب مصادقة (لطلبات الصفحات)
// middleware configuration matcher will handle API routes separately if needed.
// For page requests, this middleware checks for a token.
// const protectedPaths = [
//   '/dashboard',
//   '/products',
//   '/customers',
//   // ... and other app pages
// ];

async function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  if (!secret) {
    throw new Error('JWT Secret key is not set in environment variables');
  }
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPageRequest = !path.startsWith('/api');

  // التحقق إذا كان المسار عام
  // Check if the path is in the public paths list or matches a pattern with [productId] or other parameters
  const isPublicPath = publicPaths.some(publicPath => {
    if (publicPath.includes('[')) {
      // Convert [parameter] pattern to regex
      const pattern = publicPath.replace(/\[\w+\]/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    }
    return publicPath === path;
  });
  
  if (isPublicPath) {
    console.log(`[middleware] Public path: ${path}, allowing without auth`);
    return NextResponse.next();
  }

  // التحقق من التوكن
  const token = isPageRequest
    ? request.cookies.get('token')?.value
    : request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    // إذا كان طلب صفحة، قم بالتوجيه إلى صفحة تسجيل الدخول
    if (isPageRequest && path !== '/login') { // Avoid redirect loop if already on login
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
    const secretKey = await getJwtSecretKey();
    const { payload: decoded } = await jwtVerify(token, secretKey);
    
    // إضافة معلومات المستخدم إلى الطلب (بشكل آمن للـ headers)
    const requestHeaders = new Headers(request.headers);
    // For page requests, setting a header like 'x-user-info' is common if needed by Server Components
    // For API requests, this can be directly accessed by backend logic
    requestHeaders.set('x-user-payload', JSON.stringify(decoded));


    // المتابعة مع الطلب
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Middleware token verification error:", error);
    // إذا كان التوكن غير صالح
    if (isPageRequest && path !== '/login') {
      // مسح الكوكيز غير الصالحة وإعادة التوجيه
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
    if (!isPageRequest) {
      return new NextResponse(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    // If it's a page request, and token is invalid, redirect to login
     const response = NextResponse.redirect(new URL('/login', request.url));
     response.cookies.delete('token'); // Clear invalid token
     return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
