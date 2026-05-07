const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { message } = req.body;

    if (message && message.text) {
      const chatId = message.chat.id;
      const userMsg = message.text;
      const BOT_TOKEN = process.env.BOT_TOKEN; 
      const GITHUB_RAW_URL = "https://raw.githubusercontent.com/nothingimlosible-cyber/Ai-pribadi-kocak/main/otakai.js";

      try {
        const response = await axios.get(GITHUB_RAW_URL);
        let rawData = response.data.toString();

        // 1. CARI DATA UTAMA (Antara [ dan ])
        const start = rawData.indexOf('[');
        const end = rawData.lastIndexOf(']');
        
        if (start === -1 || end === -1) throw new Error("Format data di otakai.js rusak!");

        let jsonString = rawData.substring(start, end + 1);
        
        // 2. REPARASI OTOMATIS (Hapus koma sisa sebelum tutup kurung)
        jsonString = jsonString.replace(/,\s*\]/g, ']'); 
        
        const dataMemori = JSON.parse(jsonString);

        // 3. ALGORITMA v10.5
        let bestMatch = null;
        let maxScore = 0;
        const tokens = userMsg.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);

        dataMemori.forEach(entry => {
          let score = 0;
          tokens.forEach(tok => {
            if (entry.topic.toLowerCase().includes(tok)) score += 10.0;
            if (entry.summary.toLowerCase().includes(tok)) score += 1.5;
          });
          if (score > maxScore) { maxScore = score; bestMatch = entry; }
        });

        // 4. KIRIM JAWABAN
        let output = (bestMatch && maxScore > 1.2) ? bestMatch.summary : "Duh, saraf saya belum nangkep maksudnya, Kak Alan. 😭";
        
        // Fitur Random Slicer (Kalau ada tanda /)
        if (output.includes('/')) {
          const parts = output.split('/');
          output = parts[Math.floor(Math.random() * parts.length)].trim();
        }

        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          chat_id: chatId,
          text: output
        });

      } catch (error) {
        // Laporkan error biar kita tau salahnya di mana
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
