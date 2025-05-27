import { Connection, Request } from 'tedious';

// إعدادات الاتصال (استبدلها ببياناتك)
const config = {
  server: 'اسم_السيرفر',  // مثال: 'localhost' أو '192.168.1.100'
  authentication: {
    type: 'default',
    options: {
      userName: 'اسم_المستخدم',  // مثال: 'sa'
      password: 'كلمة_المرور'
    }
  },
  options: {
    database: 'اسم_قاعدة_البيانات',  // مثال: 'AccountingDB'
    encrypt: true,  // إذا كان السيرفر يستخدم تشفير SSL
    trustServerCertificate: true,  // مهم للتطوير المحلي (يفضل تعطيله في الإنتاج)
    port: 1433  // البورت الافتراضي لـ SQL Server
  }
};

// إنشاء اتصال
const connection = new Connection(config);

// التعامل مع الأحداث
connection.on('connect', (err) => {
  if (err) {
    console.error('فشل الاتصال:', err.message);
  } else {
    console.log('✅ تم الاتصال بنجاح!');
    
    // استعلام تجريبي (اختياري)
    const request = new Request("SELECT 1 AS test", (err, rowCount) => {
      if (err) {
        console.error('خطأ في الاستعلام:', err);
      } else {
        console.log(`✔ تم تنفيذ الاستعلام. عدد الصفوف: ${rowCount}`);
      }
      connection.close();  // أغلق الاتصال بعد الانتهاء
    });

    request.on('row', (columns) => {
      columns.forEach(column => {
        console.log(`نتيجة الاستعلام: ${column.value}`);
      });
    });

    connection.execSql(request);
  }
});

connection.on('error', (err) => {
  console.error('حدث خطأ:', err.message);
});

// بدء الاتصال
connection.connect();