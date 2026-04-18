import React from 'react';
import { Globe } from 'lucide-react';
import { motion } from 'motion/react';

interface EcossistemaHeaderProps {
  activeTab: 'geral' | 'contas';
  setActiveTab: (tab: 'geral' | 'contas') => void;
}

export const EcossistemaHeader: React.FC<EcossistemaHeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
      <div className="flex items-center gap-6">
        <motion.div 
          initial={{ rotate: -10, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          className="p-5 bg-md-primary text-md-on-primary rounded-[32px] shadow-md-2"
        >
          <Globe size={36} />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-md-on-surface tracking-tight uppercase">Ecossistema InovaSys</h2>
          <p className="text-sm font-medium text-md-on-surface-variant opacity-80 mt-1">Gestão centralizada de infraestrutura e rede de câmaras parceiras.</p>
        </div>
      </div>
      
      <div className="flex bg-md-surface-variant/20 p-1.5 rounded-full border border-md-outline/5 self-start shadow-sm">
        {(['geral', 'contas'] as const).map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-2.5 text-xs font-black uppercase tracking-[0.2em] rounded-full transition-all duration-400 ${
              activeTab === tab 
                ? 'bg-md-primary text-md-on-primary shadow-md' 
                : 'text-md-on-surface-variant/60 hover:text-md-on-surface hover:bg-md-surface-variant/30'
            }`}
          >
            {tab === 'geral' ? 'Visão Geral' : 'Rede de Câmaras'}
          </button>
        ))}
      </div>
    </div>
  );
};
