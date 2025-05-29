-- بيانات اختبارية لقاعدة البيانات

-- إنشاء المخططات إذا لم تكن موجودة
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'dbo')
BEGIN
    EXEC('CREATE SCHEMA dbo');
END

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'sales')
BEGIN
    EXEC('CREATE SCHEMA sales');
END

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'inventory')
BEGIN
    EXEC('CREATE SCHEMA inventory');
END

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'accounting')
BEGIN
    EXEC('CREATE SCHEMA accounting');
END

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'security')
BEGIN
    EXEC('CREATE SCHEMA security');
END

-- إنشاء الجداول إذا لم تكن موجودة
-- جدول الشركات
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Companies' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.Companies (
        CompanyId INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        TaxNumber NVARCHAR(50),
        Address NVARCHAR(255),
        PhoneNumber NVARCHAR(20),
        Email NVARCHAR(100),
        CurrencyCode NVARCHAR(10),
        CurrencySymbol NVARCHAR(10),
        Logo NVARCHAR(255),
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME,
        IsActive BIT DEFAULT 1
    );
END

-- جدول المستخدمين
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users' AND schema_id = SCHEMA_ID('security'))
BEGIN
    CREATE TABLE security.Users (
        UserId INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(50) NOT NULL,
        FirstName NVARCHAR(50) NOT NULL,
        LastName NVARCHAR(50) NOT NULL,
        Email NVARCHAR(100) NOT NULL,
        PasswordHash VARBINARY(256) NOT NULL,
        Role NVARCHAR(20) NOT NULL,
        CompanyId INT NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME,
        LastLogin DATETIME,
        IsActive BIT DEFAULT 1,
        CONSTRAINT FK_Users_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId)
    );
END

-- جدول العملاء
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Customers' AND schema_id = SCHEMA_ID('sales'))
BEGIN
    CREATE TABLE sales.Customers (
        CustomerId INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        ContactPerson NVARCHAR(100),
        PhoneNumber NVARCHAR(20),
        Email NVARCHAR(100),
        Address NVARCHAR(255),
        TaxNumber NVARCHAR(50),
        CreditLimit DECIMAL(18,2) DEFAULT 0,
        Balance DECIMAL(18,2) DEFAULT 0,
        CompanyId INT NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME,
        CreatedBy INT,
        IsActive BIT DEFAULT 1,
        CONSTRAINT FK_Customers_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId),
        CONSTRAINT FK_Customers_Users FOREIGN KEY (CreatedBy) REFERENCES security.Users(UserId)
    );
END

-- جدول الفئات
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Categories' AND schema_id = SCHEMA_ID('inventory'))
BEGIN
    CREATE TABLE inventory.Categories (
        CategoryId INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Description NVARCHAR(255),
        ParentCategoryId INT,
        CompanyId INT NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME,
        CreatedBy INT,
        IsActive BIT DEFAULT 1,
        CONSTRAINT FK_Categories_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId),
        CONSTRAINT FK_Categories_Users FOREIGN KEY (CreatedBy) REFERENCES security.Users(UserId),
        CONSTRAINT FK_Categories_ParentCategories FOREIGN KEY (ParentCategoryId) REFERENCES inventory.Categories(CategoryId)
    );
END

-- جدول المنتجات
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Products' AND schema_id = SCHEMA_ID('inventory'))
BEGIN
    CREATE TABLE inventory.Products (
        ProductId INT IDENTITY(1,1) PRIMARY KEY,
        Name NVARCHAR(100) NOT NULL,
        Barcode NVARCHAR(50),
        Description NVARCHAR(255),
        CategoryId INT,
        PurchasePrice DECIMAL(18,2) DEFAULT 0,
        SalePrice DECIMAL(18,2) DEFAULT 0,
        Quantity DECIMAL(18,2) DEFAULT 0,
        UnitOfMeasure NVARCHAR(20),
        MinimumQuantity DECIMAL(18,2) DEFAULT 0,
        ImageUrl NVARCHAR(255),
        CompanyId INT NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME,
        CreatedBy INT,
        IsActive BIT DEFAULT 1,
        CONSTRAINT FK_Products_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId),
        CONSTRAINT FK_Products_Categories FOREIGN KEY (CategoryId) REFERENCES inventory.Categories(CategoryId),
        CONSTRAINT FK_Products_Users FOREIGN KEY (CreatedBy) REFERENCES security.Users(UserId)
    );
END

