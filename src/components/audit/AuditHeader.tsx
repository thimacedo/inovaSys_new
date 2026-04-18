import React from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface AuditHeaderProps {
  activeTab: 'acoes' | 'visualizacoes';
  setActiveTab: (tab: 'acoes' | 'visualizacoes') => void;
  onRefresh: () => void;
  loading: boolean;
}

export const AuditHeader: React.FC<AuditHeaderProps> = ({ activeTab, setActiveTab, onRefresh, loading }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
      <div className="flex items-center gap-6">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-5 bg-md-primary text-md-on-primary rounded-[32px] shadow-md-2"
        >
          <ShieldCheck size={36} />
        </motion.div>
        <div>
          <h2 className="text-3xl font-bold text-md-on-surface tracking-tight uppercase">Trilha de Auditoria</h2>
          <p className="text-sm font-medium text-md-on-surface-variant opacity-80 mt-1">Monitoramento imutável de integridade e acessos.</p>
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex bg-md-surface-variant/20 p-1.5 rounded-full border border-md-outline/5 shadow-sm">
          {(['acoes', 'visualizacoes'] as const).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-2.5 text-xs font-black uppercase tracking-[0.2em] rounded-full transition-all duration-400 ${
                activeTab === tab 
                  ? 'bg-md-primary text-md-on-primary shadow-md' 
                  : 'text-md-on-surface-variant/60 hover:text-md-on-surface hover:bg-md-surface-variant/30'
              }`}
            >
              {tab === 'acoes' ? 'Ações' : 'Acessos'}
            </button>
          ))}
        </div>

        <button 
          onClick={onRefresh}
          disabled={loading}
          className="rounded-full px-6 py-2.5 font-medium transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 flex items-center justify-center gap-2 bg-md-secondary-container text-md-on-secondary-container hover:shadow-sm !px-6 shadow-sm disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Sincronizar
        </button>
      </div>
    </div>
  );
};
