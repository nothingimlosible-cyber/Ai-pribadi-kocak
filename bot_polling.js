const axios = require('axios');
const fs = require('fs');

async function runBot() {
    const token = process.env.BOT_TOKEN;
    const url = `https://api.telegram.org/bot${token}`;

    try {
        // 1. Ambil update chat
        const updates = await axios.get(`${url}/getUpdates`);
        const messages = updates.data.result;

        // 2. Baca Otak AI (otakai.js)
        let rawData = fs.readFileSync('./otakai.js', 'utf8');
        const start = rawData.indexOf('[');
        const end = rawData.lastIndexOf(']');
        const dataMemori = JSON.parse(rawData.substring(start, end + 1));

        for (const msg of messages) {
            const chatId = msg.message.chat.id;
            const text = msg.message.text?.toLowerCase();

            if (text) {
                // Cari jawaban
                let match = dataMemori.find(entry => 
                    entry.topic.toLowerCase().split(',').some(k => text.includes(k.trim()))
                );

                if (match) {
                    let reply = match.summary;
                    if (reply.includes('/')) {
                        const parts = reply.split('/');
                        reply = parts[Math.floor(Math.random() * parts.length)].trim();
                    }
                    await axios.post(`${url}/sendMessage`, { chat_id: chatId, text: reply });
                }
            }
        }
    } catch (e) {
        console.log("Error:", e.message);
    }
}

runBot();

