
USE [master];
GO

-- تمكين وضع المصادقة المختلط (SQL Server and Windows Authentication)
EXEC xp_instance_regwrite N'HKEY_LOCAL_MACHINE', N'Software\Microsoft\MSSQLServer\MSSQLServer', N'LoginMode', REG_DWORD, 2;
GO

-- تغيير كلمة مرور حساب sa
ALTER LOGIN [sa] WITH PASSWORD=N'P@ssw0rd';
GO

-- تمكين حساب sa
ALTER LOGIN [sa] ENABLE;
GO

USE [AlwaseetGroup];
GO

-- إنشاء مستخدم قاعدة البيانات
IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'sa')
BEGIN
    CREATE USER [sa] FOR LOGIN [sa];
    ALTER ROLE [db_owner] ADD MEMBER [sa];
END
GO

