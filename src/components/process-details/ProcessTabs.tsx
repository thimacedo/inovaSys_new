import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  FileText, 
  Clock, 
  ShieldCheck, 
  Wallet 
} from 'lucide-react';

interface ProcessTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TABS = [
  { id: 'resumo', label: 'Painel', icon: BarChart3 },
  { id: 'partes', label: 'Partes', icon: Users },
  { id: 'fatos', label: 'Causa', icon: MessageSquare },
  { id: 'documentos', label: 'Documentos', icon: FileText },
  { id: 'mensagens', label: 'Mensagens', icon: MessageSquare },
  { id: 'anexos', label: 'Arquivos', icon: FileText },
  { id: 'historico', label: 'Tempo', icon: Clock },
  { id: 'auditoria', label: 'Auditoria', icon: ShieldCheck },
  { id: 'financeiro', label: 'Custo', icon: Wallet }
];

export const ProcessTabs: React.FC<ProcessTabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="border-b border-md-outline/5 bg-md-surface sticky top-0 z-20">
      <div className="flex overflow-x-auto no-scrollbar px-4">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id)} 
              className={`group relative px-6 py-5 text-[11px] font-bold uppercase tracking-[0.15em] transition-all flex-shrink-0 flex items-center gap-2 ${
                isActive ? 'text-md-primary' : 'text-md-on-surface-variant opacity-60 hover:text-md-on-surface'
              }`}
            >
              <tab.icon size={16} className={isActive ? 'text-md-primary' : 'opacity-70'} />
              {tab.label}
              
              {isActive && (
                <motion.div 
                  layoutId="active-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-md-primary rounded-t-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
