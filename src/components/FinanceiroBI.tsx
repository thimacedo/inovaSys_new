import React, { useMemo } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useFinanceiroByOrg } from '../presentation/hooks/useFinanceiro';
import { motion } from 'motion/react';
import { 
  Bar, 
  Doughnut 
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Title
} from 'chart.js';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowDownRight, 
  PieChart,
  Calendar,
  RefreshCw,
  BarChart3,
  ArrowUpRight
} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Title
);

interface MonthData {
  label: string;
  month: number;
  year: number;
  total: number;
}

export default function FinanceiroBI() {
  const { isGod } = usePermissions();
  const currentUser = useAuthStore(state => state.currentUser);
  const camaraId = currentUser?.organization_id || currentUser?.camara_id;

  const { data: rawData, isLoading, isError, refetch } = useFinanceiroByOrg(camaraId);

  const chartData = useMemo(() => {
    const data = rawData || [];
    
    // 1. Processamento por Mês (Últimos 6 meses)
    const months: MonthData[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({
        label: d.toLocaleString('pt-BR', { month: 'short' }),
        month: d.getMonth(),
        year: d.getFullYear(),
        total: 0
      });
    }

    data.forEach(reg => {
      if (reg.status === 'Pago') {
        const regDateStr = reg.created_at || new Date().toISOString();
        const regDate = new Date(regDateStr);
        const mIdx = months.findIndex(m => m.month === regDate.getMonth() && m.year === regDate.getFullYear());
        if (mIdx !== -1) {
          months[mIdx].total += Number(reg.valor);
        }
      }
    });

    // 2. Distribuição por Tipo
    const dist = {
      Custa: 0,
      Hon_Arbitral: 0,
      Hon_Sucumbencia: 0
    };
    data.forEach(reg => {
      const tipo = reg.tipo as keyof typeof dist;
      if (dist[tipo] !== undefined) {
        dist[tipo] += Number(reg.valor);
      }
    });

    const totalReceita = data.filter(d => d.status === 'Pago').reduce((acc, curr) => acc + Number(curr.valor), 0);
    const totalPendente = data.filter(d => d.status === 'Pendente').reduce((acc, curr) => acc + Number(curr.valor), 0);

    return {
      bar: {
        labels: months.map(m => m.label),
        datasets: [{
          label: 'Receita Mensal (R$)',
          data: months.map(m => m.total),
          backgroundColor: '#3b82f6',
          borderRadius: 8,
        }]
      },
      doughnut: {
        labels: ['Custas', 'Hon. Arbitrais', 'Sucumbência'],
        datasets: [{
          data: [dist.Custa, dist.Hon_Arbitral, dist.Hon_Sucumbencia],
          backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
          borderWidth: 0,
        }]
      },
      stats: [
        { label: 'Receita Total (Pago)', value: totalReceita, icon: DollarSign, color: 'emerald' as const },
        { label: 'Contas a Receber', value: totalPendente, icon: Calendar, color: 'blue' as const },
        { label: 'Ticket Médio', value: totalReceita / (data.length || 1), icon: TrendingUp, color: 'purple' as const },
        { label: 'Inadimplência', value: (totalPendente / (totalReceita + totalPendente || 1)) * 100, isPercent: true, icon: ArrowDownRight, color: 'red' as const },
      ],
      recentTransactions: data.slice(0, 8)
    };
  }, [rawData]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <RefreshCw className="animate-spin text-blue-600" size={48} />
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center">InovaSys BI<br/>Compilando Indicadores...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-md">Live Data</span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Atualizado agora</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">BUSINESS <span className="text-blue-600">INTELLIGENCE</span></h2>
          <p className="text-slate-500 font-medium max-w-md">Análise estratégica de arrecadação, fluxo de caixa e performance da câmara.</p>
        </div>
        <div className="flex gap-2">
          <button 
             onClick={() => refetch()}
             className="px-6 py-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 text-xs font-black text-slate-600 uppercase tracking-widest"
          >
             <RefreshCw size={14} />
             Sincronizar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {chartData.stats.map((s, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100/50 group hover:scale-105 transition-all duration-300"
          >
             <div className={`p-3 rounded-2xl w-fit mb-6 shadow-lg ${
               s.color === 'emerald' ? 'bg-emerald-500 text-white shadow-emerald-200' : 
               s.color === 'blue' ? 'bg-blue-500 text-white shadow-blue-200' :
               s.color === 'purple' ? 'bg-purple-500 text-white shadow-purple-200' :
               'bg-red-500 text-white shadow-red-200'
             }`}>
                <s.icon size={20} />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{s.label}</p>
             <h4 className="text-2xl font-black text-slate-900 tracking-tight">
               {s.isPercent ? `${s.value.toFixed(1)}%` : `R$ ${s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
             </h4>
             <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                <ArrowUpRight size={12} />
                <span>+12% vs mês anterior</span>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-100/50">
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                 <BarChart3 className="text-blue-600" size={20} />
                 Receita Operacional (6 Meses)
              </h3>
            </div>
            <div className="h-[300px]">
              <Bar 
                data={chartData.bar} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
                }} 
              />
            </div>
         </div>

         <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-100/50 flex flex-col justify-center items-center">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-10 w-full text-left flex items-center gap-3">
               <PieChart className="text-emerald-600" size={20} />
               Distribuição de Verba
            </h3>
            <div className="w-full max-w-[220px]">
              <Doughnut 
                data={chartData.doughnut} 
                options={{ 
                  cutout: '75%',
                  plugins: { legend: { position: 'bottom', labels: { font: { weight: 'bold', size: 10 } } } }
                }} 
              />
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl shadow-slate-100/50 overflow-hidden">
         <div className="p-10 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Fluxo de Caixa Recente</h3>
            <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">Ver Relatório Completo</button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50">
                     <th className="px-10 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</th>
                     <th className="px-10 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo</th>
                     <th className="px-10 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                     <th className="px-10 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {chartData.recentTransactions.map(reg => (
                    <tr key={reg.id} className="hover:bg-slate-50 transition-colors group">
                       <td className="px-10 py-6">
                          <p className="text-sm font-black text-slate-800">{reg.descricao}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Proc. {reg.processos?.numero_processo || '---'}</p>
                       </td>
                       <td className="px-10 py-6">
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase">
                            {reg.tipo.replace('_', ' ')}
                          </span>
                       </td>
                       <td className="px-10 py-6">
                          <p className="text-sm font-black text-slate-900 italic">R$ {Number(reg.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                       </td>
                       <td className="px-10 py-6">
                          <div className="flex items-center gap-2">
                             <div className={`w-2 h-2 rounded-full ${reg.status === 'Pago' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                             <span className={`text-[10px] font-black uppercase ${reg.status === 'Pago' ? 'text-emerald-600' : 'text-amber-600'}`}>
                               {reg.status}
                             </span>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
