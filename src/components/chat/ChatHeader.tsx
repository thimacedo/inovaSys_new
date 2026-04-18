import React from 'react';
import { Bot } from 'lucide-react';

export const ChatHeader: React.FC = () => {
  return (
    <div className="p-6 bg-md-surface border-b border-md-outline/5 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-md-primary rounded-[16px] flex items-center justify-center text-md-on-primary shadow-md transition-transform hover:scale-105">
          <Bot size={24} />
        </div>
        <div>
          <h3 className="text-base font-black text-md-on-surface uppercase tracking-widest">Sala de Mediação</h3>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">Sincronização Ativa</p>
          </div>
        </div>
      </div>
    </div>
  );
};