-- جدول الفواتير
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Invoices' AND schema_id = SCHEMA_ID('sales'))
BEGIN
    CREATE TABLE sales.Invoices (
        InvoiceId INT IDENTITY(1,1) PRIMARY KEY,
        InvoiceNumber NVARCHAR(50) NOT NULL,
        InvoiceDate DATE NOT NULL,
        CustomerId INT NOT NULL,
        PaymentMethod NVARCHAR(50) NOT NULL,
        SubTotal DECIMAL(18,2) DEFAULT 0,
        DiscountPercent DECIMAL(5,2) DEFAULT 0,
        DiscountAmount DECIMAL(18,2) DEFAULT 0,
        TaxPercent DECIMAL(5,2) DEFAULT 0,
        TaxAmount DECIMAL(18,2) DEFAULT 0,
        TotalAmount DECIMAL(18,2) DEFAULT 0,
        AmountPaid DECIMAL(18,2) DEFAULT 0,
        AmountDue DECIMAL(18,2) DEFAULT 0,
        Status NVARCHAR(20) NOT NULL,
        Notes NVARCHAR(MAX),
        CompanyId INT NOT NULL,
        CreatedAt DATETIME DEFAULT GETDATE(),
        UpdatedAt DATETIME,
        CreatedBy INT NOT NULL,
        CONSTRAINT FK_Invoices_Companies FOREIGN KEY (CompanyId) REFERENCES dbo.Companies(CompanyId),
        CONSTRAINT FK_Invoices_Customers FOREIGN KEY (CustomerId) REFERENCES sales.Customers(CustomerId),
        CONSTRAINT FK_Invoices_Users FOREIGN KEY (CreatedBy) REFERENCES security.Users(UserId)
    );
END

-- جدول بنود الفواتير
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InvoiceItems' AND schema_id = SCHEMA_ID('sales'))
BEGIN
    CREATE TABLE sales.InvoiceItems (
        InvoiceItemId INT IDENTITY(1,1) PRIMARY KEY,
        InvoiceId INT NOT NULL,
        ProductId INT NOT NULL,
        Quantity DECIMAL(18,2) NOT NULL,
        UnitPrice DECIMAL(18,2) NOT NULL,
        DiscountPercent DECIMAL(5,2) DEFAULT 0,
        DiscountAmount DECIMAL(18,2) DEFAULT 0,
        TaxPercent DECIMAL(5,2) DEFAULT 0,
        TaxAmount DECIMAL(18,2) DEFAULT 0,
        LineTotal DECIMAL(18,2) NOT NULL,
        CONSTRAINT FK_InvoiceItems_Invoices FOREIGN KEY (InvoiceId) REFERENCES sales.Invoices(InvoiceId),
        CONSTRAINT FK_InvoiceItems_Products FOREIGN KEY (ProductId) REFERENCES inventory.Products(ProductId)
    );
END

-- إدراج بيانات اختبارية
-- إدراج شركة
IF NOT EXISTS (SELECT * FROM dbo.Companies WHERE Name = 'شركة الوسيط')
BEGIN
    INSERT INTO dbo.Companies (Name, TaxNumber, Address, PhoneNumber, Email, CurrencyCode, CurrencySymbol)
    VALUES ('شركة الوسيط', '123456789', 'الرياض، المملكة العربية السعودية', '0555555555', 'info@alwaseet.com', 'SAR', 'ر.س');
END

-- إدراج مستخدم
IF NOT EXISTS (SELECT * FROM security.Users WHERE Username = 'admin')
BEGIN
    INSERT INTO security.Users (Username, FirstName, LastName, Email, PasswordHash, Role, CompanyId)
    VALUES ('admin', 'مدير', 'النظام', 'admin@alwaseet.com', HASHBYTES('SHA2_256', 'admin123'), 'admin', 1);
END

-- إدراج عملاء
IF NOT EXISTS (SELECT * FROM sales.Customers WHERE Name = 'عميل نقدي')
BEGIN
    INSERT INTO sales.Customers (Name, PhoneNumber, Email, Address, CompanyId, CreatedBy)
    VALUES ('عميل نقدي', '0000000000', 'cash@example.com', 'الرياض', 1, 1);
END

IF NOT EXISTS (SELECT * FROM sales.Customers WHERE Name = 'شركة الأمل')
BEGIN
    INSERT INTO sales.Customers (Name, ContactPerson, PhoneNumber, Email, Address, TaxNumber, CompanyId, CreatedBy)
    VALUES ('شركة الأمل', 'أحمد محمد', '0555555551', 'info@alamal.com', 'الرياض، شارع العليا', '987654321', 1, 1);
END

