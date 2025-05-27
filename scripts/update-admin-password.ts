import bcrypt from 'bcrypt';
import { executeQuery } from '../src/lib/db';

async function createOrUpdateAdminUser() {
    try {
        // تشفير كلمة المرور
        const hashedPassword = await bcrypt.hash('123456', 10);
        
        // محاولة إنشاء شركة افتراضية إذا لم تكن موجودة
        await executeQuery(`
            IF NOT EXISTS (SELECT * FROM settings.Companies WHERE Name = 'Default Company')
            BEGIN
                INSERT INTO settings.Companies (Name, CurrencyCode, CurrencySymbol, IsActive)
                VALUES ('Default Company', 'SYP', 'ل.س', 1)
            END
        `);

        // الحصول على معرف الشركة الافتراضية
        const companies = await executeQuery<{ CompanyId: number }[]>(`
            SELECT CompanyId FROM settings.Companies WHERE Name = 'Default Company'
        `);

        const companyId = companies[0]?.CompanyId;

        // التحقق مما إذا كان المستخدم موجوداً
        const users = await executeQuery<{ UserId: number }[]>(`
            SELECT UserId FROM settings.Users WHERE Username = 'admin'
        `);

        if (users.length > 0) {
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
                companyId
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
                    IsActive
                )
                VALUES (
                    'admin',
                    @password,
                    'System',
                    'Administrator',
                    'SuperAdmin',
                    @companyId,
                    1
                )
            `, {
                password: hashedPassword,
                companyId
            });
            
            console.log('تم إنشاء المستخدم المسؤول بنجاح');
        }
    } catch (error) {
        console.error('حدث خطأ:', error);
    }
}

createOrUpdateAdminUser();
