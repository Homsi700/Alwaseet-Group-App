import sql from 'mssql';

// تكوين الاتصال بقاعدة البيانات
const sqlConfig = {
    database: process.env.DB_NAME || 'AlwaseetGroup',
    server: process.env.DB_SERVER || 'DESKTOP-0QOGPV9\\ALWASEETPRODB',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: false,
        trustServerCertificate: true,
        trustedConnection: true, // استخدام مصادقة Windows
        enableArithAbort: true
    }
};

// إنشاء مجمع اتصالات لإعادة استخدام الاتصالات
const pool = new sql.ConnectionPool(sqlConfig);
const poolConnect = pool.connect();

// التعامل مع أخطاء الاتصال
pool.on('error', err => {
    console.error('SQL Pool Error:', err);
});

async function executeQuery<T>(query: string, params: any = {}): Promise<T> {
    await poolConnect;
    try {
        const request = pool.request();
        
        // إضافة المعاملات إلى الطلب
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });

        const result = await request.query(query);
        return result.recordset as T;
    } catch (err) {
        console.error('Database Query Error:', err);
        throw new Error('Database query failed');
    }
}

async function executeProcedure<T>(procedureName: string, params: any = {}): Promise<T> {
    await poolConnect;
    try {
        const request = pool.request();
        
        // إضافة المعاملات إلى الطلب
        Object.entries(params).forEach(([key, value]) => {
            request.input(key, value);
        });

        const result = await request.execute(procedureName);
        return result.recordset as T;
    } catch (err) {
        console.error('Stored Procedure Error:', err);
        throw new Error('Stored procedure execution failed');
    }
}

export { executeQuery, executeProcedure, sql };
