import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'attention' | 'warning' | 'info';

interface ToastProps {
  message: string;
  isOpen: boolean;
  type?: ToastType;
  onClose: () => void;
}

const STYLE_MAP: Record<ToastType, { bg: string; icon: React.ReactNode; shadow: string }> = {
  success: {
    bg: 'bg-emerald-600',
    icon: <CheckCircle2 size={20} />,
    shadow: 'shadow-emerald-200'
  },
  error: {
    bg: 'bg-red-600',
    icon: <XCircle size={20} />,
    shadow: 'shadow-red-200'
  },
  attention: {
    bg: 'bg-amber-600',
    icon: <AlertTriangle size={20} />,
    shadow: 'shadow-amber-200'
  },
  warning: {
    bg: 'bg-amber-500',
    icon: <AlertTriangle size={20} />,
    shadow: 'shadow-amber-200'
  },
  info: {
    bg: 'bg-blue-600',
    icon: <Info size={20} />,
    shadow: 'shadow-blue-200'
  },
};

const Toast: React.FC<ToastProps> = ({ message, isOpen, type = 'success', onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isOpen) {
      setProgress(100);
      const startTime = Date.now();
      const duration = 4000;

      const timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
        
        if (remaining <= 0) {
          clearInterval(timer);
          onClose();
        }
      }, 10);

      return () => clearInterval(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { bg, icon, shadow } = STYLE_MAP[type];

  return (
    <div className={`fixed bottom-8 right-8 ${bg} text-white px-6 py-5 rounded-3xl shadow-2xl ${shadow} flex flex-col gap-3 transition-all duration-500 z-[9999] max-w-sm animate-in slide-in-from-right-10 overflow-hidden`}>
      <div className="flex items-center gap-4">
        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
          {icon}
        </div>
        <span className="text-sm font-bold leading-snug flex-1">{message}</span>
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1 rounded-lg">
          <X size={18} />
        </button>
      </div>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
        <div 
          className="h-full bg-white transition-none" 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  );
};

export default Toast;
