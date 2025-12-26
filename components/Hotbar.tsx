
import React, { useState, useEffect } from 'react';
import { useStore } from '../store';

const Hotbar: React.FC = () => {
  const { settings } = useStore();
  
  const liveMessage = { id: 'live-now', text: '🔴 ESTAMOS AO VIVO! APROVEITE OS MIMOS', enabled: true };
  const enabledMessages = settings.hotbarMessages.filter(m => m.enabled);
  
  // Combine logic: if Live is ON, prioritize the Live message
  const displayMessages = settings.isLiveOn 
    ? [liveMessage, ...enabledMessages]
    : enabledMessages;

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (displayMessages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % displayMessages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [displayMessages.length]);

  if (displayMessages.length === 0) return null;

  return (
    <div className={`text-white py-2 px-4 text-center text-[9px] md:text-xs tracking-[0.2em] uppercase overflow-hidden sticky top-0 z-50 transition-colors duration-500 ${settings.isLiveOn ? 'bg-red-600 font-bold' : 'bg-[#212529]'}`}>
      <div className="transition-all duration-500 ease-in-out h-4 flex items-center justify-center">
        <span className="animate-fade-in block w-full truncate">
            {displayMessages[currentIndex]?.text}
        </span>
      </div>
    </div>
  );
};

export default Hotbar;
