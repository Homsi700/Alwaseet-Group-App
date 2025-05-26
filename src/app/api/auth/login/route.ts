import { executeQuery } from '@/lib/db';
import { NextResponse } from 'next/server';
import { compare } from 'bcrypt';
import { SignJWT } from 'jose'; // Using jose for signing for consistency if preferred, or keep jsonwebtoken
// import jwt from 'jsonwebtoken'; // Can keep this if you prefer its API for signing specifically

async function getJwtSecretKey() {
  const secret = process.env.JWT_SECRET || 'your-secret-key';
  if (!secret) {
    throw new Error('JWT Secret key is not set in environment variables');
  }
  return new TextEncoder().encode(secret);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // البحث عن المستخدم
        const users = await executeQuery<any[]>(`
            SELECT UserId, Username, PasswordHash, Role, CompanyId 
            FROM settings.Users 
            WHERE Username = @username AND IsActive = 1`,
            { username }
        );

        if (users.length === 0) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const user = users[0];

        // التحقق من كلمة المرور
        // Ensure PasswordHash is not null or undefined before comparing
        if (!user.PasswordHash) {
            console.error('User found but PasswordHash is null for username:', username);
            return NextResponse.json(
                { error: 'Error during login due to missing user data.' },
                { status: 500 }
            );
        }
        const isValid = await compare(password, user.PasswordHash);

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        // تحديث وقت آخر تسجيل دخول
        await executeQuery(`
            UPDATE settings.Users 
            SET LastLogin = GETDATE() 
            WHERE UserId = @userId`,
            { userId: user.UserId }
        );

        // إنشاء رمز JWT
        const secretKey = await getJwtSecretKey();
        const token = await new SignJWT({
                userId: user.UserId,
                username: user.Username,
                role: user.Role,
                companyId: user.CompanyId
            })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('24h')
            .sign(secretKey);
        
        // Or using jsonwebtoken if you prefer:
        // const token = jwt.sign(
        //     {
        //         userId: user.UserId,
        //         username: user.Username,
        //         role: user.Role,
        //         companyId: user.CompanyId
        //     },
        //     process.env.JWT_SECRET || 'your-secret-key', // This should be a string for jsonwebtoken
        //     { expiresIn: '24h' }
        // );

        const response = NextResponse.json({
            token,
            user: {
                userId: user.UserId,
                username: user.Username,
                role: user.Role,
                companyId: user.CompanyId
            }
        });

        // Set token in HTTPOnly cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'development',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        // Check if the error is an instance of Error to access message property safely
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during login';
        return NextResponse.json(
            { error: `Error during login: ${errorMessage}` },
            { status: 500 }
        );
    }
}
