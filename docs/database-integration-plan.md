# خطة تكامل قاعدة البيانات | Database Integration Plan

## نظرة عامة | Overview

هذه الوثيقة تحدد خطة تكامل قاعدة البيانات لجميع أقسام النظام، مع التركيز على ربط واجهات API بقاعدة البيانات SQL Server.

## هيكل قاعدة البيانات | Database Structure

### الجداول الرئيسية | Main Tables

1. **Users** - جدول المستخدمين
   - UserID (PK)
   - Username
   - PasswordHash
   - FullName
   - Email
   - Role
   - IsActive
   - CreatedAt
   - LastLogin

2. **Products** - جدول المنتجات
   - ProductID (PK)
   - Name
   - SKU
   - Barcode
   - Description
   - CategoryID (FK)
   - CostPrice
   - SellingPrice
   - Stock
   - MinStock
   - MaxStock
   - Unit
   - Status
   - CreatedAt
   - UpdatedAt
   - CreatedBy (FK)

3. **Categories** - جدول الفئات
   - CategoryID (PK)
   - Name
   - Description
   - ParentCategoryID (FK, self-reference)
   - CreatedAt
   - UpdatedAt

4. **StockMovements** - جدول حركات المخزون
   - MovementID (PK)
   - ProductID (FK)
   - Type (PURCHASE, SALE, ADJUSTMENT, RETURN)
   - Quantity
   - Date
   - Reference
   - Notes
   - UserID (FK)
   - CreatedAt

5. **Customers** - جدول العملاء
   - CustomerID (PK)
   - Name
   - Phone
   - Email
   - Address
   - Balance
   - CreatedAt
   - UpdatedAt

6. **Suppliers** - جدول الموردين
   - SupplierID (PK)
   - Name
   - Phone
   - Email
   - Address
   - Balance
   - CreatedAt
   - UpdatedAt

7. **Sales** - جدول المبيعات
   - SaleID (PK)
   - CustomerID (FK)
   - Date
   - Total
   - Discount
   - Tax
   - GrandTotal
   - PaymentMethod
   - Status
   - Notes
   - UserID (FK)
   - CreatedAt
   - UpdatedAt

8. **SaleItems** - جدول عناصر المبيعات
   - SaleItemID (PK)
   - SaleID (FK)
   - ProductID (FK)
   - Quantity
   - UnitPrice
   - Discount
   - Total
   - CreatedAt

9. **Purchases** - جدول المشتريات
   - PurchaseID (PK)
   - SupplierID (FK)
   - Date
   - Total
   - Discount
   - Tax
   - GrandTotal
   - PaymentMethod
   - Status
   - Notes
   - UserID (FK)
   - CreatedAt
   - UpdatedAt

10. **PurchaseItems** - جدول عناصر المشتريات
    - PurchaseItemID (PK)
    - PurchaseID (FK)
    - ProductID (FK)
    - Quantity
    - UnitPrice
    - Discount
    - Total
    - CreatedAt

## خطة تكامل واجهات API | API Integration Plan

### 1. واجهات API للمنتجات | Products API

#### 1.1 GET /api/products
- **الوصف**: جلب قائمة المنتجات مع دعم الفلترة والبحث والترتيب والصفحات
- **استعلام SQL**:
  ```sql
  SELECT p.*, c.Name as CategoryName
  FROM Products p
  LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
  WHERE (@CategoryID IS NULL OR p.CategoryID = @CategoryID)
    AND (@Search IS NULL OR p.Name LIKE '%' + @Search + '%' OR p.SKU LIKE '%' + @Search + '%' OR p.Barcode LIKE '%' + @Search + '%')
    AND (@Status IS NULL OR p.Status = @Status)
  ORDER BY 
    CASE WHEN @SortBy = 'name' AND @SortOrder = 'asc' THEN p.Name END ASC,
    CASE WHEN @SortBy = 'name' AND @SortOrder = 'desc' THEN p.Name END DESC,
    CASE WHEN @SortBy = 'price' AND @SortOrder = 'asc' THEN p.SellingPrice END ASC,
    CASE WHEN @SortBy = 'price' AND @SortOrder = 'desc' THEN p.SellingPrice END DESC,
    CASE WHEN @SortBy = 'stock' AND @SortOrder = 'asc' THEN p.Stock END ASC,
    CASE WHEN @SortBy = 'stock' AND @SortOrder = 'desc' THEN p.Stock END DESC,
    p.Name
  OFFSET @Offset ROWS
  FETCH NEXT @Limit ROWS ONLY
  ```

