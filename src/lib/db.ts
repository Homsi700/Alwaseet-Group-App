// src/lib/db.ts
import sql from 'mssql';

// تحديد إعدادات الاتصال بقاعدة بيانات SQL Server
const config: sql.config = {
  // === التعديل الأول: اسم الخادم الصحيح ===
  server: process.env.DB_SERVER || 'DESKTOP-0QOGPV9\\SQLEXPRESS', // استخدمي المسار الكامل للنسخة المسماة

  port: 50000, // المنفذ الافتراضي لـ SQL Server

  database: process.env.DB_DATABASE || 'AlwaseetGroup',

  // === التعديل الثاني: استخدام driver 'tedious' إذا كنت تستخدمين SQL Server Authentication ===
  // 'msnodesqlv8' يعمل بشكل أفضل مع Trusted Connection (Windows Authentication)
  // 'tedious' هو driver افتراضي لـ mssql ويعمل بشكل جيد مع SQL Server Authentication
  driver: 'tedious', // غيّري الـ driver إلى 'tedious'

  // === التعديل الثالث: إزالة trustedConnection أو ضبطه على false ===
  // وتوفير اسم المستخدم وكلمة المرور مباشرة
  user: process.env.DB_USERNAME || 'sa',
  password: process.env.DB_PASSWORD || '700210',

  options: {
    // trustedConnection: false, // لا داعي لهذا السطر إذا كنت توفر user/password مباشرة
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true' || true, // ممكن تخليه true للتطوير
    encrypt: process.env.DB_ENCRYPT === 'true' || false // ممكن تخليه false للتطوير إذا لم تستخدمي SSL
  }
};

// طباعة إعدادات الاتصال (للتصحيح والمراجعة في الطرفية)
console.log('[db.ts] Config:', {
  server: config.server,
  port: config.port,
  database: config.database,
  driver: config.driver,
  user: config.user,
  options: config.options
});

let pool: sql.ConnectionPool | null = null;

async function connectToDatabase() {
    if (pool && pool.connected) {
        return pool;
    }
    console.log('[db.ts] Creating new connection pool...');
    try {
        pool = await sql.connect(config);
        console.log('[db.ts] Connection pool created successfully!');
        return pool;
    } catch (err) {
        console.error('[db.ts] Failed to create connection pool:', err);
        pool = null; // Reset pool on failure
        throw err;
    }
}

async function executeQuery<T>(query: string, params: Record<string, any> = {}): Promise<T> {
  try {
    const currentPool = await connectToDatabase();
    const request = currentPool.request();

    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });

    console.log(`[db.ts] Executing query: ${query.substring(0, 100)}...`);
    console.log(`[db.ts] With parameters:`, params);

    const result = await request.query(query);
    console.log(`[db.ts] Query executed successfully. Records:`, result.recordset?.length || 0);

    return result.recordset as T;

  } catch (error) {
    console.error('[db.ts] Database error (in executeQuery):', error);
    // لا نغلق الـ pool هنا إلا إذا كانت المشكلة في الـ pool نفسه
    // إذا كان الخطأ في الـ query، فالـ pool ممكن يكون لسه شغال
    throw error;
  }
}

async function executeTransaction(queries: { query: string; params: Record<string, any> }[]): Promise<any[]> {
  try {
    const currentPool = await connectToDatabase();
    const transaction = new sql.Transaction(currentPool);
    await transaction.begin();

    console.log(`[db.ts] Starting transaction with ${queries.length} queries`);

    const results: any[] = [];

    try {
      for (const { query, params } of queries) {
        const request = new sql.Request(transaction);

        Object.entries(params).forEach(([key, value]) => {
          request.input(key, value);
        });

        console.log(`[db.ts] Executing transaction query: ${query.substring(0, 100)}...`);
        console.log(`[db.ts] With parameters:`, params);

        const result = await request.query(query);
        results.push(result.recordset || []);
      }

      await transaction.commit();
      console.log(`[db.ts] Transaction committed successfully`);

      return results;
    } catch (transactionError) {
      await transaction.rollback();
      console.error('[db.ts] Transaction error, rolling back:', transactionError);
      throw transactionError;
    }
  } catch (error) {
    console.error('[db.ts] Database transaction error (in executeTransaction):', error);
    // لا نغلق الـ pool هنا إلا إذا كانت المشكلة في الـ pool نفسه
    // إذا كان الخطأ في الـ query، فالـ pool ممكن يكون لسه شغال
    throw error;
  }
}

export { executeQuery, executeTransaction };