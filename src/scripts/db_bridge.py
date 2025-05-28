
import pyodbc
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime
import traceback
import re

# تحميل متغيرات البيئة
load_dotenv()

app = Flask(__name__)
CORS(app)

def get_connection_string():
    db_driver = os.getenv('DB_DRIVER', '{ODBC Driver 17 for SQL Server}')
    db_server = os.getenv('DB_SERVER', 'DESKTOP-0QOGPV9\\ALWASEETPRODB')
    db_database = os.getenv('DB_DATABASE', 'AlwaseetGroup')
    db_user = os.getenv('DB_USER')
    db_password = os.getenv('DB_PASSWORD')
    db_trusted_connection = os.getenv('DB_TRUSTED_CONNECTION', 'yes')
    db_trust_server_certificate = os.getenv('DB_TRUST_SERVER_CERTIFICATE', 'yes')

    if db_user and db_password:
        conn_str = f'DRIVER={{{db_driver}}};SERVER={db_server};DATABASE={db_database};UID={db_user};PWD={db_password};TrustServerCertificate={db_trust_server_certificate};MARS_Connection=yes;'
    else:
        conn_str = f'DRIVER={{{db_driver}}};SERVER={db_server};DATABASE={db_database};Trusted_Connection={db_trusted_connection};TrustServerCertificate={db_trust_server_certificate};MARS_Connection=yes;'
    
    print(f"[{datetime.now()}] DEBUG: Using connection string: {conn_str}")
    return conn_str

def get_connection():
    return pyodbc.connect(get_connection_string())

@app.route('/')
def home():
    timestamp = datetime.now()
    print(f"[{timestamp}] DEBUG: Home route '/' accessed.")
    return jsonify({
        'status': 'running',
        'message': 'Python DB Bridge is running'
    })

@app.route('/test')
def test_connection_route():
    timestamp = datetime.now()
    print(f"[{timestamp}] DEBUG: Test connection route '/test' accessed.")
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT @@version as version')
        result = cursor.fetchone()
        print(f"[{timestamp}] SUCCESS: Test connection successful. Version: {result.version if result else 'No version info'}")
        return jsonify({
            'success': True,
            'message': 'Connection successful',
            'version': result.version if result else None
        })
    except pyodbc.Error as ex:
        sqlstate = ex.args[0] if ex.args else 'Unknown SQLState'
        print(f"[{timestamp}] PYODBC ERROR in /test: SQLState: {sqlstate} - Args: {ex.args}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error_type': 'pyodbc_error',
            'sqlstate': sqlstate,
            'message': str(ex),
            'detailed_errors': [str(rec) for rec in getattr(ex, 'diag_records', [])] if hasattr(ex, 'diag_records') else [str(ex)]
        }), 500
    except Exception as e:
        print(f"[{timestamp}] GENERAL ERROR in /test: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error_type': 'general_error',
            'message': str(e)
        }), 500
    finally:
        if conn:
            conn.close()
            print(f"[{timestamp}] Connection closed for /test route.")


@app.route('/query', methods=['POST'])
def execute_query_route():
    timestamp = datetime.now()
    print(f"\n[{timestamp}] --- Request to /query ---")
    
    raw_body = request.get_data(as_text=True)
    print(f"[{timestamp}] Request Body (raw): {raw_body}")
    
    try:
        data = json.loads(raw_body)
    except json.JSONDecodeError:
        print(f"[{timestamp}] ERROR: Bad request: Payload is not valid JSON.")
        return jsonify({
            'success': False,
            'error': "Bad request: Payload is not valid JSON."
        }), 400

    if not data or 'query' not in data:
        print(f"[{timestamp}] ERROR: Bad request: 'query' not in data or data is None.")
        return jsonify({
            'success': False,
            'error': "Bad request: 'query' field is missing."
        }), 400

    query_to_execute = data.get('query')
    params_dict = data.get('params', {}) 
    
    print(f"[{timestamp}] Received query: {query_to_execute}")
    print(f"[{timestamp}] Received params_dict: {params_dict}")
    
    # Find all named parameters in the query (e.g., @username, @age)
    param_names_in_query = re.findall(r"@([a-zA-Z0-9_]+)", query_to_execute)
    
    # Create a tuple of parameter values in the order they appear in the query
    ordered_params_tuple = ()
    if param_names_in_query:
        try:
            ordered_params_tuple = tuple(params_dict[name] for name in param_names_in_query)
        except KeyError as e:
            missing_param = str(e).strip("'")
            print(f"[{timestamp}] ERROR: Missing parameter value for '{missing_param}' in params_dict: {params_dict}")
            return jsonify({
                'success': False,
                'error': f"Missing parameter value for '{missing_param}'. Query expects: {param_names_in_query}. Received params: {list(params_dict.keys())}",
            }), 400
            
    # Replace named parameters with '?' for pyodbc
    query_for_pyodbc = re.sub(r"@([a-zA-Z0-9_]+)", "?", query_to_execute)
    
    print(f"[{timestamp}] Query for pyodbc: {query_for_pyodbc}")
    print(f"[{timestamp}] Ordered params for pyodbc (tuple): {ordered_params_tuple}")
    
    conn = None
    try:
        conn = get_connection()
        cursor = conn.cursor()
        
        print(f"[{timestamp}] Executing query with pyodbc...")
        if ordered_params_tuple:
            cursor.execute(query_for_pyodbc, ordered_params_tuple)
        else:
            cursor.execute(query_for_pyodbc)
        
        results = []
        if cursor.description:
            columns = [column[0] for column in cursor.description]
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            print(f"[{timestamp}] SUCCESS: Query executed (SELECT). Rows fetched: {len(results)}")
        else: 
            conn.commit()
            print(f"[{timestamp}] SUCCESS: Query executed (DML). Rows affected: {cursor.rowcount}. Committed.")
        
        return jsonify({
            'success': True,
            'data': results
        })
        
    except pyodbc.Error as ex:
        sqlstate = ex.args[0] if ex.args else 'Unknown SQLState'
        error_message = str(ex)
        detailed_errors = [str(rec) for rec in getattr(ex, 'diag_records', [])] if hasattr(ex, 'diag_records') else [str(ex)]
        print(f"[{timestamp}] PYODBC ERROR in /query: SQLState: {sqlstate} - Message: {error_message} - Args: {ex.args} - Details: {detailed_errors}")
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({
            'success': False,
            'error_type': 'pyodbc_error',
            'sqlstate': sqlstate,
            'message': error_message,
            'detailed_errors': detailed_errors,
            'query_attempted': query_for_pyodbc,
            'params_attempted': list(ordered_params_tuple) # Convert tuple for JSON
        }), 500
    except Exception as e:
        error_message = str(e)
        print(f"[{timestamp}] GENERAL ERROR in /query: {error_message}")
        traceback.print_exc()
        if conn:
            conn.rollback()
        return jsonify({
            'success': False,
            'error_type': 'general_error',
            'message': error_message,
            'query_attempted': query_for_pyodbc,
            'params_attempted': list(ordered_params_tuple) if ordered_params_tuple else []
        }), 500
    finally:
        if conn:
            conn.close()
            print(f"[{timestamp}] Connection closed for /query route.")

if __name__ == '__main__':
    print(f"[{datetime.now()}] Starting Python DB Bridge on http://localhost:3001")
    app.run(host='0.0.0.0', port=3001, debug=True)
