import sql from 'mssql';

// تحديد إعدادات الاتصال بقاعدة بيانات SQL Server
const config: sql.config = {
  server: 'DESKTOP-0QOGPV9\\SQLEXPRESS',  // اسم الخادم مع اسم المثيل
  database: 'AlwaseetGroup',    // اسم قاعدة البيانات
  driver: 'msnodesqlv8',         // برنامج تشغيل Node.js
  user: 'sa',                    // اسم المستخدم
  password: '700210',            // كلمة المرور
  options: {
    trustedConnection: false,    // false عند استخدام user/password
    trustServerCertificate: true // للشهادة
  }
};

// طباعة إعدادات الاتصال (للتصحيح والمراجعة في الطرفية)
console.log('[db.ts] Config:', {
  server: config.server,
  database: config.database,
  driver: config.driver,
  user: config.user,
  options: config.options
});

let pool: sql.ConnectionPool | null = null;

async function executeQuery<T>(query: string, params: Record<string, any> = {}): Promise<T> {
  try {
    if (!pool) {
      console.log('[db.ts] Creating new connection pool...');
      pool = await sql.connect(config);
      console.log('[db.ts] Connection pool created successfully!');
    }

    const request = pool.request();

    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });

    console.log(`[db.ts] Executing query: ${query.substring(0, 100)}...`);
    console.log(`[db.ts] With parameters:`, params);

    const result = await request.query(query);
    console.log(`[db.ts] Query executed successfully. Records:`, result.recordset?.length || 0);

    return result.recordset as T;

  } catch (error) {
    console.error('[db.ts] Database error:', error);
    if (pool) {
      await pool.close();
      pool = null;
    }
    throw error;
  }
}

export { executeQuery };