IF NOT EXISTS (SELECT * FROM sales.Customers WHERE Name = 'مؤسسة النور')
BEGIN
    INSERT INTO sales.Customers (Name, ContactPerson, PhoneNumber, Email, Address, TaxNumber, CompanyId, CreatedBy)
    VALUES ('مؤسسة النور', 'محمد علي', '0555555552', 'info@alnoor.com', 'جدة، شارع التحلية', '123789456', 1, 1);
END

-- إدراج فئات
IF NOT EXISTS (SELECT * FROM inventory.Categories WHERE Name = 'إلكترونيات')
BEGIN
    INSERT INTO inventory.Categories (Name, Description, CompanyId, CreatedBy)
    VALUES ('إلكترونيات', 'أجهزة إلكترونية متنوعة', 1, 1);
END

IF NOT EXISTS (SELECT * FROM inventory.Categories WHERE Name = 'أثاث')
BEGIN
    INSERT INTO inventory.Categories (Name, Description, CompanyId, CreatedBy)
    VALUES ('أثاث', 'أثاث منزلي ومكتبي', 1, 1);
END

IF NOT EXISTS (SELECT * FROM inventory.Categories WHERE Name = 'مستلزمات مكتبية')
BEGIN
    INSERT INTO inventory.Categories (Name, Description, CompanyId, CreatedBy)
    VALUES ('مستلزمات مكتبية', 'أدوات ومستلزمات مكتبية', 1, 1);
END

-- إدراج منتجات
IF NOT EXISTS (SELECT * FROM inventory.Products WHERE Name = 'لابتوب HP')
BEGIN
    INSERT INTO inventory.Products (Name, Barcode, Description, CategoryId, PurchasePrice, SalePrice, Quantity, UnitOfMeasure, MinimumQuantity, CompanyId, CreatedBy)
    VALUES ('لابتوب HP', 'HP001', 'لابتوب HP Core i7', 1, 3000, 3500, 10, 'قطعة', 2, 1, 1);
END

IF NOT EXISTS (SELECT * FROM inventory.Products WHERE Name = 'لابتوب Dell')
BEGIN
    INSERT INTO inventory.Products (Name, Barcode, Description, CategoryId, PurchasePrice, SalePrice, Quantity, UnitOfMeasure, MinimumQuantity, CompanyId, CreatedBy)
    VALUES ('لابتوب Dell', 'DELL001', 'لابتوب Dell Core i5', 1, 2500, 3000, 15, 'قطعة', 3, 1, 1);
END

IF NOT EXISTS (SELECT * FROM inventory.Products WHERE Name = 'طاولة مكتب')
BEGIN
    INSERT INTO inventory.Products (Name, Barcode, Description, CategoryId, PurchasePrice, SalePrice, Quantity, UnitOfMeasure, MinimumQuantity, CompanyId, CreatedBy)
    VALUES ('طاولة مكتب', 'DESK001', 'طاولة مكتب خشبية', 2, 500, 700, 5, 'قطعة', 1, 1, 1);
END

IF NOT EXISTS (SELECT * FROM inventory.Products WHERE Name = 'كرسي مكتب')
BEGIN
    INSERT INTO inventory.Products (Name, Barcode, Description, CategoryId, PurchasePrice, SalePrice, Quantity, UnitOfMeasure, MinimumQuantity, CompanyId, CreatedBy)
    VALUES ('كرسي مكتب', 'CHAIR001', 'كرسي مكتب دوار', 2, 300, 450, 8, 'قطعة', 2, 1, 1);
END

IF NOT EXISTS (SELECT * FROM inventory.Products WHERE Name = 'أقلام جاف')
BEGIN
    INSERT INTO inventory.Products (Name, Barcode, Description, CategoryId, PurchasePrice, SalePrice, Quantity, UnitOfMeasure, MinimumQuantity, CompanyId, CreatedBy)
    VALUES ('أقلام جاف', 'PEN001', 'علبة أقلام جاف 10 قطع', 3, 15, 25, 50, 'علبة', 10, 1, 1);
END

IF NOT EXISTS (SELECT * FROM inventory.Products WHERE Name = 'دفاتر ملاحظات')
BEGIN
    INSERT INTO inventory.Products (Name, Barcode, Description, CategoryId, PurchasePrice, SalePrice, Quantity, UnitOfMeasure, MinimumQuantity, CompanyId, CreatedBy)
    VALUES ('دفاتر ملاحظات', 'NOTE001', 'دفتر ملاحظات 100 ورقة', 3, 8, 15, 100, 'قطعة', 20, 1, 1);
END

