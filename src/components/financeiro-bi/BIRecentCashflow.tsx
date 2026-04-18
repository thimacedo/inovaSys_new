import React from 'react';
import { MD3Badge } from '../../presentation/ui/md3/MD3Badge';

interface BIRecentCashflowProps {
  transactions: any[];
}

export const BIRecentCashflow: React.FC<BIRecentCashflowProps> = ({ transactions }) => {
  return (
    <div className="bg-md-surface rounded-[48px] border border-md-outline/5 shadow-sm overflow-hidden mb-12">
       <div className="p-10 border-b border-md-outline/5 flex justify-between items-center bg-md-surface-variant/10">
          <h3 className="text-sm font-black text-md-on-surface uppercase tracking-[0.3em]">Fluxo de Caixa Recente</h3>
          <button className="text-[10px] font-black text-md-primary uppercase hover:underline tracking-widest">Relatório Analítico</button>
       </div>
       <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="bg-md-surface-variant/20 border-b border-md-outline/5">
                   <th className="px-10 py-5 text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.2em]">Registro / Processo</th>
                   <th className="px-10 py-5 text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.2em]">Tipo</th>
                   <th className="px-10 py-5 text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.2em]">Montante</th>
                   <th className="px-10 py-5 text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.2em] text-center">Status</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-md-outline/5">
                {transactions.map(reg => (
                  <tr key={reg.id} className="hover:bg-md-surface-variant/10 transition-colors group border-b border-md-outline/5 last:border-0">
                     <td className="px-10 py-6">
                        <p className="text-sm font-black text-md-on-surface group-hover:text-md-primary transition-colors">{reg.descricao}</p>
                        <p className="text-[10px] text-md-on-surface-variant/60 font-bold uppercase tracking-widest mt-1">Nº {reg.processos?.numero_processo || '---'}</p>
                     </td>
                     <td className="px-10 py-6">
                        <span className="px-4 py-1.5 bg-md-surface-variant/50 text-md-on-surface-variant rounded-full text-[10px] font-black uppercase tracking-wider">
                          {reg.tipo.replace('_', ' ')}
                        </span>
                     </td>
                     <td className="px-10 py-6">
                        <p className="text-base font-black text-md-on-surface italic tracking-tight">R$ {Number(reg.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                     </td>
                     <td className="px-10 py-6">
                        <div className="flex justify-center">
                          <MD3Badge label={reg.status} variant={reg.status === 'Pago' ? 'tertiary' : 'secondary'} />
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
