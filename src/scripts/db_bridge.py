import pyodbc
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import os

# تحميل متغيرات البيئة
load_dotenv()

app = Flask(__name__)
CORS(app)

def get_connection():
    connection_string = '''
        DRIVER={ODBC Driver 17 for SQL Server};
        SERVER=DESKTOP-0QOGPV9\\ALWASEETPRODB;
        DATABASE=AlwaseetGroup;
        Trusted_Connection=yes;
        Trust_Server_Certificate=yes;
    '''
    return pyodbc.connect(connection_string)

@app.route('/')
def home():
    return jsonify({
        'status': 'running',
        'message': 'Python DB Bridge is running'
    })

@app.route('/test')
def test_connection():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT @@version as version')
        result = cursor.fetchone()
        conn.close()
        return jsonify({
            'success': True,
            'message': 'Connection successful',
            'version': result.version
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/query', methods=['POST'])
def execute_query():
    try:
        data = request.json
        if not data or 'query' not in data:
            return jsonify({
                'success': False,
                'error': 'No query provided'
            }), 400

        query = data.get('query')
        params = data.get('params', {})
        
        conn = get_connection()
        cursor = conn.cursor()
        
        # تنفيذ الاستعلام
        cursor.execute(query, params)
        
        # تحويل النتائج إلى JSON
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        
        conn.close()
        return jsonify({
            'success': True,
            'data': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("Starting Python DB Bridge on http://localhost:3001")
    app.run(port=3001)
