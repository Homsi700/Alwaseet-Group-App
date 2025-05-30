#!/usr/bin/env node

import sql from 'mssql';
import { executeQuery } from '../lib/db';

async function testConnection() {
    try {
        console.log('جاري الاتصال بقاعدة البيانات...');
        
        // استخدام executeQuery المعرفة في db.ts
        const result = await executeQuery<Array<{ version: string }>>('SELECT @@version as version');
        console.log('تم الاتصال بنجاح!');
        console.log('إصدار SQL Server:', result[0].version);
        
        console.log('تم إغلاق الاتصال');
    } catch (err) {
        console.error('خطأ في الاتصال:', err);
    }
}

testConnection();
