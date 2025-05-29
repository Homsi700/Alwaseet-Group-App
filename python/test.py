import pyodbc

# معلومات الاتصال بقاعدة البيانات
SERVER_NAME = r'DESKTOP-0QOGPV9\SQLEXPRESS'
DATABASE_NAME = 'AlwaseetGroup'
USERNAME = 'sa'
PASSWORD = '700210'

# بناء سلسلة الاتصال (Connection String)
CONNECTION_STRING = (
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
    f"SERVER={SERVER_NAME};"
    f"DATABASE={DATABASE_NAME};"
    f"UID={USERNAME};"
    f"PWD={PASSWORD};"
)

def connect_to_database():
    """
    يتصل بقاعدة البيانات ويعيد كائن الاتصال والمؤشر.
    """
    try:
        cnxn = pyodbc.connect(CONNECTION_STRING)
        cursor = cnxn.cursor()
        print("✅ تم الاتصال بقاعدة البيانات بنجاح!")
        return cnxn, cursor
    except pyodbc.Error as ex:
        sqlstate = ex.args[0]
        print(f"❌ حدث خطأ أثناء الاتصال بقاعدة البيانات: {sqlstate}")
        print(ex)
        return None, None

def execute_and_print(cursor, title, query, params=None):
    """
    ينفذ استعلامًا ويطبع نتائجه بشكل منظم.
    """
    if not cursor:
        return

    print(f"\n## {title}")
    try:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)

        rows = cursor.fetchall()
        if rows:
            # طباعة رؤوس الأعمدة
            column_names = [column[0] for column in cursor.description]
            print(" | ".join(column_names))
            print("-" * (sum(len(name) + 3 for name in column_names) - 3)) # خط فاصل

            # طباعة الصفوف
            for row in rows:
                print(" | ".join(str(item) if item is not None else "NULL" for item in row))
        else:
            print("  لا توجد نتائج.")
    except pyodbc.Error as ex:
        sqlstate = ex.args[0]
        print(f"❌ حدث خطأ أثناء جلب {title.lower()}: {sqlstate}")
        print(ex)

