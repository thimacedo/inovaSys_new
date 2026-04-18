import React from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface BIHeaderProps {
  onRefresh: () => void;
  loading: boolean;
}

export const BIHeader: React.FC<BIHeaderProps> = ({ onRefresh, loading }) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10">
      <div className="flex items-center gap-6">
        <motion.div 
          initial={{ rotate: -5, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          className="p-5 bg-md-primary text-md-on-primary rounded-[32px] shadow-md-2"
        >
          <BarChart3 size={36} />
        </motion.div>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-lg shadow-sm">Live Analysis</span>
            <span className="text-[10px] text-md-on-surface-variant/40 font-bold uppercase tracking-[0.2em]">Sincronizado via Supabase</span>
          </div>
          <h2 className="text-3xl font-black text-md-on-surface tracking-tight uppercase">Business <span className="text-md-primary">Intelligence</span></h2>
          <p className="text-sm font-medium text-md-on-surface-variant opacity-80 mt-1">Análise estratégica de arrecadação e performance financeira.</p>
        </div>
      </div>
      
      <button 
        onClick={onRefresh}
        disabled={loading}
        className="btn-md-tonal !px-8 shadow-sm active:scale-95 disabled:opacity-50"
      >
        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        Atualizar Dados
      </button>
    </div>
  );
};
