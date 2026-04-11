import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useProcesso } from '../presentation/hooks/useProcessos';
import { userService } from '../services/userService';
import { useProcessActions } from '../presentation/hooks/useProcessActions';
import { motion, AnimatePresence } from 'motion/react';
import { ProcessEntity } from '../infrastructure/database/repositories/ProcessRepository';
import { 
  Clock, 
  ExternalLink, 
  FileText, 
  Download, 
  ArrowLeft, 
  ChevronRight, 
  MessageSquare, 
  Send,
  ShieldCheck,
  Users,
  BarChart3,
  Wallet
} from 'lucide-react';
import { Button } from '../presentation/ui/components/Button';
import FinanceiroTab from './FinanceiroTab';
import ProcessAttachments from './ProcessAttachments';
import ProcessTimeline from './ProcessTimeline';

export default function ProcessDetails({ processId, onBack }: { processId: string, onBack: () => void }) {
  // Hooks devem ser chamados ANTES de qualquer retorno condicional
  const currentUser = useAuthStore((state) => state.currentUser);
  const { data: processo, isLoading: loading, isError, refetch } = useProcesso(processId);
  const {
    isGeneratingDoc,
    isAssigning,
    submitting,
    handleGerarTermo,
    handleWhatsApp,
    handleAssignArbitrator,
    handleEditField,
    handleAddAndamento
  } = useProcessActions(processo as any, refetch);

  const [arbitros, setArbitros] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('resumo');
  const [novoAndamento, setNovoAndamento] = useState('');

  if (!processId) return null;

  const isAdmin = ['gestor', 'admin', 'god'].includes(currentUser?.tipo_usuario?.toLowerCase() || '');
  const canEditProcess = isAdmin || (processo && (processo as any).arbitro_id === currentUser?.id);

  useEffect(() => {
    if (isAdmin) {
      carregarArbitros();
    }
  }, [isAdmin]);

  const carregarArbitros = async () => {
    try {
      const data = await userService.getArbitrosDisponiveis();
      setArbitros(data);
    } catch (e) {
      console.error('Erro ao carregar árbitros:', e);
    }
  };

  const handleSubmeterAndamento = () => {
    if (!currentUser) return;
    handleAddAndamento(novoAndamento, currentUser.id, () => setNovoAndamento(''));
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Carregando detalhes do processo...</p>
    </div>
  );

  if (isError || !processo) return (
    <div className="p-20 text-center bg-white rounded-3xl border border-red-100 shadow-sm animate-in zoom-in duration-300">
      <h4 className="text-lg font-bold text-red-600">Erro: Processo não encontrado ou acesso negado.</h4>
      <Button onClick={onBack} variant="secondary" className="mt-4" icon={ArrowLeft}>Voltar ao Painel</Button>
    </div>
  );

  const p = processo as any;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-1">
        <button onClick={onBack} className="hover:text-blue-600 transition-colors">Processos</button>
        <ChevronRight size={12} className="text-slate-300" />
        <span className="text-blue-600">Detalhes {p.numero_processo}</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200">
              <FileText size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {p.titulo}
              </h2>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                  ID: {p.numero_processo}
                </span>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                  p.status === 'Protocolado' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                  p.status === 'Em Andamento' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                  'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  {p.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={() => handleGerarTermo()} 
            disabled={isGeneratingDoc}
            variant="secondary"
            icon={Download}
          >
            {isGeneratingDoc ? 'Gerando...' : 'Gerar Termo'}
          </Button>
          <Button 
             onClick={() => handleWhatsApp(p.requerente_fone, 'requerente')} 
             variant="outline"
             className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
             icon={MessageSquare}
          >
             WhatsApp
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-1 flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
            {['resumo', 'partes', 'financeiro', 'anexos', 'timeline'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 min-w-[100px] py-4 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-slate-900 text-white shadow-lg' 
                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-10 min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'resumo' && (
                <motion.div 
                  key="resumo"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="space-y-12"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-4">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Resumo do Caso</h4>
                        <p className="text-base text-slate-600 font-medium leading-relaxed italic">
                          "{p.resumo_fatos || 'Nenhum resumo cadastrado para este processo.'}"
                        </p>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col justify-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor da Causa</span>
                          <span className="text-xl font-black text-slate-900">
                             {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor_causa || 0)}
                          </span>
                        </div>
                        <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col justify-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data Protocolo</span>
                          <span className="text-xl font-black text-slate-900">
                            {new Date(p.created_at).toLocaleDateString()}
                          </span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4 p-8 bg-blue-50/50 rounded-[2rem] border border-blue-100">
                     <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Observações Internas</h4>
                     <p className="text-sm text-blue-900 font-medium">As partes solicitaram urgência na designação. Aguardando pagamento da taxa institucional.</p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'partes' && (
                <motion.div 
                  key="partes"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                >
                  {['requerente', 'requerido'].map((tipo) => (
                    <div key={tipo} className="space-y-8">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                         <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                           <div className={`w-3 h-3 rounded-full ${tipo === 'requerente' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
                           {tipo}
                         </h3>
                         <button 
                           onClick={() => handleWhatsApp(p[`${tipo}_fone`], tipo as any)} 
                           className="flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                         >
                           <Send size={14} />
                           NOTIFICAR WHATSAPP
                         </button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                         {[
                           { field: `${tipo}_nome`, label: 'Nome Completo / Razão Social' },
                           { field: `${tipo}_doc`, label: 'CPF / CNPJ' },
                           { field: `${tipo}_email`, label: 'E-mail de Notificação' },
                           { field: `${tipo}_fone`, label: 'Contato Telefônico' }
                         ].map((item) => (
                           <div key={item.field} className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 relative group transition-all hover:bg-white hover:border-blue-100">
                             {canEditProcess && <button onClick={() => handleEditField(item.field as any, item.label, p[item.field as keyof ProcessEntity])} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"><ExternalLink size={14} /></button>}
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{item.label}</span>
                             <p className="text-base font-bold text-slate-700">{p[item.field as keyof ProcessEntity] || 'NÃO CADASTRADO'}</p>
                           </div>
                         ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'financeiro' && (
                <motion.div key="financeiro" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <FinanceiroTab processoId={processId} organizationId={p.camara_id} />
                </motion.div>
              )}

              {activeTab === 'anexos' && (
                <motion.div key="anexos" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <ProcessAttachments processoId={processId} />
                </motion.div>
              )}

              {activeTab === 'timeline' && (
                <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   <div className="space-y-8">
                      <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Novo Andamento / Registro</label>
                        <textarea 
                          className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all min-h-[100px]"
                          placeholder="Digite aqui o que aconteceu..."
                          value={novoAndamento}
                          onChange={(e) => setNovoAndamento(e.target.value)}
                        />
                        <div className="flex justify-end mt-4">
                          <Button 
                            onClick={handleSubmeterAndamento} 
                            disabled={!novoAndamento || submitting}
                            variant="primary"
                            icon={Send}
                          >
                             {submitting ? 'Salvando...' : 'Postar Andamento'}
                          </Button>
                        </div>
                      </div>
                      <ProcessTimeline processoId={processId} />
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 p-8">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-4">Gestão do Processo</h4>
            <div className="space-y-8">
               <div className="flex items-start gap-4 p-4 rounded-2xl bg-indigo-50/30 border border-indigo-100/50">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Árbitro Designado</span>
                    {canEditProcess ? (
                       <select 
                         value={p.arbitro_id || ''} 
                         onChange={(e) => handleAssignArbitrator(e.target.value)}
                         disabled={isAssigning}
                         className="w-full bg-transparent border-none p-0 text-sm font-bold text-indigo-900 focus:ring-0 outline-none cursor-pointer"
                       >
                         <option value="">NÃO DESIGNADO</option>
                         {arbitros.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                       </select>
                    ) : (
                       <p className="text-sm font-bold text-slate-700">{p.arbitro?.nome || 'NÃO DESIGNADO'}</p>
                    )}
                  </div>
               </div>

               <div className="space-y-4">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Painel de Ações Rápidas</h5>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Wallet, label: 'Financeiro', tab: 'financeiro', color: 'text-emerald-600 bg-emerald-50' },
                      { icon: BarChart3, label: 'Estatísticas', tab: 'resumo', color: 'text-purple-600 bg-purple-50' },
                      { icon: Clock, label: 'Prazos', tab: 'timeline', color: 'text-amber-600 bg-amber-50' },
                      { icon: Users, label: 'Árbitros', tab: 'resumo', color: 'text-blue-600 bg-blue-50' },
                    ].map((action) => (
                      <button 
                        key={action.label}
                        onClick={() => setActiveTab(action.tab)}
                        className="flex flex-col items-center gap-3 p-5 rounded-3xl border border-slate-100 hover:border-blue-200 transition-all hover:bg-white active:scale-95 text-center group"
                      >
                        <div className={`p-3 rounded-2xl ${action.color} group-hover:scale-110 transition-transform`}>
                          <action.icon size={18} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{action.label}</span>
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