def get_database_full_schema(cursor):
    """
    يجلب معلومات شاملة حول مخطط قاعدة البيانات (من الألف إلى الياء).
    """
    if not cursor:
        return

    print("\n" + "="*70)
    print("           عرض شامل لمخطط قاعدة البيانات (من الألف إلى الياء)")
    print("="*70)

    # 1. تفاصيل شاملة عن جميع الجداول والأعمدة والمفاتيح الأساسية والأجنبية
    print("\n--- 1. تفاصيل الجداول والأعمدة والمفاتيح الأساسية والأجنبية ---")
    detailed_table_column_fk_pk_query = """
    SELECT
        t.TABLE_SCHEMA,
        t.TABLE_NAME,
        c.COLUMN_NAME,
        c.DATA_TYPE,
        CASE
            WHEN c.CHARACTER_MAXIMUM_LENGTH = -1 THEN 'MAX'
            WHEN c.CHARACTER_MAXIMUM_LENGTH IS NULL THEN ''
            ELSE CAST(c.CHARACTER_MAXIMUM_LENGTH AS NVARCHAR(10))
        END AS MaxLength,
        c.NUMERIC_PRECISION,
        c.NUMERIC_SCALE,
        c.IS_NULLABLE,
        CASE
            WHEN pk.COLUMN_NAME IS NOT NULL THEN 'YES'
            ELSE 'NO'
        END AS IsPrimaryKey,
        CASE
            WHEN fk.ForeignKeyColumnName IS NOT NULL THEN 'YES'
            ELSE 'NO'
        END AS IsForeignKey,
        fk.ReferencedTableName,
        fk.ReferencedColumnName
    FROM
        INFORMATION_SCHEMA.TABLES AS t
    INNER JOIN
        INFORMATION_SCHEMA.COLUMNS AS c ON t.TABLE_SCHEMA = c.TABLE_SCHEMA AND t.TABLE_NAME = c.TABLE_NAME
    LEFT JOIN (
        SELECT
            kcu.TABLE_SCHEMA,
            kcu.TABLE_NAME,
            kcu.COLUMN_NAME
        FROM
            INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc
        INNER JOIN
            INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS kcu ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME AND tc.TABLE_SCHEMA = kcu.TABLE_SCHEMA AND tc.TABLE_NAME = kcu.TABLE_NAME
        WHERE
            tc.CONSTRAINT_TYPE = 'PRIMARY KEY'
    ) AS pk ON c.TABLE_SCHEMA = pk.TABLE_SCHEMA AND c.TABLE_NAME = pk.TABLE_NAME AND c.COLUMN_NAME = pk.COLUMN_NAME
    LEFT JOIN (
        SELECT
            kcu.TABLE_SCHEMA AS ForeignTableSchema,
            kcu.TABLE_NAME AS ForeignTableName,
            kcu.COLUMN_NAME AS ForeignKeyColumnName,
            rc.UNIQUE_CONSTRAINT_SCHEMA AS ReferencedTableSchema,
            ptc.TABLE_NAME AS ReferencedTableName,
            ccu.COLUMN_NAME AS ReferencedColumnName
        FROM
            INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS AS rc
        INNER JOIN
            INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS kcu ON kcu.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA AND kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
        INNER JOIN
            INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE AS ccu ON ccu.CONSTRAINT_SCHEMA = rc.UNIQUE_CONSTRAINT_SCHEMA AND ccu.CONSTRAINT_NAME = rc.UNIQUE_CONSTRAINT_NAME
        INNER JOIN
            INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS ptc ON ptc.CONSTRAINT_SCHEMA = rc.UNIQUE_CONSTRAINT_SCHEMA AND ptc.CONSTRAINT_NAME = rc.UNIQUE_CONSTRAINT_NAME
        WHERE
            ptc.CONSTRAINT_TYPE = 'PRIMARY KEY'
    ) AS fk ON c.TABLE_SCHEMA = fk.ForeignTableSchema AND c.TABLE_NAME = fk.ForeignTableName AND c.COLUMN_NAME = fk.ForeignKeyColumnName
    WHERE
        t.TABLE_TYPE = 'BASE TABLE'
    ORDER BY
        t.TABLE_SCHEMA, t.TABLE_NAME, c.ORDINAL_POSITION;
    """
    execute_and_print(cursor, "تفاصيل الجداول والأعمدة والمفاتيح (PK/FK)", detailed_table_column_fk_pk_query)

    # 2. جلب جميع الفهارس (Indexes) لكل جدول
    print("\n--- 2. الفهارس (Indexes) ---")
    indexes_query = """
    SELECT
        SCHEMA_NAME(t.schema_id) AS TableSchema,
        t.name AS TableName,
        ind.name AS IndexName,
        ind.type_desc AS IndexType,
        STRING_AGG(col.name, ', ') WITHIN GROUP (ORDER BY ic.key_ordinal) AS IndexColumns,
        CASE WHEN ind.is_unique = 1 THEN 'YES' ELSE 'NO' END AS IsUnique
    FROM
        sys.indexes AS ind
    INNER JOIN
        sys.tables AS t ON ind.object_id = t.object_id
    INNER JOIN
        sys.index_columns AS ic ON ind.object_id = ic.object_id AND ind.index_id = ic.index_id
    INNER JOIN
        sys.columns AS col ON ic.object_id = col.object_id AND ic.column_id = col.column_id
    WHERE
        t.is_ms_shipped = 0 -- Exclude system tables
        AND ind.name IS NOT NULL -- Exclude heap (no index name)
    GROUP BY
        SCHEMA_NAME(t.schema_id), t.name, ind.name, ind.type_desc, ind.is_unique
    ORDER BY
        TableSchema, TableName, IndexName;
    """
    execute_and_print(cursor, "الفهارس", indexes_query)

    # 3. جلب جميع الإجراءات المخزنة (Stored Procedures) وتفاصيلها
    print("\n--- 3. الإجراءات المخزنة (Stored Procedures) ---")
    stored_procedures_query = """
    SELECT
        SCHEMA_NAME(SCHEMA_ID) AS RoutineSchema,
        o.name AS ProcedureName,
        o.type_desc AS ObjectType,
        LEFT(m.definition, 500) AS ProcedureDefinition_Snippet -- Limit definition to 500 chars for readability
    FROM
        sys.objects AS o
    INNER JOIN
        sys.sql_modules AS m ON o.object_id = m.object_id
    WHERE
        o.type = 'P' -- 'P' for Stored Procedures
    ORDER BY
        RoutineSchema, ProcedureName;
    """
    execute_and_print(cursor, "الإجراءات المخزنة", stored_procedures_query)

    # 4. جلب جميع الدوال (Functions) وتفاصيلها
    print("\n--- 4. الدوال (Functions) ---")
    functions_query = """
    SELECT
        SCHEMA_NAME(SCHEMA_ID) AS RoutineSchema,
        o.name AS FunctionName,
        o.type_desc AS ObjectType,
        LEFT(m.definition, 500) AS FunctionDefinition_Snippet -- Limit definition
    FROM
        sys.objects AS o
    INNER JOIN
        sys.sql_modules AS m ON o.object_id = m.object_id
    WHERE
        o.type IN ('FN', 'IF', 'TF') -- 'FN' for Scalar functions, 'IF' for Inlined table-function, 'TF' for Table functions
    ORDER BY
        RoutineSchema, FunctionName;
    """
    execute_and_print(cursor, "الدوال", functions_query)

    # 5. جلب جميع المشاهدات (Views) وتفاصيلها
    print("\n--- 5. المشاهدات (Views) ---")
    views_query = """
    SELECT
        SCHEMA_NAME(SCHEMA_ID) AS ViewSchema,
        o.name AS ViewName,
        LEFT(m.definition, 500) AS ViewDefinition_Snippet -- Limit definition
    FROM
        sys.objects AS o
    INNER JOIN
        sys.sql_modules AS m ON o.object_id = m.object_id
    WHERE
        o.type = 'V' -- 'V' for Views
    ORDER BY
        ViewSchema, ViewName;
    """
    execute_and_print(cursor, "المشاهدات", views_query)

    # 6. جلب جميع القيود (Constraints) الأخرى (Unique, Check, Default)
    print("\n--- 6. القيود (Constraints) الأخرى ---")
    constraints_query = """
    SELECT
        SCHEMA_NAME(t.schema_id) AS TableSchema,
        t.name AS TableName,
        c.name AS ConstraintName,
        c.type_desc AS ConstraintType,
        OBJECT_DEFINITION(c.object_id) AS ConstraintDefinition -- For CHECK/DEFAULT constraints
    FROM
        sys.tables AS t
    INNER JOIN
        sys.objects AS c ON t.object_id = c.parent_object_id
    WHERE
        c.type IN ('UQ', 'C', 'D') -- 'UQ' for Unique, 'C' for Check, 'D' for Default
    ORDER BY
        TableSchema, TableName, ConstraintType, ConstraintName;
    """
    execute_and_print(cursor, "القيود", constraints_query)

    # 7. جلب جميع المشغلات (Triggers)
    print("\n--- 7. المشغلات (Triggers) ---")
    triggers_query = """
    SELECT
        SCHEMA_NAME(t.schema_id) AS TableSchema,
        t.name AS TableName,
        tr.name AS TriggerName,
        LEFT(OBJECT_DEFINITION(tr.object_id), 500) AS TriggerDefinition_Snippet, -- Limit definition
        CASE
            WHEN tr.is_instead_of_trigger = 1 THEN 'INSTEAD OF'
            ELSE 'AFTER'
        END AS TriggerType,
        tr.is_disabled AS IsDisabled
    FROM
        sys.triggers AS tr
    INNER JOIN
        sys.tables AS t ON tr.parent_id = t.object_id
    WHERE
        tr.parent_class_desc = 'OBJECT_OR_COLUMN' -- For DML triggers on tables
    ORDER BY
        TableSchema, TableName, TriggerName;
    """
    execute_and_print(cursor, "المشغلات", triggers_query)