#### 1.2 POST /api/products
- **الوصف**: إضافة منتج جديد
- **استعلام SQL**:
  ```sql
  INSERT INTO Products (Name, SKU, Barcode, Description, CategoryID, CostPrice, SellingPrice, Stock, MinStock, MaxStock, Unit, Status, CreatedAt, UpdatedAt, CreatedBy)
  VALUES (@Name, @SKU, @Barcode, @Description, @CategoryID, @CostPrice, @SellingPrice, @Stock, @MinStock, @MaxStock, @Unit, @Status, GETDATE(), GETDATE(), @UserID)
  ```

#### 1.3 GET /api/products/:id
- **الوصف**: جلب تفاصيل منتج محدد
- **استعلام SQL**:
  ```sql
  SELECT p.*, c.Name as CategoryName
  FROM Products p
  LEFT JOIN Categories c ON p.CategoryID = c.CategoryID
  WHERE p.ProductID = @ProductID
  ```

#### 1.4 PUT /api/products/:id
- **الوصف**: تحديث منتج محدد
- **استعلام SQL**:
  ```sql
  UPDATE Products
  SET Name = @Name, SKU = @SKU, Barcode = @Barcode, Description = @Description,
      CategoryID = @CategoryID, CostPrice = @CostPrice, SellingPrice = @SellingPrice,
      Stock = @Stock, MinStock = @MinStock, MaxStock = @MaxStock, Unit = @Unit,
      Status = @Status, UpdatedAt = GETDATE()
  WHERE ProductID = @ProductID
  ```

#### 1.5 DELETE /api/products/:id
- **الوصف**: حذف منتج محدد
- **استعلام SQL**:
  ```sql
  DELETE FROM Products
  WHERE ProductID = @ProductID
  ```

### 2. واجهات API للفئات | Categories API

#### 2.1 GET /api/categories
- **الوصف**: جلب قائمة الفئات
- **استعلام SQL**:
  ```sql
  SELECT c.*, p.Name as ParentName
  FROM Categories c
  LEFT JOIN Categories p ON c.ParentCategoryID = p.CategoryID
  ORDER BY c.Name
  ```

#### 2.2 POST /api/categories
- **الوصف**: إضافة فئة جديدة
- **استعلام SQL**:
  ```sql
  INSERT INTO Categories (Name, Description, ParentCategoryID, CreatedAt, UpdatedAt)
  VALUES (@Name, @Description, @ParentCategoryID, GETDATE(), GETDATE())
  ```

### 3. واجهات API لحركات المخزون | Stock Movements API

#### 3.1 GET /api/stock-movements
- **الوصف**: جلب قائمة حركات المخزون مع دعم الفلترة والبحث
- **استعلام SQL**:
  ```sql
  SELECT sm.*, p.Name as ProductName, p.SKU, c.Name as CategoryName, u.FullName as UserName
  FROM StockMovements sm
  JOIN Products p ON sm.ProductID = p.ProductID
  JOIN Categories c ON p.CategoryID = c.CategoryID
  JOIN Users u ON sm.UserID = u.UserID
  WHERE (@ProductID IS NULL OR sm.ProductID = @ProductID)
    AND (@Type IS NULL OR sm.Type = @Type)
    AND (@FromDate IS NULL OR sm.Date >= @FromDate)
    AND (@ToDate IS NULL OR sm.Date <= @ToDate)
    AND (@CategoryID IS NULL OR p.CategoryID = @CategoryID)
    AND (@Search IS NULL OR sm.Reference LIKE '%' + @Search + '%' OR sm.Notes LIKE '%' + @Search + '%' OR p.Name LIKE '%' + @Search + '%' OR p.SKU LIKE '%' + @Search + '%')
  ORDER BY sm.Date DESC
  OFFSET @Offset ROWS
  FETCH NEXT @Limit ROWS ONLY
  ```

