
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
            // Provide a more user-friendly error message for network issues
            const errorMessage = networkError instanceof Error ? networkError.message : 'Unknown network error';
            throw new Error(`Network error connecting to Python bridge: ${errorMessage}. Ensure the Python bridge is running.`);
        }
        
        const responseStatus = response.status;
        const responseText = await response.text(); // Get text first to avoid issues if not JSON
        console.log(`[db.ts] Bridge response status: ${responseStatus}`);
        console.log(`[db.ts] Bridge response text: ${responseText.substring(0, 200)}...`); // Log snippet of response

        if (!response.ok) {
            let errorMessage = `Python bridge error: ${responseStatus}`;
            try {
                const errorJson = JSON.parse(responseText);
                errorMessage = errorJson.message || errorJson.error || `Python bridge error: ${responseStatus} - ${responseText}`;
                if (errorJson.detailed_errors) {
                    errorMessage += ` Details: ${JSON.stringify(errorJson.detailed_errors)}`;
                }
                 if (errorJson.query_attempted) {
                    errorMessage += ` Query: ${errorJson.query_attempted}`;
                }
            } catch (e) {
                // responseText is not JSON, use it as is
                errorMessage = `Python bridge error: ${responseStatus} - ${responseText}`;
            }
            console.error(`[db.ts] Bridge response not OK. Error: ${errorMessage}`);
            throw new Error(errorMessage);
        }

        try {
            const result = JSON.parse(responseText);
            // console.log(`[db.ts] Bridge response JSON:`, result); // Can be very verbose
            
            if (result && typeof result === 'object' && 'success' in result && !result.success) {
                console.error('[db.ts] Bridge reported failure:', result.error, result.detailed_errors);
                const message = result.message || result.error || 'Unknown error from Python bridge';
                const detailed = result.detailed_errors ? ` Details: ${JSON.stringify(result.detailed_errors)}` : '';
                throw new Error(`${message}${detailed}`);
            }
            
            if (result && typeof result === 'object' && 'data' in result) {
                 console.log(`[db.ts] Bridge call successful.`);
                return result.data as T;
            } else {
                console.error('[db.ts] Bridge response missing data field or invalid structure:', result);
                throw new Error('Invalid response structure from Python bridge: missing data field.');
            }
        } catch (jsonError) {
            console.error('[db.ts] Error parsing JSON response from bridge:', jsonError);
            throw new Error(`Error parsing JSON response from Python bridge: ${responseText}`);
        }
    });
}

// تصدير الدوال اللازمة
export { executeQuery };
