USE AlwaseetGroup;
GO

-- عرض تفاصيل المنتجات مع الفئات
CREATE OR ALTER VIEW inventory.vw_ProductDetails
AS
SELECT 
    p.ProductId,
    p.Name AS ProductName,
    p.Barcode,
    p.Description,
    p.PurchasePrice,
    p.SalePrice,
    p.Quantity,
    p.UnitOfMeasure,
    p.MinimumQuantity,
    c.Name AS CategoryName,
    p.CompanyId,
    p.IsActive,
    CASE WHEN p.Quantity <= p.MinimumQuantity THEN 1 ELSE 0 END AS NeedsRestock
FROM inventory.Products p
LEFT JOIN inventory.Categories c ON p.CategoryId = c.CategoryId;
GO

-- عرض تفاصيل الفواتير مع العملاء
CREATE OR ALTER VIEW sales.vw_InvoiceDetails
AS
SELECT 
    i.InvoiceId,
    i.InvoiceNumber,
    i.InvoiceDate,
    c.Name AS CustomerName,
    i.PaymentMethod,
    i.SubTotal,
    i.DiscountAmount,
    i.TaxAmount,
    i.TotalAmount,
    i.AmountPaid,
    i.AmountDue,
    i.Status,
    i.CompanyId,
    u.Username AS CreatedBy,
    i.CreatedAt
FROM sales.Invoices i
LEFT JOIN sales.Customers c ON i.CustomerId = c.CustomerId
LEFT JOIN settings.Users u ON i.CreatedBy = u.UserId;
GO

-- عرض تفاصيل بنود الفواتير مع المنتجات
CREATE OR ALTER VIEW sales.vw_InvoiceItemDetails
AS
SELECT 
    ii.InvoiceItemId,
    ii.InvoiceId,
    i.InvoiceNumber,
    i.InvoiceDate,
    p.Name AS ProductName,
    p.Barcode,
    ii.Quantity,
    ii.UnitPrice,
    ii.DiscountAmount,
    ii.TaxAmount,
    ii.LineTotal,
    i.CompanyId
FROM sales.InvoiceItems ii
INNER JOIN sales.Invoices i ON ii.InvoiceId = i.InvoiceId
INNER JOIN inventory.Products p ON ii.ProductId = p.ProductId;
GO

-- عرض أرصدة الحسابات
CREATE OR ALTER VIEW accounting.vw_AccountBalances
AS
SELECT 
    a.AccountId,
    a.AccountCode,
    a.AccountName,
    a.AccountType,
    ISNULL((
        SELECT SUM(DebitAmount - CreditAmount)
        FROM accounting.JournalEntryDetails jed
        INNER JOIN accounting.JournalEntries je ON jed.EntryId = je.EntryId
        WHERE jed.AccountId = a.AccountId
        AND je.IsPosted = 1
    ), 0) AS Balance,
    a.CompanyId,
    a.IsActive
FROM accounting.ChartOfAccounts a;
GO

-- عرض مؤشرات الأداء الرئيسية (KPIs) للوحة القيادة
CREATE OR ALTER VIEW sales.vw_DashboardKPIs
AS
WITH SalesStats AS (
    SELECT 
        CompanyId,
        SUM(TotalAmount) AS TotalSales,
        COUNT(*) AS InvoiceCount,
        SUM(CASE WHEN Status = 'Unpaid' THEN AmountDue ELSE 0 END) AS TotalReceivables
    FROM sales.Invoices
    WHERE InvoiceDate >= DATEADD(MONTH, -1, GETDATE())
    GROUP BY CompanyId
),
InventoryStats AS (
    SELECT 
        CompanyId,
        COUNT(*) AS TotalProducts,
        SUM(CASE WHEN Quantity <= MinimumQuantity THEN 1 ELSE 0 END) AS LowStockCount
    FROM inventory.Products
    GROUP BY CompanyId
)
SELECT 
    s.CompanyId,
    s.TotalSales,
    s.InvoiceCount,
    s.TotalReceivables,
    i.TotalProducts,
    i.LowStockCount
FROM SalesStats s
JOIN InventoryStats i ON s.CompanyId = i.CompanyId;
GO

-- اختبار الـ Views
SELECT 'Products with Low Stock:' AS Report;
SELECT * FROM inventory.vw_ProductDetails WHERE NeedsRestock = 1;

SELECT 'Recent Invoices:' AS Report;
SELECT TOP 5 * FROM sales.vw_InvoiceDetails ORDER BY InvoiceDate DESC;

SELECT 'Account Balances:' AS Report;
SELECT * FROM accounting.vw_AccountBalances WHERE Balance != 0;

SELECT 'Dashboard KPIs:' AS Report;
SELECT * FROM sales.vw_DashboardKPIs;
GO
