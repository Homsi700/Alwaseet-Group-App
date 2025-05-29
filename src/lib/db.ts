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

async function getPool(): Promise<sql.ConnectionPool> {
  if (!pool) {
    console.log('[db.ts] Creating new connection pool...');
    pool = await sql.connect(config);
    console.log('[db.ts] Connection pool created successfully!');
  }
  return pool;
}

async function executeQuery<T>(query: string, params: Record<string, any> = {}): Promise<T> {
  try {
    const pool = await getPool();
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

// Function to execute multiple queries in a transaction
async function executeTransaction<T>(
  queries: Array<{ query: string; params: Record<string, any> }>
): Promise<T[]> {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  const results: T[] = [];

  try {
    console.log('[db.ts] Beginning transaction...');
    await transaction.begin();

    for (let i = 0; i < queries.length; i++) {
      const { query, params } = queries[i];
      const request = new sql.Request(transaction);

      Object.entries(params).forEach(([key, value]) => {
        request.input(key, value);
      });

      console.log(`[db.ts] Executing transaction query ${i + 1}/${queries.length}: ${query.substring(0, 100)}...`);
      const result = await request.query(query);
      results.push(result.recordset as T);
    }

    console.log('[db.ts] Committing transaction...');
    await transaction.commit();
    console.log('[db.ts] Transaction committed successfully!');

    return results;
  } catch (error) {
    console.error('[db.ts] Transaction error:', error);
    try {
      console.log('[db.ts] Rolling back transaction...');
      await transaction.rollback();
      console.log('[db.ts] Transaction rolled back successfully!');
    } catch (rollbackError) {
      console.error('[db.ts] Rollback error:', rollbackError);
    }
    throw error;
  }
}

export { executeQuery, executeTransaction };