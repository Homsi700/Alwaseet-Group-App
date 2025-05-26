USE AlwaseetGroup;
GO

-- عرض جميع الجداول في قاعدة البيانات مع عدد الصفوف
SELECT 
    SCHEMA_NAME(t.schema_id) AS SchemaName,
    t.name AS TableName,
    i.rows AS NumberOfRows
FROM sys.tables t
INNER JOIN sys.sysindexes i ON t.object_id = i.id
WHERE i.indid < 2 AND t.is_ms_shipped = 0
ORDER BY SchemaName, TableName;
GO

-- عرض جميع الإجراءات المخزنة
SELECT 
    s.name AS SchemaName,
    p.name AS ProcedureName,
    p.create_date AS CreatedDate,
    p.modify_date AS LastModified
FROM sys.procedures p
INNER JOIN sys.schemas s ON p.schema_id = s.schema_id
WHERE p.is_ms_shipped = 0
ORDER BY s.name, p.name;
GO

-- عرض الأنواع المخصصة (User-Defined Types)
SELECT 
    s.name AS SchemaName,
    t.name AS TypeName,
    t.is_table_type AS IsTableType
FROM sys.types t
INNER JOIN sys.schemas s ON t.schema_id = s.schema_id
WHERE t.is_user_defined = 1
ORDER BY s.name, t.name;
GO
