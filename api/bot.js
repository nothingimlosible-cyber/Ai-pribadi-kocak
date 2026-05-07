const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { message } = req.body;

    if (message && message.text) {
      const chatId = message.chat.id;
      const userMsg = message.text;
      const BOT_TOKEN = process.env.BOT_TOKEN; 
      
      // LINK RAW YANG SUDAH DI-TEST
      const GITHUB_RAW_URL = "https://raw.githubusercontent.com/nothingimlosible-cyber/Ai-pribadi-kocak/main/otakai.js";

      try {
        // 1. Ambil data dari server otak (GitHub)
        const response = await axios.get(GITHUB_RAW_URL);
        let rawData = response.data;

        // Mesin pencari data JSON otomatis
        const startIndex = rawData.indexOf('[');
        const endIndex = rawData.lastIndexOf(']');
        
        if (startIndex === -1 || endIndex === -1) {
          throw new Error("Gagal nemu data di server otak. Pastikan ada [ dan ]");
        }

        const cleanJson = rawData.substring(startIndex, endIndex + 1);
        const dataMemori = JSON.parse(cleanJson);

        // 2. ALGORITMA v10.5
        let bestMatch = null;
        let maxScore = 0;
        const noise = ['apakah', 'bagaimana', 'apa', 'itu', 'saya', 'kak', 'dong', 'bang'];
        const tokens = userMsg.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !noise.includes(w));

        dataMemori.forEach(entry => {
          let score = 0;
          tokens.forEach(tok => {
            if (entry.topic.toLowerCase().includes(tok)) score += 10.0;
            if (entry.summary.toLowerCase().includes(tok)) score += 1.5;
          });
          if (score > maxScore) { maxScore = score; bestMatch = entry; }
        });

        // 3. Penentuan Jawaban
        let output = (bestMatch && maxScore > 1.2) ? bestMatch.summary : "Duh, saraf saya belum nangkep maksudnya, Kak Alan. 😭";
        if (output.includes('/')) {
          const p = output.split('/');
          output = p[Math.floor(Math.random() * p.length)].trim();
        }

        // 4. Kirim Balasan
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: chatId,
          text: output
        });

      } catch (error) {
        // Biar kita tau server mana yang salah, bot bakal lapor:
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: chatId,
          text: "⚠️ Saraf Error: " + error.message
        });
      }
    }
    res.status(200).send('ok');
  } else {
    res.status(200).send('Gunakan POST');
  }
};
