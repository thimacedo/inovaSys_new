import React from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { MD3Badge } from '../../presentation/ui/md3/MD3Badge';
import { ProcessRowSkeleton } from '../../presentation/ui/components/Skeleton';
import { ProcessEntity as Processo } from '../../infrastructure/database/repositories/ProcessRepository';

interface ProcessTableProps {
  processos: Processo[];
  loading: boolean;
  activeStatus: string;
  isAtLeastAdmin: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ProcessTable: React.FC<ProcessTableProps> = ({
  processos,
  loading,
  activeStatus,
  isAtLeastAdmin,
  onSelect,
  onDelete
}) => {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Concluído': return 'tertiary';
      case 'Em Andamento': return 'primary';
      case 'Arquivado': return 'secondary';
      case 'Protocolado': return 'secondary';
      default: return 'primary';
    }
  };

  if (loading) {
    return (
      <div className="divide-y divide-md-outline/5 p-4">
        {[...Array(5)].map((_, i) => <ProcessRowSkeleton key={i} />)}
      </div>
    );
  }

  if (processos.length === 0) {
    return (
      <div className="px-6 py-20 text-center">
        <p className="text-sm font-bold text-md-on-surface-variant/60">
          Nenhum processo {activeStatus !== 'Todos' ? `com status "${activeStatus}"` : ''} encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-md-surface-variant/10 border-b border-md-outline/5">
            <th className="px-8 py-5 text-[10px] font-bold text-md-on-surface-variant/50 uppercase tracking-widest">Processo</th>
            <th className="px-8 py-5 text-[10px] font-bold text-md-on-surface-variant/50 uppercase tracking-widest">Partes Envolvidas</th>
            <th className="px-8 py-5 text-[10px] font-bold text-md-on-surface-variant/50 uppercase tracking-widest">Valor</th>
            <th className="px-8 py-5 text-[10px] font-bold text-md-on-surface-variant/50 uppercase tracking-widest">Situação</th>
            <th className="px-8 py-5 text-[10px] font-bold text-md-on-surface-variant/50 uppercase tracking-widest text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-md-outline/5">
          {processos.map(p => (
            <tr 
              key={p.id} 
              className="hover:bg-md-surface-variant/20 transition-all group cursor-pointer border-b border-md-outline/5 last:border-0"
              onClick={() => onSelect(p.id)}
            >
              <td className="px-8 py-5">
                <span className="text-sm font-mono font-black text-md-primary bg-md-primary/5 px-3 py-1.5 rounded-xl border border-md-primary/10 group-hover:bg-md-primary group-hover:text-md-on-primary transition-all shadow-sm">
                  {p.numero_processo}
                </span>
              </td>
              <td className="px-8 py-5">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-bold text-md-on-surface group-hover:text-md-primary transition-colors">{p.requerente_nome}</span>
                  <span className="text-[10px] text-md-on-surface-variant/60 font-bold uppercase tracking-wider line-clamp-1">{p.requerido_nome}</span>
                </div>
              </td>
              <td className="px-8 py-5">
                <span className="text-sm font-bold text-md-on-surface opacity-90">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor_causa || 0)}
                </span>
              </td>
              <td className="px-8 py-5">
                <MD3Badge label={p.status || ''} variant={getStatusVariant(p.status || '') as any} />
              </td>
              <td className="px-8 py-5 text-right">
                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button className="p-2.5 text-md-on-surface-variant/40 hover:text-md-primary hover:bg-md-primary/10 rounded-xl transition-all border border-transparent hover:border-md-primary/20 shadow-sm" onClick={() => onSelect(p.id)}>
                    <Eye size={18} />
                  </button>
                  {isAtLeastAdmin && (
                    <button className="p-2.5 text-md-on-surface-variant/40 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 shadow-sm" onClick={() => onDelete(p.id)}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
