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
      <div className="absolute w-full h-full rounded-full bg-white/10 blur-[80px] animate-pulse"></div>
      
      {/* Main Floating Container */}
      <div className="relative w-40 h-40 animate-[bounce_6s_infinite_ease-in-out]">
        
        {/* Head/Orb Shell - Bright Silver/White Metallic */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-zinc-200 to-zinc-400 rounded-full border-2 border-white shadow-[0_0_60px_rgba(255,255,255,0.5)] overflow-hidden">
           
           {/* Metallic Reflection High Gloss */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-20 bg-gradient-to-b from-white to-transparent rounded-full blur-[2px] opacity-90"></div>
           
           {/* Eye Container - Follows Mouse */}
           <div 
             className="absolute inset-0 flex items-center justify-center transition-transform duration-100 ease-out"
             style={{ 
               transform: `translate(${mousePos.x * 12}px, ${mousePos.y * 12}px)` 
             }}
           >
               {/* Eye Visor - Deep Black for Contrast */}
               <div className="w-32 h-12 bg-black rounded-full flex items-center justify-center border border-zinc-500 relative overflow-hidden shadow-2xl">
                   {/* Digital Scanning Line */}
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent w-full animate-[shimmer_2.5s_infinite_linear] translate-x-[-100%]"></div>
                   
                   {/* The Eye Core */}
                   <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center relative border border-zinc-800">
                       {/* Glow behind pupil */}
                       <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded-full animate-pulse"></div>
                       
                       {/* Pupil - Pure White Light */}
                       <div className="w-10 h-1.5 bg-white shadow-[0_0_25px_#ffffff] animate-[blink_5s_infinite]"></div>
                       
                       {/* Specular Highlight */}
                       <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-white rounded-full blur-[0.5px]"></div>
                   </div>
               </div>
           </div>
        </div>

        {/* Orbiting Rings - Bright White */}
        <div className="absolute -inset-6 border-2 border-white/60 rounded-full animate-[spin_12s_linear_infinite] skew-x-12 skew-y-12 pointer-events-none opacity-90 shadow-[0_0_15px_rgba(255,255,255,0.3)]"></div>
        <div className="absolute -inset-10 border border-white/30 rounded-full animate-[spin_18s_linear_infinite_reverse] skew-x-[-12deg] skew-y-[-12deg] pointer-events-none"></div>
      </div>
      
      <style>{`
        @keyframes shimmer {
            0% { transform: translateX(-150%); }
            100% { transform: translateX(150%); }
        }
        @keyframes blink {
            0%, 45%, 55%, 100% { height: 6px; opacity: 1; width: 36px; background-color: #ffffff; box-shadow: 0 0 30px #ffffff; }
            50% { height: 1px; opacity: 0.8; width: 40px; background-color: #e4e4e7; box-shadow: 0 0 20px #e4e4e7; }
        }
      `}</style>
    </div>
  );
};

export default Robot;