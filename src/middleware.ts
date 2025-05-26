import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

// المسارات التي لا تحتاج إلى مصادقة
const publicPaths = ['/api/auth/login', '/api/auth/register'];

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // التحقق إذا كان المسار عام
    if (publicPaths.includes(path)) {
        return NextResponse.next();
    }

    // التحقق من وجود token
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
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
