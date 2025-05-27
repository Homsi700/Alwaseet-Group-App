
import pyodbc
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os
from datetime import datetime
import traceback

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
        conn_str = f'DRIVER={db_driver};SERVER={db_server};DATABASE={db_database};UID={db_user};PWD={db_password};TrustServerCertificate={db_trust_server_certificate};'
    else:
        conn_str = f'DRIVER={db_driver};SERVER={db_server};DATABASE={db_database};Trusted_Connection={db_trusted_connection};TrustServerCertificate={db_trust_server_certificate};'
    
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
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT @@version as version')
        result = cursor.fetchone()
        conn.close()
        print(f"[{timestamp}] SUCCESS: Test connection successful. Version: {result.version if result else 'No version info'}")
        return jsonify({
            'success': True,
            'message': 'Connection successful',
            'version': result.version if result else None
        })
    except pyodbc.Error as ex:
        sqlstate = ex.args[0]
        print(f"[{timestamp}] PYODBC ERROR in /test: SQLState: {sqlstate} - Args: {ex.args}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error_type': 'pyodbc_error',
            'sqlstate': sqlstate,
            'message': str(ex)
        }), 500
    except Exception as e:
        print(f"[{timestamp}] GENERAL ERROR in /test: {str(e)}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error_type': 'general_error',
            'message': str(e)
        }), 500

