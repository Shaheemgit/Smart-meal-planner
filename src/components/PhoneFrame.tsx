import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Signal } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
}

export default function PhoneFrame({ children }: PhoneFrameProps) {
  const [time, setTime] = useState('08:24');

  useEffect(() => {
    // Dynamic clock inside the mock status bar
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setTime(`${hours}:${minutes} ${ampm}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="phone-frame-container" className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-0 md:p-6 lg:p-8 font-sans antialiased overflow-x-hidden select-none">
      
      {/* Decorative desktop background elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none hidden md:block" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-lime-500/10 rounded-full filter blur-3xl pointer-events-none hidden md:block" />

      {/* Main Outer Container */}
      <div className="w-full max-w-md md:max-w-md h-full md:h-[840px] flex flex-col relative bg-zinc-950 md:rounded-[48px] md:border-[12px] md:border-zinc-800 md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-300">
        
        {/* Mock Speaker, Camera & Notch (Dynamic Island shape) */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 h-6 w-32 bg-black rounded-full z-50 flex items-center justify-center pointer-events-none hidden md:flex">
          {/* Camera Circle */}
          <div className="w-2.5 h-2.5 bg-zinc-900 rounded-full border border-zinc-800/60 ml-auto mr-3 flex items-center justify-center">
            <div className="w-1 h-1 bg-blue-900/40 rounded-full" />
          </div>
        </div>

        {/* Mock Screen Header (Status Bar) */}
        <div id="mock-status-bar" className="h-11 bg-zinc-900/45 backdrop-blur-sm px-6 flex items-center justify-between text-xs font-medium text-white/90 shrink-0 select-none z-40 border-b border-white/5">
          {/* Clock */}
          <span>{time}</span>
          
          {/* Icons */}
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5 text-white/95" />
            <Wifi className="w-3.5 h-3.5 text-white/95" />
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] mr-0.5">94%</span>
              <Battery className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
            </div>
          </div>
        </div>

        {/* Dynamic App Content Canvas */}
        <div className="flex-1 overflow-y-auto bg-stone-50 text-stone-900 flex flex-col relative">
          {children}
        </div>

        {/* Mock Home Indicator Bar for iOS feel */}
        <div className="h-6 bg-stone-50 shrink-0 flex items-center justify-center select-none pb-1 hidden md:flex">
          <div className="w-32 h-1 bg-zinc-300 rounded-full" />
        </div>

      </div>
    </div>
  );
}