# --- الجزء الرئيسي للسكربت ---
if __name__ == "__main__":
    cnxn, cursor = connect_to_database()

    if cnxn and cursor:
        # استدعاء الدالة الجديدة لعرض المخطط الكامل
        get_database_full_schema(cursor)

        print("\n" + "="*70)
        print("           أمثلة على تنفيذ استعلامات البيانات")
        print("="*70)

        # مثال على SELECT
        select_query = "SELECT TOP 5 UserId, Username, Email, Role FROM settings.Users"
        execute_and_print(cursor, "أول 5 مستخدمين من settings.Users", select_query)

        # أمثلة INSERT/UPDATE/DELETE (تذكير: كن حذرًا عند استخدامها!)
        # لاستخدامها، قم بإزالة التعليق وتعديلها لتناسب بياناتك
        # print("\n--- أمثلة على INSERT/UPDATE/DELETE (للتجربة فقط) ---")
        # try:
        #     # مثال INSERT (يجب تعديل القيم والأعمدة لتناسب جدولك)
        #     # insert_user_query = "INSERT INTO settings.Users (Username, PasswordHash, FirstName, LastName, Email, Role, CompanyId, CreatedAt, IsActive) VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE(), ?)"
        #     # execute_query(cursor, "INSERT", insert_user_query, ('testuser', 'hashedpass', 'Test', 'User', 'test@example.com', 'Viewer', 1, 1))

        #     # مثال UPDATE (يجب تعديل القيم والشروط)
        #     # update_product_price_query = "UPDATE inventory.Products SET SalePrice = ? WHERE ProductId = ?"
        #     # execute_query(cursor, "UPDATE", update_product_price_query, (120.50, 1))

        #     # مثال DELETE (كن حذرًا جداً!)
        #     # delete_customer_query = "DELETE FROM sales.Customers WHERE CustomerId = ?"
        #     # execute_query(cursor, "DELETE", delete_customer_query, (5,))

        #     cnxn.commit() # تأكيد التغييرات بعد عمليات INSERT/UPDATE/DELETE
        #     print("✅ تم الالتزام بالتغييرات (إن وجدت).")
        # except pyodbc.Error as ex:
        #     print(f"❌ حدث خطأ أثناء الالتزام بالتغييرات: {ex}")
        #     cnxn.rollback() # التراجع عن التغييرات في حالة حدوث خطأ
        #     print("⚠️ تم التراجع عن التغييرات بسبب خطأ.")


        # 3. جلب وتنفيذ الإجراءات المخزنة (كما كان سابقاً)
        print("\n" + "="*70)
        print("           جلب وتنفيذ الإجراءات المخزنة (أمثلة)")
        print("="*70)

        # يمكنك عرض أسماء الإجراءات المخزنة مجدداً هنا إذا أردت
        # get_stored_procedures(cursor) # يمكن إعادة تفعيل هذه الدالة من السكربت القديم إذا أردت قائمة مختصرة

        # مثال على تنفيذ إجراء مخزن (تحتاج إلى معرفة المعلمات المطلوبة)
        # execute_stored_procedure(cursor, 'inventory.sp_AddProduct', ('New Product Name', '123456789', 'Desc', 1, 10.0, 15.0, 100.0, 'Pcs', 10, NULL, 1, 1))
        # execute_stored_procedure(cursor, 'sales.sp_CreateSalesInvoice', (1, 'Cash', 100.0, 0, 0, 10.0, 10.0, 110.0, 110.0, 0.0, 'Completed', 'Notes here', 1, 1))


        cursor.close()
        cnxn.close()
        print("✅ تم إغلاق الاتصال بقاعدة البيانات.")
    else:
        print("⚠️ لم يتمكن السكربت من الاتصال بقاعدة البيانات. يرجى مراجعة معلومات الاتصال والخطأ أعلاه.")