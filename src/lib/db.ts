
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' }); // Load .env.local variables

const dbConfig: sql.config = {
  user: process.env.DB_USER, // Corrected to DB_USER
  password: process.env.DB_PASSWORD, // Corrected to DB_PASSWORD
  server: process.env.DB_SERVER || 'localhost', // Default to localhost if not set
  database: process.env.DB_DATABASE || '',
  port: parseInt(process.env.DB_PORT || "1433", 10),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true', // Use strict 'true' check
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true', // Use strict 'true' check
  },
  connectionTimeout: 30000, // 30 seconds
  requestTimeout: 30000, // 30 seconds
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// For Windows Authentication, trustedConnection is handled differently in mssql
// If DB_TRUSTED_CONNECTION is true, user and password should not be provided
if (process.env.DB_TRUSTED_CONNECTION === 'true') {
  dbConfig.user = undefined;
  dbConfig.password = undefined;
  dbConfig.options!.trustedConnection = true; // mssql uses options.trustedConnection
}


console.log('[db.ts] Initializing DB connection pool with config:', {
    server: dbConfig.server,
    database: dbConfig.database,
    user: dbConfig.user ? '********' : undefined, // Mask user
    port: dbConfig.port,
    options: dbConfig.options,
});

let pool: sql.ConnectionPool | null = null;
let poolConnectPromise: Promise<sql.ConnectionPool> | null = null;

const getPool = (): Promise<sql.ConnectionPool> => {
  if (poolConnectPromise) {
    return poolConnectPromise;
  }

  poolConnectPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(connectedPool => {
      pool = connectedPool;
      console.log('[db.ts] SQL Server Connection Pool Created Successfully.');
      pool.on('error', err => {
        console.error('[db.ts] SQL Pool Error:', err);
        // Optionally, try to recreate the pool or signal critical failure
        pool = null;
        poolConnectPromise = null; // Reset promise to allow reconnection attempt
      });
      return pool;
    })
    .catch(err => {
      console.error('[db.ts] Failed to create SQL Server Connection Pool:', err);
      poolConnectPromise = null; // Reset promise to allow reconnection attempt
      throw err; // Re-throw error to be caught by caller
    });

  return poolConnectPromise;
};

async function executeQuery<T>(query: string, params: Record<string, any> = {}): Promise<T> {
  console.log(`[db.ts] Attempting to execute query: ${query.substring(0,100)}...`);
  console.log(`[db.ts] With params:`, params);

  try {
    const currentPool = await getPool();
    const request = currentPool.request();

    // Add parameters to the request
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        // Infer SQL type or set explicitly if needed. For simplicity, mssql often infers well.
        // Example: request.input(key, sql.NVarChar, params[key]);
        request.input(key, params[key]);
      }
    }

    const result = await request.query(query);
    console.log(`[db.ts] Query executed successfully. Rows affected/returned: ${result.rowsAffected[0] !== undefined ? result.rowsAffected[0] : result.recordset?.length}`);
    
    // For SELECT statements, result.recordset contains the data
    // For INSERT, UPDATE, DELETE, result.rowsAffected indicates success
    // We'll assume SELECT queries expect recordset, others might not return data this way.
    // The generic type T will determine what the caller expects.
    // If it's an array of objects (typical for SELECT), return recordset.
    // If it's a number (typical for rowsAffected), the caller should handle that.
    // This simple return might need adjustment based on query types.
    return result.recordset as T;

  } catch (error) {
    const err = error as sql.ISqlError; // Type assertion
    console.error(`[db.ts] SQL Error executing query: ${query.substring(0,100)}...`);
    console.error(`[db.ts] Error Code: ${err.code}, Message: ${err.message}`);
    console.error(`[db.ts] Full Error:`, err);
    // Construct a more detailed error message
    let detailedErrorMessage = `SQL Execution Failed: ${err.message} (Code: ${err.code})`;
    if (err.originalError) {
        detailedErrorMessage += ` Original Error: ${err.originalError}`;
    }
    throw new Error(detailedErrorMessage);
  }
}

// Optional: Close the pool when the application exits (e.g., in a cleanup script or server shutdown)
// async function closePool() {
//   try {
//     if (pool) {
//       await pool.close();
//       pool = null;
//       poolConnectPromise = null;
//       console.log('[db.ts] SQL Server Connection Pool Closed.');
//     }
//   } catch (error) {
//     console.error('[db.ts] Error closing SQL Server Connection Pool:', error);
//   }
// }

// process.on('SIGINT', closePool); // Example for graceful shutdown
// process.on('SIGTERM', closePool);

export { executeQuery };
