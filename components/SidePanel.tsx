import React from 'react';
import { X, Image as ImageIcon, Edit3, Video, Mic, Clock, MessageSquare, Trash2, Smartphone, Monitor, Search, Skull, Zap, LayoutGrid, Sparkles, Brain, Moon, BookOpen, Network } from 'lucide-react';
import { AppMode, VideoAspectRatio, ImageGenerationConfig } from '../types';

interface SidePanelProps {
  isOpen: boolean;
  activePanel: string;
  onClose: () => void;
  onModeSelect: (mode: string) => void;
  currentMode: string;
  history: any[]; 
  onLoadHistory: (chat: any) => void;
  onClearHistory: () => void;
  videoAspectRatio: VideoAspectRatio;
  setVideoAspectRatio: (ratio: VideoAspectRatio) => void;
  imageConfig: ImageGenerationConfig;
  setImageConfig: (config: ImageGenerationConfig) => void;
  currentPersona: string;
  setCurrentPersona: (persona: string) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ 
  isOpen, 
  activePanel, 
  onClose, 
  onModeSelect, 
  currentMode,
  history,
  onLoadHistory,
  onClearHistory,
  videoAspectRatio,
  setVideoAspectRatio,
  imageConfig,
  setImageConfig,
  currentPersona,
  setCurrentPersona
}) => {
  
  const panelClasses = `fixed left-[80px] md:left-[96px] top-0 h-screen w-[380px] bg-black border-r border-white/20 z-40 p-6 shadow-[30px_0_60px_rgba(0,0,0,0.8)] transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0 pointer-events-none'}`;

  const FeatureGridItem = ({ title, icon: Icon, modeId }: any) => (
      <button 
        onClick={() => onModeSelect(modeId)}
        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-200 group
            ${currentMode === modeId
                ? 'bg-white border-white text-black shadow-[0_0_20px_rgba(255,255,255,0.5)]' 
                : 'bg-black border-zinc-800 text-zinc-400 hover:border-white hover:text-white hover:bg-zinc-900'
            }
        `}
      >
          <Icon size={32} strokeWidth={1.5} className={`transition-transform duration-300 group-hover:scale-110 ${currentMode === modeId ? 'text-black' : 'text-white'}`} />
          <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
      </button>
  );

  const PersonaCard = ({ id, title, desc, icon: Icon, current, onClick, color, borderColor }: any) => {
    const isActive = current === id;
    const activeBorder = borderColor || 'border-white';
    const activeText = color || 'text-black';
    
    return (
        <button 
            onClick={() => onClick(id)}
            className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all duration-300 group
                ${isActive 
                    ? `bg-white ${activeBorder} shadow-[0_0_25px_rgba(255,255,255,0.3)] scale-[1.02]` 
                    : 'bg-black border-zinc-800 hover:border-zinc-500'
                }
            `}
        >
            <div className={`p-3 rounded-full ${isActive ? 'bg-black' : 'bg-zinc-900'}`}>
                <Icon size={20} className={`${isActive ? (color ? color : 'text-white') : 'text-zinc-400'}`} />
            </div>
            <div className="text-left">
                <div className={`text-sm font-black tracking-wider ${isActive ? activeText : 'text-white'}`}>{title}</div>
                <div className={`text-[10px] font-bold uppercase tracking-wide ${isActive ? 'text-zinc-600' : 'text-zinc-500'}`}>{desc}</div>
            </div>
        </button>
    )
  };

  const renderContent = () => {
    switch (activePanel) {
      case 'tools':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 h-full flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white">
                <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter uppercase">
                    <LayoutGrid size={24} /> Pusat Fitur
                </h3>
                <button onClick={onClose} className="p-2 hover:bg-white hover:text-black rounded-full transition-colors"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Utama</p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <FeatureGridItem title="Chat AI" icon={MessageSquare} modeId="chat" />
                    <FeatureGridItem title="Deep Search" icon={Search} modeId="search" />
                </div>

                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Generatif Media</p>
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <FeatureGridItem title="Buat Gambar" icon={ImageIcon} modeId={AppMode.IMAGE_GEN} />
                    <FeatureGridItem title="Edit Gambar" icon={Edit3} modeId={AppMode.IMAGE_EDIT} />
                    <FeatureGridItem title="Buat Video" icon={Video} modeId={AppMode.VIDEO_GEN} />
                    <FeatureGridItem title="Suara Live" icon={Mic} modeId="live_audio" />
                </div>
            </div>
          </div>
        );

      case 'mode':
        return (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500 h-full flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-white">
                 <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter uppercase">
                    <Zap size={24} /> Pengaturan
                </h3>
                <button onClick={onClose} className="p-2 hover:bg-white hover:text-black rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8">
                
                {/* SECTION 2: PERSONA GRID */}
                <div>
                    <div className="flex items-center gap-2 mb-4 text-white">
                        <Brain size={18} />
                        <span className="text-sm font-bold uppercase tracking-wider">Pilih Persona AI</span>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                         <PersonaCard 
                            id="hades"
                            title="HADES (THE DEVIL)" 
                            desc="Provocative Challenger. Sarkastik. Tajam." 
                            icon={Skull} 
                            current={currentPersona} 
                            onClick={setCurrentPersona}
                            color="text-red-500"
                            borderColor="border-red-500"
                        />
                         <PersonaCard 
                            id="lilith"
                            title="LILITH (DARK FEMININE)" 
                            desc="Mystic Strategist. Misterius. Dominan." 
                            icon={Moon} 
                            current={currentPersona} 
                            onClick={setCurrentPersona}
                            color="text-purple-400"
                            borderColor="border-purple-400"
                        />
                         <PersonaCard 
                            id="chiron"
                            title="CHIRON (GREAT TEACHER)" 
                            desc="Sage Analyst. Bijaksana. Ilmiah." 
                            icon={BookOpen} 
                            current={currentPersona} 
                            onClick={setCurrentPersona}
                            color="text-blue-400"
                            borderColor="border-blue-400"
                        />
                         <PersonaCard 
                            id="nexus"
                            title="NEXUS (INTEGRATOR)" 
                            desc="Orchestrator. Netral. Penengah Logika." 
                            icon={Network} 
                            current={currentPersona} 
                            onClick={setCurrentPersona}
                            color="text-emerald-400"
                            borderColor="border-emerald-400"
                        />
                        <PersonaCard 
                            id="gemini"
                            title="GEMINI (DEFAULT)" 
                            desc="Respon Cepat & Cerdas." 
                            icon={Sparkles} 
                            current={currentPersona} 
                            onClick={setCurrentPersona}
                        />
                    </div>
                </div>

                {/* Image Settings */}
                {(currentMode === AppMode.IMAGE_GEN || currentMode === AppMode.VIDEO_GEN) && (
                    <div className="pt-6 border-t border-white/10 space-y-4">
                        <h4 className="text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">Pengaturan Visual</h4>
                        
                        {currentMode === AppMode.IMAGE_GEN && (
                            <>
                                <div>
                                    <label className="text-xs text-zinc-400 mb-2 block">Rasio Aspek</label>
                                    <div className="grid grid-cols-5 gap-1">
                                        {['1:1', '16:9', '9:16', '4:3', '3:4'].map(ratio => (
                                            <button
                                                key={ratio}
                                                onClick={() => setImageConfig({...imageConfig, aspectRatio: ratio as any})}
                                                className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${imageConfig.aspectRatio === ratio ? 'bg-white text-black border-white' : 'bg-black border-zinc-800 text-zinc-500 hover:border-white'}`}
                                            >
                                                {ratio}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {currentMode === AppMode.VIDEO_GEN && (
                             <div className="grid grid-cols-2 gap-3">
                                <button 
                                   onClick={() => setVideoAspectRatio('16:9')}
                                   className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${videoAspectRatio === '16:9' ? 'bg-white text-black border-white' : 'bg-black border-zinc-800 text-zinc-500'}`}
                                >
                                    <Monitor size={20} /> <span className="text-xs font-bold">16:9 (Landscape)</span>
                                </button>
                                <button 
                                   onClick={() => setVideoAspectRatio('9:16')}
                                   className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${videoAspectRatio === '9:16' ? 'bg-white text-black border-white' : 'bg-black border-zinc-800 text-zinc-500'}`}
                                >
                                    <Smartphone size={20} /> <span className="text-xs font-bold">9:16 (Portrait)</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="h-full flex flex-col animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between mb-6 border-b border-white pb-4">
                <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter uppercase">
                    <Clock size={24} /> Riwayat
                </h3>
                <button onClick={onClose} className="p-2 hover:bg-white hover:text-black rounded-full transition-colors"><X size={24} /></button>
            </div>
            
            <div className="flex justify-end mb-4">
                 <button 
                    onClick={() => {
                        if(window.confirm("Yakin hapus semua riwayat?")) {
                            onClearHistory();
                            onClose();
                        }
                    }}
                    className="text-zinc-400 hover:text-red-500 py-2 px-4 rounded-full border border-zinc-800 hover:border-red-500 flex items-center gap-2 text-[10px] uppercase font-bold transition-all hover:bg-red-950/30"
                >
                    <Trash2 size={14} /> Hapus Semua
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-2">
                {history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-60 text-zinc-700 space-y-4 border border-dashed border-zinc-800 rounded-3xl mx-4">
                        <MessageSquare size={32} />
                        <span className="text-xs font-bold uppercase tracking-widest">Kosong</span>
                    </div>
                ) : (
                    history.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onLoadHistory(item)}
                            className="w-full p-4 rounded-xl bg-zinc-900/20 border border-zinc-800 hover:bg-white hover:text-black hover:border-white hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] text-left transition-all group"
                        >
                            <div className="flex items-start justify-between mb-1">
                                <span className="text-sm font-bold line-clamp-1 transition-colors text-zinc-200 group-hover:text-black">
                                    {item.title || "Sesi Baru"}
                                </span>
                            </div>
                            <span className="text-[10px] text-zinc-500 block font-bold uppercase tracking-wider group-hover:text-zinc-600">
                                {new Date(item.timestamp).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </button>
                    ))
                )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
      <aside className={panelClasses}>
        {renderContent()}
      </aside>
  );
};

export default SidePanel;