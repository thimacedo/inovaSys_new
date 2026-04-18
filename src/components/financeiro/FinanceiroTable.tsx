import React from 'react';
import { CheckCircle, Clock, Trash2 } from 'lucide-react';
import { MD3Badge } from '../../presentation/ui/md3/MD3Badge';

interface FinanceiroTableProps {
  registros: any[];
  loading: boolean;
  isAtLeastAdmin: boolean;
  onPay: (id: string) => void;
  onDelete: (id: string) => void;
}

export const FinanceiroTable: React.FC<FinanceiroTableProps> = ({ 
  registros, 
  loading, 
  isAtLeastAdmin, 
  onPay, 
  onDelete 
}) => {
  if (loading) return <div className="p-20 text-center text-md-on-surface-variant font-medium animate-pulse">Sincronizando extrato...</div>;
  if (registros.length === 0) return <div className="p-20 text-center text-md-on-surface-variant italic border-2 border-dashed border-md-outline/10 rounded-[32px]">Sem lançamentos registrados para este processo.</div>;

  return (
    <div className="bg-md-surface rounded-[32px] border border-md-outline/5 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-md-surface-variant/20 border-b border-md-outline/5">
            <tr>
              <th className="px-8 py-5 font-bold text-[11px] text-md-on-surface-variant/60 uppercase tracking-widest">Descrição</th>
              <th className="px-8 py-5 font-bold text-[11px] text-md-on-surface-variant/60 uppercase tracking-widest">Valor</th>
              <th className="px-8 py-5 font-bold text-[11px] text-md-on-surface-variant/60 uppercase tracking-widest">Vencimento</th>
              <th className="px-8 py-5 font-bold text-[11px] text-md-on-surface-variant/60 uppercase tracking-widest text-center">Status</th>
              <th className="px-8 py-5 font-bold text-[11px] text-md-on-surface-variant/60 uppercase tracking-widest text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-md-outline/5">
            {registros.map(reg => (
              <tr key={reg.id} className="hover:bg-md-surface-variant/10 transition-colors group">
                <td className="px-8 py-5">
                  <p className="font-bold text-md-on-surface">{reg.descricao}</p>
                  <p className="text-[10px] text-md-primary font-bold uppercase tracking-wider">{reg.tipo}</p>
                </td>
                <td className="px-8 py-5 font-black text-md-on-surface">R$ {Number(reg.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="px-8 py-5 text-md-on-surface-variant opacity-70 font-medium">
                  {reg.data_vencimento ? new Date(reg.data_vencimento).toLocaleDateString('pt-BR') : '---'}
                </td>
                <td className="px-8 py-5">
                  <div className="flex justify-center">
                    {reg.status === 'Pago' ? (
                      <MD3Badge label="Liquidado" variant="tertiary" />
                    ) : (
                      <MD3Badge label="Pendente" variant="secondary" />
                    )}
                  </div>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {reg.status === 'Pendente' && isAtLeastAdmin && (
                      <button onClick={() => onPay(reg.id)} className="p-2.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all border border-emerald-100 shadow-sm"><CheckCircle size={18} /></button>
                    )}
                    {isAtLeastAdmin && (
                      <button onClick={() => onDelete(reg.id)} className="p-2.5 text-md-on-surface-variant/40 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-md-outline/10"><Trash2 size={18} /></button>
                    )}
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
