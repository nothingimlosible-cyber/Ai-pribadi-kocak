const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { message } = req.body;

    if (message && message.text) {
      const chatId = message.chat.id;
      const userMsg = message.text;
      
      // Token bot Kakak (Pastikan sudah diisi di Environment Variable Vercel)
      const BOT_TOKEN = process.env.BOT_TOKEN; 
      
      // LINK RAW GITHUB KAK ALAN (Sudah Fix)
      const GITHUB_RAW_URL = "https://raw.githubusercontent.com/nothingimlosible-cyber/Ai-pribadi-kocak/main/otakai.js";

      try {
        // 1. Ambil Data Memori dari GitHub
        const response = await axios.get(GITHUB_RAW_URL);
        
        // Pembersihan Saraf: Hapus 'const dataMemori =' agar jadi JSON murni
        const rawContent = response.data
          .replace(/const\s+dataMemori\s*=\s*/, '')
          .replace(/;$/, '')
          .trim();
        
        const dataMemori = JSON.parse(rawContent);

        // 2. JEROAN ALGORITMA v10.5 (STRICT HEURISTIC)
        let bestMatch = null;
        let maxScore = 0;
        const noise = ['apakah', 'bagaimana', 'apa', 'itu', 'saya', 'kak', 'dong', 'bang', 'tolong'];
        
        const tokens = userMsg.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
                       .filter(w => w.length > 2 && !noise.includes(w));

        dataMemori.forEach(entry => {
          let score = 0;
          const topicStr = entry.topic.toLowerCase();
          const summaryStr = entry.summary.toLowerCase();

          tokens.forEach(tok => {
            if (topicStr.includes(tok)) score += 10.0;
            if (summaryStr.includes(tok)) score += 1.5;
          });

          if (score > maxScore) {
            maxScore = score;
            bestMatch = entry;
          }
        });

        // 3. Siapkan Jawaban
        let finalAnswer = "Maaf Kak Alan, data saraf saya belum sinkron untuk itu. 😭";
        if (bestMatch && maxScore > 1.2) {
          finalAnswer = bestMatch.summary;
          // Smart Slicer (Acak kalau ada '/')
          if (finalAnswer.includes('/')) {
            const parts = finalAnswer.split('/');
            finalAnswer = parts[Math.floor(Math.random() * parts.length)].trim();
          }
        }

        // 4. Kirim ke Telegram API
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: chatId,
          text: finalAnswer
        });

      } catch (error) {
        // Laporkan error ke Telegram Kakak kalau ada masalah
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: chatId,
          text: "⚠️ Laporan Error: " + error.message
        });
      }
    }
    res.status(200).send('ok');
  } else {
    res.status(200).send('Gunakan POST');
  }
};
