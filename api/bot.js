const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { message } = req.body;
    if (message && message.text) {
      const chatId = message.chat.id;
      const userMsg = message.text.toLowerCase();
      const BOT_TOKEN = process.env.BOT_TOKEN; 
      const GITHUB_RAW_URL = "https://raw.githubusercontent.com/nothingimlosible-cyber/Ai-pribadi-kocak/main/otakai.js";

      try {
        const response = await axios.get(GITHUB_RAW_URL);
        let rawData = response.data.toString();

        // --- MESIN PENCERNA OTOMATIS ---
        const start = rawData.indexOf('[');
        const end = rawData.lastIndexOf(']');
        let jsonString = rawData.substring(start, end + 1);
        
        // Hapus koma liar di akhir list
        jsonString = jsonString.replace(/,\s*\]/g, ']'); 
        const dataMemori = JSON.parse(jsonString);

        let bestMatch = null;
        dataMemori.forEach(entry => {
          const keywords = entry.topic.toLowerCase().split(',');
          keywords.forEach(key => {
            if (userMsg.includes(key.trim())) bestMatch = entry;
          });
        });

        let reply = bestMatch ? bestMatch.summary : "Duh, belum nangkep nih Kak Alan. Coba nambang kata kunci lain! 😭";
        if (reply.includes('/')) {
          const parts = reply.split('/');
          reply = parts[Math.floor(Math.random() * parts.length)].trim();
        }

        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: chatId,
          text: reply
        });
      } catch (e) {
        // Biar ketahuan rusaknya di mana
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: chatId,
          text: "⚠️ Laporan Saraf: " + e.message
        });
      }
    }
    res.status(200).send('ok');
  }
};
