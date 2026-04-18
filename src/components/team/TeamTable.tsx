import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { MD3Badge } from '../../presentation/ui/md3/MD3Badge';

interface TeamTableProps {
  membros: any[];
  loading: boolean;
  onEdit: (membro: any) => void;
  onDelete: (id: string) => void;
}

export const TeamTable: React.FC<TeamTableProps> = ({ membros, loading, onEdit, onDelete }) => {
  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 space-y-4">
      <div className="w-12 h-12 border-4 border-md-surface-variant border-t-md-primary rounded-full animate-spin"></div>
      <p className="text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60">Sincronizando Colaboradores...</p>
    </div>
  );

  if (membros.length === 0) return (
    <div className="p-24 text-center border-2 border-dashed border-md-outline/10 rounded-[48px]">
      <Users className="mx-auto text-md-on-surface-variant opacity-20 mb-4" size={48} />
      <p className="text-sm text-md-on-surface-variant font-bold uppercase tracking-widest opacity-40">Nenhum membro listado.</p>
    </div>
  );

  return (
    <div className="bg-md-surface rounded-[32px] border border-md-outline/5 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-md-surface-variant/10 border-b border-md-outline/5">
              <th className="px-8 py-5 text-[10px] font-bold text-md-on-surface-variant/50 uppercase tracking-widest">Identificação</th>
              <th className="px-8 py-5 text-[10px] font-bold text-md-on-surface-variant/50 uppercase tracking-widest text-center">Nível de Acesso</th>
              <th className="px-8 py-5 text-[10px] font-bold text-md-on-surface-variant/50 uppercase tracking-widest text-right">Gestão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-md-outline/5">
            {membros.map(m => (
              <tr key={m.id} className="hover:bg-md-surface-variant/10 transition-all group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center font-black text-lg shadow-sm">
                      {(m.nome || m.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-md-on-surface">{m.nome || 'Pendente'}</span>
                      <span className="text-xs text-md-on-surface-variant opacity-60 font-medium">{m.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5 text-center">
                  <MD3Badge 
                    label={m.tipo_usuario || 'arbitro'} 
                    variant={
                      m.tipo_usuario === 'admin' ? 'tertiary' : 
                      m.tipo_usuario === 'gestor' ? 'secondary' : 
                      'primary'
                    } 
                  />
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => onEdit(m)} className="p-2.5 text-md-on-surface-variant/40 hover:text-md-primary hover:bg-md-primary/10 rounded-xl transition-all border border-transparent hover:border-md-primary/20 shadow-sm"><Edit2 size={18} /></button>
                    <button onClick={() => onDelete(m.id)} className="p-2.5 text-md-on-surface-variant/40 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 shadow-sm"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

import { Users } from 'lucide-react';
