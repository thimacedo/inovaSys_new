import React from 'react';
import { motion } from 'motion/react';
import { useEfficiencyMetrics } from '../presentation/hooks/useEfficiency';
import { useAuditLogs } from '../presentation/hooks/useSettings';
import { 
  Activity,
  ScanText,
  ShieldCheck,
  BarChart3,
  RefreshCw,
  Eye,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export default function EfficiencyDashboard() {
  const { data: metrics, isLoading: loadingMetrics, refetch: refetchMetrics } = useEfficiencyMetrics();
  const { data: recentLogs = [], isLoading: loadingLogs, refetch: refetchLogs } = useAuditLogs();

  const handleRefresh = () => {
    refetchMetrics();
    refetchLogs();
  };

  if (loadingMetrics || loadingLogs) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <RefreshCw className="animate-spin text-blue-600" size={32} />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Calculando Métricas de Eficiência...</p>
      </div>
    );
  }

  const stats = [
    { label: 'Documentos Analisados (OCR)', value: metrics?.efficiency.anexosClassificados, total: metrics?.efficiency.totalAnexos, icon: ScanText, color: 'blue' },
    { label: 'Ações Auditadas', value: metrics?.compliance.totalAuditoria, icon: ShieldCheck, color: 'emerald' },
    { label: 'Visualizações LGPD', value: metrics?.compliance.totalVisualizacoes, icon: Eye, color: 'indigo' },
    { label: 'Automação IA', value: `${metrics?.efficiency.percentualAutomacao}%`, icon: Activity, color: 'purple' },
    { label: 'Cálculos Financeiros', value: metrics?.finance?.totalCalculosFinanceiros, icon: DollarSign, color: 'rose' },
    { label: 'Total Pago (R$)', value: metrics?.finance?.valorTotalPagoFinanceiro?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), icon: DollarSign, color: 'teal' }
  ];

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <BarChart3 size={150} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <Activity className="text-blue-600" size={28} />
             Eficiência & Conformidade
          </h2>
          <p className="text-slate-500 mt-2 font-medium">Monitoramento em tempo real do ecossistema de automação jurídica.</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg"
        >
          <RefreshCw size={16} />
          Sincronizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all"
          >
             <div className={`p-3 rounded-xl w-fit mb-4 ${
               s.color === 'blue' ? 'bg-blue-50 text-blue-600' :
               s.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
               s.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
               s.color === 'purple' ? 'bg-purple-50 text-purple-600' :
               s.color === 'rose' ? 'bg-rose-50 text-rose-600' :
               s.color === 'teal' ? 'bg-teal-50 text-teal-600' :
               'bg-slate-50 text-slate-600'
             }`}>
                <s.icon size={20} />
             </div>
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
             <h4 className="text-2xl font-black text-slate-900">{s.value}</h4>
             {s.total !== undefined && (
               <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-1000" 
                    style={{ width: `${(Number(s.value) / Number(s.total || 1)) * 100}%` }}
                  />
               </div>
             )}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lado Esquerdo: Últimas Ações IA */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 mb-8">
              <ScanText className="text-blue-600" size={20} />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Extrações Automáticas Recentes</h3>
           </div>
           <div className="space-y-4">
              {metrics?.recentIA.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Nenhuma atividade recente.</p>
              ) : (
                metrics?.recentIA.map((ia: any) => (
                  <div key={ia.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-100 transition-all">
                     <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-slate-200 text-blue-500 group-hover:scale-110 transition-transform">
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                           <p className="text-xs font-black text-slate-800 truncate max-w-[180px]">{ia.nome_arquivo}</p>
                           <p className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">{ia.categoria}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(ia.created_at).toLocaleDateString('pt-BR')}</p>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>

        {/* Lado Direito: Integridade do Sistema */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
           <div className="flex items-center gap-3 mb-8">
              <ShieldCheck className="text-emerald-600" size={20} />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Compliance & Saúde</h3>
           </div>
           <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 size={24} />
                 </div>
                 <div>
                    <p className="text-xs font-black text-slate-900 uppercase">Supabase Realtime</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Conexão Ativa & Latência Estável</p>
                 </div>
                 <div className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Activity size={24} />
                 </div>
                 <div>
                    <p className="text-xs font-black text-slate-900 uppercase">Motor Jurídico IA</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Pronto para Requisições (SLA 99%)</p>
                 </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                 <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-2">
                    <span>Score de Auditoria</span>
                    <span>94/100</span>
                 </div>
                 <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-blue-500" style={{ width: '94%' }} />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Tabela de Auditoria Resumida */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-8 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Trilha Crítica do Sistema</h3>
            <button className="text-[10px] font-black text-blue-600 uppercase hover:underline">Auditoria Completa</button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50">
                     <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ação</th>
                     <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Autor</th>
                     <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data/Hora</th>
                     <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">IP</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {recentLogs.slice(0, 5).map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                       <td className="px-8 py-5">
                          <span className="text-xs font-black text-slate-800">{log.acao}</span>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{log.tabela}</p>
                       </td>
                       <td className="px-8 py-5">
                          <span className="text-xs font-bold text-slate-600">{log.perfil?.nome || 'Sistema'}</span>
                       </td>
                       <td className="px-8 py-5">
                          <span className="text-xs font-bold text-slate-500">{new Date(log.created_at).toLocaleString('pt-BR')}</span>
                       </td>
                       <td className="px-8 py-5">
                          <span className="text-xs font-mono text-slate-400">{log.ip_address || '---'}</span>
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
