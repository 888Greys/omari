exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

    try {
        const body = JSON.parse(event.body);
        
        if (body.callback_query) {
            const { bot } = event.queryStringParameters || {};
            const botToken = bot === 'secondary' ? process.env.SECONDARY_TELEGRAM_BOT_TOKEN : process.env.TELEGRAM_BOT_TOKEN;
            
            if (!botToken) {
                console.error('No bot token found for bot:', bot);
                return { statusCode: 200, body: 'Token Missing' };
            }

            const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
            const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
            
            const callbackQuery = body.callback_query;
            const data = callbackQuery.data; // format: action|sessionId|step
            const [action, sessionId, step] = data.split('|');
            
            const newStatus = action === 'approve' ? 'approved' : 'rejected';
            const redisKey = `session:${sessionId}:${step}`;
            
            // Update Redis state
            await fetch(`${redisUrl}/set/${redisKey}/${newStatus}?EX=600`, {
                headers: { Authorization: `Bearer ${redisToken}` }
            });
            
            // Answer Callback Query (removes loading state from button)
            await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ callback_query_id: callbackQuery.id })
            });
            
            // Update the message text to show it was approved/rejected
            const oldText = callbackQuery.message.text || 'Submission';
            const updatedText = `${oldText}\n\n*Status:* ${newStatus.toUpperCase()} ${action === 'approve' ? '✅' : '❌'}`;
            
            await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: callbackQuery.message.chat.id,
                    message_id: callbackQuery.message.message_id,
                    text: updatedText,
                    parse_mode: 'Markdown'
                })
            });
        }
        
        return { statusCode: 200, body: 'OK' };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: 'Error' };
    }
};
