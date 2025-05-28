import pyodbc
from datetime import datetime
from tabulate import tabulate  # للتنسيق الجدولي

def sql_server_connection():
    # معلومات الاتصال المؤكدة
    server = 'DESKTOP-0QOGPV9\\ALWASEETPRODB'
    database = 'AlwaseetGroup'
    
    try:
        # إنشاء سلسلة الاتصال
        connection_string = f'''
            DRIVER={{ODBC Driver 17 for SQL Server}};
            SERVER={server};
            DATABASE={database};
            Trusted_Connection=yes;
            Trust_Server_Certificate=yes;
        '''
        
        # إجراء الاتصال
        print(f"[{datetime.now()}] جاري الاتصال بالخادم: {server}...")
        connection = pyodbc.connect(connection_string)
        cursor = connection.cursor()
        
        print("\n--- معلومات قواعد البيانات ---")
        cursor.execute("SELECT @@VERSION AS version")
        print(f"إصدار SQL Server: {cursor.fetchone().version}\n")
        
        # ---------------------------------------------------------
        # 1. استعراض الهيكل الأساسي للقاعدة
        # ---------------------------------------------------------
        print("\n--- الهيكل الأساسي للقاعدة ---")
        schemas = cursor.execute("""
            SELECT s.name AS schema_name, 
                   COUNT(t.name) AS tables_count
            FROM sys.schemas s
            LEFT JOIN sys.tables t ON s.schema_id = t.schema_id
            GROUP BY s.name
            ORDER BY s.name
        """).fetchall()
        
        print(tabulate(schemas, headers=['المخطط', 'عدد الجداول'], tablefmt='pretty'))
        
        # ---------------------------------------------------------
        # 2. استعلامات محاسبية (Accounting)
        # ---------------------------------------------------------
        print("\n--- البيانات المحاسبية ---")
        
        # أ. دليل الحسابات
        try:
            # تم حذف عمود 'Balance' لأنه غير موجود في هيكل الجدول الذي زودتني به
            accounts = cursor.execute("""
                SELECT TOP 5 AccountId, AccountCode, AccountName, AccountType
                FROM accounting.ChartOfAccounts
                ORDER BY AccountCode
            """).fetchall()
            
            if accounts:
                print("\nأول 5 حسابات في دليل الحسابات:")
                print(tabulate(accounts, 
                               headers=['ID', 'الكود', 'اسم الحساب', 'النوع'], # تم حذف 'الرصيد'
                               tablefmt='grid'))
            else:
                print("لا توجد بيانات في جدول دليل الحسابات (accounting.ChartOfAccounts).")
        except Exception as e:
            print(f"\n! خطأ في جلب دليل الحسابات: {str(e)}")
        
        # ب. حركات اليومية
        try:
            # تم حذف عمود 'TotalAmount' لأنه غير موجود في هيكل الجدول الذي زودتني به
            journal_entries = cursor.execute("""
                SELECT TOP 5 EntryId, EntryDate, Description
                FROM accounting.JournalEntries
                ORDER BY EntryDate DESC
            """).fetchall()
            
            if journal_entries:
                print("\nأحدث 5 حركات يومية:")
                print(tabulate(journal_entries,
                               headers=['ID', 'التاريخ', 'الوصف'], # تم حذف 'المبلغ'
                               tablefmt='grid'))
            else:
                print("لا توجد بيانات في جدول حركات اليومية (accounting.JournalEntries).")
        except Exception as e:
            print(f"\n! خطأ في جلب حركات اليومية: {str(e)}")
        
        # ---------------------------------------------------------
        # 3. استعلامات المخزون (Inventory)
        # ---------------------------------------------------------
        print("\n--- بيانات المخزون ---")
        
        # أ. الفئات
        try:
            categories = cursor.execute("""
                SELECT CategoryId, Name, Description
                FROM inventory.Categories
                ORDER BY Name
            """).fetchall()
            
            if categories:
                print("\nجميع فئات المنتجات:")
                print(tabulate(categories,
                               headers=['ID', 'اسم الفئة', 'الوصف'],
                               tablefmt='grid'))
            else:
                print("لا توجد بيانات في جدول الفئات (inventory.Categories).")
        except Exception as e:
            print(f"\n! خطأ في جلب الفئات: {str(e)}")
        
        # ب. المنتجات
        try:
            products = cursor.execute("""
                SELECT p.ProductId, p.Name, p.Quantity, p.SalePrice, 
                       c.Name AS CategoryName, p.MinimumQuantity
                FROM inventory.Products p
                LEFT JOIN inventory.Categories c ON p.CategoryId = c.CategoryId
                ORDER BY p.Name
            """).fetchall()
            
            if products:
                print("\nجميع المنتجات:")
                print(tabulate(products,
                               headers=['ID', 'الاسم', 'الكمية', 'السعر', 'الفئة', 'حد أدنى'],
                               tablefmt='grid'))
                
                # تحليل المخزون
                inventory_stats = cursor.execute("""
                    SELECT 
                        COUNT(*) AS total_products,
                        SUM(Quantity) AS total_quantity,
                        SUM(Quantity * SalePrice) AS inventory_value
                    FROM inventory.Products
                """).fetchone()
                
                print("\nملخص المخزون:")
                print(f"- عدد المنتجات: {inventory_stats.total_products}")
                print(f"- إجمالي الكمية: {inventory_stats.total_quantity}")
                print(f"- القيمة الإجمالية للمخزون: {inventory_stats.inventory_value:,.2f}")
                
                # المنتجات المنخفضة
                low_stock = cursor.execute("""
                    SELECT Name, Quantity, MinimumQuantity
                    FROM inventory.Products
                    WHERE Quantity < MinimumQuantity OR Quantity < 5
                    ORDER BY Quantity ASC
                """).fetchall()
                
                if low_stock:
                    print("\n! تنبيه: المنتجات المنخفضة:")
                    print(tabulate(low_stock,
                                   headers=['المنتج', 'الكمية', 'حد أدنى'],
                                   tablefmt='grid'))
                else:
                    print("\n✓ لا توجد منتجات منخفضة في المخزون")
            else:
                print("لا توجد بيانات في جدول المنتجات (inventory.Products).")
        except Exception as e:
            print(f"\n! خطأ في جلب المنتجات: {str(e)}")
        
        # ---------------------------------------------------------
        # 4. استعلامات المبيعات (Sales)
        # ---------------------------------------------------------
        print("\n--- بيانات المبيعات ---")
        
        # أ. العملاء
        try:
            customers = cursor.execute("""
                SELECT TOP 5 CustomerId, Name, PhoneNumber, Email
                FROM sales.Customers
                ORDER BY Name
            """).fetchall()
            
            if customers:
                print("\nأهم 5 عملاء:")
                print(tabulate(customers,
                               headers=['ID', 'اسم العميل', 'الهاتف', 'البريد'],
                               tablefmt='grid'))
            else:
                print("لا توجد بيانات في جدول العملاء (sales.Customers).")
        except Exception as e:
            print(f"\n! خطأ في جلب العملاء: {str(e)}")
        
        # ب. الفواتير
        try:
            invoices = cursor.execute("""
                SELECT TOP 5 i.InvoiceId, i.InvoiceDate, c.Name AS CustomerName, 
                       i.TotalAmount, i.Status AS PaymentStatus
                FROM sales.Invoices i
                LEFT JOIN sales.Customers c ON i.CustomerId = c.CustomerId
                ORDER BY i.InvoiceDate DESC
            """).fetchall()
            
            if invoices:
                print("\nأحدث 5 فواتير:")
                print(tabulate(invoices,
                               headers=['رقم الفاتورة', 'التاريخ', 'العميل', 'المبلغ', 'الحالة'],
                               tablefmt='grid'))
            else:
                print("لا توجد بيانات في جدول الفواتير (sales.Invoices).")
        except Exception as e:
            print(f"\n! خطأ في جلب الفواتير: {str(e)}")
        
        # ---------------------------------------------------------
        # 5. استعلامات الإعدادات (Settings)
        # ---------------------------------------------------------
        print("\n--- إعدادات النظام ---")
        
        # أ. الشركات
        try:
            companies = cursor.execute("""
                SELECT CompanyId, Name, TaxNumber, PhoneNumber
                FROM settings.Companies
            """).fetchall()
            
            if companies:
                print("\nبيانات الشركة:")
                print(tabulate(companies,
                               headers=['ID', 'اسم الشركة', 'الرقم الضريبي', 'الهاتف'],
                               tablefmt='grid'))
            else:
                print("لا توجد بيانات في جدول الشركات (settings.Companies).")
        except Exception as e:
            print(f"\n! خطأ في جلب بيانات الشركة: {str(e)}")
        
        # ب. المستخدمين
        try:
            users = cursor.execute("""
                SELECT UserId, Username, Email, IsActive, Role
                FROM settings.Users
                ORDER BY Username
            """).fetchall()
            
            if users:
                print("\nجميع المستخدمين:")
                print(tabulate(users,
                               headers=['ID', 'اسم المستخدم', 'البريد', 'نشط؟', 'الدور'],
                               tablefmt='grid'))
            else:
                print("لا توجد بيانات في جدول المستخدمين (settings.Users).")
        except Exception as e:
            print(f"\n! خطأ في جلب المستخدمين: {str(e)}")
        
        # ---------------------------------------------------------
        
        # إغلاق الاتصال
        connection.close()
        print(f"\n[{datetime.now()}] تم إغلاق الاتصال بنجاح.")
        
    except pyodbc.Error as e:
        print(f"\n✗ خطأ في الاتصال بقاعدة البيانات: {str(e)}")
    except Exception as e:
        print(f"\n✗ خطأ غير متوقع: {str(e)}")

if __name__ == "__main__":
    print(f"[{datetime.now()}] بدء اختبار اتصال SQL Server")
    sql_server_connection()
    print(f"\n[{datetime.now()}] تم الانتهاء من العملية")