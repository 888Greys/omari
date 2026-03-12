exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method Not Allowed' };
    
    const { sessionId, step } = event.queryStringParameters;
    if (!sessionId || !step) return { statusCode: 400, body: 'Missing sessionId or step' };

    const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
    const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    const redisKey = `session:${sessionId}:${step}`;

    try {
        const response = await fetch(`${redisUrl}/get/${redisKey}`, {
            headers: { Authorization: `Bearer ${redisToken}` }
        });
        const data = await response.json();
        const status = data.result || 'pending';

        return {
            statusCode: 200,
            body: JSON.stringify({ status })
        };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};
