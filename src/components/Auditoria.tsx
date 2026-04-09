import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuditLogs } from '../presentation/hooks/useSettings';
import { 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  LogIn, 
  Clock,
  ChevronDown,
  FileCode,
  Calendar,
  User as UserIcon
} from 'lucide-react';

export default function Auditoria() {
  const { data: logs = [], isLoading, refetch } = useAuditLogs();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  const getActionConfig = (acao: string) => {
    const act = acao.toLowerCase();
    if (act.includes('criar') || act.includes('insert')) return { icon: <Plus size={14} />, color: 'bg-emerald-100 text-emerald-700', label: 'Criação' };
    if (act.includes('deletar') || act.includes('delete') || act.includes('excluir')) return { icon: <Trash2 size={14} />, color: 'bg-red-100 text-red-700', label: 'Exclusão' };
    if (act.includes('update') || act.includes('editar') || act.includes('atualizar')) return { icon: <Edit3 size={14} />, color: 'bg-blue-100 text-blue-700', label: 'Edição' };
    if (act.includes('login')) return { icon: <LogIn size={14} />, color: 'bg-amber-100 text-amber-700', label: 'Acesso' };
    return { icon: <ShieldCheck size={14} />, color: 'bg-slate-100 text-slate-700', label: acao };
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => 
      log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.perfil as any)?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.dados_novos || log.dados_antigos).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  const grouped = useMemo(() => {
    const groups: { [key: string]: typeof logs } = {};
    filteredLogs.forEach(log => {
      const date = new Date(log.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
    });
    return groups;
  }, [filteredLogs]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <ShieldCheck size={120} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
              <ShieldCheck size={28} />
            </div>
            Trilha de Auditoria
          </h2>
          <p className="text-slate-500 mt-2 font-medium">Registro imutável de todas as ações críticas do sistema.</p>
        </div>
        <button 
          onClick={() => refetch()}
          disabled={isLoading}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          Sincronizar Logs
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text"
          placeholder="Filtrar logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm font-medium"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Mapeando atividades...</p>
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-bold">Nenhuma atividade registrada.</p>
        </div>
      ) : (
        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-10 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
          {Object.entries(grouped).map(([date, dateLogs]) => (
            <div key={date} className="relative space-y-6">
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-20 h-20 bg-white border-2 border-slate-100 shadow-sm rounded-full flex flex-col items-center justify-center z-10 sticky top-4">
                    <Calendar size={14} className="text-purple-600 mb-1" />
                    <span className="text-[10px] font-black text-slate-400 uppercase text-center leading-tight">
                      {date.split(' ')[0]}<br/>
                      <span className="text-[8px] text-slate-300">{date.split(' ').slice(1).join(' ')}</span>
                    </span>
                 </div>
                 <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              <div className="space-y-4 pl-20">
                {dateLogs.map((log) => {
                  const config = getActionConfig(log.acao);
                  const isExpanded = expandedLog === log.id;
                  const perfil = log.perfil as any;

                  return (
                    <div 
                      key={log.id} 
                      className={`bg-white border rounded-2xl transition-all shadow-sm cursor-pointer group ${isExpanded ? 'border-purple-200 ring-2 ring-purple-50' : 'border-slate-200'}`}
                      onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                    >
                      <div className="p-5 flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${config.color}`}>
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                             <span className="text-sm font-black text-slate-900 truncate">{log.acao}</span>
                             <span className="text-xs font-bold text-slate-500"> — {perfil?.nome || 'Sistema'}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-400">
                             <Clock size={12} />
                             {new Date(log.created_at).toLocaleTimeString('pt-BR')}
                             <span className="text-[10px] font-mono">({log.tabela})</span>
                          </div>
                        </div>
                        <ChevronDown className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180 text-purple-600' : ''}`} size={20} />
                      </div>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-slate-100 bg-slate-50/50 overflow-hidden"
                          >
                            <div className="p-6">
                               <div className="flex items-center gap-2 mb-4 text-slate-600">
                                  <FileCode size={16} className="text-purple-500" />
                                  <span className="text-xs font-bold uppercase tracking-widest">Metadata do Evento</span>
                               </div>
                               <pre className="text-xs text-slate-600 bg-white border border-slate-200 p-4 rounded-xl shadow-inner font-mono overflow-auto max-h-60">
                                  {JSON.stringify({ anterior: log.dados_antigos, novo: log.dados_novos }, null, 2)}
                                </pre>
                                <div className="mt-4 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                                  <span>Tabela: {log.tabela}</span>
                                  <span>ID: {log.registro_id}</span>
                                </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
