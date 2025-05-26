USE AlwaseetGroup;
GO

-- إضافة شركة افتراضية
INSERT INTO settings.Companies (
    Name, TaxNumber, Address, PhoneNumber, Email, 
    CurrencyCode, CurrencySymbol, CreatedAt, IsActive
)
VALUES (
    N'شركة الوسيط للتجارة',
    N'123456789',
    N'دمشق - سوريا',
    N'0911234567',
    N'info@alwaseet.com',
    'SYP',
    N'ل.س',
    GETDATE(),
    1
);

DECLARE @CompanyId INT = SCOPE_IDENTITY();

-- إضافة مستخدم admin
INSERT INTO settings.Users (
    Username, PasswordHash, FirstName, LastName,
    Email, Role, CompanyId, CreatedAt, IsActive
)
VALUES (
    'admin',
    -- كلمة المرور: 123456 (يجب تغييرها في الإنتاج)
    '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', -- SHA256 for '123456'
    N'مدير',
    N'النظام',
    'admin@alwaseet.com',
    'Administrator',
    @CompanyId,
    GETDATE(),
    1
);

DECLARE @AdminId INT = SCOPE_IDENTITY();

-- إضافة الحسابات المحاسبية الأساسية
INSERT INTO accounting.ChartOfAccounts (
    AccountCode, AccountName, AccountType,
    CompanyId, CreatedBy, IsActive
)
VALUES 
    ('1000', N'الأصول', 'Asset', @CompanyId, @AdminId, 1),
    ('1100', N'النقدية', 'Asset', @CompanyId, @AdminId, 1),
    ('2000', N'الخصوم', 'Liability', @CompanyId, @AdminId, 1),
    ('3000', N'حقوق الملكية', 'Equity', @CompanyId, @AdminId, 1),
    ('4000', N'الإيرادات', 'Revenue', @CompanyId, @AdminId, 1),
    ('5000', N'المصروفات', 'Expense', @CompanyId, @AdminId, 1);

-- إضافة فئات المنتجات
INSERT INTO inventory.Categories (
    Name, Description, CompanyId, CreatedBy, IsActive
)
VALUES 
    (N'منتجات عامة', N'الفئة الافتراضية للمنتجات', @CompanyId, @AdminId, 1),
    (N'إلكترونيات', N'الأجهزة والمعدات الإلكترونية', @CompanyId, @AdminId, 1),
    (N'أدوات مكتبية', N'مستلزمات وأدوات مكتبية', @CompanyId, @AdminId, 1);

-- إضافة منتج تجريبي
DECLARE @CategoryId INT = SCOPE_IDENTITY();

EXEC inventory.sp_AddProduct
    @Name = N'منتج تجريبي',
    @Barcode = '1234567890',
    @Description = N'هذا منتج تجريبي للنظام',
    @CategoryId = @CategoryId,
    @PurchasePrice = 1000,
    @SalePrice = 1200,
    @Quantity = 100,
    @UnitOfMeasure = N'قطعة',
    @MinimumQuantity = 10,
    @ImageUrl = NULL,
    @CompanyId = @CompanyId,
    @CreatedBy = @AdminId;

-- إضافة عميل افتراضي
INSERT INTO sales.Customers (
    Name, ContactPerson, PhoneNumber,
    Email, Address, CompanyId,
    CreatedBy, IsActive
)
VALUES (
    N'عميل نقدي',
    N'عميل نقدي',
    N'',
    N'',
    N'',
    @CompanyId,
    @AdminId,
    1
);

-- طباعة معلومات الدخول
SELECT 'تم إنشاء بيانات النظام الأساسية:' AS Message;
SELECT 
    'admin' AS Username,
    '123456' AS Password,
    CompanyId,
    Name AS CompanyName
FROM settings.Companies 
WHERE CompanyId = @CompanyId;
GO
