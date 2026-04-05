import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  isOpen: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-8 right-8 bg-slate-800 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-4 transition-opacity duration-300 z-[9999]">
      <span>{message}</span>
      <button onClick={onClose} className="text-slate-400 hover:text-white">
        &times;
      </button>
    </div>
  );
};

export default Toast;
