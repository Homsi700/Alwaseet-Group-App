/**
 * واجهة برمجة التطبيقات (API) للمصادقة
 * POST /api/auth/login - تسجيل الدخول
 * POST /api/auth/register - إنشاء حساب جديد
 * POST /api/auth/logout - تسجيل الخروج
 * GET /api/auth/me - الحصول على معلومات المستخدم الحالي
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { executeQuery } from '@/lib/db';
import { Schema } from '@/lib/db-schema';
import { loginUser, getUserFromRequest, getUserPermissions, logoutUser } from '@/lib/auth';
import { createSuccessResponse, createErrorResponse } from '@/lib/api-utils';
import { User } from '@/lib/types';

/**
 * تسجيل الدخول
 * POST /api/auth/login
 */
export async function POST(req: NextRequest) {
  try {
    // استخراج نوع الطلب من المسار
    const path = req.nextUrl.pathname;
    const authType = path.split('/').pop();
    
    if (authType === 'login') {
      // تسجيل الدخول
      const body = await req.json();
      
      if (!body.username || !body.password) {
        return createErrorResponse('يجب توفير اسم المستخدم وكلمة المرور');
      }
      
      const user = await loginUser(body.username, body.password);
      
      if (!user) {
        return createErrorResponse('اسم المستخدم أو كلمة المرور غير صحيحة', '', 401);
      }
      
      // الحصول على صلاحيات المستخدم
      const permissions = await getUserPermissions(user.userId);
      
      // إعداد الاستجابة
      const response = NextResponse.json({
        data: {
          ...user,
          permissions,
        },
        message: 'تم تسجيل الدخول بنجاح',
      });
      
      // إضافة الكوكيز
      response.cookies.set('userId', user.userId.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 أيام
        path: '/',
      });
      
      response.cookies.set('username', user.username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 أيام
        path: '/',
      });
      
      response.cookies.set('role', user.role, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 أيام
        path: '/',
      });
      
      return response;
    } else if (authType === 'register') {
      // إنشاء حساب جديد
      const body = await req.json();
      
      if (!body.username || !body.password || !body.email || !body.firstName || !body.lastName || !body.companyId) {
        return createErrorResponse('يجب توفير جميع البيانات المطلوبة');
      }
      
      // التحقق من وجود اسم المستخدم
      const checkUsernameQuery = `
        SELECT ${Schema.columns.users.id}
        FROM ${Schema.tables.users}
        WHERE ${Schema.columns.users.username} = @username
      `;
      
      const existingUsers = await executeQuery<any[]>(checkUsernameQuery, { username: body.username });
      
      if (existingUsers && existingUsers.length > 0) {
        return createErrorResponse('اسم المستخدم موجود بالفعل');
      }
      
      // إنشاء المستخدم
      const createUserQuery = `
        INSERT INTO ${Schema.tables.users} (
          ${Schema.columns.users.username},
          ${Schema.columns.users.passwordHash},
          ${Schema.columns.users.firstName},
          ${Schema.columns.users.lastName},
          ${Schema.columns.users.email},
          ${Schema.columns.users.role},
          ${Schema.columns.users.companyId},
          ${Schema.columns.users.createdAt},
          ${Schema.columns.users.isActive}
        )
        OUTPUT INSERTED.${Schema.columns.users.id} as userId
        VALUES (
          @username,
          HASHBYTES('SHA2_256', @password),
          @firstName,
          @lastName,
          @email,
          @role,
          @companyId,
          GETDATE(),
          1
        )
      `;
      
      const result = await executeQuery<{ userId: number }[]>(createUserQuery, {
        username: body.username,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        role: body.role || 'user',
        companyId: body.companyId,
      });
      
      if (!result || result.length === 0) {
        throw new Error('لم يتم إرجاع أي نتائج من قاعدة البيانات');
      }
      
      // الحصول على المستخدم المنشأ
      const userId = result[0].userId;
      const userQuery = `
        SELECT 
          ${Schema.columns.users.id} as userId,
          ${Schema.columns.users.username} as username,
          ${Schema.columns.users.firstName} as firstName,
          ${Schema.columns.users.lastName} as lastName,
          ${Schema.columns.users.email} as email,
          ${Schema.columns.users.role} as role,
          ${Schema.columns.users.companyId} as companyId,
          ${Schema.columns.users.createdAt} as createdAt,
          ${Schema.columns.users.isActive} as isActive
        FROM ${Schema.tables.users}
        WHERE ${Schema.columns.users.id} = @userId
      `;
      
      const users = await executeQuery<User[]>(userQuery, { userId });
      
      return createSuccessResponse(users[0], 'تم إنشاء الحساب بنجاح', 201);
    } else if (authType === 'logout') {
      // تسجيل الخروج
      logoutUser();
      
      return createSuccessResponse({ success: true }, 'تم تسجيل الخروج بنجاح');
    } else {
      return createErrorResponse('طلب غير صالح');
    }
  } catch (error: any) {
    console.error('[api/auth/route.ts] خطأ في المصادقة:', error);
    return createErrorResponse('حدث خطأ أثناء المصادقة', error.message);
  }
}

/**
 * الحصول على معلومات المستخدم الحالي
 * GET /api/auth/me
 */
export async function GET(req: NextRequest) {
  try {
    // الحصول على المستخدم الحالي
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return createErrorResponse('غير مصرح لك بالوصول', '', 401);
    }
    
    // الحصول على صلاحيات المستخدم
    const permissions = await getUserPermissions(user.userId);
    
    // إعداد الاستجابة
    return createSuccessResponse({
      ...user,
      permissions,
    });
  } catch (error: any) {
    console.error('[api/auth/route.ts] خطأ في الحصول على معلومات المستخدم:', error);
    return createErrorResponse('حدث خطأ أثناء الحصول على معلومات المستخدم', error.message);
  }
}