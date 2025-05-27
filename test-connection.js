const sql = require('mssql/msnodesqlv8');

const config = {
    server: '.',  // يشير إلى السيرفر المحلي
    database: 'AlwaseetGroup',
    driver: 'msnodesqlv8',
    options: {
        trustedConnection: true,
        enableArithAbort: true,
        encrypt: false,
        instanceName: 'ALWASEETPRODB'
    }
};

async function testConnection() {
    try {
        console.log('Attempting to connect...');
        console.log('Using config:', config);
        const pool = await sql.connect(config);
        console.log('Connected to pool...');
        const result = await pool.request().query('SELECT @@VERSION');
        console.log('Connected successfully!');
        console.log('SQL Server Version:', result.recordset[0]);
        await pool.close();
    } catch (err) {
        console.error('Connection error:', err);
        if (err.originalError) {
            console.error('Original error:', err.originalError);
        }
    }
}

testConnection();
