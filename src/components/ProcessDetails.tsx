import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useModal } from '../context/ModalContext';
import { useProcesso } from '../presentation/hooks/useProcessos';
import { userService } from '../services/userService';
import { documentService } from '../services/documentService';
import { whatsappService } from '../services/whatsappService';
import { processService, Processo } from '../services/processService';
import { isValidDoc } from '../utils/validators';
import FinanceiroTab from './FinanceiroTab';
import ProcessAttachments from './ProcessAttachments';
import ProcessTimeline from './ProcessTimeline';
import { useAddHistoryEntry } from '../presentation/hooks/useHistory';
import { Clock, ExternalLink, FileText, Download, ArrowLeft, ChevronRight, MessageSquare, Send, Users, BarChart3, Wallet, ShieldCheck } from 'lucide-react';
import { Button } from '../presentation/ui/components/Button';
import { AnimatePresence } from 'motion/react';
import { motion } from 'motion/react';

export default function ProcessDetails({ processId, onBack }: { processId: string, onBack: () => void }) {
  // All hooks MUST be called before any early return
  const currentUser = useAuthStore((state) => state.currentUser);
  const { data: processo, isLoading: loading, isError, refetch } = useProcesso(processId);
  const addHistoryMutation = useAddHistoryEntry();

  const [arbitros, setArbitros] = useState<any[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [activeTab, setActiveTab] = useState('resumo');
  const [novoAndamento, setNovoAndamento] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const { showToast, showPrompt } = useModal();

  const isAdmin = ['gestor', 'admin', 'god'].includes(currentUser?.tipo_usuario?.toLowerCase() || '');
  const canEditProcess = isAdmin || (processo && processo.arbitro_id === currentUser?.id);

  const carregarArbitros = async () => {
    if (!isAdmin) return;
    try {
      const data = await userService.getArbitrosDisponiveis();
      setArbitros(data);
    } catch (e) {
      console.error('Erro ao carregar árbitros:', e);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      carregarArbitros();
    }
  }, [isAdmin]);

  // All hooks must be before this early return
  if (!processId) return null;

  const handleAddAndamento = async () => {
    if (!novoAndamento.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      await addHistoryMutation.mutateAsync({
        processoId: processId,
        titulo: 'Atualização do Processo',
        tipo: 'usuario',
        descricao: novoAndamento,
        autorId: currentUser.id
      });
      setNovoAndamento('');
      showToast('Andamento registrado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao registrar andamento.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGerarTermo = async () => {
    if (!processo) return;
    setIsGeneratingDoc(true);
    try {
      await documentService.generateFromTemplate(2, {
        requerente_nome: processo.requerente_nome || 'Não informado',
        requerido_nome: processo.requerido_nome || 'Não informado',
        requerente_doc: processo.requerente_doc || '---',
        requerido_doc: processo.requerido_doc || '---',
        numero_processo: processo.numero_processo || processo.id,
        valor_causa: Number(processo.valor_causa || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        arbitro_nome: (processo as any).arbitro?.nome || 'Designação Pendente',
        camara_nome: localStorage.getItem('camara_config') ? JSON.parse(localStorage.getItem('camara_config')!).nome : 'InovaSys',
        resumo_fatos: processo.resumo_fatos || 'Sem resumo cadastrado.',
        data_hoje: new Date().toLocaleDateString('pt-BR')
      }, `Termo_Arbitragem_${processo.numero_processo}`);
      showToast('Download iniciado!', 'success');
    } catch (error: any) {
      showToast('Erro ao gerar documento: ' + error.message, 'error');
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  const handleWhatsApp = (nomeParte: string, tipo: 'requerente' | 'requerido') => {
    if (!processo) return;
    showPrompt(`Notificar ${tipo === 'requerente' ? 'Requerente' : 'Requerido'}`, `Confirme o número do WhatsApp de ${nomeParte} (apenas números com DDD):`, '', (phone) => {
      if (!phone || !processo) return;
      const msg = whatsappService.templates.avisoAndamento(nomeParte, (processo as any).numero_processo || '', "Houve uma nova atualização no seu processo. Por favor, acesse o sistema.");
      whatsappService.enviarMensagem(phone, msg);
      showToast('WhatsApp aberto!', 'success');
    });
  };

  const handleAssignArbitrator = async (arbitroId: string) => {
    if (!processo || !arbitroId) return;
    setIsAssigning(true);
    try {
      if (!processo) return;
      await processService.assignArbitrator(processo.id, arbitroId);
      await refetch();
      showToast('Árbitro designado com sucesso!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Erro ao designar árbitro.', 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleEditField = async (field: keyof Processo, label: string, currentValue: any) => {
    let inputType: 'text' | 'date' | 'time' | 'textarea' | 'select' = 'text';
    let maskType: 'doc' | 'money' | 'phone' | 'cep' | undefined = undefined;
    if (field === 'resumo_fatos') inputType = 'textarea';
    if (field.toString().startsWith('valor_')) { inputType = 'text'; maskType = 'money'; }
    if (field === 'requerente_doc' || field === 'requerido_doc') { maskType = 'doc'; }

    let options: { label: string, value: string }[] | undefined = undefined;
    if (field === 'status') {
      inputType = 'select';
      options = [
        { label: 'Protocolado', value: 'Protocolado' },
        { label: 'Em Andamento', value: 'Em Andamento' },
        { label: 'Concluído', value: 'Concluído' },
        { label: 'Arquivado', value: 'Arquivado' }
      ];
    }

    const initialVal = currentValue?.toString() || '';
    showPrompt('Editar Campo', label, initialVal, async (newValue) => {
      if (newValue !== null && newValue !== initialVal) {
        let finalValue: any = newValue;
        if (field === 'requerente_doc' || field === 'requerido_doc') {
          if (!isValidDoc(newValue)) { showToast('CPF ou CNPJ inválido.', 'attention'); return; }
          finalValue = newValue.replace(/\D/g, '');
        }
        if (maskType === 'money') {
          const vRaw = newValue.replace('R$ ', '').replace(/\./g, '').replace(',', '.').trim();
          finalValue = vRaw ? parseFloat(vRaw) : 0;
        }
        try {
          if (!processo?.id) return;
          await processService.update(processo.id, { [field]: finalValue });
          showToast(`${label} atualizado com sucesso!`, 'success');
        } catch (e) {
          showToast(`Erro ao atualizar ${label}: ` + (e as Error).message, 'error');
        }
      }
    }, inputType, maskType, options);
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 px-1">
        <button onClick={onBack} className="hover:text-blue-600 transition-colors">Processos</button>
        <ChevronRight size={12} className="text-slate-300" />
        <span className="text-blue-600">Detalhes {processo.numero_processo}</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-200">
              <FileText size={28} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                Processo <span className="text-blue-600">{processo.numero_processo}</span>
              </h2>
              <p className="text-sm font-medium text-slate-500">Última movimentação: {new Date(processo.updated_at || '').toLocaleDateString('pt-BR')} às {new Date(processo.updated_at || '').toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
            <Button 
                variant="outline" 
                onClick={handleGerarTermo} 
                isLoading={isGeneratingDoc}
                icon={Download}
                size="md"
            >
                Gerar Termo
            </Button>
            <Button 
                variant="secondary" 
                onClick={onBack}
                icon={ArrowLeft}
                size="md"
            >
                Voltar
            </Button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 z-0 pointer-events-none" />
        
        {isAdmin && (
          <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-200">
                <ShieldCheck size={24} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Controle Institucional</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Somente Gestores e Administradores</p>
              </div>
            </div>
            <div className="flex-1 w-full max-w-md">
              <select 
                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-sm"
                value={processo.arbitro_id || ''}
                onChange={(e) => handleAssignArbitrator(e.target.value)}
                disabled={isAssigning}
              >
                <option value="">-- Designar Árbitro Responsável --</option>
                {arbitros.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.email})</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="border-b border-slate-100 bg-white sticky top-0 z-20">
          <div className="flex overflow-x-auto no-scrollbar px-4">
            {[
              { id: 'resumo', label: 'Painel', icon: BarChart3 },
              { id: 'partes', label: 'Partes', icon: Users },
              { id: 'fatos', label: 'Causa', icon: MessageSquare },
              { id: 'anexos', label: 'Arquivos', icon: FileText },
              { id: 'historico', label: 'Linha do Tempo', icon: Clock },
              { id: 'financeiro', label: 'Financeiro', icon: Wallet }
            ].map((tab) => (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={`px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-4 flex-shrink-0 flex items-center gap-2 ${
                  activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/10' 
                    : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8 lg:p-12 relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === 'resumo' && (
              <motion.div 
                key="resumo"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
                  {canEditProcess && <button onClick={() => handleEditField('numero_processo', 'Número do Processo', processo.numero_processo)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"><ExternalLink size={16} /></button>}
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Registro Oficial</span>
                  <p className="text-2xl font-black text-slate-900 tracking-tight">{processo.numero_processo}</p>
                </div>
                <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
                  {canEditProcess && <button onClick={() => handleEditField('status', 'Situação do Processo', processo.status)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"><ExternalLink size={16} /></button>}
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Fase Processual</span>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                    <p className="text-2xl font-black text-slate-900 uppercase tracking-tight">{processo.status || 'Pendente'}</p>
                  </div>
                </div>
                <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-100">
                  {canEditProcess && <button onClick={() => handleEditField('valor_causa', 'Valor da Causa', processo.valor_causa)} className="absolute top-6 right-6 p-2 text-slate-300 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"><ExternalLink size={16} /></button>}
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Montante em Lide</span>
                  <p className="text-2xl font-black text-blue-600">{Number(processo.valor_causa || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
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
                         onClick={() => handleWhatsApp(processo[`${tipo}_nome` as keyof Processo] as string, tipo as any)} 
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
                           {canEditProcess && <button onClick={() => handleEditField(item.field as any, item.label, processo[item.field as keyof Processo])} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"><ExternalLink size={14} /></button>}
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{item.label}</span>
                           <p className="text-base font-bold text-slate-700">{processo[item.field as keyof Processo] || 'NÃO CADASTRADO'}</p>
                         </div>
                       ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'fatos' && (
              <motion.div 
                key="fatos"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 relative group"
              >
                {canEditProcess && <button onClick={() => handleEditField('resumo_fatos', 'Resumo dos Fatos', processo.resumo_fatos)} className="absolute top-6 right-6 p-4 bg-white border border-slate-200 text-blue-600 rounded-[1.5rem] shadow-2xl shadow-blue-100 hover:scale-110 transition-all z-10"><ExternalLink size={24} /></button>}
                <div className="p-10 lg:p-16 bg-slate-50/50 rounded-[3rem] border border-slate-100 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.3em] mb-10 flex items-center gap-4">
                    <MessageSquare size={24} className="text-blue-600" />
                    Narrativa do Conflito & Causa Petendi
                  </h3>
                  <p className="text-lg text-slate-600 leading-[1.8] font-medium whitespace-pre-wrap">{processo.resumo_fatos || 'Aguardando o registro do memorial descritivo.'}</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'anexos' && (
              <ProcessAttachments processoId={processId} />
            )}

            {activeTab === 'historico' && (
              <div className="space-y-10">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <Clock size={24} />
                      </div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Cadeia de Custódia & Histórico</h3>
                    </div>
                </div>

                {currentUser && (
                    <div className="group flex gap-4 bg-slate-50 p-6 rounded-[2rem] border border-slate-200 focus-within:ring-8 focus-within:ring-blue-50 transition-all">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm font-black text-blue-600">
                          {currentUser.nome?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 flex flex-col md:flex-row gap-4">
                          <input 
                            type="text" 
                            value={novoAndamento} 
                            onChange={(e) => setNovoAndamento(e.target.value)} 
                            placeholder="Inserir novo despacho, decisão ou movimentação processual..." 
                            className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder:text-slate-300" 
                            disabled={submitting} 
                          />
                          <Button 
                            onClick={handleAddAndamento} 
                            disabled={submitting || !novoAndamento.trim()} 
                            isLoading={submitting}
                            icon={Send}
                            size="md"
                            className="px-8 shadow-none border-b-0"
                          >
                            Registrar
                          </Button>
                        </div>
                    </div>
                )}

                <ProcessTimeline processoId={processId} />
              </div>
            )}

            {activeTab === 'financeiro' && (
              <FinanceiroTab processoId={processId} organizationId={processo.organization_id || ''} />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
