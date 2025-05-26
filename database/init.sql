-- Create Database with SQL Server 2022 features
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'AlwaseetGroup')
BEGIN
    CREATE DATABASE AlwaseetGroup
    ON PRIMARY
    (
        NAME = AlwaseetGroup_Data,
        FILENAME = 'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\AlwaseetGroup.mdf',
        SIZE = 100MB,
        MAXSIZE = UNLIMITED,
        FILEGROWTH = 64MB
    )
    LOG ON
    (
        NAME = AlwaseetGroup_Log,
        FILENAME = 'C:\Program Files\Microsoft SQL Server\MSSQL16.MSSQLSERVER\MSSQL\DATA\AlwaseetGroup.ldf',
        SIZE = 50MB,
        MAXSIZE = UNLIMITED,
        FILEGROWTH = 32MB
    )
    WITH COMPATIBILITY_LEVEL = 160; -- SQL Server 2022
END
GO

ALTER DATABASE AlwaseetGroup SET RECOVERY FULL;
GO

USE AlwaseetGroup;
GO

-- Enable Advanced Features
ALTER DATABASE AlwaseetGroup SET ALLOW_SNAPSHOT_ISOLATION ON;
GO

ALTER DATABASE AlwaseetGroup SET READ_COMMITTED_SNAPSHOT ON;
GO

-- Enable QUOTED_IDENTIFIER
SET QUOTED_IDENTIFIER ON
GO

-- Create Schema for different modules
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'inventory')
    EXEC('CREATE SCHEMA inventory')
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'sales')
    EXEC('CREATE SCHEMA sales')
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'purchases')
    EXEC('CREATE SCHEMA purchases')
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'accounting')
    EXEC('CREATE SCHEMA accounting')
GO

IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = 'settings')
    EXEC('CREATE SCHEMA settings')
GO

-- Settings Tables
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'settings.Companies') AND type = N'U')
CREATE TABLE settings.Companies (
    CompanyId INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(255) NOT NULL,
    TaxNumber NVARCHAR(50),
    Address NVARCHAR(500),
    PhoneNumber NVARCHAR(50),
    Email NVARCHAR(255),
    CurrencyCode NVARCHAR(10) DEFAULT 'SYP',
    CurrencySymbol NVARCHAR(10) DEFAULT 'ل.س',
    Logo VARBINARY(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2,
    IsActive BIT DEFAULT 1
);

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'settings.Users') AND type = N'U')
CREATE TABLE settings.Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    FirstName NVARCHAR(50),
    LastName NVARCHAR(50),
    Email NVARCHAR(255),
    Role NVARCHAR(50) NOT NULL,
    CompanyId INT REFERENCES settings.Companies(CompanyId),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2,
    LastLogin DATETIME2,
    IsActive BIT DEFAULT 1
);

-- Inventory Tables
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'inventory.Categories') AND type = N'U')
CREATE TABLE inventory.Categories (
    CategoryId INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(255) NOT NULL,
    Description NVARCHAR(500),
    ParentCategoryId INT REFERENCES inventory.Categories(CategoryId),
    CompanyId INT REFERENCES settings.Companies(CompanyId),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2,
    CreatedBy INT REFERENCES settings.Users(UserId),
    IsActive BIT DEFAULT 1
);

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'inventory.Products') AND type = N'U')
CREATE TABLE inventory.Products (
    ProductId INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(255) NOT NULL,
    Barcode NVARCHAR(100) UNIQUE,
    Description NVARCHAR(MAX),
    CategoryId INT REFERENCES inventory.Categories(CategoryId),
    PurchasePrice DECIMAL(18,2) NOT NULL,
    SalePrice DECIMAL(18,2) NOT NULL,
    Quantity DECIMAL(18,2) DEFAULT 0,
    UnitOfMeasure NVARCHAR(50),
    MinimumQuantity DECIMAL(18,2),
    ImageUrl NVARCHAR(MAX),
    CompanyId INT REFERENCES settings.Companies(CompanyId),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2,
    CreatedBy INT REFERENCES settings.Users(UserId),
    IsActive BIT DEFAULT 1
);

