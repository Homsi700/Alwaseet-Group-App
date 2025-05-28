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

-- الحصول على معرفات الفئات
DECLARE @MashrobatId INT;
DECLARE @MawadGhizaiyaId INT;
DECLARE @MuratibatId INT;
DECLARE @SagaerId INT;
DECLARE @MunazifatId INT;
DECLARE @AlbanId INT;
DECLARE @LuhumId INT;
DECLARE @KhudarId INT;
DECLARE @MualabatId INT;
DECLARE @HalawiyatId INT;

SELECT @MashrobatId = CategoryId FROM inventory.Categories WHERE Name = N'مشروبات' AND CompanyId = @CompanyId;
SELECT @MawadGhizaiyaId = CategoryId FROM inventory.Categories WHERE Name = N'مواد غذائية' AND CompanyId = @CompanyId;
SELECT @MuratibatId = CategoryId FROM inventory.Categories WHERE Name = N'مرطبات' AND CompanyId = @CompanyId;
SELECT @SagaerId = CategoryId FROM inventory.Categories WHERE Name = N'سجائر' AND CompanyId = @CompanyId;
SELECT @MunazifatId = CategoryId FROM inventory.Categories WHERE Name = N'منظفات' AND CompanyId = @CompanyId;
SELECT @AlbanId = CategoryId FROM inventory.Categories WHERE Name = N'ألبان وأجبان' AND CompanyId = @CompanyId;
SELECT @LuhumId = CategoryId FROM inventory.Categories WHERE Name = N'لحوم' AND CompanyId = @CompanyId;
SELECT @KhudarId = CategoryId FROM inventory.Categories WHERE Name = N'خضروات وفواكه' AND CompanyId = @CompanyId;
SELECT @MualabatId = CategoryId FROM inventory.Categories WHERE Name = N'معلبات' AND CompanyId = @CompanyId;
SELECT @HalawiyatId = CategoryId FROM inventory.Categories WHERE Name = N'حلويات' AND CompanyId = @CompanyId;

-- طباعة معرفات الفئات
PRINT N'معرف فئة المشروبات: ' + ISNULL(CONVERT(NVARCHAR(10), @MashrobatId), N'غير موجود');
PRINT N'معرف فئة المواد الغذائية: ' + ISNULL(CONVERT(NVARCHAR(10), @MawadGhizaiyaId), N'غير موجود');
PRINT N'معرف فئة المرطبات: ' + ISNULL(CONVERT(NVARCHAR(10), @MuratibatId), N'غير موجود');
PRINT N'معرف فئة السجائر: ' + ISNULL(CONVERT(NVARCHAR(10), @SagaerId), N'غير موجود');
PRINT N'معرف فئة المنظفات: ' + ISNULL(CONVERT(NVARCHAR(10), @MunazifatId), N'غير موجود');

-- إضافة منتجات المشروبات
IF @MashrobatId IS NOT NULL
BEGIN
    PRINT N'إضافة منتجات المشروبات...';
    INSERT INTO inventory.Products (
        Name, Barcode, Description, CategoryId,
        PurchasePrice, SalePrice, Quantity,
        UnitOfMeasure, MinimumQuantity, CompanyId, CreatedBy, IsActive
    )
    VALUES 
        (N'كوكاكولا 330 مل', 'COCA330', N'عبوة كوكاكولا 330 مل', @MashrobatId, 0.75, 1.25, 100, N'علبة', 20, @CompanyId, @AdminId, 1),
        (N'بيبسي 330 مل', 'PEPSI330', N'عبوة بيبسي 330 مل', @MashrobatId, 0.70, 1.20, 120, N'علبة', 20, @CompanyId, @AdminId, 1),
        (N'سفن أب 330 مل', '7UP330', N'عبوة سفن أب 330 مل', @MashrobatId, 0.70, 1.20, 80, N'علبة', 15, @CompanyId, @AdminId, 1),
        (N'كوكاكولا 1.5 لتر', 'COCA1500', N'عبوة كوكاكولا 1.5 لتر', @MashrobatId, 1.50, 2.50, 50, N'زجاجة', 10, @CompanyId, @AdminId, 1),
        (N'بيبسي 1.5 لتر', 'PEPSI1500', N'عبوة بيبسي 1.5 لتر', @MashrobatId, 1.45, 2.45, 60, N'زجاجة', 10, @CompanyId, @AdminId, 1);
END

