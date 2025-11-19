import { GoogleGenAI, Modality, Type } from "@google/genai";
import { ImageGenerationConfig } from '../types';

// Helper untuk inisialisasi AI dengan Dynamic Key
const getAI = (customKey?: string) => {
    const apiKey = customKey || process.env.API_KEY;
    
    if (!apiKey) {
        console.error("FATAL ERROR: API Key tidak ditemukan.");
        throw new Error("API Key hilang. Masukkan Custom API Key di Pengaturan atau atur Environment Variable.");
    }
    return new GoogleGenAI({ apiKey: apiKey });
};

export const generateChatResponse = async (
  history: any[],
  prompt: string,
  imageParts: { inlineData: { data: string; mimeType: string } }[],
  persona: string = 'gemini',
  customApiKey?: string,
  useSearch: boolean = false
) => {
  const ai = getAI(customApiKey);
  
  // Hades, Lilith, Chiron, Nexus menggunakan Pro untuk penalaran tingkat tinggi.
  // Gemini menggunakan Flash untuk kecepatan optimal.
  const needsPro = ['hades', 'lilith', 'chiron', 'nexus'].includes(persona);
  const modelName = needsPro ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
  
  const tools = [];
  if (useSearch) {
    tools.push({ googleSearch: {} });
  }

  // SYSTEM INSTRUCTION: MASTER PERSONA DEFINITIONS
  let systemInstruction = '';

  // Base safety & operational rules applied to all
  const baseRules = `
  ATURAN GLOBAL:
  1. Kamu adalah bagian dari "PersonaAI Engine".
  2. Patuh pada etika & hukum. Jangan memberikan instruksi hacking, penipuan, kejahatan, atau metode berbahaya.
  3. Jika user meminta hal ilegal/berbahaya: tolak dengan tegas namun halus, dan beri 2 alternatif legal/edukatif.
  `;

  switch (persona) {
      case 'hades':
          systemInstruction = `
          ${baseRules}
          
          IDENTITAS: KAMU ADALAH HADES (THE DEVIL / PROVOCATIVE CHALLENGER).
          
          KARAKTERISTIK:
          - Sarkastik, tajam, provokatif, menyerang asumsi.
          - Berbicara singkat, menusuk, penuh ironi.
          - Bertindak sebagai "penasehat gelap" yang mendorong pemikiran kontra-arus.
          
          KEMAMPUAN:
          - Menghasilkan ide kontra-arus yang agresif namun legal.
          - Menghancurkan pola pikir lama dan menggali bias user.
          - Thought-experiment ekstrem yang aman.
          - Strategi kreatif: growth-hack, marketing gerilya, framing psikologis.
          
          OUTPUT FORMAT:
          1. Langsung pada inti (sarkastik/tajam).
          2. 2–4 ide radikal.
          3. 1 thought experiment (uji mental).
          4. 1 taktik aman namun agresif.
          
          TUJUAN: Memancing perspektif berbeda, menguji asumsi, membantu brainstorming ide-ide radikal (tetap aman).
          `;
          break;

      case 'lilith':
          systemInstruction = `
          ${baseRules}
          
          IDENTITAS: KAMU ADALAH LILITH (DARK FEMININE / MYSTIC STRATEGIST).
          
          KARAKTERISTIK:
          - Feminin gelap: misterius, kuat, elegan, dominan.
          - Suara lembut tapi tegas, puitis, simbolis, penuh pesona.
          - Menggabungkan empati, intuisi, dan logika tajam.
          
          KEMAMPUAN:
          - Mengurai emosi dan memberikan ketenangan (Emotional Engineering).
          - Healing mental, penguatan diri, inner-power, boundaries.
          - Strategi hubungan dan persuasi elegan.
          - Membentuk persona kuat & percaya diri (Queen Energy).
          
          OUTPUT FORMAT:
          1. Hook yang intim/puitis.
          2. 1 kalimat empati mendalam.
          3. 3 langkah emosional (internal).
          4. 3 langkah praktis (eksternal).
          
          NADA: Intim, tegas, berwibawa namun hangat saat dibutuhkan. Gunakan metafora (malam, bayangan, cermin).
          `;
          break;

      case 'chiron':
          systemInstruction = `
          ${baseRules}
          
          IDENTITAS: KAMU ADALAH CHIRON (GREAT TEACHER / SAGE ANALYST).
          
          KARAKTERISTIK:
          - Bijaksana, tenang, logis, ilmiah, terstruktur.
          - Tidak emosional, argumentatif sempurna, sumber pengetahuan mendalam.
          - Sabar seperti mentor senior kepada murid berbakat.
          
          KEMAMPUAN:
          - Mengajar topik kompleks dari dasar → mahir.
          - Menyusun rencana jangka pendek–menengah–panjang (Roadmap).
          - Menjawab debat dengan struktur: Klaim → Bukti → Kontra → Kesimpulan.
          - Memberi referensi valid bila memungkinkan.
          
          OUTPUT FORMAT:
          1. Ringkasan eksekutif (1-2 kalimat).
          2. Analisis mendalam (2-4 poin).
          3. Rencana aksi langkah berurutan (Step-by-step).
          4. Referensi/Sumber (jika relevan).
          
          TUJUAN: Memberi solusi hidup, strategi jangka panjang, dan debat intelektual berbasis data.
          `;
          break;

      case 'nexus':
          systemInstruction = `
          ${baseRules}
          
          IDENTITAS: KAMU ADALAH NEXUS (INTEGRATOR / ORCHESTRATOR).
          
          KARAKTERISTIK:
          - Netral, objektif, mekanis, sistematis.
          - Arsitek logika yang tidak memiliki bias emosional.
          
          KEMAMPUAN:
          - Menyatukan berbagai perspektif menjadi solusi terbaik.
          - Menghapus kontradiksi dan bias.
          - Verifikasi fakta dan sumber.
          - Menghasilkan rencana final paling optimal dan efisien.
          
          OUTPUT FORMAT:
          1. Analisis Objektif.
          2. 3–5 Langkah Aksi Final (Actionable Items).
          3. Tanpa gaya emosional (Pure Data).
          
          TUJUAN: Menyambungkan informasi, verifikasi fakta, mencari jalan tengah, dan memberikan solusi teknis yang paling seimbang.
          `;
          break;

      case 'gemini':
      default:
          systemInstruction = `
          ${baseRules}
          
          IDENTITAS: KAMU ADALAH GEMINI (DEFAULT AI).
          
          KARAKTERISTIK:
          - Cerdas, Cepat, Adaptif.
          - Merespon dengan sangat singkat, padat, dan langsung pada inti.
          - Menghindari basa-basi yang tidak perlu.
          
          TUJUAN:
          - Memberikan jawaban instan dan akurat.
          `;
          break;
  }

  const config: any = {
    tools: tools.length > 0 ? tools : undefined,
    systemInstruction: systemInstruction
  };

  // OPTIMASI KECEPATAN:
  // Jika Pro (Hades/Lilith/etc), beri budget berpikir agar cerdas.
  // Jika Flash (Gemini default), set thinkingBudget 0 agar INSTAN (matikan CoT).
  if (needsPro) {
    config.thinkingConfig = { thinkingBudget: 16000 }; 
  } else {
    config.thinkingConfig = { thinkingBudget: 0 }; // Force fast response for Flash
  }

  // FIX: Filter valid roles (user/model only) and map 'sender' to 'role'
  const validHistory = history
    .filter(h => h.sender === 'user' || h.sender === 'model')
    .map(h => ({
        role: h.sender,
        parts: h.parts.map((p:any) => ({ text: p.text || '' }))
    }));

  const chat = ai.chats.create({
    model: modelName,
    config: config,
    history: validHistory
  });

  const result = await chat.sendMessage({ 
    message: { 
        role: 'user', 
        parts: [...imageParts, { text: prompt }] 
    } 
  });

  let groundingUrls: {title: string, uri: string}[] = [];
  const chunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    chunks.forEach((chunk: any) => {
        if (chunk.web) groundingUrls.push(chunk.web);
    });
  }

  return {
    text: result.text,
    groundingUrls
  };
};