#### 3.2 POST /api/stock-movements
- **الوصف**: إضافة حركة مخزون جديدة
- **استعلام SQL**:
  ```sql
  BEGIN TRANSACTION;
  
  -- إضافة حركة المخزون
  INSERT INTO StockMovements (ProductID, Type, Quantity, Date, Reference, Notes, UserID, CreatedAt)
  VALUES (@ProductID, @Type, @Quantity, @Date, @Reference, @Notes, @UserID, GETDATE());
  
  -- تحديث مخزون المنتج
  UPDATE Products
  SET Stock = Stock + @Quantity,
      Status = CASE
                WHEN Stock + @Quantity <= 0 THEN 'OUT_OF_STOCK'
                WHEN Stock + @Quantity <= MinStock THEN 'LOW_STOCK'
                ELSE 'ACTIVE'
              END,
      UpdatedAt = GETDATE()
  WHERE ProductID = @ProductID;
  
  COMMIT TRANSACTION;
  ```

### 4. واجهات API للتقارير | Reports API

#### 4.1 GET /api/reports/inventory/status
- **الوصف**: جلب تقرير حالة المخزون
- **استعلام SQL**:
  ```sql
  -- جلب المنتجات
  SELECT p.*, c.Name as CategoryName
  FROM Products p
  JOIN Categories c ON p.CategoryID = c.CategoryID
  WHERE (@CategoryID IS NULL OR p.CategoryID = @CategoryID)
    AND (@Search IS NULL OR p.Name LIKE '%' + @Search + '%' OR p.SKU LIKE '%' + @Search + '%' OR p.Barcode LIKE '%' + @Search + '%')
  ORDER BY p.Name;
  
  -- حساب إحصائيات الفئات
  SELECT c.CategoryID, c.Name, COUNT(p.ProductID) as ProductCount,
         SUM(p.Stock) as TotalItems, SUM(p.Stock * p.CostPrice) as TotalValue
  FROM Categories c
  LEFT JOIN Products p ON c.CategoryID = p.CategoryID
  GROUP BY c.CategoryID, c.Name
  HAVING COUNT(p.ProductID) > 0
  ORDER BY c.Name;
  ```

#### 4.2 GET /api/reports/inventory/low-stock
- **الوصف**: جلب تقرير المنتجات منخفضة المخزون
- **استعلام SQL**:
  ```sql
  SELECT p.*, c.Name as CategoryName,
         CASE
           WHEN p.Stock <= 0 THEN p.MaxStock
           ELSE p.MaxStock - p.Stock
         END as RecommendedPurchase
  FROM Products p
  JOIN Categories c ON p.CategoryID = c.CategoryID
  WHERE (p.Stock <= p.MinStock OR p.Stock <= 0)
    AND (@CategoryID IS NULL OR p.CategoryID = @CategoryID)
    AND (@Status IS NULL OR p.Status = @Status)
  ORDER BY p.Stock ASC, p.Name ASC
  ```

#### 4.3 GET /api/reports/inventory/valuation
- **الوصف**: جلب تقرير تقييم المخزون
- **استعلام SQL**:
  ```sql
  -- جلب المنتجات مع آخر عمليات الشراء
  SELECT p.*, c.Name as CategoryName,
         (SELECT TOP 10 pi.UnitPrice
          FROM PurchaseItems pi
          JOIN Purchases pu ON pi.PurchaseID = pu.PurchaseID
          WHERE pi.ProductID = p.ProductID
          ORDER BY pu.Date DESC
          FOR JSON PATH) as RecentPurchasePrices
  FROM Products p
  JOIN Categories c ON p.CategoryID = c.CategoryID
  WHERE (@CategoryID IS NULL OR p.CategoryID = @CategoryID)
    AND (@Search IS NULL OR p.Name LIKE '%' + @Search + '%' OR p.SKU LIKE '%' + @Search + '%')
  ORDER BY p.Name
  ```

