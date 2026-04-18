import React from 'react';
import { motion } from 'motion/react';
import { ProcessEntity as Processo } from '../../infrastructure/database/repositories/ProcessRepository';
import { ProcessRowSkeleton } from '../../presentation/ui/components/Skeleton';
import { MD3Card } from '../../presentation/ui/md3/MD3Card';

interface ProcessKanbanProps {
  processos: Processo[];
  loading: boolean;
  onSelect: (id: string) => void;
}

const STATUSES = ['Protocolado', 'Em Andamento', 'Concluído', 'Arquivado'];

export const ProcessKanban: React.FC<ProcessKanbanProps> = ({ processos, loading, onSelect }) => {
  return (
    <motion.div 
      key="kanban" 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="flex gap-6 overflow-x-auto pb-6 min-h-[600px] w-full max-w-full custom-scrollbar"
    >
      {STATUSES.map(status => {
        const columnProcesses = processos.filter(p => String(p.status || '').trim().toLowerCase() === status.toLowerCase());
        
        return (
          <div key={status} className="flex-shrink-0 w-[320px] bg-md-surface-variant/10 rounded-[32px] border border-md-outline/10 p-5 flex flex-col gap-5">
            <div className="flex items-center justify-between px-2">
              <h5 className="text-xs font-bold text-md-on-surface-variant/70 uppercase tracking-[0.2em]">{status}</h5>
              <span className="text-[10px] font-black bg-md-surface-variant/30 text-md-on-surface px-2 py-0.5 rounded-full">
                {columnProcesses.length}
              </span>
            </div>
            
            <div className="flex-1 space-y-4">
              {loading ? [...Array(3)].map((_, i) => <ProcessRowSkeleton key={i} />) : 
                columnProcesses.length === 0 ? (
                  <div className="py-12 text-center border-2 border-dashed border-md-outline/10 rounded-[24px]">
                    <p className="text-[10px] font-bold text-md-on-surface-variant/40 uppercase tracking-widest">Sem Registros</p>
                  </div>
                ) : (
                  columnProcesses.map(p => (
                    <MD3Card 
                      key={p.id}
                      variant="elevated" 
                      onClick={() => onSelect(p.id)}
                      className="!p-5 !rounded-[24px] cursor-pointer group"
                    >
                      <span className="text-[10px] font-mono font-black text-md-primary bg-md-primary/5 px-2 py-1 rounded-lg mb-3 inline-block shadow-sm">
                        {p.numero_processo}
                      </span>
                      <p className="text-sm font-bold text-md-on-surface mb-1.5 line-clamp-2 group-hover:text-md-primary transition-colors">
                        {p.requerente_nome}
                      </p>
                      <p className="text-[10px] text-md-on-surface-variant/60 font-bold uppercase tracking-wider line-clamp-1">
                        {p.requerido_nome}
                      </p>
                    </MD3Card>
                  ))
                )
              }
            </div>
          </div>
        );
      })}
    </motion.div>
  );
};
