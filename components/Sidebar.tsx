import React from 'react';
import { SquarePen, Grid, Settings, Trash2, Zap, Clock } from 'lucide-react';

interface SidebarProps {
  activeMode: string;
  activePanel: string | null;
  setPanel: (panel: string | null) => void;
  onNewChat: () => void;
  onDeleteChat: () => void;
  currentPersona: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activePanel, 
  setPanel, 
  onNewChat,
  onDeleteChat,
  currentPersona
}) => {
  
  const isHades = currentPersona === 'hades';

  // Helper untuk toggle panel (Buka/Tutup)
  const togglePanel = (panelName: string) => {
      if (activePanel === panelName) {
          setPanel(null); // Tutup jika sedang aktif
      } else {
          setPanel(panelName); // Buka panel baru
      }
  };

  return (
    <div className="h-screen w-[80px] md:w-[96px] flex flex-col items-center py-8 bg-black border-r border-white fixed left-0 top-0 z-50 shadow-[10px_0_50px_rgba(255,255,255,0.05)]">
      
      {/* 1. Logo Identity */}
      <div className="mb-8 group cursor-pointer" onClick={onNewChat}>
        <div className={`w-12 h-12 md:w-14 md:h-14 bg-black border-2 border-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-500 hover:scale-110 hover:shadow-[0_0_35px_rgba(255,255,255,0.8)] ${isHades ? 'shadow-red-500/50 border-red-500' : ''}`}>
          <Zap size={26} strokeWidth={3} className={isHades ? "fill-red-500 text-red-500" : "fill-white text-white"} />
        </div>
      </div>

      {/* 2. Main Actions Container */}
      <div className="flex-1 flex flex-col gap-4 w-full items-center px-2 overflow-y-auto custom-scrollbar no-scrollbar">
        
        {/* TOMBOL CHAT BARU (Primary) */}
        <SidebarButton 
            icon={<SquarePen size={26} strokeWidth={2.5} />} 
            label="Chat Baru" 
            onClick={onNewChat}
            isActive={false}
            isPrimary={true}
        />

        <div className="w-10 h-[1px] bg-white/20 my-2"></div>

        {/* GROUP NAVIGATION */}
        
        {/* TOMBOL TOOLS / FITUR */}
        <SidebarButton 
            icon={<Grid size={26} strokeWidth={2} />} 
            label="Semua Fitur" 
            onClick={() => togglePanel('tools')}
            isActive={activePanel === 'tools'}
        />

        {/* TOMBOL RIWAYAT (Baru Ditambahkan) */}
        <SidebarButton 
            icon={<Clock size={26} strokeWidth={2} />} 
            label="Riwayat Chat" 
            onClick={() => togglePanel('history')}
            isActive={activePanel === 'history'}
        />

        {/* TOMBOL SETTINGS / PERSONA */}
        <SidebarButton 
            icon={<Settings size={26} strokeWidth={2} />} 
            label="Pengaturan & Persona" 
            onClick={() => togglePanel('mode')}
            isActive={activePanel === 'mode'}
            alert={isHades} 
        />

      </div>

      {/* 3. Bottom Actions */}
      <div className="mt-auto flex flex-col gap-4 w-full items-center pb-6 px-2">
        <div className="w-10 h-[1px] bg-white/20"></div>
        
        <SidebarButton 
            icon={<Trash2 size={24} strokeWidth={2.5} />} 
            label="Hapus Chat" 
            onClick={onDeleteChat}
            isActive={false}
            variant="danger"
        />
      </div>
    </div>
  );
};

interface SidebarButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    isActive: boolean;
    isPrimary?: boolean;
    variant?: 'default' | 'danger';
    alert?: boolean;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ icon, label, onClick, isActive, isPrimary, variant = 'default', alert }) => {
    
    let baseClass = "relative w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl transition-all duration-300 group border-2 cursor-pointer shrink-0 ";
    let colorClass = "";

    if (isActive) {
        colorClass = "bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.6)] scale-110 z-10";
    } else if (isPrimary) {
        colorClass = "bg-black text-white border-white hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]";
    } else if (variant === 'danger') {
        colorClass = "bg-black text-zinc-500 border-transparent hover:border-red-600 hover:text-red-600 hover:shadow-[0_0_15px_rgba(220,38,38,0.4)]";
    } else {
        // Default Tool Button - High Contrast White Hover
        colorClass = "bg-black text-zinc-400 border-transparent hover:border-white hover:text-white hover:bg-zinc-900 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]";
    }

    return (
        <button onClick={onClick} className={`${baseClass} ${colorClass}`}>
            {icon}
            
            {/* Alert Dot for Hades Mode */}
            {alert && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_red]"></span>
            )}

            {/* Tooltip Modern */}
            <div className="absolute left-full ml-4 bg-white text-black text-xs font-bold px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-[0_0_20px_rgba(255,255,255,0.3)] translate-x-[-10px] group-hover:translate-x-0 border border-zinc-200">
              {label}
              {/* Arrow */}
              <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-4 border-transparent border-r-white"></div>
            </div>
        </button>
    );
}

export default Sidebar;