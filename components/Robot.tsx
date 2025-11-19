import React, { useEffect, useState } from 'react';

const Robot: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized position (-1 to 1) relative to center of screen
      const x = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const y = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative w-64 h-64 flex items-center justify-center mb-6 animate-in fade-in zoom-in duration-1000">
      {/* Outer Glow - Bright White */}
      <div className="absolute w-full h-full rounded-full bg-white/20 blur-[90px] animate-pulse"></div>
      
      {/* Main Floating Container */}
      <div className="relative w-40 h-40 animate-[bounce_6s_infinite_ease-in-out]">
        
        {/* Head/Orb Shell - Dark Metal with White Highlights */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-black to-zinc-900 rounded-full border border-white/40 shadow-[0_0_60px_rgba(255,255,255,0.2)] overflow-hidden">
           
           {/* Metallic Reflection */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-14 bg-gradient-to-b from-white/60 to-transparent rounded-full blur-[6px]"></div>
           
           {/* Eye Container - Follows Mouse */}
           <div 
             className="absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-out"
             style={{ 
               transform: `translate(${mousePos.x * 15}px, ${mousePos.y * 15}px)` 
             }}
           >
               {/* Eye Black Background Strip */}
               <div className="w-28 h-10 bg-black rounded-full flex items-center justify-center border border-zinc-700 relative overflow-hidden shadow-inner">
                   {/* Digital Scanning Line - White */}
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-full animate-[shimmer_2.5s_infinite_linear] translate-x-[-100%]"></div>
                   
                   {/* The Eye Core - White Hot */}
                   <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center relative">
                       {/* Glow behind pupil */}
                       <div className="absolute inset-0 bg-white/50 blur-lg rounded-full animate-pulse"></div>
                       
                       {/* Pupil */}
                       <div className="w-8 h-1.5 bg-white shadow-[0_0_20px_#ffffff] animate-[blink_5s_infinite]"></div>
                       
                       {/* Specular Highlight */}
                       <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-white rounded-full blur-[0.5px] shadow-[0_0_5px_white]"></div>
                   </div>
               </div>
           </div>
        </div>

        {/* Orbiting Rings - White/Silver */}
        <div className="absolute -inset-6 border border-white/40 rounded-full animate-[spin_12s_linear_infinite] skew-x-12 skew-y-12 pointer-events-none opacity-80"></div>
        <div className="absolute -inset-10 border border-zinc-400/20 rounded-full animate-[spin_18s_linear_infinite_reverse] skew-x-[-12deg] skew-y-[-12deg] pointer-events-none"></div>
      </div>
      
      <style>{`
        @keyframes shimmer {
            0% { transform: translateX(-150%); }
            100% { transform: translateX(150%); }
        }
        @keyframes blink {
            0%, 45%, 55%, 100% { height: 6px; opacity: 1; width: 32px; background-color: #ffffff; box-shadow: 0 0 25px #ffffff; }
            50% { height: 1px; opacity: 0.7; width: 36px; background-color: #e4e4e7; box-shadow: 0 0 15px #e4e4e7; }
        }
      `}</style>
    </div>
  );
};

export default Robot;