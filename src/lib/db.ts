
// استخدام Python كجسر للاتصال بقاعدة البيانات
const DB_BRIDGE_URL = 'http://localhost:3001'; // تأكد من أن هذا هو العنوان والمنفذ الذي يعمل عليه جسر Python

// دالة للانتظار
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// دالة إعادة المحاولة
async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        console.log('[db.ts] Attempting DB operation...');
        return await fn();
    } catch (error) {
        console.error(`[db.ts] DB operation failed. Retries left: ${retries}. Error:`, error);
        if (retries === 0) {
            console.error('[db.ts] No more retries left. Throwing error.');
            throw error;
        }
        await sleep(delay);
        return retry(fn, retries - 1, delay * 2);
    }
}

// دالة تنفيذ الاستعلامات من خلال جسر Python
async function executeQuery<T>(query: string, params: any = {}): Promise<T> {
    return retry(async () => { // Re-enabled retry
        console.log(`[db.ts] Executing via bridge. URL: ${DB_BRIDGE_URL}/query`);
        console.log(`[db.ts] Query: ${query}`);
        console.log(`[db.ts] Params: ${JSON.stringify(params)}`);

        let response;
        try {
            response = await fetch(`${DB_BRIDGE_URL}/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, params })
            });
        } catch (networkError) {
            console.error('[db.ts] Network error fetching from bridge:', networkError);
            throw new Error(`Network error connecting to Python bridge: ${(networkError as Error).message}`);
        }
        
        console.log(`[db.ts] Bridge response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[db.ts] Bridge response not OK. Status: ${response.status}, Body: ${errorText}`);
            let errorMessage = `Python bridge error: ${response.status}`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.message || errorJson.error || errorText;
            } catch (e) {
                // errorText is not JSON, use it as is
                errorMessage = `Python bridge error: ${response.status} - ${errorText}`;
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        // console.log(`[db.ts] Bridge response JSON:`, result); // Can be very verbose
        
        if (result && typeof result === 'object' && 'success' in result && !result.success) {
            console.error('[db.ts] Bridge reported failure:', result.error, result.detailed_errors);
            const message = result.message || result.error || 'Unknown error from Python bridge';
            // Include detailed_errors if available
            const detailed = result.detailed_errors ? ` Details: ${JSON.stringify(result.detailed_errors)}` : '';
            throw new Error(`${message}${detailed}`);
        }
        
        // Ensure result.data exists
        if (result && typeof result === 'object' && 'data' in result) {
             console.log(`[db.ts] Bridge call successful. Data received (first 50 chars): ${JSON.stringify(result.data).substring(0,50)}...`);
            return result.data as T;
        } else {
            console.error('[db.ts] Bridge response missing data field or invalid structure:', result);
            throw new Error('Invalid response structure from Python bridge: missing data field.');
        }

    });
}

// تصدير الدوال اللازمة
export { executeQuery };
    
