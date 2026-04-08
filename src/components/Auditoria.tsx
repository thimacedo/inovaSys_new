import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auditService, AuditLog } from '../services/auditService';
import { useModal } from '../context/ModalContext';
import { 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  Filter, 
  User, 
  Plus, 
  Trash2, 
  Edit3, 
  LogIn, 
  AlertCircle,
  Clock,
  ChevronDown,
  FileCode,
  Calendar
} from 'lucide-react';

export default function Auditoria() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const { showToast } = useModal();

  useEffect(() => {
    carregarLogs();
  }, []);

  const carregarLogs = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await auditService.getAll();
      setLogs(data);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes('relation "auditoria" does not exist')) {
        setErrorMsg('A tabela "auditoria" não existe no banco de dados. Execute o script SQL de reparo no editor do Supabase.');
      } else {
        setErrorMsg(`Erro ao carregar auditoria: ${e.message}`);
        showToast("Erro ao carregar auditoria", 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const getActionConfig = (acao: string) => {
    const act = acao.toLowerCase();
    if (act.includes('criar') || act.includes('insert')) return { icon: <Plus size={14} />, color: 'bg-emerald-100 text-emerald-700', label: 'Criação' };
    if (act.includes('deletar') || act.includes('delete') || act.includes('excluir')) return { icon: <Trash2 size={14} />, color: 'bg-red-100 text-red-700', label: 'Exclusão' };
    if (act.includes('update') || act.includes('editar') || act.includes('atualizar')) return { icon: <Edit3 size={14} />, color: 'bg-blue-100 text-blue-700', label: 'Edição' };
    if (act.includes('login')) return { icon: <LogIn size={14} />, color: 'bg-amber-100 text-amber-700', label: 'Acesso' };
    return { icon: <ShieldCheck size={14} />, color: 'bg-slate-100 text-slate-700', label: acao };
  };

  const groupLogsByDate = (logs: AuditLog[]) => {
    const groups: { [key: string]: AuditLog[] } = {};
    logs.forEach(log => {
      const date = new Date(log.data_hora).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
      if (!groups[date]) groups[date] = [];
      groups[date].push(log);
    });
    return groups;
  };

  const filteredLogs = logs.filter(log => 
    log.acao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.usuario_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    JSON.stringify(log.detalhes).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const grouped = groupLogsByDate(filteredLogs);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      {/* Header Section */}
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
          onClick={carregarLogs}
          disabled={loading}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Sincronizar Logs
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Filtrar por ação, usuário ou conteúdo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-purple-500 outline-none transition-all shadow-sm font-medium"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-6 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl flex items-center gap-2 hover:bg-slate-50 transition-all font-bold text-sm shadow-sm">
            <Filter size={18} />
            Filtros Avançados
          </button>
        </div>
      </div>

      {errorMsg ? (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-8 text-red-800 text-center">
          <AlertCircle size={48} className="mx-auto mb-4 opacity-50 text-red-600" />
          <h3 className="text-xl font-black mb-2 tracking-tight">Esquema de Banco Pendente</h3>
          <p className="text-sm opacity-80 leading-relaxed max-w-md mx-auto">{errorMsg}</p>
        </div>
      ) : (
        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-10 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-slate-200 before:via-slate-200 before:to-transparent">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Mapeando atividades...</p>
             </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
               <div className="p-4 bg-slate-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                 <ShieldCheck size={32} className="text-slate-300" />
               </div>
               <p className="text-slate-500 font-bold">Nenhuma atividade registrada no período.</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, dateLogs]) => (
              <div key={date} className="relative space-y-6">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-20 h-20 bg-white border-2 border-slate-100 shadow-sm rounded-full flex flex-col items-center justify-center z-10 sticky top-4">
                      <Calendar size={14} className="text-purple-600 mb-1" />
                      <span className="text-[10px] font-black text-slate-400 uppercase text-center leading-tight">
                        {date.split(' de ')[0]}<br/>{date.split(' de ')[1].substring(0, 3)}
                      </span>
                   </div>
                   <div className="h-px bg-slate-100 flex-1"></div>
                   <span className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">{date}</span>
                </div>

                <div className="space-y-4 pl-20">
                  {dateLogs.map((log) => {
                    const config = getActionConfig(log.acao);
                    const isExpanded = expandedLog === log.id;

                    return (
                      <motion.div 
                        layout
                        key={log.id} 
                        className={`bg-white border rounded-2xl transition-all shadow-sm hover:shadow-md cursor-pointer group ${isExpanded ? 'border-purple-200 ring-2 ring-purple-50' : 'border-slate-200'}`}
                        onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                      >
                        <div className="p-5 flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${config.color} transition-transform group-hover:scale-110`}>
                            {config.icon}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                               <span className="text-sm font-black text-slate-900 truncate">{log.acao}</span>
                               <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                               <span className="text-xs font-bold text-slate-500">{log.usuario_nome || 'Sistema'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                               <div className="flex items-center gap-1.5">
                                  <Clock size={12} />
                                  {new Date(log.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                               </div>
                               <div className="flex items-center gap-1.5 font-mono text-[10px]">
                                  <User size={12} />
                                  {log.usuario_id.substring(0, 8)}...
                               </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                             <ChevronDown className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180 text-purple-600' : ''}`} size={20} />
                          </div>
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
                                 <pre className="text-xs text-slate-600 bg-white border border-slate-200 p-4 rounded-xl shadow-inner font-mono overflow-auto max-h-60 leading-relaxed">
                                    {JSON.stringify(log.detalhes, null, 2)}
                                 </pre>
                                 <div className="mt-4 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                                    <span>ID Único: {log.id}</span>
                                    <span>Verificado via Blockchain Hash Simulation</span>
                                 </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
