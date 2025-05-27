
import pyodbc
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime

# تحميل متغيرات البيئة
load_dotenv()

app = Flask(__name__)
CORS(app)

def get_connection_string():
    # الأولوية لمتغيرات البيئة إذا كانت موجودة
    db_driver = os.getenv('DB_DRIVER', '{ODBC Driver 17 for SQL Server}')
    db_server = os.getenv('DB_SERVER', 'DESKTOP-0QOGPV9\\ALWASEETPRODB') # قيمة افتراضية
    db_database = os.getenv('DB_DATABASE', 'AlwaseetGroup')    # قيمة افتراضية
    db_user = os.getenv('DB_USER')
    db_password = os.getenv('DB_PASSWORD')
    db_trusted_connection = os.getenv('DB_TRUSTED_CONNECTION', 'yes')
    db_trust_server_certificate = os.getenv('DB_TRUST_SERVER_CERTIFICATE', 'yes')

    if db_user and db_password:
        conn_str = f'DRIVER={db_driver};SERVER={db_server};DATABASE={db_database};UID={db_user};PWD={db_password};TrustServerCertificate={db_trust_server_certificate};'
    else:
        conn_str = f'DRIVER={db_driver};SERVER={db_server};DATABASE={db_database};Trusted_Connection={db_trusted_connection};TrustServerCertificate={db_trust_server_certificate};'
    
    # طباعة سلسلة الاتصال المستخدمة (للتتبع فقط، يمكن إزالتها في الإنتاج)
    # print(f"[{datetime.now()}] Using connection string: {conn_str}")
    return conn_str

def get_connection():
    return pyodbc.connect(get_connection_string())

@app.route('/')
def home():
    print(f"[{datetime.now()}] Home route accessed.")
    return jsonify({
        'status': 'running',
        'message': 'Python DB Bridge is running'
    })

@app.route('/test')
def test_connection_route():
    print(f"[{datetime.now()}] Test connection route accessed.")
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT @@version as version')
        result = cursor.fetchone()
        conn.close()
        print(f"[{datetime.now()}] Test connection successful. Version: {result.version}")
        return jsonify({
            'success': True,
            'message': 'Connection successful',
            'version': result.version
        })
    except Exception as e:
        print(f"[{datetime.now()}] Test connection failed: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/query', methods=['POST'])
def execute_query_route():
    timestamp = datetime.now()
    print(f"[{timestamp}] /query endpoint hit.")
    try:
        data = request.json
        if not data or 'query' not in data:
            print(f"[{timestamp}] Bad request: No query provided.")
            return jsonify({
                'success': False,
                'error': 'No query provided'
            }), 400

        query = data.get('query')
        params_tuple = tuple(data.get('params', {}).values()) # Convert params dict values to tuple for pyodbc

        print(f"[{timestamp}] Received query: {query}")
        print(f"[{timestamp}] Received params: {params_tuple}")
        
        conn = get_connection()
        cursor = conn.cursor()
        
        print(f"[{timestamp}] Executing query...")
        if params_tuple:
            cursor.execute(query, params_tuple)
        else:
            cursor.execute(query)
        
        results = []
        # التحقق مما إذا كان الاستعلام يُرجع نتائج (مثل SELECT)
        if cursor.description:
            columns = [column[0] for column in cursor.description]
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            print(f"[{timestamp}] Query executed successfully. Rows fetched: {len(results)}")
        else:
            # للاستعلامات التي لا تُرجع نتائج (مثل INSERT, UPDATE, DELETE)
            # يمكن إضافة عدد الصفوف المتأثرة إذا لزم الأمر cursor.rowcount
            conn.commit() # تأكيد التغييرات
            print(f"[{timestamp}] Query executed successfully (no rows returned, committed if DML). Rows affected: {cursor.rowcount}")
        
        conn.close()
        return jsonify({
            'success': True,
            'data': results
        })
        
    except Exception as e:
        print(f"[{timestamp}] Error during query execution: {str(e)}")
        # طباعة تفاصيل الخطأ لمزيد من المعلومات
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print(f"[{datetime.now()}] Starting Python DB Bridge on http://localhost:3001")
    # تم تعديل host للسماح بالاتصالات من خارج Docker إذا كان التطبيق يعمل داخله
    app.run(host='0.0.0.0', port=3001, debug=True)
