import { NextRequest, NextResponse } from 'next/server';
// import { verify } from 'jsonwebtoken'; // No longer needed here if middleware handles verification for API routes too
import { jwtVerify } from 'jose';

async function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  if (!secret) {
    throw new Error('JWT Secret key is not set in environment variables');
  }
  return new TextEncoder().encode(secret);
}

// استخراج معلومات المستخدم من التوكن
// This function would typically be used in API routes if they need to re-verify or access user info
// If middleware already adds user info to request headers, API routes can use that.
export async function getUserFromToken(token: string): Promise<any | null> {
    try {
        if (!token) return null;
        const secretKey = await getJwtSecretKey();
        const { payload } = await jwtVerify(token, secretKey);
        return payload;
    } catch (error) {
        console.error("Error verifying token in getUserFromToken:", error);
        return null;
    }
}

// Example: Get user from request headers (set by middleware)
export function getUserFromRequest(request: NextRequest): any | null {
    const userPayloadHeader = request.headers.get('x-user-payload');
    if (userPayloadHeader) {
        try {
            return JSON.parse(userPayloadHeader);
        } catch (error) {
            console.error("Error parsing user payload from header:", error);
            return null;
        }
    }
    return null;
}


// التحقق من الصلاحيات
export function checkPermission(user: any, requiredRole: string | string[]) {
    if (!user || !user.role) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    return roles.includes(user.role);
}

// إنشاء رد خطأ
export function createErrorResponse(message: string, status: number = 401) {
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
    if (!user || user.companyId === undefined) return false;
    if (user.role === 'SuperAdmin') return true; // Assuming SuperAdmin has universal access
    return user.companyId === companyId;
}