#### 4.4 GET /api/reports/inventory/movement
- **الوصف**: جلب تقرير حركة المخزون
- **استعلام SQL**:
  ```sql
  -- جلب حركات المخزون
  SELECT sm.*, p.Name as ProductName, p.SKU, c.Name as CategoryName, u.FullName as UserName
  FROM StockMovements sm
  JOIN Products p ON sm.ProductID = p.ProductID
  JOIN Categories c ON p.CategoryID = c.CategoryID
  JOIN Users u ON sm.UserID = u.UserID
  WHERE (@FromDate IS NULL OR sm.Date >= @FromDate)
    AND (@ToDate IS NULL OR sm.Date <= @ToDate)
    AND (@CategoryID IS NULL OR p.CategoryID = @CategoryID)
    AND (@ProductID IS NULL OR sm.ProductID = @ProductID)
    AND (@Type IS NULL OR sm.Type = @Type)
  ORDER BY sm.Date DESC;
  
  -- حساب إحصائيات الحركة
  SELECT
    SUM(CASE WHEN sm.Quantity > 0 THEN sm.Quantity ELSE 0 END) as TotalIn,
    SUM(CASE WHEN sm.Quantity < 0 THEN ABS(sm.Quantity) ELSE 0 END) as TotalOut,
    SUM(sm.Quantity) as NetChange,
    COUNT(sm.MovementID) as TotalMovements
  FROM StockMovements sm
  JOIN Products p ON sm.ProductID = p.ProductID
  WHERE (@FromDate IS NULL OR sm.Date >= @FromDate)
    AND (@ToDate IS NULL OR sm.Date <= @ToDate)
    AND (@CategoryID IS NULL OR p.CategoryID = @CategoryID)
    AND (@ProductID IS NULL OR sm.ProductID = @ProductID)
    AND (@Type IS NULL OR sm.Type = @Type);
  
  -- حساب حركة المخزون حسب الفترات الزمنية
  SELECT
    CONVERT(DATE, sm.Date) as Date,
    SUM(CASE WHEN sm.Quantity > 0 THEN sm.Quantity ELSE 0 END) as TotalIn,
    SUM(CASE WHEN sm.Quantity < 0 THEN ABS(sm.Quantity) ELSE 0 END) as TotalOut
  FROM StockMovements sm
  JOIN Products p ON sm.ProductID = p.ProductID
  WHERE (@FromDate IS NULL OR sm.Date >= @FromDate)
    AND (@ToDate IS NULL OR sm.Date <= @ToDate)
    AND (@CategoryID IS NULL OR p.CategoryID = @CategoryID)
    AND (@ProductID IS NULL OR sm.ProductID = @ProductID)
    AND (@Type IS NULL OR sm.Type = @Type)
  GROUP BY CONVERT(DATE, sm.Date)
  ORDER BY CONVERT(DATE, sm.Date)
  ```