-- Sales Tables
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sales.Customers') AND type = N'U')
CREATE TABLE sales.Customers (
    CustomerId INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(255) NOT NULL,
    ContactPerson NVARCHAR(255),
    PhoneNumber NVARCHAR(50),
    Email NVARCHAR(255),
    Address NVARCHAR(500),
    TaxNumber NVARCHAR(50),
    CreditLimit DECIMAL(18,2),
    Balance DECIMAL(18,2) DEFAULT 0,
    CompanyId INT REFERENCES settings.Companies(CompanyId),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2,
    CreatedBy INT REFERENCES settings.Users(UserId),
    IsActive BIT DEFAULT 1
);

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sales.Invoices') AND type = N'U')
CREATE TABLE sales.Invoices (
    InvoiceId INT PRIMARY KEY IDENTITY(1,1),
    InvoiceNumber NVARCHAR(50) NOT NULL UNIQUE,
    InvoiceDate DATETIME2 NOT NULL,
    CustomerId INT REFERENCES sales.Customers(CustomerId),
    PaymentMethod NVARCHAR(50) NOT NULL,
    SubTotal DECIMAL(18,2) NOT NULL,
    DiscountPercent DECIMAL(5,2),
    DiscountAmount DECIMAL(18,2),
    TaxPercent DECIMAL(5,2),
    TaxAmount DECIMAL(18,2),
    TotalAmount DECIMAL(18,2) NOT NULL,
    AmountPaid DECIMAL(18,2) DEFAULT 0,
    AmountDue DECIMAL(18,2),
    Status NVARCHAR(50) NOT NULL,
    Notes NVARCHAR(MAX),
    CompanyId INT REFERENCES settings.Companies(CompanyId),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2,
    CreatedBy INT REFERENCES settings.Users(UserId)
);

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sales.InvoiceItems') AND type = N'U')
CREATE TABLE sales.InvoiceItems (
    InvoiceItemId INT PRIMARY KEY IDENTITY(1,1),
    InvoiceId INT REFERENCES sales.Invoices(InvoiceId),
    ProductId INT REFERENCES inventory.Products(ProductId),
    Quantity DECIMAL(18,2) NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    DiscountPercent DECIMAL(5,2),
    DiscountAmount DECIMAL(18,2),
    TaxPercent DECIMAL(5,2),
    TaxAmount DECIMAL(18,2),
    LineTotal DECIMAL(18,2) NOT NULL
);

-- Accounting Tables
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'accounting.ChartOfAccounts') AND type = N'U')
CREATE TABLE accounting.ChartOfAccounts (
    AccountId INT PRIMARY KEY IDENTITY(1,1),
    AccountCode NVARCHAR(50) NOT NULL UNIQUE,
    AccountName NVARCHAR(255) NOT NULL,
    AccountType NVARCHAR(50) NOT NULL,
    ParentAccountId INT REFERENCES accounting.ChartOfAccounts(AccountId),
    Balance DECIMAL(18,2) DEFAULT 0,
    CompanyId INT REFERENCES settings.Companies(CompanyId),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2,
    CreatedBy INT REFERENCES settings.Users(UserId),
    IsActive BIT DEFAULT 1
);

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'accounting.JournalEntries') AND type = N'U')
CREATE TABLE accounting.JournalEntries (
    EntryId INT PRIMARY KEY IDENTITY(1,1),
    EntryNumber NVARCHAR(50) NOT NULL UNIQUE,
    EntryDate DATETIME2 NOT NULL,
    Description NVARCHAR(500),
    ReferenceType NVARCHAR(50),
    ReferenceId NVARCHAR(50),
    CompanyId INT REFERENCES settings.Companies(CompanyId),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    UpdatedAt DATETIME2,
    CreatedBy INT REFERENCES settings.Users(UserId),
    IsPosted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'accounting.JournalEntryDetails') AND type = N'U')
CREATE TABLE accounting.JournalEntryDetails (
    EntryDetailId INT PRIMARY KEY IDENTITY(1,1),
    EntryId INT REFERENCES accounting.JournalEntries(EntryId),
    AccountId INT REFERENCES accounting.ChartOfAccounts(AccountId),
    DebitAmount DECIMAL(18,2),
    CreditAmount DECIMAL(18,2),
    Notes NVARCHAR(500)
);

