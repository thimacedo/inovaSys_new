import React from 'react';
import { ChevronDown, Clock, Plus, Trash2, Edit3, LogIn, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { MD3Card } from '../../presentation/ui/md3/MD3Card';

interface AuditDetailsCardProps {
  log: any;
  isExpanded: boolean;
  onToggle: () => void;
}

const getActionConfig = (acao: string) => {
  const act = acao.toLowerCase();
  if (act.includes('criar') || act.includes('insert')) return { icon: <Plus size={16} />, color: 'bg-emerald-100 text-emerald-700', label: 'Criação' };
  if (act.includes('deletar') || act.includes('delete')) return { icon: <Trash2 size={16} />, color: 'bg-rose-100 text-rose-700', label: 'Exclusão' };
  if (act.includes('update') || act.includes('editar')) return { icon: <Edit3 size={16} />, color: 'bg-sky-100 text-sky-700', label: 'Edição' };
  if (act.includes('login')) return { icon: <LogIn size={16} />, color: 'bg-amber-100 text-amber-700', label: 'Acesso' };
  return { icon: <ShieldCheck size={16} />, color: 'bg-md-surface-variant text-md-on-surface-variant', label: acao };
};

export const AuditDetailsCard: React.FC<AuditDetailsCardProps> = ({ log, isExpanded, onToggle }) => {
  const config = getActionConfig(log.acao);

  return (
    <MD3Card 
      variant="filled" 
      onClick={onToggle}
      className={`!p-0 border-none overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-md-primary/20 shadow-md' : 'hover:!bg-md-surface-variant/20'}`}
    >
      <div className="p-5 flex items-center gap-5">
        <div className={`p-3.5 rounded-2xl ${config.color} shadow-sm`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
             <span className="text-sm font-black text-md-on-surface truncate">{log.acao}</span>
             <span className="text-xs font-bold text-md-on-surface-variant/60"> — {log.perfil?.nome || 'Sistema'}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-black text-md-on-surface-variant/40 uppercase tracking-widest">
             <Clock size={12} className="opacity-50" />
             {new Date(log.created_at || log.data_hora).toLocaleTimeString('pt-BR')}
             <span className="bg-md-surface-variant/30 px-2 py-0.5 rounded-md">{log.tabela || 'global'}</span>
          </div>
        </div>
        <ChevronDown className={`text-md-on-surface-variant/30 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-md-primary' : ''}`} size={22} />
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-md-surface-variant/10 border-t border-md-outline/5 overflow-hidden"
          >
            <div className="p-8">
               <pre className="text-[11px] text-md-on-surface bg-md-surface border border-md-outline/10 p-6 rounded-[24px] shadow-inner font-mono overflow-auto max-h-80 custom-scrollbar">
                  {JSON.stringify({ snapshot_anterior: log.dados_antigos, snapshot_novo: log.dados_novos, contexto: log.detalhes }, null, 3)}
                </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MD3Card>
  );
};
