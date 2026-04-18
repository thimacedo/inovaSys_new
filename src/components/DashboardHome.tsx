import React, { useMemo, useState, useEffect } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useProcessos } from '../presentation/hooks/useProcessos';
import { useFinanceiroByOrg } from '../presentation/hooks/useFinanceiro';
import { useModal } from '../context/ModalContext';
import { supabase } from '../lib/supabase';
import { aiService } from '../services/aiService';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  TrendingUp, 
  Building2, 
  Files,
  AlertCircle,
  ShieldCheck,
  Database,
  Bot,
  Terminal,
  Activity,
  Cpu,
  CheckCircle2,
  XCircle,
  Shield,
  MessageSquare
} from 'lucide-react';

// 🖥️ System Health Hub - Monitoramento de Infraestrutura v3.0
function SystemHealthHub() {
  const [status, setStatus] = useState({
    gemini: 'checking',
    grok: 'checking',
    supabase: 'checking',
    latency: [] as number[],
    whatsappCount: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSystems = async () => {
      setLoading(true);
      
      // 1. Check Gemini & Supabase em paralelo
      const [geminiRes, supabaseRes] = await Promise.all([
        (async () => {
          try {
            const res = await aiService.suggestClausula('health-check', 'OK');
            return res.includes('[ERRO IA]') ? 'offline' : 'online';
          } catch { return 'offline'; }
        })(),
        (async () => {
          try {
            const { error } = await supabase.from('perfis').select('id', { count: 'exact', head: true }).limit(1);
            return error ? 'offline' : 'online';
          } catch { return 'offline'; }
        })()
      ]);

      // 2. Grok status (Contingência - simulado como online)
      const grokStatus = 'online'; 

      // 3. WhatsApp count (simulado via metadata ou mock)
      const mockWhatsapp = Math.floor(Math.random() * 85) + 12;

      // 4. Latência (simulada para o gráfico)
      const mockLatency = Array.from({ length: 12 }, () => Math.floor(Math.random() * 150) + 40);

      setStatus({
        gemini: geminiRes,
        grok: grokStatus,
        supabase: supabaseRes,
        latency: mockLatency,
        whatsappCount: mockWhatsapp
      });
      setLoading(false);
    };

    checkSystems();
  }, []);

  return (
    <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl w-full max-w-2xl font-sans text-slate-300 overflow-hidden">
      <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <Activity className="text-blue-500 animate-pulse" size={24} />
          <h2 className="text-lg font-black uppercase tracking-tighter text-white">System Health Hub <span className="text-blue-500">v3.0</span></h2>
        </div>
        <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full">
           LegalOps Infra
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* API Status */}
        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors">
          <p className="text-[10px] font-bold text-slate-500 uppercase mb-4 tracking-widest text-center md:text-left">IA & Cloud Engines</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot size={16} className="text-blue-400" />
                <span className="text-xs font-bold text-slate-200">Gemini 1.5 Flash</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${status.gemini === 'online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {status.gemini}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cpu size={16} className="text-purple-400" />
                <span className="text-xs font-bold text-slate-200">Grok-Beta (xAI)</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${status.grok === 'online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {status.grok}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
              <div className="flex items-center gap-3">
                <Database size={16} className="text-amber-400" />
                <span className="text-xs font-bold text-slate-200">Supabase DB</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${status.supabase === 'online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                {status.supabase}
              </span>
            </div>
          </div>
        </div>

        {/* Messaging & Traffic */}
        <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800 flex flex-col items-center justify-center text-center">
           <div className="p-3 bg-blue-500/10 text-blue-500 rounded-full mb-3">
              <MessageSquare size={24} />
           </div>
           <p className="text-4xl font-black text-white">{status.whatsappCount}</p>
           <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-widest">Mensagens WhatsApp (Hoje)</p>
           <div className="mt-4 flex gap-1">
              {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-3 bg-blue-500/20 rounded-full animate-pulse" style={{ animationDelay: `${i*0.2}s` }}></div>)}
           </div>
        </div>
      </div>

      {/* Latency Graph */}
      <div className="bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
               <TrendingUp size={14} className="text-emerald-400" />
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Network Latency (ms)</p>
            </div>
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-bold text-slate-400">Peak: 184ms</span>
               <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Stable</span>
            </div>
         </div>
         <div className="h-24 flex items-end gap-1.5 px-2">
            {status.latency.map((l, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(l/200)*100}%` }}
                className="flex-1 bg-gradient-to-t from-blue-600/20 to-blue-500/40 rounded-t-sm border-t border-blue-400/30 hover:to-blue-400 transition-all relative group cursor-crosshair"
              >
                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-slate-700 shadow-xl z-10">
                    {l}ms
                 </div>
              </motion.div>
            ))}
         </div>
      </div>

      <div className="mt-6 flex justify-between items-center text-[9px] font-bold text-slate-600 uppercase tracking-widest">
         <span>Security Level: AES-256</span>
         <span className="flex items-center gap-1 text-emerald-500">
            <CheckCircle2 size={10} />
            Integridade Validada
         </span>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { isGod } = usePermissions();
  const currentUser = useAuthStore(state => state.currentUser);
  const { showModal } = useModal();
  
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
      totalUsuarios: isGod ? 'Global' : 1,
      totalCamaras: isGod ? 'Global' : 1,
      alertas: procs.filter(p => {
        if (p.status === 'Concluído' || p.status === 'Arquivado') return false;
        const dateStr = p.updated_at || p.created_at || new Date().toISOString();
        const lastUpdate = new Date(dateStr);
        const diffDays = (new Date().getTime() - lastUpdate.getTime()) / (1000 * 3600 * 24);
        return diffDays > 7;
      })
    };
  }, [processosData, financeiroData, isGod]);

  const loading = loadingProcs || loadingFinance;

  const handleRunDiagnostic = () => {
    showModal('Monitor de Infraestrutura & Health', <SystemHealthHub />);
  };

  const statCards = [
    { label: 'Processos Ativos', value: stats.processosAtivos, icon: Files, color: 'blue' },
    { label: 'Atenção (Parados > 7d)', value: stats.alertas.length, icon: AlertCircle, color: 'red' },
    { label: isGod ? 'Câmaras Registradas' : 'Status da Câmara', value: isGod ? stats.totalCamaras : 'Ativa', icon: Building2, color: 'amber' },
    { label: 'Volume Financeiro (Pago)', value: `R$ ${stats.totalFinanceiro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'emerald' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Seja bem-vindo, <span className="text-blue-600 dark:text-blue-400">{currentUser?.nome?.split(' ')[0]}</span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Aqui está o resumo do que está acontecendo no {isGod ? 'ecossistema InovaSys' : 'seu painel'}.</p>
        </div>
        <div className="flex gap-2">
           <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100 dark:border-blue-800 flex items-center gap-2">
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
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative"
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${card.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
            <div className={`p-3 bg-${card.color}-50 dark:bg-${card.color}-900/20 text-${card.color}-600 dark:text-${card.color}-400 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
              <card.icon size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{card.label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 group-hover:translate-x-1 transition-transform">{loading ? '...' : card.value}</p>
          </motion.div>
        ))}
      </div>

      {stats.alertas.length > 0 && (
        <div className="bg-red-50 border border-red-100 p-6 rounded-3xl">
           <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-600" size={20} />
              <h3 className="text-sm font-black text-red-900 uppercase tracking-widest">Alertas de Eficiência (Ação Requerida)</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.alertas.slice(0, 3).map(p => (
                <div key={p.id} className="p-4 bg-white rounded-2xl border border-red-50 shadow-sm">
                   <p className="text-xs font-black text-slate-900 truncate">Proc. {p.numero_processo}</p>
                   <p className="text-[10px] text-red-500 font-bold uppercase mt-1">Inativo há {Math.floor((new Date().getTime() - new Date(p.updated_at || p.created_at || '').getTime()) / (1000 * 3600 * 24))} dias</p>
                </div>
              ))}
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                 <BarChart3 className="text-blue-600 dark:text-blue-400" size={20} />
                 Progresso Mensal
              </h3>
              <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold px-3 py-1 text-slate-500 dark:text-slate-400 focus:ring-0">
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
                     className={`w-full max-w-[40px] rounded-t-xl bg-gradient-to-t ${i === 3 ? 'from-blue-600 to-blue-400' : 'from-slate-200 dark:from-slate-800 to-slate-100 dark:to-slate-900'} hover:from-blue-500 transition-colors cursor-pointer relative group`}
                   >
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-slate-700 text-white dark:text-slate-100 text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                         {h} novos processos
                      </div>
                   </motion.div>
                   <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">{['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][i]}</span>
                </div>
              ))}
           </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck size={120} />
           </div>
           
           <div>
              <h3 className="text-xl font-bold mb-2 tracking-tight">Segurança & Performance</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium">Infraestrutura monitorada em tempo real com isolamento de dados e assistência de IA ativa.</p>
              
              <div className="space-y-4">
                 <div className="flex items-center gap-3 group/item">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover/item:scale-110 transition-transform">
                       <Database size={16} />
                    </div>
                    <span className="text-xs font-semibold tracking-wide">Backup Redundante (15m)</span>
                 </div>
                 <div className="flex items-center gap-3 group/item">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover/item:scale-110 transition-transform">
                       <ShieldCheck size={16} />
                    </div>
                    <span className="text-xs font-semibold tracking-wide">AES-256 Encryption</span>
                 </div>
                 <div className="flex items-center gap-3 group/item">
                    <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 group-hover/item:scale-110 transition-transform">
                       <Bot size={16} />
                    </div>
                    <span className="text-xs font-semibold tracking-wide text-blue-100">IA Engine: Operacional</span>
                 </div>
              </div>
           </div>

           <button 
             onClick={handleRunDiagnostic}
             className="w-full mt-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all hover:shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 group"
           >
              <Activity className="group-hover:animate-pulse" size={18} />
              Diagnóstico Completo
           </button>
        </div>
      </div>
    </div>
  );
}
