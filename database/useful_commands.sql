-- عرض جميع قواعد البيانات
SELECT name FROM sys.databases
ORDER BY name;
GO

-- عرض معلومات تفصيلية عن قواعد البيانات
SELECT 
    name AS DatabaseName,
    state_desc AS Status,
    recovery_model_desc AS RecoveryModel,
    compatibility_level AS CompatibilityLevel
FROM sys.databases
ORDER BY name;
GO

-- عرض حجم قواعد البيانات
SELECT 
    DB_NAME(database_id) AS DatabaseName,
    CAST(SUM(size * 8.0 / 1024) AS DECIMAL(10,2)) AS SizeInMB
FROM sys.master_files
GROUP BY database_id
ORDER BY DatabaseName;
GO

-- عرض قواعد البيانات مع معلومات الملفات
SELECT 
    DB_NAME(df.database_id) AS DatabaseName,
    df.name AS FileName,
    df.physical_name AS FilePath,
    df.type_desc AS FileType,
    CAST(df.size * 8.0 / 1024 AS DECIMAL(10,2)) AS SizeInMB
FROM sys.master_files df
ORDER BY DB_NAME(df.database_id), df.type_desc;
GO
