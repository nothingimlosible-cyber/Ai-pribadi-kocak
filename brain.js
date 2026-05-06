// Memanggil library AI dari internet (CDN)
import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

let model = null;

// Fungsi untuk membangunkan model AI
export async function bangunkanModel() {
    try {
        // Menggunakan SmolLM-135M (~30MB) sebagai otak utama
        model = await pipeline('text-generation', 'Xenova/SmolLM-135M-Instruct');
        console.log("Brain.js: Otak AI sudah bangun!");
        return true;
    } catch (e) {
        console.error("Brain.js: Gagal muat model.");
        return false;
    }
}

// Fungsi utama buat mikir (Model x Tambang)
export async function tanyaModel(teksUser, dataTambang) {
    if (!model) return dataTambang || "Model belum siap, coba lagi Lan.";

    try {
        // Prompt rahasia biar pinter dan pake data tambang
        const instruksi = `<|im_start|>system\nJawab dengan ramah. Gunakan info ini jika relevan: ${dataTambang}<|im_end|>\n<|im_start|>user\n${teksUser}<|im_end|>\n<|im_start|>assistant\n`;
        
        const output = await model(instruksi, { 
            max_new_tokens: 80, 
            temperature: 0.4,
            repetition_penalty: 1.2
        });

        return output[0].generated_text.split('assistant\n')[1].trim();
    } catch (err) {
        return dataTambang || "RAM kamu lagi sesak, Lan.";
    }
}
