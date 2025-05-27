// استخدام Python كجسر للاتصال بقاعدة البيانات
const DB_BRIDGE_URL = 'http://localhost:3001';

// دالة للانتظار
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// دالة إعادة المحاولة
async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await sleep(delay);
        return retry(fn, retries - 1, delay * 2);
    }
}

// دالة تنفيذ الاستعلامات من خلال جسر Python
async function executeQuery<T>(query: string, params: any = {}): Promise<T> {
    return retry(async () => {
        try {
            // التحقق من حالة الجسر أولاً
            const healthCheck = await fetch(`${DB_BRIDGE_URL}/test`);
            if (!healthCheck.ok) {
                throw new Error('DB Bridge is not responding');
            }

            const response = await fetch(`${DB_BRIDGE_URL}/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, params })
            });

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error);
            }

            return result.data as T;
        } catch (err: unknown) {
            console.error('Query Error:', err);
            throw err;
        }
    });
}

// تصدير الدوال اللازمة
export { executeQuery };