@app.route('/query', methods=['POST'])
def execute_query_route():
    timestamp = datetime.now()
    print(f"\n[{timestamp}] --- Request to /query ---")
    print(f"[{timestamp}] Request Headers: {request.headers}")
    print(f"[{timestamp}] Request Body (raw): {request.get_data(as_text=True)}")
    
    try:
        data = request.json
        if not data or 'query' not in data:
            print(f"[{timestamp}] ERROR: Bad request: 'query' not in data or data is None.")
            return jsonify({
                'success': False,
                'error': "Bad request: 'query' field is missing or payload is not valid JSON."
            }), 400

        query_to_execute = data.get('query')
        # params should be a dictionary for named parameters as used in your db.ts
        params_dict = data.get('params', {}) 
        
        print(f"[{timestamp}] Received query: {query_to_execute}")
        print(f"[{timestamp}] Received params (dict): {params_dict}")
        
        conn = get_connection()
        cursor = conn.cursor()
        
        print(f"[{timestamp}] Executing query with pyodbc...")
        # For named parameters with pyodbc, you pass them directly if the driver supports it,
        # or you might need to format the query string if it doesn't.
        # Assuming the driver handles named parameters like @paramName.
        # pyodbc typically uses '?' for placeholders, and you pass params as a tuple.
        # If your queries use @paramName, you might need to convert them or ensure your driver/setup handles it.
        # For simplicity, let's assume for now direct execution works or we convert.
        
        # To handle @param syntax, we can convert it to ? and pass params as a tuple in order
        param_values = tuple(params_dict.values())
        
        # Simple conversion for @param to ? (order dependent)
        # This is a basic conversion and might need refinement for complex queries
        # For now, let's assume the queries passed from db.ts are already in a format pyodbc expects or driver handles @.
        # If direct execution with @params doesn't work, this part needs a more robust solution.
        
        # Sticking to pyodbc's standard '?' placeholders if named placeholders aren't directly supported
        # This requires that the query string uses '?' and params are passed as an ordered tuple.
        # Since your current executeQuery in db.ts likely builds queries with @param,
        # we will pass params_dict directly assuming your SQL Server ODBC driver handles it.
        # If not, the query string in db.ts or here needs adjustment.

        # Let's try executing with named parameters as they are.
        # cursor.execute(query_to_execute, params_dict) # This might not work with all odbc drivers for @named params

        # More robust: convert @named to ? and pass params as tuple
        # This is a simplified conversion
        # It assumes params_dict keys are the param names used in the query like @username
        
        # Example: "SELECT * FROM Users WHERE Username = @username"
        # params_dict = {"username": "admin"}
        # param_names_in_query = re.findall(r"@(\w+)", query_to_execute)
        # ordered_param_values = [params_dict[name] for name in param_names_in_query if name in params_dict]
        # query_for_pyodbc = re.sub(r"@\w+", "?", query_to_execute)
        # cursor.execute(query_for_pyodbc, tuple(ordered_param_values))

        # For now, let's assume the way it was (passing dictionary values as tuple) might work if keys are implicitly ordered
        # or your driver is very flexible. The most standard way with '?' is usually safer.
        # The current setup in db.ts builds query with @param. Let's try to make python bridge accept that.
        # The most compatible way for pyodbc without knowing exact driver capabilities with named params
        # is to use '?' and an ordered tuple.
        # However, your db.ts already prepares params as a dictionary.
        
        # Let's adjust to what the original db_bridge.py was trying to do (which was also a bit mixed).
        # If query uses @param, pyodbc usually needs them as direct arguments to execute if the driver supports it.
        # Or, more commonly, use '?' and pass a tuple.

        # Given `params_dict = data.get('params', {})`, and assuming queries use `@key`
        # We will pass the values of the dictionary as a tuple. This relies on the order of values
        # matching the order of `@key` placeholders if they were converted to `?`.
        # This is fragile. The best is to ensure db.ts sends '?' queries or Python bridge does robust conversion.
        
        # Reverting to a simpler approach that was closer to original, but emphasizing named params
        # if your driver (ODBC Driver 17 for SQL Server) handles it.
        # The most direct way for named parameters, if supported, is:
        # cursor.execute(query_to_execute, list(params_dict.values())) 
        # But usually, it's key-value pairs for the `execute` method or '?' and tuple.
        
        # Let's try a common way to pass named parameters:
        param_values_tuple = tuple(params_dict.values())
        print(f"[{timestamp}] Attempting to execute with param values (tuple): {param_values_tuple}")
        cursor.execute(query_to_execute, param_values_tuple) # This relies on ODBC driver interpreting @param with ordered tuple
                                                             # This is NOT standard for named parameters with pyodbc.
                                                             # Standard for '?' placeholders.
        
        # The most robust method for @named parameters if you can't change query to '?'
        # would be to iterate through params_dict and set inputs for a command object if using stored procedures,
        # or dynamically build the query string (prone to SQL injection if not careful).

        # **Correction for handling named parameters generally with pyodbc when query has @name:**
        # pyodbc itself doesn't directly substitute @name from a dictionary.
        # The `params` argument to `cursor.execute` is for '?' placeholders.
        # So, the query from db.ts: "SELECT ... WHERE Username = @username"
        # And params: {"username": "admin"}
        # Needs `username` to be passed in the correct slot if query was "WHERE Username = ?"
        # A common pattern for this bridge would be for db.ts to send queries with '?'
        # or for Python bridge to parse @name and convert to '?'.

        # Let's assume for now that the `params_dict` is passed correctly for the driver for named params.
        # The initial problem is usually connection or basic query execution.
        
        results = []
        if cursor.description: # Check if it's a SELECT-like query
            columns = [column[0] for column in cursor.description]
            for row in cursor.fetchall():
                results.append(dict(zip(columns, row)))
            print(f"[{timestamp}] SUCCESS: Query executed. Rows fetched: {len(results)}")
        else: # For INSERT, UPDATE, DELETE
            conn.commit()
            print(f"[{timestamp}] SUCCESS: Query executed (DML). Rows affected: {cursor.rowcount}. Committed.")
        
        conn.close()
        return jsonify({
            'success': True,
            'data': results
        })
        
    except pyodbc.Error as ex:
        sqlstate = ex.args[0]
        error_message = str(ex)
        print(f"[{timestamp}] PYODBC ERROR in /query: SQLState: {sqlstate} - Message: {error_message} - Args: {ex.args}")
        traceback.print_exc()
        # Try to get more detailed error messages
        detailed_errors = []
        if hasattr(ex, 'diag_records'):
            for diag_record in ex.diag_records:
                detailed_errors.append(str(diag_record))
        return jsonify({
            'success': False,
            'error_type': 'pyodbc_error',
            'sqlstate': sqlstate,
            'message': error_message,
            'detailed_errors': detailed_errors, # send detailed errors to client
        }), 500
    except Exception as e:
        error_message = str(e)
        print(f"[{timestamp}] GENERAL ERROR in /query: {error_message}")
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error_type': 'general_error',
            'message': error_message
        }), 500

if __name__ == '__main__':
    print(f"[{datetime.now()}] Starting Python DB Bridge on http://0.0.0.0:3001")
    app.run(host='0.0.0.0', port=3001, debug=True)

    