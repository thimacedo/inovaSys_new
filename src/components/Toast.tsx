import React, { useEffect } from 'react';

type ToastType = 'success' | 'error' | 'attention' | 'warning' | 'info';

interface ToastProps {
  message: string;
  isOpen: boolean;
  type?: ToastType;
  onClose: () => void;
}

const STYLE_MAP: Record<ToastType, { bg: string; icon: string }> = {
  success: {
    bg: 'bg-emerald-700',
    icon: '✓',
  },
  error: {
    bg: 'bg-red-700',
    icon: '✕',
  },
  attention: {
    bg: 'bg-amber-600',
    icon: '⚠',
  },
  warning: {
    bg: 'bg-amber-600',
    icon: '⚠',
  },
  info: {
    bg: 'bg-blue-600',
    icon: 'ℹ',
  },
};

const Toast: React.FC<ToastProps> = ({ message, isOpen, type = 'success', onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { bg, icon } = STYLE_MAP[type];

  return (
    <div className={`fixed bottom-8 right-8 ${bg} text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-4 transition-all duration-300 z-[9999] max-w-sm`}>
      <span className="text-white font-bold text-lg shrink-0">{icon}</span>
      <span className="text-sm font-medium leading-snug">{message}</span>
      <button onClick={onClose} className="text-white/60 hover:text-white transition-colors text-xl shrink-0">
        &times;
      </button>
    </div>
  );
};

export default Toast;
