import React, { useMemo } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useFinanceiroByOrg } from '../presentation/hooks/useFinanceiro';
import { motion } from 'motion/react';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowDownRight, 
  PieChart,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';

export default function FinanceiroBI() {
  const { isGod } = usePermissions();
  const currentUser = useAuthStore(state => state.currentUser);
  const camaraId = currentUser?.organization_id || currentUser?.camara_id;

  // Hook reativo (TanStack Query)
  const { data: rawData, isLoading, isError, refetch } = useFinanceiroByOrg(camaraId);

  // Processamento de dados em memória
  const processedData = useMemo(() => {
    const data = rawData || [];
    
    const totalPago = data
      .filter(d => d.status === 'Pago')
      .reduce((acc, curr) => acc + Number(curr.valor), 0);
      
    const totalPendente = data
      .filter(d => d.status === 'Pendente')
      .reduce((acc, curr) => acc + Number(curr.valor), 0);

    const stats = [
      { label: 'Receita Total (Pago)', value: totalPago, icon: DollarSign, color: 'emerald' },
      { label: 'Contas a Receber', value: totalPendente, icon: Calendar, color: 'blue' },
      { label: 'Meta Mensal (80%)', value: totalPago * 1.2, icon: TrendingUp, color: 'purple' },
      { label: 'Inadimplência', value: (totalPendente / (totalPago + totalPendente || 1)) * 100, isPercent: true, icon: ArrowDownRight, color: 'red' },
    ];

    const distribution = ['Custa', 'Hon_Arbitral', 'Hon_Sucumbencia'].map(tipo => {
      const val = data.filter(d => d.tipo === tipo).reduce((acc, curr) => acc + Number(curr.valor), 0);
      const perc = (val / (totalPago + totalPendente || 1)) * 100;
      return { tipo, val, perc };
    });

    return {
      totalPago,
      totalPendente,
      stats,
      distribution,
      recentTransactions: data.slice(0, 10)
    };
  }, [rawData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <RefreshCw className="animate-spin text-emerald-600" size={48} />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Carregando indicadores...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-20 text-center">
        <p className="text-red-500 font-bold">Erro ao carregar dados financeiros.</p>
        <button onClick={() => refetch()} className="mt-4 px-4 py-2 bg-slate-200 rounded-xl text-xs font-bold">Tentar Novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Business Intelligence <span className="text-emerald-600">Financeiro</span></h2>
          <p className="text-slate-500 font-medium">Análise de receitas e fluxo de caixa da rede.</p>
        </div>
        <button 
           onClick={() => refetch()}
           className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 text-xs font-bold text-slate-600"
        >
           <Filter size={16} />
           Atualizar Dados
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {processedData.stats.map((s, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"
          >
             <div className={`p-2 bg-${s.color}-50 text-${s.color}-600 rounded-xl w-fit mb-4`}>
                <s.icon size={20} />
             </div>
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
             <h4 className="text-2xl font-black text-slate-900">
               {s.isPercent ? `${s.value.toFixed(1)}%` : `R$ ${s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
             </h4>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
               <PieChart className="text-emerald-600" size={20} />
               Distribuição por Tipo
            </h3>
            <div className="space-y-4">
               {processedData.distribution.map(item => (
                 <div key={item.tipo}>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                       <span className="text-slate-500">{item.tipo.replace('_', ' ')}</span>
                       <span className="text-slate-900">{item.perc.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${item.perc}%` }}
                         className={`h-full bg-emerald-500`}
                       />
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <h3 className="font-bold text-slate-800 mb-6">Últimas Transações</h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
               {processedData.recentTransactions.map(reg => (
                  <div key={reg.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-2xl transition-all border border-transparent hover:border-slate-100">
                     <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${reg.status === 'Pago' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                           <DollarSign size={18} />
                        </div>
                        <div>
                           <p className="text-sm font-bold text-slate-900 line-clamp-1">{reg.descricao}</p>
                           <p className="text-[10px] text-slate-400 font-medium">Proc. {reg.processo_id?.substring(0, 8) || '---'}</p>
                        </div>
                     </div>
                     <p className="text-sm font-black text-slate-900">R$ {Number(reg.valor).toLocaleString('pt-BR')}</p>
                  </div>
               ))}
               {processedData.recentTransactions.length === 0 && (
                 <p className="text-center text-slate-400 text-xs italic py-10">Nenhuma transação recente.</p>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
