
// استخدام Python كجسر للاتصال بقاعدة البيانات
const DB_BRIDGE_URL = 'http://localhost:3001'; // تأكد من أن هذا هو العنوان والمنفذ الذي يعمل عليه جسر Python

// دالة للانتظار
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// دالة إعادة المحاولة (تم تبسيطها مؤقتاً للاختبار)
async function retry<T>(fn: () => Promise<T>, retries = 1, delay = 500): Promise<T> {
    try {
        console.log('Attempting DB operation...');
        return await fn();
    } catch (error) {
        console.error(`DB operation failed. Retries left: ${retries}. Error:`, error);
        if (retries === 0) {
            console.error('No more retries left. Throwing error.');
            throw error;
        }
        await sleep(delay);
        return retry(fn, retries - 1, delay * 2);
    }
}

// دالة تنفيذ الاستعلامات من خلال جسر Python
async function executeQuery<T>(query: string, params: any = {}): Promise<T> {
    // تم إزالة retry مؤقتاً لتبسيط التشخيص
    // return retry(async () => {
    console.log(`[db.ts] Attempting to execute query via bridge.`);
    console.log(`[db.ts] Bridge URL: ${DB_BRIDGE_URL}/query`);
    console.log(`[db.ts] Query: ${query}`);
    console.log(`[db.ts] Params: ${JSON.stringify(params)}`);

    try {
        const response = await fetch(`${DB_BRIDGE_URL}/query`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, params }) // تأكد من أن `params` هنا هو الكائن الذي يتوقعه جسر Python
        });

        console.log(`[db.ts] Bridge response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[db.ts] Bridge response not OK. Status: ${response.status}, Body: ${errorText}`);
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.message || `Python bridge error: ${response.status} - ${errorJson.error || errorText}`);
            } catch (e) {
                throw new Error(`Python bridge error: ${response.status} - ${errorText}`);
            }
        }

        const result = await response.json();
        console.log(`[db.ts] Bridge response JSON:`, result);
        
        if (!result.success) {
            console.error('[db.ts] Bridge reported failure:', result.error, result.detailed_errors);
            throw new Error(result.message || result.error || 'Unknown error from Python bridge');
        }

        return result.data as T;
    } catch (err: unknown) {
        console.error('[db.ts] Fetch to bridge or JSON parsing failed:', err);
        // Aاكد من أن هذا الخطأ يظهر تفاصيل كافية
        if (err instanceof Error) {
            throw new Error(`Failed to execute query via bridge: ${err.message}`);
        }
        throw new Error('Failed to execute query via bridge due to an unknown error.');
    }
    // });
}

// تصدير الدوال اللازمة
export { executeQuery };

    