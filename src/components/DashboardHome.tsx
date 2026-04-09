import React, { useMemo } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useProcessos } from '../presentation/hooks/useProcessos';
import { useFinanceiroByOrg } from '../presentation/hooks/useFinanceiro';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Building2, 
  DollarSign,
  CheckCircle,
  Files
} from 'lucide-react';

export default function DashboardHome() {
  const { isGod } = usePermissions();
  const currentUser = useAuthStore(state => state.currentUser);
  
  // Identificação da Câmara/Organização
  const camaraId = currentUser?.organization_id || currentUser?.camara_id;

  // Hooks reativos (TanStack Query)
  const { data: processosData, isLoading: loadingProcs } = useProcessos(camaraId);
  const { data: financeiroData, isLoading: loadingFinance } = useFinanceiroByOrg(camaraId);

  const stats = useMemo(() => {
    // Processos
    const procs = processosData?.data || [];
    const totalProcessos = procs.length;
    const processosAtivos = procs.filter(p => p.status !== 'Concluído' && p.status !== 'Arquivado').length;

    // Financeiro
    const finance = financeiroData || [];
    const totalFinanceiro = finance
      .filter(f => f.status === 'Pago')
      .reduce((acc, curr) => acc + Number(curr.valor), 0);

    return {
      totalProcessos,
      processosAtivos,
      totalFinanceiro,
      totalUsuarios: isGod ? 'Global' : 1, // Placeholder para usuários se não houver hook específico solicitado
      totalCamaras: isGod ? 'Global' : 1
    };
  }, [processosData, financeiroData, isGod]);

  const loading = loadingProcs || loadingFinance;

  const statCards = [
    { label: 'Processos Ativos', value: stats.processosAtivos, icon: Files, color: 'blue' },
    { label: 'Usuários no Sistema', value: stats.totalUsuarios, icon: Users, color: 'purple' },
    { label: isGod ? 'Câmaras Registradas' : 'Status da Câmara', value: isGod ? stats.totalCamaras : 'Ativa', icon: Building2, color: 'amber' },
    { label: 'Volume Financeiro (Pago)', value: `R$ ${stats.totalFinanceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'emerald' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            Seja bem-vindo, <span className="text-blue-600">{currentUser?.nome?.split(' ')[0]}</span>
          </h2>
          <p className="text-slate-500 font-medium">Aqui está o resumo do que está acontecendo no {isGod ? 'ecossistema InovaSys' : 'seu painel'}.</p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
              Live Server
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${card.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
            <div className={`p-3 bg-${card.color}-50 text-${card.color}-600 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
              <card.icon size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{card.label}</p>
            <p className="text-2xl font-black text-slate-900 group-hover:translate-x-1 transition-transform">{loading ? '...' : card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                 <BarChart3 className="text-blue-600" size={20} />
                 Progresso Mensal
              </h3>
              <select className="bg-slate-50 border-none rounded-lg text-xs font-bold px-3 py-1 text-slate-500 focus:ring-0">
                 <option>Últimos 6 meses</option>
                 <option>Este ano</option>
              </select>
           </div>
           
           <div className="h-64 flex items-end justify-between gap-2 px-4">
              {[40, 70, 45, 90, 65, 80].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                   <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: `${h}%` }}
                     className={`w-full max-w-[40px] rounded-t-xl bg-gradient-to-t ${i === 3 ? 'from-blue-600 to-blue-400' : 'from-slate-200 to-slate-100'} hover:from-blue-500 transition-colors cursor-pointer relative group`}
                   >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                         {h} novos processos
                      </div>
                   </motion.div>
                   <span className="text-[10px] font-bold text-slate-400 uppercase">{['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][i]}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <Building2 size={120} />
           </div>
           
           <div>
              <h3 className="text-xl font-bold mb-2">Ecossistema Digital</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">Você está operando na plataforma InovaSys v2.0. Novas funcionalidades de IA e assinatura digital estão sendo integradas hoje.</p>
              
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                       <CheckCircle size={16} />
                    </div>
                    <span className="text-xs font-medium">Backup automático ativo</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                       <DollarSign size={16} />
                    </div>
                    <span className="text-xs font-medium">Certificado SSL Válido</span>
                 </div>
              </div>
           </div>

           <button className="w-full mt-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-sm hover:bg-slate-100 transition-colors">
              Explorar Novidades
           </button>
        </div>
      </div>
    </div>
  );
}
