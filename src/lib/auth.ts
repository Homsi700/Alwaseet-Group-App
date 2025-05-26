import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

// استخراج معلومات المستخدم من التوكن
export function getUser(request: NextRequest) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) return null;

        const decoded = verify(token, process.env.JWT_SECRET || 'your-secret-key');
        return decoded;
    } catch {
        return null;
    }
}

// التحقق من الصلاحيات
export function checkPermission(user: any, requiredRole: string | string[]) {
    if (!user) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(user.role);
}

// إنشاء رد خطأ
export function createErrorResponse(message: string, status: number = 400) {
    return new NextResponse(
        JSON.stringify({ error: message }),
        { 
            status,
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

// التحقق من صلاحية الوصول للشركة
export function checkCompanyAccess(user: any, companyId: number) {
    if (!user) return false;
    if (user.role === 'SuperAdmin') return true;
    return user.companyId === companyId;
}