#### 4.5 GET /api/reports/inventory/performance
- **الوصف**: جلب تقرير أداء المنتجات
- **استعلام SQL**:
  ```sql
  -- جلب بيانات المنتجات
  SELECT p.*, c.Name as CategoryName
  FROM Products p
  JOIN Categories c ON p.CategoryID = c.CategoryID
  WHERE (@CategoryID IS NULL OR p.CategoryID = @CategoryID)
    AND (@Search IS NULL OR p.Name LIKE '%' + @Search + '%' OR p.SKU LIKE '%' + @Search + '%' OR p.Barcode LIKE '%' + @Search + '%')
  ORDER BY p.Name;
  
  -- حساب أداء المنتجات
  SELECT
    p.ProductID,
    COUNT(si.SaleItemID) as SalesCount,
    SUM(si.Quantity) as QuantitySold,
    SUM(si.Total) as SalesValue,
    SUM(si.Quantity * p.CostPrice) as CostValue,
    SUM(si.Total) - SUM(si.Quantity * p.CostPrice) as Profit,
    CASE
      WHEN SUM(si.Quantity * p.CostPrice) = 0 THEN 0
      ELSE (SUM(si.Total) - SUM(si.Quantity * p.CostPrice)) / SUM(si.Quantity * p.CostPrice) * 100
    END as ProfitMargin,
    (SELECT COUNT(*) FROM SaleItems si2
     JOIN Sales s ON si2.SaleID = s.SaleID
     WHERE si2.ProductID = p.ProductID AND s.Status = 'RETURNED'
     AND (@FromDate IS NULL OR s.Date >= @FromDate)
     AND (@ToDate IS NULL OR s.Date <= @ToDate)) as ReturnCount,
    CASE
      WHEN SUM(si.Quantity) = 0 THEN 0
      ELSE (SELECT COUNT(*) FROM SaleItems si2
            JOIN Sales s ON si2.SaleID = s.SaleID
            WHERE si2.ProductID = p.ProductID AND s.Status = 'RETURNED'
            AND (@FromDate IS NULL OR s.Date >= @FromDate)
            AND (@ToDate IS NULL OR s.Date <= @ToDate)) / SUM(si.Quantity) * 100
    END as ReturnRate,
    CASE
      WHEN p.Stock = 0 THEN 0
      ELSE SUM(si.Quantity) / p.Stock
    END as StockTurnover
  FROM Products p
  LEFT JOIN SaleItems si ON p.ProductID = si.ProductID
  LEFT JOIN Sales s ON si.SaleID = s.SaleID
  WHERE (@CategoryID IS NULL OR p.CategoryID = @CategoryID)
    AND (@FromDate IS NULL OR s.Date >= @FromDate)
    AND (@ToDate IS NULL OR s.Date <= @ToDate)
  GROUP BY p.ProductID, p.Stock
  ```

## خطة تنفيذ Hooks | Hooks Implementation Plan

### 1. Hook لجلب المنتجات | Products Hook

```typescript
// src/hooks/use-products.ts
export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        
        // بناء URL مع معلمات البحث
        const url = new URL('/api/products', window.location.origin);
        if (filters?.categoryId) url.searchParams.append('categoryId', filters.categoryId);
        if (filters?.search) url.searchParams.append('search', filters.search);
        if (filters?.status) url.searchParams.append('status', filters.status);
        if (filters?.sortBy) url.searchParams.append('sortBy', filters.sortBy);
        if (filters?.sortOrder) url.searchParams.append('sortOrder', filters.sortOrder);
        if (filters?.page) url.searchParams.append('page', filters.page.toString());
        if (filters?.limit) url.searchParams.append('limit', filters.limit.toString());
        
        const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error(`فشل في جلب المنتجات: ${response.status}`);
        }
        
        const data = await response.json();
        setProducts(data.products);
        setPagination(data.pagination);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err : new Error('حدث خطأ غير معروف'));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchProducts();
  }, [filters]);
  
  return { products, pagination, isLoading, error };
}
```

### 2. Hook لجلب حركات المخزون | Stock Movements Hook

```typescript
// src/hooks/use-stock-movements.ts
export function useStockMovements(filters?: StockMovementFilters) {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [summary, setSummary] = useState<StockMovementSummary>({
    totalIn: 0,
    totalOut: 0,
    netChange: 0,
    totalMovements: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function fetchMovements() {
      try {
        setIsLoading(true);
        
        // بناء URL مع معلمات البحث
        const url = new URL('/api/stock-movements', window.location.origin);
        if (filters?.productId) url.searchParams.append('productId', filters.productId);
        if (filters?.categoryId) url.searchParams.append('categoryId', filters.categoryId);
        if (filters?.type) url.searchParams.append('type', filters.type);
        if (filters?.from) url.searchParams.append('from', filters.from.toISOString());
        if (filters?.to) url.searchParams.append('to', filters.to.toISOString());
        if (filters?.search) url.searchParams.append('search', filters.search);
        if (filters?.page) url.searchParams.append('page', filters.page.toString());
        if (filters?.limit) url.searchParams.append('limit', filters.limit.toString());
        
        const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error(`فشل في جلب حركات المخزون: ${response.status}`);
        }
        
        const data = await response.json();
        setMovements(data.movements);
        setSummary(data.summary);
        setPagination(data.pagination);
        setError(null);
      } catch (err) {
        console.error('Error fetching stock movements:', err);
        setError(err instanceof Error ? err : new Error('حدث خطأ غير معروف'));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchMovements();
  }, [filters]);
  
  return { movements, summary, pagination, isLoading, error };
}
```

