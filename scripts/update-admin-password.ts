
import bcrypt from 'bcrypt';
import { executeQuery } from '../src/lib/db'; // Uses the new mssql based db.ts
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });


async function createOrUpdateAdminUser() {
    console.log('Starting createOrUpdateAdminUser script...');
    try {
        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash('123456', 10);
        console.log('Password hashed.');

        // محاولة إنشاء شركة افتراضية إذا لم تكن موجودة
        const companyCheckQuery = `
            IF NOT EXISTS (SELECT * FROM settings.Companies WHERE Name = 'Default Company')
            BEGIN
                INSERT INTO settings.Companies (Name, CurrencyCode, CurrencySymbol, IsActive)
                VALUES ('Default Company', 'SYP', 'ل.س', 1)
            END
        `;
        await executeQuery(companyCheckQuery);
        console.log('Default company ensured.');

        // الحصول على معرف الشركة الافتراضية
        const companiesResult = await executeQuery<{ CompanyId: number }[]>(`
            SELECT CompanyId FROM settings.Companies WHERE Name = 'Default Company'
        `);
        
        if (!companiesResult || companiesResult.length === 0) {
            console.error('Failed to find or create Default Company.');
            return;
        }
        const companyId = companiesResult[0].CompanyId;
        console.log(`Default company ID: ${companyId}`);

        // التحقق مما إذا كان المستخدم موجوداً
        const usersResult = await executeQuery<{ UserId: number }[]>(`
            SELECT UserId FROM settings.Users WHERE Username = 'admin'
        `);

        if (usersResult && usersResult.length > 0) {
            // تحديث كلمة المرور للمستخدم الموجود
            await executeQuery(`
                UPDATE settings.Users 
                SET PasswordHash = @password,
                    Role = 'SuperAdmin',
                    CompanyId = @companyId,
                    UpdatedAt = GETDATE()
                WHERE Username = 'admin'
            `, {
                password: hashedPassword,
                companyId: companyId
            });
            
            console.log('تم تحديث بيانات المستخدم المسؤول بنجاح');
        } else {
            // إنشاء مستخدم جديد
            await executeQuery(`
                INSERT INTO settings.Users (
                    Username, 
                    PasswordHash, 
                    FirstName,
                    LastName,
                    Role,
                    CompanyId,
                    IsActive,
                    CreatedAt,
                    UpdatedAt
                )
                VALUES (
                    'admin',
                    @password,
                    'System',
                    'Administrator',
                    'SuperAdmin',
                    @companyId,
                    1,
                    GETDATE(),
                    GETDATE()
                )
            `, {
                password: hashedPassword,
                companyId: companyId
            });
            
            console.log('تم إنشاء المستخدم المسؤول بنجاح');
        }
    } catch (error) {
        console.error('حدث خطأ في سكريبت تحديث/إنشاء المستخدم المسؤول:', error);
    } finally {
        // Since mssql manages a connection pool, explicit closing of all connections
        // is usually handled by the pool or on application shutdown.
        // For a script like this, the process will exit and connections will be reclaimed.
        console.log('Admin user script finished.');
    }
}

createOrUpdateAdminUser();
