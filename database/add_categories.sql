USE AlwaseetGroup;
GO

-- الحصول على معرف الشركة والمستخدم
DECLARE @CompanyId INT;
DECLARE @AdminId INT;

SELECT TOP 1 @CompanyId = CompanyId FROM settings.Companies;
SELECT TOP 1 @AdminId = UserId FROM settings.Users WHERE Role = 'Administrator';

-- طباعة معلومات الشركة والمستخدم
PRINT N'معرف الشركة: ' + CONVERT(NVARCHAR(10), @CompanyId);
PRINT N'معرف المستخدم: ' + CONVERT(NVARCHAR(10), @AdminId);

-- التحقق من وجود فئات
DECLARE @ExistingCount INT;
SELECT @ExistingCount = COUNT(*) FROM inventory.Categories WHERE CompanyId = @CompanyId;
PRINT N'عدد الفئات الموجودة: ' + CONVERT(NVARCHAR(10), @ExistingCount);

-- إضافة فئات المنتجات الإضافية
INSERT INTO inventory.Categories (
    Name, Description, CompanyId, CreatedBy, IsActive
)
VALUES 
    (N'مشروبات', N'مشروبات غازية وعصائر', @CompanyId, @AdminId, 1),
    (N'مواد غذائية', N'مواد غذائية متنوعة', @CompanyId, @AdminId, 1),
    (N'مرطبات', N'مرطبات ومشروبات باردة', @CompanyId, @AdminId, 1),
    (N'سجائر', N'سجائر ومنتجات التبغ', @CompanyId, @AdminId, 1),
    (N'منظفات', N'منتجات التنظيف والعناية المنزلية', @CompanyId, @AdminId, 1),
    (N'ألبان وأجبان', N'منتجات الألبان والأجبان', @CompanyId, @AdminId, 1),
    (N'لحوم', N'لحوم طازجة ومجمدة', @CompanyId, @AdminId, 1),
    (N'خضروات وفواكه', N'خضروات وفواكه طازجة', @CompanyId, @AdminId, 1),
    (N'معلبات', N'أغذية معلبة ومحفوظة', @CompanyId, @AdminId, 1),
    (N'حلويات', N'حلويات ومنتجات المخابز', @CompanyId, @AdminId, 1);

-- طباعة الفئات المضافة
PRINT N'تم إضافة الفئات التالية:';
SELECT 
    CategoryId,
    Name
FROM inventory.Categories 
WHERE CompanyId = @CompanyId
ORDER BY CategoryId;
GO