### 3. Hook لجلب تقرير حالة المخزون | Inventory Status Hook

```typescript
// src/hooks/use-inventory-status.ts
export function useInventoryStatus(filters?: InventoryStatusFilters) {
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<InventoryStatusSummary>({
    totalProducts: 0,
    totalItems: 0,
    totalValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0
  });
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [chartData, setChartData] = useState<InventoryChartData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    async function fetchInventoryStatus() {
      try {
        setIsLoading(true);
        
        // بناء URL مع معلمات البحث
        const url = new URL('/api/reports/inventory/status', window.location.origin);
        if (filters?.categoryId) url.searchParams.append('categoryId', filters.categoryId);
        if (filters?.search) url.searchParams.append('search', filters.search);
        
        const response = await fetch(url.toString());
        
        if (!response.ok) {
          throw new Error(`فشل في جلب تقرير حالة المخزون: ${response.status}`);
        }
        
        const data = await response.json();
        setProducts(data.products);
        setSummary(data.summary);
        setCategoryStats(data.categoryStats);
        
        // إعداد بيانات الرسم البياني
        const chartData: InventoryChartData = {
          inventoryValueByCategory: {
            labels: data.categoryStats.map((cat: CategoryStat) => cat.name),
            data: data.categoryStats.map((cat: CategoryStat) => cat.totalValue)
          },
          inventoryItemsByCategory: {
            labels: data.categoryStats.map((cat: CategoryStat) => cat.name),
            data: data.categoryStats.map((cat: CategoryStat) => cat.totalItems)
          },
          stockStatus: {
            labels: ['مخزون كافي', 'مخزون منخفض', 'نفاذ المخزون'],
            data: [
              data.summary.totalProducts - data.summary.lowStockCount - data.summary.outOfStockCount,
              data.summary.lowStockCount,
              data.summary.outOfStockCount
            ]
          }
        };
        
        setChartData(chartData);
        setError(null);
      } catch (err) {
        console.error('Error fetching inventory status:', err);
        setError(err instanceof Error ? err : new Error('حدث خطأ غير معروف'));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchInventoryStatus();
  }, [filters]);
  
  return { products, summary, categoryStats, chartData, isLoading, error };
}
```

## خطة الاختبار | Testing Plan

### 1. اختبار واجهات API | API Testing

- اختبار جلب المنتجات مع فلاتر مختلفة
- اختبار إضافة منتج جديد
- اختبار تحديث منتج
- اختبار حذف منتج
- اختبار جلب حركات المخزون
- اختبار إضافة حركة مخزون
- اختبار جلب تقارير المخزون المختلفة

### 2. اختبار Hooks | Hooks Testing

- اختبار Hook جلب المنتجات
- اختبار Hook جلب حركات المخزون
- اختبار Hooks جلب تقارير المخزون

### 3. اختبار التكامل | Integration Testing

- اختبار تكامل واجهة المستخدم مع واجهات API
- اختبار تكامل الرسوم البيانية مع البيانات الفعلية
- اختبار تكامل وظائف التصدير مع البيانات الفعلية

## الخطوات التالية | Next Steps

1. تنفيذ واجهات API للمنتجات والفئات وحركات المخزون
2. تنفيذ واجهات API للتقارير
3. تحديث Hooks لاستخدام واجهات API الفعلية
4. اختبار التكامل بين واجهة المستخدم وقاعدة البيانات
5. تحسين أداء الاستعلامات وتحسين تجربة المستخدم