-- Indexes
CREATE INDEX IX_Products_Barcode ON inventory.Products(Barcode);
CREATE INDEX IX_Products_CategoryId ON inventory.Products(CategoryId);
CREATE INDEX IX_Invoices_CustomerId ON sales.Invoices(CustomerId);
CREATE INDEX IX_Invoices_InvoiceDate ON sales.Invoices(InvoiceDate);
CREATE INDEX IX_JournalEntries_EntryDate ON accounting.JournalEntries(EntryDate);
CREATE INDEX IX_ChartOfAccounts_AccountCode ON accounting.ChartOfAccounts(AccountCode);

-- Add Data Compression to frequently accessed tables
ALTER TABLE sales.Invoices REBUILD PARTITION = ALL WITH (DATA_COMPRESSION = PAGE);
ALTER TABLE sales.InvoiceItems REBUILD PARTITION = ALL WITH (DATA_COMPRESSION = PAGE);
ALTER TABLE inventory.Products REBUILD PARTITION = ALL WITH (DATA_COMPRESSION = PAGE);
GO

-- Add Columnstore indexes for analytical queries
CREATE NONCLUSTERED COLUMNSTORE INDEX [IX_InvoiceItems_Analytics] ON sales.InvoiceItems
(
    InvoiceId,
    ProductId,
    Quantity,
    UnitPrice,
    LineTotal
)
WITH (DROP_EXISTING = OFF, COMPRESSION_DELAY = 0);
GO

CREATE NONCLUSTERED COLUMNSTORE INDEX [IX_JournalEntryDetails_Analytics] ON accounting.JournalEntryDetails
(
    EntryId,
    AccountId,
    DebitAmount,
    CreditAmount
)
WITH (DROP_EXISTING = OFF, COMPRESSION_DELAY = 0);
GO

-- Create User-Defined Table Types
IF NOT EXISTS (SELECT * FROM sys.types WHERE is_table_type = 1 AND name = 'InvoiceItemType' AND schema_id = SCHEMA_ID('sales'))
CREATE TYPE sales.InvoiceItemType AS TABLE
(
    ProductId INT,
    Quantity DECIMAL(18,2),
    UnitPrice DECIMAL(18,2),
    DiscountPercent DECIMAL(5,2),
    DiscountAmount DECIMAL(18,2),
    TaxPercent DECIMAL(5,2),
    TaxAmount DECIMAL(18,2),
    LineTotal DECIMAL(18,2)
);
GO

