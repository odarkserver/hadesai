import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Mic, Paperclip, X, Search, Video, Volume2, Globe, Edit3, Sparkles } from 'lucide-react';
import { AppMode } from '../types';
import Robot from './Robot';

interface InputAreaProps {
  onSend: (text: string, files: File[]) => void;
  onModeChange: (mode: string) => void;
  isLoading: boolean;
  mode: string;
  isLanding: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSend, onModeChange, isLoading, mode, isLanding }) => {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  const handleSend = () => {
    if ((!text.trim() && files.length === 0) || isLoading) return;
    onSend(text, files);
    setText('');
    setFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
      // CRITICAL FIX: Reset value to allow re-selecting the same file if deleted
      e.target.value = ''; 
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Styles for Landing (Centered) vs Normal (Bottom)
  const containerClasses = isLanding 
    ? "fixed top-[45%] left-0 md:left-[88px] right-0 transform -translate-y-1/2 flex flex-col items-center z-30 px-4 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
    : "fixed bottom-0 left-0 md:left-[88px] right-0 bg-gradient-to-t from-black via-black/90 to-transparent pb-8 pt-12 px-4 z-30 flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]";

  // BRIGHT WHITE THEME
  const inputWrapperClasses = `w-full max-w-3xl bg-white border transition-all duration-300 rounded-[28px] shadow-2xl flex flex-col relative overflow-hidden group
    ${isFocused 
        ? 'border-zinc-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] ring-4 ring-zinc-100' 
        : 'border-zinc-200 shadow-xl'
    }`;

  const getPlaceholder = () => {
      switch(mode) {
          case AppMode.IMAGE_GEN: return "Jelaskan gambar yang ingin kamu buat...";
          case AppMode.IMAGE_EDIT: return "Unggah gambar dan jelaskan perubahannya...";
          case AppMode.VIDEO_GEN: return "Jelaskan video yang ingin kamu buat...";
          default: return "Tanyakan apa saja...";
      }
  };

  return (
    <div className={containerClasses}>
      
      {isLanding && (
        <div className="mb-10 flex flex-col items-center">
            <Robot />
            <div className="text-center mt-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              <h1 className="text-6xl font-black text-white tracking-tighter mb-2 drop-shadow-[0_0_30px_rgba(255,255,255,0.4)]">HADES</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.4em]">Kecerdasan Utama</p>
            </div>
        </div>
      )}

      {/* File Preview */}
      {files.length > 0 && (
        <div className={`w-full max-w-3xl mb-4 flex gap-3 overflow-x-auto pb-2 custom-scrollbar`}>
          {files.map((f, i) => (
            <div key={i} className="relative group shrink-0 animate-in zoom-in duration-200">
              <div className="relative rounded-xl overflow-hidden border-2 border-white/20 bg-zinc-800 shadow-lg">
                {f.type.startsWith('image') ? (
                    <img src={URL.createObjectURL(f)} alt="preview" className="h-20 w-20 object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                ) : (
                    <div className="h-20 w-20 flex items-center justify-center bg-zinc-800">
                        <Video size={24} className="text-zinc-500" />
                    </div>
                )}
              </div>
              <button 
                onClick={() => removeFile(i)}
                className="absolute -top-2 -right-2 bg-white text-black rounded-full p-1 shadow-md hover:bg-red-500 hover:text-white transition-colors"
              >
                <X size={14} strokeWidth={3} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className={inputWrapperClasses}>
        <div className="flex items-end px-4 py-3">
            <button 
                onClick={() => fileInputRef.current?.click()}
                className={`mb-1.5 transition-all p-2.5 rounded-full hover:bg-zinc-100 ${mode === AppMode.IMAGE_EDIT && files.length === 0 ? 'text-blue-600 animate-pulse bg-blue-50' : 'text-zinc-500 hover:text-black'}`}
                title="Unggah berkas"
            >
                <Paperclip size={24} strokeWidth={2} />
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                multiple 
                accept="image/*,video/*"
            />

            <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={getPlaceholder()}
                rows={1}
                className="bg-transparent text-black flex-1 mx-3 focus:outline-none placeholder-zinc-400 resize-none py-3.5 max-h-[200px] custom-scrollbar text-lg leading-relaxed font-medium"
                disabled={isLoading}
                style={{ minHeight: '52px' }}
            />
            
            <div className="mb-1.5 flex items-center gap-2">
                 {/* Mode Indicator Badge */}
                {!isLanding && (
                    <div className="hidden md:flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded-full mr-1 border border-zinc-200 select-none uppercase tracking-wide">
                        {mode === 'chat' ? <Globe size={10} /> : mode === 'image_edit' ? <Edit3 size={10} /> : mode === 'image_gen' ? <ImageIcon size={10} /> : <Sparkles size={10} />}
                        <span>{mode === 'chat' ? 'Otomatis' : mode.replace('_', ' ')}</span>
                    </div>
                )}

                <button 
                    className={`p-2.5 rounded-full transition-all duration-200 transform ${text || files.length > 0 ? 'bg-black text-white hover:scale-105 hover:bg-zinc-800 shadow-lg' : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'}`}
                    onClick={handleSend}
                    disabled={isLoading || (!text && files.length === 0)}
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Send size={20} fill={text || files.length > 0 ? "currentColor" : "none"} strokeWidth={2} />
                    )}
                </button>
            </div>
        </div>
      </div>

      {/* Quick Actions - Only visible on landing */}
      {isLanding && (
        <div className="mt-10 grid grid-cols-2 md:flex gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <QuickAction icon={<Search size={18} />} label="Pencarian Mendalam" onClick={() => onModeChange('search')} />
            <QuickAction icon={<ImageIcon size={18} />} label="Buat Gambar" onClick={() => onModeChange('image_gen')} />
            <QuickAction icon={<Globe size={18} />} label="Berita Terkini" onClick={() => onSend("Berita terbaru hari ini", [])} />
            <QuickAction icon={<Volume2 size={18} />} label="Mode Suara" onClick={() => onModeChange('live_audio')} />
        </div>
      )}
      
      {!isLanding && (
        <div className="text-center mt-3 text-[10px] uppercase tracking-widest text-zinc-600 font-semibold select-none opacity-70">
            Didukung oleh Gemini 3 Pro &bull; Veo &bull; Imagen 4
        </div>
      )}
    </div>
  );
};

const QuickAction = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
    <button 
        onClick={onClick} 
        className="flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-sm font-medium text-zinc-300 hover:bg-white hover:text-black hover:border-white transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
    >
        {icon}
        {label}
    </button>
)

export default InputArea;