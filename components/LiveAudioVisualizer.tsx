import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, X } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';
import { decodeBase64ToUint8Array, decodeAudioData, base64ToBlob } from '../utils/audioUtils';

interface LiveAudioVisualizerProps {
    onClose: () => void;
}

const LiveAudioVisualizer: React.FC<LiveAudioVisualizerProps> = ({ onClose }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [status, setStatus] = useState('Menghubungkan ke Gemini Live...');
    
    // Refs for audio handling
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sessionRef = useRef<any>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        isMountedRef.current = true;
        startLiveSession();
        return () => {
            isMountedRef.current = false;
            cleanup();
        };
    }, []);

    const cleanup = () => {
        if (sessionRef.current) {
            sessionRef.current = null; 
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        if (processorRef.current) {
            processorRef.current.disconnect();
        }
        if (inputSourceRef.current) {
            inputSourceRef.current.disconnect();
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
    };

    const startLiveSession = async () => {
        try {
            if (!process.env.API_KEY) throw new Error("API Key tidak ditemukan");

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Try to create context. If sampleRate 16000 fails, fallback to default
            try {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            } catch (e) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }

            // FIX: Resume context if suspended (autoplay policy)
            if (audioContextRef.current?.state === 'suspended') {
                await audioContextRef.current.resume();
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    autoGainControl: true,
                    noiseSuppression: true
                } 
            });
            streamRef.current = stream;

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
                    },
                    systemInstruction: "Kamu adalah asisten AI berbahasa Indonesia yang ramah dan membantu. Jawab dengan singkat dan natural.",
                },
                callbacks: {
                    onopen: () => {
                        if (!isMountedRef.current) return;
                        console.log("Live Session Opened");
                        setIsConnected(true);
                        setStatus("Mendengarkan...");
                        setupAudioInput(stream, sessionPromise);
                    },
                    onmessage: async (msg) => {
                        if (!isMountedRef.current) return;
                        
                        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (audioData && audioContextRef.current) {
                            playAudioChunk(audioData);
                        }

                        if (msg.serverContent?.interrupted) {
                            console.log("Interrupted");
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onclose: () => {
                        if (!isMountedRef.current) return;
                        console.log("Live Session Closed");
                        setIsConnected(false);
                        setStatus("Sesi Berakhir");
                    },
                    onerror: (err) => {
                        console.error("Live Session Error", err);
                        setStatus("Gagal terhubung");
                    }
                }
            });
            
            sessionRef.current = sessionPromise;

        } catch (e: any) {
            console.error("Failed to start live session", e);
            setStatus(`Error: ${e.message || "Gagal mengakses mikrofon"}`);
        }
    };

    const setupAudioInput = (stream: MediaStream, sessionPromise: Promise<any>) => {
        if (!audioContextRef.current) return;

        const ctx = audioContextRef.current;
        const source = ctx.createMediaStreamSource(stream);
        const processor = ctx.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
            if (isMuted) return;

            const inputData = e.inputBuffer.getChannelData(0);
            // Simple downsampling/conversion if context is not 16k, or just pass through if it is.
            // Gemini Live prefers 16k PCM. 
            const l = inputData.length;
            const int16 = new Int16Array(l);
            for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
            }

            let binary = '';
            const bytes = new Uint8Array(int16.buffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64Data = btoa(binary);

            sessionPromise.then(session => {
                session.sendRealtimeInput({
                    media: {
                        mimeType: 'audio/pcm;rate=16000',
                        data: base64Data
                    }
                });
            });
        };

        source.connect(processor);
        processor.connect(ctx.destination);

        inputSourceRef.current = source;
        processorRef.current = processor;
    };

    const playAudioChunk = async (base64Data: string) => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;

        const uint8Array = decodeBase64ToUint8Array(base64Data);
        const audioBuffer = await decodeAudioData(uint8Array, ctx, 24000, 1);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);

        const now = ctx.currentTime;
        const startTime = Math.max(nextStartTimeRef.current, now);
        
        source.start(startTime);
        nextStartTimeRef.current = startTime + audioBuffer.duration;
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center">
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-zinc-400 hover:text-white"
            >
                <X size={32} />
            </button>

            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* Animated Rings */}
                {isConnected && (
                    <>
                        <div className="absolute w-full h-full rounded-full border border-blue-500/30 animate-[ping_3s_ease-in-out_infinite]"></div>
                        <div className="absolute w-48 h-48 rounded-full border border-purple-500/30 animate-[ping_2s_ease-in-out_infinite_reverse]"></div>
                    </>
                )}
                
                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.5)]">
                    <Mic size={48} className="text-white" />
                </div>
            </div>

            <h2 className="mt-8 text-2xl font-semibold text-white">{status}</h2>
            <p className="text-zinc-500 mt-2">Gemini 2.5 Native Audio Live</p>

            <div className="mt-12 flex gap-6">
                <button 
                    onClick={toggleMute}
                    className={`p-4 rounded-full ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-zinc-800 text-white'} hover:scale-105 transition-all`}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                <button 
                    onClick={onClose}
                    className="px-8 py-4 rounded-full bg-white text-black font-medium hover:scale-105 transition-all"
                >
                    Akhiri Sesi
                </button>
            </div>
        </div>
    );
};

export default LiveAudioVisualizer;