
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import InputArea from './components/InputArea';
import LiveAudioVisualizer from './components/LiveAudioVisualizer';
import ImageModal from './components/ImageModal';
import SidePanel from './components/SidePanel';
import { Sender, Message, AppMode, ContentType, VideoAspectRatio, ImageGenerationConfig } from './types';
import { generateChatResponse, generateImage, generateVideo, editImageWithPrompt, generateSpeech } from './services/geminiService';
import { Volume2, Clock, Cpu, Info, Database, User, Link as LinkIcon, ExternalLink } from 'lucide-react';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<string>('chat');
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLiveAudio, setShowLiveAudio] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = useState<VideoAspectRatio>('16:9');
  const [imageConfig, setImageConfig] = useState<ImageGenerationConfig>({ aspectRatio: '1:1', numberOfImages: 1 });
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null); // State untuk detail pesan
  
  // Enhanced State - Default to 'gemini'
  const [currentPersona, setCurrentPersona] = useState<string>('gemini');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [history, setHistory] = useState<any[]>(() => {
      try {
        const saved = localStorage.getItem('chat_history');
        return saved ? JSON.parse(saved) : [];
      } catch(e) { return []; }
  });

  // Load custom key from local storage on mount
  useEffect(() => {
      const savedPersona = localStorage.getItem('current_persona');
      if (savedPersona) setCurrentPersona(savedPersona);
  }, []);

  const handleSetPersona = (persona: string) => {
      setCurrentPersona(persona);
      localStorage.setItem('current_persona', persona);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, expandedMessageId]); // Scroll jika detail dibuka

  useEffect(() => {
      try {
        localStorage.setItem('chat_history', JSON.stringify(history));
      } catch (e) {
        console.error("Storage full or error", e);
      }
  }, [history]);

  useEffect(() => {
      if (messages.length > 0) {
          const title = messages[0].parts.find(p => p.type === ContentType.TEXT)?.text?.slice(0, 30) || "Percakapan Baru";
          
          const compressedMessages = messages.map(m => ({
              ...m,
              parts: m.parts.map(p => p.type === ContentType.IMAGE ? { ...p, imageUrl: '[Gambar Disimpan]' } : p)
          }));

          const currentSession = {
              id: messages[0].id, 
              timestamp: messages[0].timestamp,
              title: title,
              messages: compressedMessages
          };
          
          setHistory(prev => {
              const exists = prev.find(h => h.id === currentSession.id);
              if (exists) {
                  return prev.map(h => h.id === currentSession.id ? currentSession : h);
              } else {
                  return [currentSession, ...prev];
              }
          });
      }
  }, [messages]);

  const handleModeChange = (mode: string) => {
      setActiveMode(mode);
      if (mode === 'live_audio') {
          setShowLiveAudio(true);
          setActivePanel(null);
      } else {
          setActivePanel(null);
      }
  };

  const handleNewChat = () => {
      setMessages([]);
      setActiveMode('chat');
      setActivePanel(null);
      setExpandedMessageId(null);
  };

  const handleDeleteChat = () => {
      if (window.confirm("Apakah Anda yakin ingin menghapus chat ini secara permanen?")) {
          setMessages([]);
          setExpandedMessageId(null);
      }
  };

  const handleLoadHistory = (chat: any) => {
      setMessages(chat.messages);
      setActivePanel(null);
      setActiveMode('chat');
  };

  const handleSend = async (text: string, files: File[]) => {
    const newUserMsg: Message = {
      id: Date.now().toString(),
      sender: Sender.USER,
      timestamp: Date.now(),
      parts: [
        { type: ContentType.TEXT, text: text },
        ...files.map(f => ({ 
            type: f.type.startsWith('image') ? ContentType.IMAGE : ContentType.VIDEO,
            text: `[Berkas: ${f.name}]` 
        }))
      ]
    };
    
    const processedFiles = await Promise.all(files.map(async (file) => {
        return new Promise<{inlineData: {data: string, mimeType: string}, preview: string}>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                resolve({
                    inlineData: { data: base64, mimeType: file.type },
                    preview: reader.result as string
                });
            };
            reader.readAsDataURL(file);
        });
    }));

    if (processedFiles.length > 0) {
        newUserMsg.parts = [
            ...newUserMsg.parts.filter(p => p.type === ContentType.TEXT),
            ...processedFiles.map(f => ({ 
                type: ContentType.IMAGE, 
                imageUrl: f.preview 
            }))
        ];
    }

    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      let responseText = '';
      let responseImages: string[] = [];
      let responseVideo = '';
      let groundingUrls: any[] = [];
      
      // Determine Technical Model Name for Metadata
      const needsPro = ['hades', 'lilith', 'chiron', 'nexus'].includes(currentPersona);
      const technicalModel = activeMode === AppMode.VIDEO_GEN ? 'Veo 3.1' : 
                             activeMode === AppMode.IMAGE_GEN ? 'Imagen 4' :
                             needsPro ? 'Gemini 3 Pro' : 'Gemini 2.5 Flash';

      if (activeMode === AppMode.IMAGE_EDIT) {
          if (processedFiles.length === 0) {
             throw new Error("Silakan unggah gambar untuk diedit.");
          }
          const editedImage = await editImageWithPrompt(processedFiles[0].inlineData.data, text || "Ubah gambar ini");
          responseImages = [editedImage];
          responseText = text ? `Gambar diedit berdasarkan: "${text}"` : "Gambar berhasil diedit.";
      }
      else if (activeMode === AppMode.IMAGE_GEN) {
         const prompt = text.replace(/^(create|generate|buatkan)\s+image\s*(of)?/i, '').trim();
         const imgUrls = await generateImage(prompt || text, imageConfig);
         responseImages = imgUrls;
         responseText = `Menghasilkan ${imgUrls.length} gambar dengan Imagen 4.`;
      } 
      else if (activeMode === AppMode.VIDEO_GEN) {
         const videoUrl = await generateVideo(text, videoAspectRatio);
         responseVideo = videoUrl;
         responseText = `Video dihasilkan via Veo 3.1 (${videoAspectRatio}).`;
      }
      else if (processedFiles.length > 0 && activeMode === 'chat' && (text.toLowerCase().includes('edit') || text.toLowerCase().includes('tambah') || text.toLowerCase().includes('hapus'))) {
         const editedImage = await editImageWithPrompt(processedFiles[0].inlineData.data, text);
         responseImages = [editedImage];
         responseText = "Ini versi yang sudah diedit.";
      }
      else {
         const useSearch = activeMode === 'search';
         
         const result = await generateChatResponse(
             messages, 
             text, 
             processedFiles.map(f => ({ inlineData: f.inlineData })),
             currentPersona,
             undefined,
             useSearch
         );
         responseText = result.text || "Tidak ada respon teks.";
         groundingUrls = result.groundingUrls || [];
      }

      const newModelMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: Sender.MODEL,
        timestamp: Date.now(),
        persona: currentPersona, // Simpan persona
        model: technicalModel,   // Simpan model teknis
        groundingLinks: groundingUrls, // Simpan referensi terpisah
        parts: []
      };

      if (responseText) newModelMsg.parts.push({ type: ContentType.TEXT, text: responseText });
      
      responseImages.forEach(img => {
          newModelMsg.parts.push({ type: ContentType.IMAGE, imageUrl: img });
      });
      
      if (responseVideo) newModelMsg.parts.push({ type: ContentType.VIDEO, videoUrl: responseVideo });
      
      setMessages(prev => [...prev, newModelMsg]);

    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: Sender.SYSTEM,
        timestamp: Date.now(),
        parts: [{ type: ContentType.TEXT, text: `Error: ${error.message}` }]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const playTTS = async (text: string) => {
      try {
        const audioBase64 = await generateSpeech(text);
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        const audioBuffer = await import('./utils/audioUtils').then(m => m.decodeAudioData(
             new Uint8Array(atob(audioBase64).split("").map(c => c.charCodeAt(0))), 
             ctx, 24000, 1
        ));
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch (e) {
          console.error(e);
      }
  };

  const formatDetailTime = (timestamp: number) => {
      return new Intl.DateTimeFormat('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
      }).format(new Date(timestamp));
  };

  const isHades = currentPersona === 'hades';

  return (
    <div className="min-h-screen bg-black text-white font-sans flex overflow-hidden">
      <Sidebar 
        activeMode={activeMode} 
        activePanel={activePanel}
        setPanel={setActivePanel}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        currentPersona={currentPersona}
      />

      <SidePanel 
        isOpen={!!activePanel}
        activePanel={activePanel || ''}
        onClose={() => setActivePanel(null)}
        onModeSelect={(mode) => { handleModeChange(mode); }}
        currentMode={activeMode}
        history={history}
        onLoadHistory={handleLoadHistory}
        onClearHistory={() => { setHistory([]); setMessages([]); localStorage.removeItem('chat_history'); }}
        videoAspectRatio={videoAspectRatio}
        setVideoAspectRatio={setVideoAspectRatio}
        imageConfig={imageConfig}
        setImageConfig={setImageConfig}
        currentPersona={currentPersona}
        setCurrentPersona={handleSetPersona}
      />
      
      {showLiveAudio && <LiveAudioVisualizer onClose={() => { setShowLiveAudio(false); setActiveMode('chat'); }} />}
      
      {selectedImage && (
          <ImageModal imageUrl={selectedImage} onClose={() => setSelectedImage(null)} />
      )}

      <main className="flex-1 ml-[80px] md:ml-[96px] flex flex-col relative transition-all duration-300 h-screen">
        
        {/* Header */}
        {messages.length > 0 && (
            <div className={`absolute top-0 left-0 right-0 z-20 backdrop-blur-xl p-6 flex justify-between items-center border-b transition-colors duration-500 animate-in fade-in ${isHades ? 'bg-red-950/10 border-red-900/30' : 'bg-black/80 border-white/10'}`}>
                <div className="flex items-center gap-3 px-4">
                    <span className={`font-bold tracking-tight text-lg ${isHades ? 'text-red-500 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'text-white'}`}>
                        {activeMode === 'chat' ? currentPersona.toUpperCase() : 
                        activeMode === 'search' ? 'DEEP SEARCH' :
                        activeMode === 'image_gen' ? 'IMAGEN STUDIO' :
                        activeMode === 'image_edit' ? 'MAGIC EDITOR' :
                        activeMode === 'video_gen' ? 'VEO DIRECTOR' : 'SYSTEM'}
                    </span>
                    {isHades && <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-lg shadow-red-900/50">THE DEVIL</span>}
                </div>
            </div>
        )}

        {/* Chat Content */}
        <div className="flex-1 overflow-y-auto pb-48 pt-28 px-4 md:px-20 custom-scrollbar scroll-smooth" onClick={() => setActivePanel(null)}>
            <div className="max-w-4xl mx-auto space-y-10">
                {messages.length === 0 && activeMode === AppMode.IMAGE_EDIT && (
                     <div className="text-center text-zinc-500 mt-20 animate-in fade-in zoom-in duration-500">
                        <h2 className="text-3xl text-white font-black mb-3 tracking-tighter">EDITOR GAMBAR</h2>
                        <p>Unggah gambar dan perintahkan AI untuk mengubahnya.</p>
                     </div>
                )}
                {messages.length === 0 && activeMode === AppMode.VIDEO_GEN && (
                     <div className="text-center text-zinc-500 mt-20 animate-in fade-in zoom-in duration-500">
                        <h2 className="text-3xl text-white font-black mb-3 tracking-tighter">VEO VIDEO</h2>
                        <p>Tulis imajinasi Anda dan biarkan Veo membuatnya menjadi nyata.</p>
                        <p className="text-xs mt-4 font-mono bg-zinc-900 inline-block px-3 py-1 rounded border border-zinc-800">ASPECT RATIO: {videoAspectRatio}</p>
                     </div>
                )}

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-6 ${msg.sender === Sender.USER ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-4 duration-200`}>
                            {msg.sender === Sender.MODEL && (
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shrink-0 mt-1 transition-all duration-500 ${isHades ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.5)]'}`}>
                                    AI
                                </div>
                            )}
                            <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${msg.sender === Sender.USER ? 'items-end' : 'items-start'}`}>
                                <div className="space-y-3">
                                    {msg.parts.map((part, idx) => (
                                        <div key={idx} className="flex flex-col gap-3">
                                            {part.type === ContentType.TEXT && (
                                                <div 
                                                    onClick={() => setExpandedMessageId(expandedMessageId === msg.id ? null : msg.id)}
                                                    title="Klik untuk melihat detail pesan"
                                                    className={`px-6 py-4 rounded-3xl text-left whitespace-pre-wrap leading-relaxed text-[15px] tracking-wide font-medium transition-all duration-200 cursor-pointer relative ${
                                                    msg.sender === Sender.USER 
                                                        ? 'bg-black text-white border border-white rounded-tr-none shadow-[0_0_15px_rgba(255,255,255,0.25)] hover:shadow-[0_0_25px_rgba(255,255,255,0.4)]' 
                                                        : isHades 
                                                            ? 'bg-black text-red-100 rounded-tl-none border border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)] hover:bg-red-950/30'
                                                            : 'bg-black text-white rounded-tl-none border border-white shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]'
                                                }`}>
                                                    {part.text}
                                                    
                                                    {/* Action Buttons inside bubble (Hover only) */}
                                                    {msg.sender === Sender.MODEL && (
                                                        <div className="mt-3 pt-3 border-t border-white/20 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                                            <button 
                                                            onClick={() => part.text && playTTS(part.text)}
                                                            className="text-zinc-400 hover:text-white flex items-center gap-1.5 text-[10px] uppercase font-bold transition-colors"
                                                            >
                                                                <Volume2 size={12} /> Baca
                                                            </button>
                                                            <button 
                                                            onClick={() => setExpandedMessageId(expandedMessageId === msg.id ? null : msg.id)}
                                                            className="text-zinc-400 hover:text-white flex items-center gap-1.5 text-[10px] uppercase font-bold transition-colors"
                                                            >
                                                                <Info size={12} /> Detail
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                            {part.type === ContentType.IMAGE && part.imageUrl && (
                                                <div className={`relative inline-block mt-2 rounded-2xl overflow-hidden border-2 border-white bg-black shadow-[0_0_30px_rgba(255,255,255,0.1)] ${msg.sender === Sender.USER ? 'ml-auto' : ''}`}>
                                                    <img 
                                                        src={part.imageUrl} 
                                                        alt="Content" 
                                                        onClick={() => setSelectedImage(part.imageUrl!)}
                                                        className="max-w-full h-auto object-contain cursor-zoom-in hover:scale-[1.01] transition-transform duration-500" 
                                                        style={{ maxHeight: '400px' }}
                                                    />
                                                </div>
                                            )}
                                            {part.type === ContentType.VIDEO && part.videoUrl && (
                                                <div className="rounded-2xl overflow-hidden border-2 border-white mt-2 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                                                    <video controls autoPlay loop muted src={part.videoUrl} className="max-w-full h-auto" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Message Metadata Panel - Click to Reveal */}
                                {expandedMessageId === msg.id && (
                                    <div className={`mt-4 w-full animate-in fade-in slide-in-from-top-2 duration-200 ${msg.sender === Sender.USER ? 'items-end text-right' : 'items-start'}`}>
                                        <div className="bg-zinc-900/95 border border-white/30 rounded-xl p-4 text-xs space-y-3 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.8)] inline-block min-w-[240px]">
                                            
                                            <div className="flex items-center gap-2 text-zinc-300 border-b border-white/10 pb-2 mb-2">
                                                <Clock size={14} className="text-blue-400" />
                                                <span className="font-mono tracking-tight">{formatDetailTime(msg.timestamp)}</span>
                                            </div>
                                            
                                            {msg.sender === Sender.MODEL && (
                                                <>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1.5">
                                                                <User size={10} /> Persona
                                                            </span>
                                                            <div className={`font-bold tracking-wide uppercase ${isHades && msg.persona === 'hades' ? 'text-red-500' : 'text-white'}`}>
                                                                {msg.persona || "DEFAULT"}
                                                            </div>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <span className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1.5">
                                                                <Cpu size={10} /> Engine
                                                            </span>
                                                            <div className="font-bold tracking-wide text-emerald-400">
                                                                {msg.model || "Gemini 2.5 Flash"}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {msg.groundingLinks && msg.groundingLinks.length > 0 && (
                                                        <div className="pt-2 mt-2 border-t border-white/10">
                                                            <span className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1.5 mb-2">
                                                                <LinkIcon size={10} /> Referensi & Sumber
                                                            </span>
                                                            <div className="flex flex-col gap-1.5">
                                                                {msg.groundingLinks.map((link, i) => (
                                                                    <a 
                                                                        key={i} 
                                                                        href={link.uri} 
                                                                        target="_blank" 
                                                                        rel="noreferrer"
                                                                        className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors truncate max-w-[250px]"
                                                                    >
                                                                        <ExternalLink size={10} />
                                                                        <span className="truncate underline decoration-blue-400/30">{link.title}</span>
                                                                    </a>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                            
                                            {msg.sender === Sender.USER && (
                                                <div className="text-zinc-400 italic">Dikirim oleh Pengguna</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-6 animate-pulse px-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-xl ${isHades ? 'bg-red-600 text-white' : 'bg-white text-black'}`}>AI</div>
                            <div className="flex items-center gap-2 mt-4">
                                <div className="w-2.5 h-2.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2.5 h-2.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2.5 h-2.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                    </div>
                )}
                <div ref={messagesEndRef} className="h-10" />
            </div>
        </div>

        <InputArea 
            onSend={handleSend} 
            onModeChange={(mode) => { handleModeChange(mode); setActivePanel(null); }}
            isLoading={isLoading} 
            mode={activeMode} 
            isLanding={messages.length === 0}
        />
      </main>
    </div>
  );
};

export default App;
