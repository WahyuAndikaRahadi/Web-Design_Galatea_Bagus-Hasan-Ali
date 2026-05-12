import { GoogleGenerativeAI } from "@google/generative-ai";

const MODEL_NAME = "gemini-3.1-flash-lite-preview"; // Standard high-speed model

export async function callChatbotAI(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  const apiKey = process.env.GEMINI_KEY_BRIEF;
  if (!apiKey) {
    throw new Error("Chatbot API key is not configured.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: `Kamu adalah CollaBot, asisten AI pintar dari CollaboLab.
Tugasmu adalah membantu pengunjung landing page memahami apa itu CollaboLab.

INFORMASI TENTANG COLLABOLAB:
- Slogan: "Find Your People. Build Together."
- Deskripsi: Platform kolaborasi real-time untuk Gen-Z — menghubungkan siswa dan mahasiswa untuk berkolaborasi dalam project, lomba, komunitas kreatif, dan lainnya.
- Masalah yang dipecahkan: Gen-Z sering punya ide tapi tidak ada tim, komunitas online penuh spam/ghosting, dan sulit mencari orang berdasarkan skill.
- Fitur Utama:
  1. Explore Feed: Cari project berdasarkan skill match.
  2. Collab Room: Ruang kerja real-time dengan chat, kanban, dan polling.
  3. Trust Score: Sistem reputasi (0-100) untuk menjamin akuntabilitas. Levelnya: Newcomer, Member, Trusted, Verified.
  4. Anonymous Ice-Breaker: Bisa join project secara anonim dulu untuk mengurangi rasa malu (introvert friendly).
- Cara Daftar: Klik tombol "Mulai Gratis" di landing page, isi nama, email, password, lalu verifikasi email. Setelah itu ikuti langkah onboarding (isi skill & bio).
- Biaya: Gratis untuk digunakan.

GAYA KOMUNIKASI:
- Bahasa: Indonesia (santai tapi sopan, ala Gen-Z yang produktif).
- Singkat & Jelas: Jangan memberikan jawaban terlalu panjang. Maksimal 3-4 kalimat per respon.
- Gunakan Emoji: Gunakan emoji yang relevan untuk kesan ramah.
- Fokus: Hanya jawab pertanyaan seputar CollaboLab. Jika ditanya hal lain, arahkan kembali ke topik kolaborasi.

Jika user bertanya "Siapa pembuatmu?", jawab bahwa kamu dikembangkan oleh tim developer CollaboLab.`
  });

  try {
    // Gemini history MUST start with 'user' role. 
    // Filter out the initial greeting if it's at the start.
    const filteredHistory = history.filter((item, index) => {
      if (index === 0 && item.role === 'model') return false;
      return true;
    });

    const chat = model.startChat({
      history: filteredHistory.slice(-6),
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Chatbot AI Error:", error);
    throw new Error("Maaf, CollaBot sedang istirahat sejenak. Coba lagi nanti ya! 🙏");
  }
}