-- Create Stored Procedures for Products
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'inventory.sp_AddProduct') AND type = N'P')
EXEC('CREATE PROCEDURE inventory.sp_AddProduct
    @Name NVARCHAR(255),
    @Barcode NVARCHAR(100),
    @Description NVARCHAR(MAX),
    @CategoryId INT,
    @PurchasePrice DECIMAL(18,2),
    @SalePrice DECIMAL(18,2),
    @Quantity DECIMAL(18,2),
    @UnitOfMeasure NVARCHAR(50),
    @MinimumQuantity DECIMAL(18,2),
    @ImageUrl NVARCHAR(MAX),
    @CompanyId INT,
    @CreatedBy INT
AS
BEGIN
    INSERT INTO inventory.Products (
        Name, Barcode, Description, CategoryId, PurchasePrice, 
        SalePrice, Quantity, UnitOfMeasure, MinimumQuantity, 
        ImageUrl, CompanyId, CreatedBy
    )
    VALUES (
        @Name, @Barcode, @Description, @CategoryId, @PurchasePrice,
        @SalePrice, @Quantity, @UnitOfMeasure, @MinimumQuantity,
        @ImageUrl, @CompanyId, @CreatedBy
    );
    
    SELECT SCOPE_IDENTITY() AS ProductId;
END');
GO

-- Create Stored Procedure for Creating Sales Invoice
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'sales.sp_CreateSalesInvoice') AND type = N'P')
EXEC('CREATE PROCEDURE sales.sp_CreateSalesInvoice
    @InvoiceNumber NVARCHAR(50),
    @CustomerId INT,
    @PaymentMethod NVARCHAR(50),
    @SubTotal DECIMAL(18,2),
    @DiscountPercent DECIMAL(5,2),
    @DiscountAmount DECIMAL(18,2),
    @TaxPercent DECIMAL(5,2),
    @TaxAmount DECIMAL(18,2),
    @TotalAmount DECIMAL(18,2),
    @AmountPaid DECIMAL(18,2),
    @Notes NVARCHAR(MAX),
    @CompanyId INT,
    @CreatedBy INT,
    @InvoiceItems sales.InvoiceItemType READONLY
AS
BEGIN
    BEGIN TRANSACTION;
    
    BEGIN TRY
        -- Insert Invoice Header
        INSERT INTO sales.Invoices (
            InvoiceNumber, InvoiceDate, CustomerId, PaymentMethod,
            SubTotal, DiscountPercent, DiscountAmount, TaxPercent,
            TaxAmount, TotalAmount, AmountPaid, AmountDue,
            Status, Notes, CompanyId, CreatedBy
        )
        VALUES (
            @InvoiceNumber, GETDATE(), @CustomerId, @PaymentMethod,
            @SubTotal, @DiscountPercent, @DiscountAmount, @TaxPercent,
            @TaxAmount, @TotalAmount, @AmountPaid, (@TotalAmount - @AmountPaid),
            CASE WHEN @AmountPaid >= @TotalAmount THEN 'Paid'
                 WHEN @AmountPaid > 0 THEN 'PartiallyPaid'
                 ELSE 'Unpaid'
            END,
            @Notes, @CompanyId, @CreatedBy
        );
        
        DECLARE @InvoiceId INT = SCOPE_IDENTITY();
        
        -- Insert Invoice Items
        INSERT INTO sales.InvoiceItems (
            InvoiceId, ProductId, Quantity, UnitPrice,
            DiscountPercent, DiscountAmount, TaxPercent,
            TaxAmount, LineTotal
        )
        SELECT 
            @InvoiceId, ProductId, Quantity, UnitPrice,
            DiscountPercent, DiscountAmount, TaxPercent,
            TaxAmount, LineTotal
        FROM @InvoiceItems;
        
        -- Update Product Quantities
        UPDATE p
        SET p.Quantity = p.Quantity - i.Quantity,
            p.UpdatedAt = GETDATE()
        FROM inventory.Products p
        INNER JOIN @InvoiceItems i ON p.ProductId = i.ProductId;
        
        -- Create Journal Entry
        INSERT INTO accounting.JournalEntries (
            EntryNumber, EntryDate, Description,
            ReferenceType, ReferenceId, CompanyId,
            CreatedBy, IsPosted
        )
        VALUES (
            'JE-' + @InvoiceNumber,
            GETDATE(),
            'Sales Invoice ' + @InvoiceNumber,
            'SalesInvoice',
            @InvoiceNumber,
            @CompanyId,
            @CreatedBy,
            1
        );
        
        DECLARE @EntryId INT = SCOPE_IDENTITY();
        
        -- Insert Journal Entry Details
        INSERT INTO accounting.JournalEntryDetails (
            EntryId, AccountId, DebitAmount, CreditAmount, Notes
        )
        VALUES
        -- Debit Cash/Receivables
        (@EntryId, 
         (SELECT AccountId FROM accounting.ChartOfAccounts WHERE AccountCode = '1100' AND CompanyId = @CompanyId), -- Cash
         @TotalAmount,
         0,
         'Sales Invoice ' + @InvoiceNumber),
        -- Credit Sales
        (@EntryId,
         (SELECT AccountId FROM accounting.ChartOfAccounts WHERE AccountCode = '4000' AND CompanyId = @CompanyId), -- Sales
         0,
         @TotalAmount,
         'Sales Invoice ' + @InvoiceNumber);
         
        COMMIT TRANSACTION;
        
        SELECT @InvoiceId AS InvoiceId;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END');
GO