-- إضافة منتجات المواد الغذائية
IF @MawadGhizaiyaId IS NOT NULL
BEGIN
    PRINT N'إضافة منتجات المواد الغذائية...';
    INSERT INTO inventory.Products (
        Name, Barcode, Description, CategoryId,
        PurchasePrice, SalePrice, Quantity,
        UnitOfMeasure, MinimumQuantity, CompanyId, CreatedBy, IsActive
    )
    VALUES 
        (N'أرز بسمتي 5 كجم', 'RICE5KG', N'كيس أرز بسمتي 5 كجم', @MawadGhizaiyaId, 5.00, 7.50, 30, N'كيس', 5, @CompanyId, @AdminId, 1),
        (N'سكر 1 كجم', 'SUGAR1KG', N'كيس سكر أبيض 1 كجم', @MawadGhizaiyaId, 0.80, 1.20, 50, N'كيس', 10, @CompanyId, @AdminId, 1),
        (N'زيت دوار الشمس 1.8 لتر', 'OIL1.8L', N'زجاجة زيت دوار الشمس 1.8 لتر', @MawadGhizaiyaId, 2.50, 3.75, 40, N'زجاجة', 8, @CompanyId, @AdminId, 1),
        (N'معكرونة 400 جرام', 'PASTA400G', N'عبوة معكرونة 400 جرام', @MawadGhizaiyaId, 0.60, 1.00, 60, N'عبوة', 15, @CompanyId, @AdminId, 1),
        (N'طحين 1 كجم', 'FLOUR1KG', N'كيس طحين 1 كجم', @MawadGhizaiyaId, 0.70, 1.10, 45, N'كيس', 10, @CompanyId, @AdminId, 1);
END

-- إضافة منتجات الألبان والأجبان
IF @AlbanId IS NOT NULL
BEGIN
    PRINT N'إضافة منتجات الألبان والأجبان...';
    INSERT INTO inventory.Products (
        Name, Barcode, Description, CategoryId,
        PurchasePrice, SalePrice, Quantity,
        UnitOfMeasure, MinimumQuantity, CompanyId, CreatedBy, IsActive
    )
    VALUES 
        (N'حليب طازج 1 لتر', 'MILK1L', N'عبوة حليب طازج 1 لتر', @AlbanId, 1.20, 1.80, 40, N'عبوة', 10, @CompanyId, @AdminId, 1),
        (N'جبنة بيضاء 500 جرام', 'CHEESE500G', N'عبوة جبنة بيضاء 500 جرام', @AlbanId, 2.00, 3.00, 25, N'عبوة', 5, @CompanyId, @AdminId, 1),
        (N'زبادي 4 عبوات', 'YOGURT4P', N'طبق زبادي 4 عبوات', @AlbanId, 1.50, 2.25, 30, N'طبق', 8, @CompanyId, @AdminId, 1),
        (N'لبنة 400 جرام', 'LABNEH400G', N'عبوة لبنة 400 جرام', @AlbanId, 1.80, 2.70, 20, N'عبوة', 5, @CompanyId, @AdminId, 1),
        (N'جبنة مثلثات 16 قطعة', 'CHEESET16P', N'علبة جبنة مثلثات 16 قطعة', @AlbanId, 1.60, 2.40, 35, N'علبة', 7, @CompanyId, @AdminId, 1);
END

-- إضافة منتجات المنظفات
IF @MunazifatId IS NOT NULL
BEGIN
    PRINT N'إضافة منتجات المنظفات...';
    INSERT INTO inventory.Products (
        Name, Barcode, Description, CategoryId,
        PurchasePrice, SalePrice, Quantity,
        UnitOfMeasure, MinimumQuantity, CompanyId, CreatedBy, IsActive
    )
    VALUES 
        (N'منظف أرضيات 1 لتر', 'FLOOR1L', N'عبوة منظف أرضيات 1 لتر', @MunazifatId, 1.00, 1.75, 30, N'زجاجة', 8, @CompanyId, @AdminId, 1),
        (N'منظف زجاج 500 مل', 'GLASS500ML', N'عبوة منظف زجاج 500 مل', @MunazifatId, 0.80, 1.50, 25, N'زجاجة', 6, @CompanyId, @AdminId, 1),
        (N'صابون غسيل 5 كجم', 'SOAP5KG', N'كيس صابون غسيل 5 كجم', @MunazifatId, 4.00, 6.50, 15, N'كيس', 3, @CompanyId, @AdminId, 1),
        (N'منظف أطباق 750 مل', 'DISH750ML', N'عبوة منظف أطباق 750 مل', @MunazifatId, 1.20, 2.00, 20, N'زجاجة', 5, @CompanyId, @AdminId, 1),
        (N'معطر جو 300 مل', 'AIR300ML', N'عبوة معطر جو 300 مل', @MunazifatId, 1.50, 2.75, 18, N'عبوة', 4, @CompanyId, @AdminId, 1);
END

-- طباعة المنتجات المضافة
PRINT N'تم إضافة المنتجات التالية:';
SELECT TOP 20
    ProductId,
    Name,
    Barcode,
    CategoryId,
    PurchasePrice,
    SalePrice,
    Quantity,
    UnitOfMeasure
FROM inventory.Products 
WHERE CompanyId = @CompanyId
ORDER BY ProductId DESC;
GO