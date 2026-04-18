import React from 'react';
import { Search, Plus, Filter, Building2, ExternalLink, Clock, CheckCircle2 } from 'lucide-react';
import { MD3Badge } from '../../presentation/ui/md3/MD3Badge';

interface InstitutionTableProps {
  contas: any[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  onNew: () => void;
  onToggle: (conta: any) => void;
  onBonus: (conta: any) => void;
  onAccess: (conta: any) => void;
}

export const InstitutionTable: React.FC<InstitutionTableProps> = ({
  contas,
  searchTerm,
  setSearchTerm,
  onNew,
  onToggle,
  onBonus,
  onAccess
}) => {
  return (
    <div className="bg-md-surface rounded-[40px] border border-md-outline/5 shadow-sm overflow-hidden animate-in zoom-in-95 duration-500">
      <div className="p-8 border-b border-md-outline/5 flex flex-col lg:flex-row justify-between items-center gap-6 bg-md-surface-variant/10">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant/40" size={20} />
          <input 
            type="text"
            placeholder="Buscar por instituição ou CNPJ..."
            className="h-14 w-full bg-md-surface-variant rounded-t-xl border-b-2 border-md-outline px-4 text-md-on-surface transition-colors duration-200 focus:border-md-primary focus:outline-none placeholder:text-md-on-surface-variant/50 !pl-12 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button className="p-3.5 text-md-on-surface-variant hover:bg-md-surface rounded-2xl transition-all border border-md-outline/10"><Filter size={20} /></button>
          <button 
            onClick={onNew}
            className="rounded-full px-6 py-2.5 font-medium transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 flex items-center justify-center gap-2 bg-md-primary text-md-on-primary hover:shadow-md hover:brightness-110 !px-8 !py-4 shadow-lg shadow-md-primary/10"
          >
            <Plus size={20} />
            Nova Afiliação
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-md-surface-variant/20 border-b border-md-outline/5">
              <th className="px-8 py-6 text-[10px] font-black text-md-on-surface-variant/40 uppercase tracking-[0.2em]">Identificador</th>
              <th className="px-8 py-6 text-[10px] font-black text-md-on-surface-variant/40 uppercase tracking-[0.2em]">Instituição Parceira</th>
              <th className="px-8 py-6 text-[10px] font-black text-md-on-surface-variant/40 uppercase tracking-[0.2em]">Nível do Plano</th>
              <th className="px-8 py-6 text-[10px] font-black text-md-on-surface-variant/40 uppercase tracking-[0.2em]">Faturamento</th>
              <th className="px-8 py-6 text-[10px] font-black text-md-on-surface-variant/40 uppercase tracking-[0.2em] text-right">Controles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-md-outline/5">
            {contas.map(conta => (
              <tr key={conta.id} className="hover:bg-md-surface-variant/10 transition-all group">
                <td className="px-8 py-6 text-xs font-mono text-md-on-surface-variant/50">#{conta.id.substring(0, 6)}</td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-[20px] flex items-center justify-center transition-all duration-500 ${
                      conta.ativa ? 'bg-md-primary/10 text-md-primary group-hover:bg-md-primary group-hover:text-md-on-primary shadow-sm' : 'bg-md-surface-variant text-md-on-surface-variant opacity-50'
                    }`}>
                      <Building2 size={22} />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${conta.ativa ? 'text-md-on-surface' : 'text-md-on-surface-variant/40 line-through'}`}>{conta.nome}</span>
                      {!conta.ativa && <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-0.5">Licença Suspensa</span>}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <MD3Badge label={conta.plano_nome} variant={conta.plano_nome === 'Enterprise' ? 'tertiary' : 'primary'} />
                </td>
                <td className="px-8 py-6">
                  <span className="text-sm font-black text-md-on-surface">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(conta.mrr || 0)}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => onToggle(conta)} className={`p-2.5 rounded-xl transition-all border border-md-outline/10 ${conta.ativa ? 'text-md-on-surface-variant/40 hover:text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>{conta.ativa ? <Clock size={18} /> : <CheckCircle2 size={18} />}</button>
                    <button onClick={() => onBonus(conta)} className="p-2.5 text-md-on-surface-variant/40 hover:text-md-primary hover:bg-md-primary/10 border border-md-outline/10 rounded-xl transition-all"><Plus size={18} /></button>
                    <button onClick={() => onAccess(conta)} className="p-2.5 text-md-on-surface-variant/40 hover:text-md-tertiary hover:bg-md-tertiary/10 border border-md-outline/10 rounded-xl transition-all"><ExternalLink size={18} /></button>
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
