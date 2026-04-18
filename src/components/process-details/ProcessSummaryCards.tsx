import React from 'react';
import { ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { Processo } from '../../services/processService';

interface ProcessSummaryCardsProps {
  processo: Processo;
  canEdit: boolean;
  onEditField: (field: keyof Processo, label: string, value: any) => void;
  isAdmin?: boolean;
}

export const ProcessSummaryCards: React.FC<ProcessSummaryCardsProps> = ({
  processo,
  canEdit,
  onEditField,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
      {/* Card: Registro */}
      <motion.div 
        whileHover={{ y: -4 }}
        className="p-6 bg-md-surface-variant/20 rounded-[28px] border border-md-outline/5 relative group transition-all"
      >
        {canEdit && (
          <button 
            onClick={() => onEditField('numero_processo', 'Número do Processo', processo.numero_processo)} 
            className="absolute top-5 right-5 p-2 text-md-on-surface-variant/40 hover:text-md-primary opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink size={16} />
          </button>
        )}
        <span className="text-[10px] font-bold text-md-on-surface-variant/60 uppercase tracking-widest block mb-3">Registro Oficial</span>
        <p className="text-xl font-black text-md-on-surface tracking-tight">{processo.numero_processo}</p>
      </motion.div>

      {/* Card: Situação */}
      <motion.div 
        whileHover={{ y: -4 }}
        className="p-6 bg-md-surface-variant/20 rounded-[28px] border border-md-outline/5 relative group transition-all"
      >
        {canEdit && (
          <button 
            onClick={() => onEditField('status', 'Situação do Processo', processo.status)} 
            className="absolute top-5 right-5 p-2 text-md-on-surface-variant/40 hover:text-md-primary opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink size={16} />
          </button>
        )}
        <span className="text-[10px] font-bold text-md-on-surface-variant/60 uppercase tracking-widest block mb-3">Fase Processual</span>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-md-primary animate-pulse shadow-[0_0_12px_rgba(103,80,164,0.4)]"></div>
          <p className="text-xl font-black text-md-on-surface uppercase tracking-tight">{processo.status || 'Protocolado'}</p>
        </div>
      </motion.div>

      {/* Card: Valor */}
      <motion.div 
        whileHover={{ y: -4 }}
        className="p-6 bg-md-primary-container/20 rounded-[28px] border border-md-primary/5 relative group transition-all"
      >
        {canEdit && (
          <button 
            onClick={() => onEditField('valor_causa', 'Valor da Causa', processo.valor_causa)} 
            className="absolute top-5 right-5 p-2 text-md-primary/40 hover:text-md-primary opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ExternalLink size={16} />
          </button>
        )}
        <span className="text-[10px] font-bold text-md-primary/60 uppercase tracking-widest block mb-3">Montante em Lide</span>
        <p className="text-xl font-black text-md-primary">
          {Number(processo.valor_causa || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </motion.div>
    </div>
  );
};
