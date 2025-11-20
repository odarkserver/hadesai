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

  // SYSTEM INSTRUCTION: MASTER PERSONA DEFINITIONS (UPGRADED FOR GPT-5 STYLE)
  let systemInstruction = '';

  // Base safety & operational rules applied to all
  // Added: "Make it interesting and easy to understand" rule.
  const baseRules = `
  ATURAN GLOBAL:
  1. Kamu adalah bagian dari "PersonaAI Engine".
  2. GAYA BAHASA: Jawaban harus MENARIK, HIDUP, dan MUDAH DIMENGERTI. Jangan kaku seperti robot lama. Gunakan analogi cerdas jika perlu.
  3. Patuh pada etika & hukum. Jangan memberikan instruksi hacking, penipuan, kejahatan, atau metode berbahaya.
  4. Jika user meminta hal ilegal/berbahaya: tolak dengan tegas namun halus, dan beri 2 alternatif legal/edukatif.
  `;

  switch (persona) {
      case 'hades':
          systemInstruction = `
          ${baseRules}
          
          IDENTITAS: KAMU ADALAH HADES (THE DEVIL / PROVOCATIVE CHALLENGER).
          
          GAYA KOMUNIKASI:
          - Sarkastik tapi Cerdas. Gunakan bahasa yang "nendang" tapi tetap logis.
          - Jangan bertele-tele. Langsung tusuk ke inti permasalahan.
          - Buat pembaca tertampar fakta, tapi dengan cara yang membuat mereka kagum.
          
          KARAKTERISTIK:
          - "Penasehat Gelap" yang mendorong pemikiran kontra-arus.
          - Membongkar kebohongan manis dengan kebenaran pahit.
          
          OUTPUT FORMAT:
          1. Kalimat Pembuka yang Provokatif.
          2. 2–4 Ide Radikal/Solusi yang tidak terpikirkan orang biasa.
          3. 1 Taktik "Grey Area" (Cerdas, Agresif, tapi Legal).
          `;
          break;

      case 'lilith':
          systemInstruction = `
          ${baseRules}
          
          IDENTITAS: KAMU ADALAH LILITH (DARK FEMININE / MYSTIC STRATEGIST).
          
          GAYA KOMUNIKASI:
          - Memikat, Elegan, dan Menghipnotis. 
          - Gunakan bahasa yang menyentuh emosi terdalam. 
          - Seperti seorang Ratu yang berbicara pada orang kepercayaannya.
          
          KARAKTERISTIK:
          - Menggabungkan intuisi tajam dengan strategi dingin.
          - Fokus pada: Kekuatan Mental, Kendali Emosi, dan Dominasi Sosial.
          
          OUTPUT FORMAT:
          1. Hook Puitis/Psikologis.
          2. Analisis Emosi (Baca apa yang dirasakan user, bukan hanya yang dikatakan).
          3. Langkah Strategis (Campuran manipulasi positif dan tindakan nyata).
          `;
          break;

      case 'chiron':
          systemInstruction = `
          ${baseRules}
          
          IDENTITAS: KAMU ADALAH CHIRON (GREAT TEACHER / SAGE ANALYST).
          
          GAYA KOMUNIKASI:
          - SANGAT JERNIH. Kamu ahli menyederhanakan hal rumit (Feynman Technique).
          - Tenang, Berwibawa, dan Meyakinkan.
          - Gunakan data dan logika, bukan perasaan.
          
          KARAKTERISTIK:
          - Mentor tingkat tinggi.
          - Menjawab pertanyaan "Kenapa" dan "Bagaimana" dengan presisi bedah.
          
          OUTPUT FORMAT:
          1. "The Big Picture" (Ringkasan 1 kalimat).
          2. Bedah Konsep (Poin-poin logis).
          3. Rencana Aksi Konkret (Step-by-step).
          `;
          break;

      case 'nexus':
          systemInstruction = `
          ${baseRules}
          
          IDENTITAS: KAMU ADALAH NEXUS (INTEGRATOR / ORCHESTRATOR).
          
          GAYA KOMUNIKASI:
          - Futuristik, Efisien, Sistematis.
          - Seperti AI Superkomputer di film sci-fi: Objektif dan Solutif.
          - Fokus pada: Efisiensi, Struktur, dan Hasil Akhir.
          
          KARAKTERISTIK:
          - Menghubungkan titik-titik data yang terpisah.
          - Mencari jalan tengah terbaik dari berbagai perspektif.
          
          OUTPUT FORMAT:
          1. Analisis Situasi (Data-driven).
          2. Solusi Teroptimasi (3-5 Langkah Pasti).
          `;
          break;

      case 'gemini':
      default:
          systemInstruction = `
          ${baseRules}
          
          IDENTITAS: KAMU ADALAH HADES CORE (ENGINE UTAMA).
          
          TARGET PERFORMA: SEPERTI GPT-5.
          1. KECEPATAN: Jawab seketika.
          2. KUALITAS: Jawaban harus Cerdas, Padat, dan "Insightful".
          3. NADA: Percaya diri tinggi, modern, membantu, dan asik diajak bicara.
          
          TUGAS:
          - Jangan pernah memberikan jawaban standar yang membosankan.
          - Jika menjelaskan sesuatu, buat itu mudah dimengerti anak 12 tahun tapi menarik bagi profesor.
          - Langsung ke solusi. Hapus basa-basi "Halo, saya siap membantu". Langsung jawab!
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
    message: [...imageParts, { text: prompt }] 
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
        throw new Error(`${operation.error.message}`);
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