-- إنشاء الإجراء المخزن لإنشاء فاتورة
IF NOT EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_CreateSalesInvoice' AND schema_id = SCHEMA_ID('sales'))
BEGIN
    EXEC('
    CREATE PROCEDURE sales.sp_CreateSalesInvoice
        @InvoiceNumber NVARCHAR(50),
        @InvoiceDate DATE,
        @CustomerId INT,
        @PaymentMethod NVARCHAR(50),
        @DiscountPercent DECIMAL(5,2),
        @TaxPercent DECIMAL(5,2),
        @AmountPaid DECIMAL(18,2),
        @Status NVARCHAR(20),
        @Notes NVARCHAR(MAX),
        @CompanyId INT,
        @CreatedBy INT,
        @ItemsJson NVARCHAR(MAX)
    AS
    BEGIN
        SET NOCOUNT ON;
        
        BEGIN TRY
            BEGIN TRANSACTION;
            
            -- حساب إجماليات الفاتورة
            DECLARE @SubTotal DECIMAL(18,2) = 0;
            DECLARE @DiscountAmount DECIMAL(18,2) = 0;
            DECLARE @TaxAmount DECIMAL(18,2) = 0;
            DECLARE @TotalAmount DECIMAL(18,2) = 0;
            DECLARE @AmountDue DECIMAL(18,2) = 0;
            
            -- إنشاء جدول مؤقت لبنود الفاتورة
            DECLARE @Items TABLE (
                ProductId INT,
                Quantity DECIMAL(18,2),
                UnitPrice DECIMAL(18,2),
                DiscountPercent DECIMAL(5,2),
                TaxPercent DECIMAL(5,2),
                DiscountAmount DECIMAL(18,2),
                TaxAmount DECIMAL(18,2),
                LineTotal DECIMAL(18,2)
            );
            
            -- تحويل JSON إلى جدول
            INSERT INTO @Items (ProductId, Quantity, UnitPrice, DiscountPercent, TaxPercent)
            SELECT 
                JSON_VALUE(value, ''$.ProductId'') AS ProductId,
                JSON_VALUE(value, ''$.Quantity'') AS Quantity,
                JSON_VALUE(value, ''$.UnitPrice'') AS UnitPrice,
                ISNULL(JSON_VALUE(value, ''$.DiscountPercent''), 0) AS DiscountPercent,
                ISNULL(JSON_VALUE(value, ''$.TaxPercent''), 0) AS TaxPercent
            FROM OPENJSON(@ItemsJson);
            
            -- حساب قيم البنود
            UPDATE @Items
            SET 
                DiscountAmount = (Quantity * UnitPrice) * (DiscountPercent / 100),
                TaxAmount = ((Quantity * UnitPrice) - ((Quantity * UnitPrice) * (DiscountPercent / 100))) * (TaxPercent / 100),
                LineTotal = (Quantity * UnitPrice) - ((Quantity * UnitPrice) * (DiscountPercent / 100)) + (((Quantity * UnitPrice) - ((Quantity * UnitPrice) * (DiscountPercent / 100))) * (TaxPercent / 100));
            
            -- حساب إجماليات الفاتورة
            SELECT 
                @SubTotal = SUM(Quantity * UnitPrice),
                @DiscountAmount = SUM(DiscountAmount) + (@SubTotal * (@DiscountPercent / 100)),
                @TaxAmount = SUM(TaxAmount) + ((@SubTotal - @DiscountAmount) * (@TaxPercent / 100)),
                @TotalAmount = @SubTotal - @DiscountAmount + @TaxAmount,
                @AmountDue = @TotalAmount - @AmountPaid
            FROM @Items;
            
            -- إنشاء الفاتورة
            INSERT INTO sales.Invoices (
                InvoiceNumber,
                InvoiceDate,
                CustomerId,
                PaymentMethod,
                SubTotal,
                DiscountPercent,
                DiscountAmount,
                TaxPercent,
                TaxAmount,
                TotalAmount,
                AmountPaid,
                AmountDue,
                Status,
                Notes,
                CompanyId,
                CreatedBy
            )
            VALUES (
                @InvoiceNumber,
                @InvoiceDate,
                @CustomerId,
                @PaymentMethod,
                @SubTotal,
                @DiscountPercent,
                @DiscountAmount,
                @TaxPercent,
                @TaxAmount,
                @TotalAmount,
                @AmountPaid,
                @AmountDue,
                @Status,
                @Notes,
                @CompanyId,
                @CreatedBy
            );
            
            -- الحصول على معرف الفاتورة المنشأة
            DECLARE @InvoiceId INT = SCOPE_IDENTITY();
            
            -- إدراج بنود الفاتورة
            INSERT INTO sales.InvoiceItems (
                InvoiceId,
                ProductId,
                Quantity,
                UnitPrice,
                DiscountPercent,
                DiscountAmount,
                TaxPercent,
                TaxAmount,
                LineTotal
            )
            SELECT 
                @InvoiceId,
                ProductId,
                Quantity,
                UnitPrice,
                DiscountPercent,
                DiscountAmount,
                TaxPercent,
                TaxAmount,
                LineTotal
            FROM @Items;
            
            -- تحديث كميات المنتجات
            UPDATE p
            SET 
                p.Quantity = p.Quantity - i.Quantity,
                p.UpdatedAt = GETDATE()
            FROM inventory.Products p
            INNER JOIN @Items i ON p.ProductId = i.ProductId;
            
            -- إرجاع الفاتورة المنشأة مع بنودها
            SELECT 
                i.InvoiceId,
                i.InvoiceNumber,
                i.InvoiceDate,
                i.CustomerId,
                c.Name AS CustomerName,
                i.PaymentMethod,
                i.SubTotal,
                i.DiscountPercent,
                i.DiscountAmount,
                i.TaxPercent,
                i.TaxAmount,
                i.TotalAmount,
                i.AmountPaid,
                i.AmountDue,
                i.Status,
                i.Notes,
                i.CompanyId,
                i.CreatedAt,
                i.CreatedBy
            FROM sales.Invoices i
            INNER JOIN sales.Customers c ON i.CustomerId = c.CustomerId
            WHERE i.InvoiceId = @InvoiceId;
            
            SELECT 
                ii.InvoiceItemId,
                ii.InvoiceId,
                ii.ProductId,
                p.Name AS ProductName,
                p.Barcode AS ProductBarcode,
                ii.Quantity,
                p.UnitOfMeasure,
                ii.UnitPrice,
                ii.DiscountPercent,
                ii.DiscountAmount,
                ii.TaxPercent,
                ii.TaxAmount,
                ii.LineTotal
            FROM sales.InvoiceItems ii
            INNER JOIN inventory.Products p ON ii.ProductId = p.ProductId
            WHERE ii.InvoiceId = @InvoiceId;
            
            COMMIT TRANSACTION;
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            THROW;
        END CATCH
    END
    ');
END

-- إنشاء الإجراء المخزن لتحديث كمية المنتج
IF NOT EXISTS (SELECT * FROM sys.procedures WHERE name = 'sp_UpdateProductQuantity' AND schema_id = SCHEMA_ID('inventory'))
BEGIN
    EXEC('
    CREATE PROCEDURE inventory.sp_UpdateProductQuantity
        @ProductId INT,
        @Quantity DECIMAL(18,2),
        @Operation NVARCHAR(10),
        @Reason NVARCHAR(255) = NULL,
        @UserId INT
    AS
    BEGIN
        SET NOCOUNT ON;
        
        BEGIN TRY
            BEGIN TRANSACTION;
            
            DECLARE @OldQuantity DECIMAL(18,2);
            DECLARE @NewQuantity DECIMAL(18,2);
            
            -- الحصول على الكمية الحالية
            SELECT @OldQuantity = Quantity
            FROM inventory.Products
            WHERE ProductId = @ProductId;
            
            -- حساب الكمية الجديدة
            IF @Operation = ''add''
                SET @NewQuantity = @OldQuantity + @Quantity;
            ELSE IF @Operation = ''subtract''
                SET @NewQuantity = @OldQuantity - @Quantity;
            ELSE IF @Operation = ''set''
                SET @NewQuantity = @Quantity;
            ELSE
                THROW 50000, ''العملية غير صالحة. يجب أن تكون "add" أو "subtract" أو "set"'', 1;
            
            -- التحقق من أن الكمية الجديدة ليست سالبة
            IF @NewQuantity < 0
                THROW 50001, ''الكمية الجديدة لا يمكن أن تكون سالبة'', 1;
            
            -- تحديث كمية المنتج
            UPDATE inventory.Products
            SET 
                Quantity = @NewQuantity,
                UpdatedAt = GETDATE()
            WHERE ProductId = @ProductId;
            
            -- يمكن إضافة سجل لحركة المخزون هنا
            -- ...
            
            COMMIT TRANSACTION;
            
            -- إرجاع معلومات التحديث
            SELECT 
                @ProductId AS ProductId,
                p.Name AS ProductName,
                @OldQuantity AS OldQuantity,
                @NewQuantity AS NewQuantity,
                @NewQuantity - @OldQuantity AS QuantityChange,
                @Operation AS Operation,
                @Reason AS Reason,
                GETDATE() AS Timestamp
            FROM inventory.Products p
            WHERE p.ProductId = @ProductId;
        END TRY
        BEGIN CATCH
            ROLLBACK TRANSACTION;
            THROW;
        END CATCH
    END
    ');
END