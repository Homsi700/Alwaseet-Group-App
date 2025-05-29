import pyodbc

# معلومات الاتصال بقاعدة البيانات
SERVER_NAME = r'DESKTOP-0QOGPV9\SQLEXPRESS'
DATABASE_NAME = 'AlwaseetGroup'
USERNAME = 'sa'
PASSWORD = '700210'

# بناء سلسلة الاتصال (Connection String)
# Trusted_Connection=yes تستخدم عادة للاتصال بـ Windows Authentication.
# إذا كنت تستخدم SQL Server Authentication، فيجب تحديد UID و PWD.
CONNECTION_STRING = (
    f"DRIVER={{ODBC Driver 17 for SQL Server}};"  # تأكد من أن هذا يتطابق مع برنامج تشغيل ODBC المثبت لديك
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

def get_database_schema(cursor):
    """
    يجلب معلومات حول الجداول والأعمدة والعلاقات في قاعدة البيانات.
    """
    if not cursor:
        return

    print("\n--- فهم هيكل قاعدة البيانات ---")

    # 1. جلب أسماء الجداول
    print("\n## أسماء الجداول:")
    try:
        cursor.execute("SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
        tables = cursor.fetchall()
        for schema, table_name in tables:
            print(f"- {schema}.{table_name}")
    except pyodbc.Error as ex:
        print(f"❌ حدث خطأ أثناء جلب أسماء الجداول: {ex}")

    # 2. جلب أسماء الأعمدة لكل جدول
    print("\n## أسماء الأعمدة لكل جدول:")
    for schema, table_name in tables:
        print(f"\n### أعمدة الجدول: {table_name}")
        try:
            cursor.execute(f"SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '{schema}' AND TABLE_NAME = '{table_name}'")
            columns = cursor.fetchall()
            for col_name, data_type, max_length in columns:
                if max_length is not None:
                    print(f"  - {col_name} ({data_type}, طول أقصى: {max_length})")
                else:
                    print(f"  - {col_name} ({data_type})")
        except pyodbc.Error as ex:
            print(f"❌ حدث خطأ أثناء جلب أعمدة الجدول {table_name}: {ex}")

    # 3. جلب العلاقات بين الجداول (المفاتيح الأجنبية)
    print("\n## العلاقات بين الجداول (المفاتيح الأجنبية):")
    try:
        # استعلام لجلب معلومات المفاتيح الأجنبية
        foreign_keys_query = """
        SELECT
            rc.CONSTRAINT_NAME AS ForeignKeyName,
            kcu.TABLE_SCHEMA AS ForeignTableSchema,
            kcu.TABLE_NAME AS ForeignTableName,
            kcu.COLUMN_NAME AS ForeignColumnName,
            rc.UNIQUE_CONSTRAINT_SCHEMA AS PrimaryTableSchema,
            rc.UNIQUE_CONSTRAINT_NAME AS PrimaryKeyName,
            ptu.TABLE_NAME AS PrimaryTableName,
            ccu.COLUMN_NAME AS PrimaryColumnName
        FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS AS rc
        INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS kcu
            ON kcu.CONSTRAINT_SCHEMA = rc.CONSTRAINT_SCHEMA
            AND kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
        INNER JOIN INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE AS ccu
            ON ccu.CONSTRAINT_SCHEMA = rc.UNIQUE_CONSTRAINT_SCHEMA
            AND ccu.CONSTRAINT_NAME = rc.UNIQUE_CONSTRAINT_NAME
        INNER JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS ptu
            ON ptu.CONSTRAINT_SCHEMA = rc.UNIQUE_CONSTRAINT_SCHEMA
            AND ptu.CONSTRAINT_NAME = rc.UNIQUE_CONSTRAINT_NAME
        WHERE ptu.CONSTRAINT_TYPE = 'PRIMARY KEY'
        """
        cursor.execute(foreign_keys_query)
        foreign_keys = cursor.fetchall()
        if foreign_keys:
            for fk_name, ft_schema, ft_name, fc_name, pt_schema, pk_name, pt_name, pc_name in foreign_keys:
                print(f"- المفتاح الأجنبي: {fk_name}")
                print(f"  الجدول الأجنبي: {ft_schema}.{ft_name}, العمود: {fc_name}")
                print(f"  الجدول الرئيسي: {pt_schema}.{pt_name}, العمود: {pc_name}")
                print("-" * 30)
        else:
            print("  لا توجد علاقات مفاتيح أجنبية معروفة.")
    except pyodbc.Error as ex:
        print(f"❌ حدث خطأ أثناء جلب علاقات المفاتيح الأجنبية: {ex}")

def execute_query(cursor, query_type, query, params=None):
    """
    ينفذ استعلامًا ويعالج الأخطاء.
    """
    if not cursor:
        return

    print(f"\n--- تنفيذ استعلام {query_type} ---")
    print(f"الاستعلام: {query}")
    try:
        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)

        if query_type == "SELECT":
            rows = cursor.fetchall()
            if rows:
                print("النتائج:")
                for row in rows:
                    print(row)
            else:
                print("لا توجد نتائج.")
        else:
            print("✅ تم تنفيذ الاستعلام بنجاح!")
            # يمكنك إضافة cursor.commit() هنا إذا كنت تريد تنفيذ كل عملية على حدة،
            # ولكن من الأفضل عادةً تجميع العمليات ثم الالتزام بها مرة واحدة في نهاية العملية الأكبر.
    except pyodbc.Error as ex:
        sqlstate = ex.args[0]
        print(f"❌ حدث خطأ أثناء تنفيذ استعلام {query_type}: {sqlstate}")
        print(ex)

def execute_stored_procedure(cursor, sp_name, params=None):
    """
    ينفذ إجراءً مخزنًا.
    """
    if not cursor:
        return

    print(f"\n--- تنفيذ الإجراء المخزن: {sp_name} ---")
    try:
        if params:
            # استخدام {CALL sp_name(?, ?)} للتعامل مع المعلمات
            placeholders = ', '.join(['?' for _ in params])
            cursor.execute(f"{{CALL {sp_name}({placeholders})}}", params)
        else:
            cursor.execute(f"{{CALL {sp_name}}}")

        # يمكن أن تعيد الإجراءات المخزنة نتائج، لذا يمكنك محاولة جلبها
        rows = cursor.fetchall()
        if rows:
            print("نتائج الإجراء المخزن:")
            for row in rows:
                print(row)
        else:
            print("تم تنفيذ الإجراء المخزن بنجاح (لا توجد نتائج مباشرة معادة).")
        print("✅ تم تنفيذ الإجراء المخزن بنجاح!")
    except pyodbc.Error as ex:
        sqlstate = ex.args[0]
        print(f"❌ حدث خطأ أثناء تنفيذ الإجراء المخزن {sp_name}: {sqlstate}")
        print(ex)

def get_stored_procedures(cursor):
    """
    يجلب أسماء الإجراءات المخزنة الموجودة في قاعدة البيانات.
    """
    if not cursor:
        return []

    print("\n--- الإجراءات المخزنة (Stored Procedures) الموجودة ---")
    try:
        cursor.execute("SELECT ROUTINE_SCHEMA, ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_TYPE = 'PROCEDURE'")
        procedures = cursor.fetchall()
        if procedures:
            for schema, proc_name in procedures:
                print(f"- {schema}.{proc_name}")
            return [f"{schema}.{proc_name}" for schema, proc_name in procedures]
        else:
            print("  لا توجد إجراءات مخزنة.")
            return []
    except pyodbc.Error as ex:
        print(f"❌ حدث خطأ أثناء جلب الإجراءات المخزنة: {ex}")
        return []

# --- الجزء الرئيسي للسكربت ---
if __name__ == "__main__":
    cnxn, cursor = connect_to_database()

    if cnxn and cursor:
        # 1. فهم هيكل قاعدة البيانات
        get_database_schema(cursor)

        # 2. أمثلة على تنفيذ الاستعلامات
        # استبدل هذه الاستعلامات باستعلاماتك الفعلية
        print("\n" + "="*50)
        print("           أمثلة على تنفيذ الاستعلامات")
        print("="*50)

        # مثال على SELECT
        # استعلام SELECT يتناسب مع بنية قاعدة البيانات الخاصة بك
        # افترض أن لديك جدول اسمه 'Users' وعمود اسمه 'UserName'
        select_query = "SELECT TOP 5 * FROM Users" # تأكد من وجود هذا الجدول
        execute_query(cursor, "SELECT", select_query)

        # مثال على INSERT (يحتاج إلى قيم حقيقية تتناسب مع جدولك)
        # تأكد من استبدال 'YourTable' و 'Column1', 'Column2' بأسماء الأعمدة الصحيحة
        # وأضف القيم المناسبة.
        # insert_query = "INSERT INTO YourTable (Column1, Column2) VALUES (?, ?)"
        # execute_query(cursor, "INSERT", insert_query, ('value1', 'value2'))

        # مثال على UPDATE (يحتاج إلى قيم حقيقية تتناسب مع جدولك)
        # update_query = "UPDATE YourTable SET Column1 = ? WHERE Column2 = ?"
        # execute_query(cursor, "UPDATE", update_query, ('newValue', 'someCondition'))

        # مثال على DELETE (كن حذرًا جدًا عند استخدام DELETE)
        # delete_query = "DELETE FROM YourTable WHERE Column1 = ?"
        # execute_query(cursor, "DELETE", delete_query, ('valueToDelete',))


        # 3. جلب وتنفيذ الإجراءات المخزنة
        print("\n" + "="*50)
        print("           جلب وتنفيذ الإجراءات المخزنة")
        print("="*50)
        
        available_procedures = get_stored_procedures(cursor)
        if available_procedures:
            # يمكنك اختيار إجراء مخزن من القائمة وتجربته
            # مثال: إذا كان لديك إجراء مخزن اسمه 'GetUserDetails' يأخذ معرّف المستخدم كمعامل
            # execute_stored_procedure(cursor, 'GetUserDetails', (123,))
            pass

        # تذكر دائمًا الالتزام بالتغييرات وإغلاق الاتصال
        try:
            cnxn.commit()
            print("\n✅ تم الالتزام بالتغييرات (إن وجدت).")
        except pyodbc.Error as ex:
            print(f"❌ حدث خطأ أثناء الالتزام بالتغييرات: {ex}")

        cursor.close()
        cnxn.close()
        print("✅ تم إغلاق الاتصال بقاعدة البيانات.")
    else:
        print("⚠️ لم يتمكن السكربت من الاتصال بقاعدة البيانات. يرجى مراجعة معلومات الاتصال والخطأ أعلاه.")