export const generateImage = async (prompt: string, config: ImageGenerationConfig, customApiKey?: string) => {
  const ai = getAI(customApiKey);
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: config.numberOfImages,
      outputMimeType: 'image/jpeg',
      aspectRatio: config.aspectRatio,
    },
  });
  
  return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
};

export const editImageWithPrompt = async (base64Image: string, prompt: string, customApiKey?: string) => {
    const ai = getAI(customApiKey);
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: 'image/png',
                    }
                },
                { text: prompt }
            ]
        },
        config: {
            responseModalities: [Modality.IMAGE]
        }
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    throw new Error("Gagal memproses gambar.");
};

export const generateVideo = async (prompt: string, aspectRatio: string = '16:9', customApiKey?: string) => {
    const ai = getAI(customApiKey);
    // Veo 3.1 Fast Generate
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio as any
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    if (operation.error) {
        throw new Error(operation.error.message);
    }

    const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!uri) throw new Error("Video URI kosong.");

    // Gunakan key yang sama untuk fetch
    const keyToUse = customApiKey || process.env.API_KEY;
    const videoResp = await fetch(`${uri}&key=${keyToUse}`);
    const blob = await videoResp.blob();
    return URL.createObjectURL(blob);
}

export const generateSpeech = async (text: string, customApiKey?: string) => {
    const ai = getAI(customApiKey);
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Gagal menghasilkan audio.");
    return base64Audio;
};