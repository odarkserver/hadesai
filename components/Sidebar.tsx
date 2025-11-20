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
        // ACTIVE STATE: PURE WHITE, BLACK ICON, GLOW
        colorClass = "bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.8)] scale-110 z-10 ring-4 ring-white/20";
    } else if (isPrimary) {
        // CHAT BARU BUTTON
        colorClass = "bg-black text-white border-white/50 hover:bg-white hover:text-black hover:border-white hover:shadow-[0_0_25px_rgba(255,255,255,0.6)] hover:scale-105";
    } else if (variant === 'danger') {
        // DELETE BUTTON
        colorClass = "bg-black text-zinc-500 border-transparent hover:border-red-500 hover:text-red-500 hover:bg-red-950/20 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]";
    } else {
        // DEFAULT BUTTONS
        colorClass = "bg-black text-zinc-400 border-transparent hover:border-white/50 hover:text-white hover:bg-white/5";
    }

    if (alert && !isActive) {
        colorClass += " border-red-500/50 text-red-500 hover:border-red-500 shadow-[0_0_10px_rgba(220,38,38,0.2)]";
    }

    return (
        <div className="relative flex items-center justify-center group my-1">
            <button onClick={onClick} className={`${baseClass} ${colorClass}`} title={label}>
                {icon}
            </button>
            
            {/* Tooltip on Hover */}
            <div className="absolute left-full ml-4 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap shadow-[0_0_20px_rgba(255,255,255,0.4)] z-50 hidden md:block">
                {label}
                {/* Little Arrow */}
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-white rotate-45"></div>
            </div>
        </div>
    );
};

const Sidebar: React.FC<SidebarProps> = ({ 
  activePanel, 
  setPanel, 
  onNewChat,
  onDeleteChat,
  currentPersona
}) => {
  
  const isHades = currentPersona === 'hades';

  const togglePanel = (panelName: string) => {
      if (activePanel === panelName) {
          setPanel(null); 
      } else {
          setPanel(panelName); 
      }
  };

  return (
    <div className="h-screen w-[80px] md:w-[96px] flex flex-col items-center py-8 bg-black border-r border-white/30 fixed left-0 top-0 z-50 shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
      
      {/* 1. Logo Identity */}
      <div className="mb-8 group cursor-pointer" onClick={onNewChat}>
        <div className={`w-12 h-12 md:w-14 md:h-14 bg-black border-2 border-white rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all duration-500 hover:scale-110 hover:bg-white hover:text-black hover:shadow-[0_0_40px_rgba(255,255,255,0.9)] ${isHades ? 'shadow-red-500/50 border-red-500' : ''}`}>
          <Zap size={26} strokeWidth={3} className={isHades ? "fill-red-500 text-red-500" : "fill-white text-white group-hover:text-black group-hover:fill-black"} />
        </div>
      </div>

      {/* 2. Main Actions Container */}
      <div className="flex-1 flex flex-col gap-6 w-full items-center px-2 overflow-y-auto custom-scrollbar no-scrollbar pt-4">
        
        {/* TOMBOL CHAT BARU (Primary) */}
        <SidebarButton 
            icon={<SquarePen size={26} strokeWidth={2.5} />} 
            label="Chat Baru" 
            onClick={onNewChat}
            isActive={false}
            isPrimary={true}
        />

        <div className="w-12 h-[1px] bg-white/20 my-1"></div>

        {/* GROUP NAVIGATION */}
        
        {/* TOMBOL TOOLS / FITUR */}
        <SidebarButton 
            icon={<Grid size={26} strokeWidth={2} />} 
            label="Semua Fitur" 
            onClick={() => togglePanel('tools')}
            isActive={activePanel === 'tools'}
        />

        {/* TOMBOL RIWAYAT */}
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
        <div className="w-12 h-[1px] bg-white/20"></div>
        
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

export default Sidebar;