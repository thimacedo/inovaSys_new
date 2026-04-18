import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useModal } from '../context/ModalContext';
import { useProcesso } from '../presentation/hooks/useProcessos';
import { userService } from '../services/userService';
import { documentService } from '../services/documentService';
import { whatsappService } from '../services/whatsappService';
import { financeiroService } from '../services/financeiroService';
import { notificationService } from '../services/notificationService';
import { processService, Processo } from '../services/processService';
import { isValidDoc } from '../utils/validators';
import { useAddHistoryEntry } from '../presentation/hooks/useHistory';

// 🧩 Sub-componentes Modularizados (Material You MD3)
import { ProcessHeader } from './process-details/ProcessHeader';
import { ProcessAdminControls } from './process-details/ProcessAdminControls';
import { ProcessTabs } from './process-details/ProcessTabs';
import { ProcessSummaryCards } from './process-details/ProcessSummaryCards';

// 📦 Componentes de Aba Legados (a serem modularizados futuramente)
import FinanceiroTab from './FinanceiroTab';
import ProcessAttachments from './ProcessAttachments';
import ProcessTimeline from './ProcessTimeline';
import { DocumentCenter } from './DocumentCenter';
import { ProcessChat } from './ProcessChat';
import { ProcessAudit } from './ProcessAudit';
import { SentenceGenerator } from './SentenceGenerator';

import { Clock, Send, MessageSquare } from 'lucide-react';
import { Button } from '../presentation/ui/components/Button';
import { AnimatePresence, motion } from 'motion/react';

export default function ProcessDetails({ processId, onBack }: { processId: string, onBack: () => void }) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const { data: processo, isLoading: loading, isError, refetch } = useProcesso(processId);
  const addHistoryMutation = useAddHistoryEntry();

  const [arbitros, setArbitros] = useState<any[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [activeTab, setActiveTab] = useState('resumo');
  const [novoAndamento, setNovoAndamento] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const { showToast, showPrompt, showModal } = useModal();

  const isAdmin = ['gestor', 'admin', 'god'].includes(currentUser?.tipo_usuario?.toLowerCase() || '');
  const canEditProcess = isAdmin || (processo && processo.arbitro_id === currentUser?.id);

  useEffect(() => {
    if (isAdmin) {
      userService.getArbitrosDisponiveis().then(setArbitros).catch(console.error);
    }
  }, [isAdmin]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-6">
      <div className="w-14 h-14 border-[5px] border-md-surface-variant border-t-md-primary rounded-full animate-spin"></div>
      <p className="text-xs font-bold text-md-on-surface-variant uppercase tracking-[0.2em]">Sincronizando dados processuais...</p>
    </div>
  );

  if (isError || !processo) return (
    <div className="p-20 text-center bg-md-surface rounded-[32px] border border-md-outline/10 shadow-md animate-in zoom-in duration-300">
      <h4 className="text-xl font-bold text-rose-600 mb-6">Acesso negado ou processo inexistente.</h4>
      <Button onClick={onBack} variant="secondary" className="rounded-full">Retornar ao Dashboard</Button>
    </div>
  );

  // 🛠️ Handlers de Lógica
  const handleAddAndamento = async () => {
    if (!novoAndamento.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      await addHistoryMutation.mutateAsync({ processoId: processId, titulo: 'Movimentação', tipo: 'usuario', descricao: novoAndamento, autorId: currentUser.id });
      setNovoAndamento('');
      showToast('Movimentação registrada.', 'success');
    } catch (e) { showToast('Falha no registro.', 'error'); } finally { setSubmitting(false); }
  };

  const handleEditField = async (field: keyof Processo, label: string, currentValue: any) => {
    let inputType: any = 'text';
    let maskType: any = undefined;
    if (field === 'resumo_fatos') inputType = 'textarea';
    if (field.toString().startsWith('valor_')) { maskType = 'money'; }
    if (field === 'requerente_doc' || field === 'requerido_doc') maskType = 'doc';

    showPrompt('Refinar Registro', label, currentValue?.toString() || '', async (newValue) => {
      if (newValue !== null && newValue !== currentValue) {
        try {
          await processService.update(processo.id, { [field]: newValue });
          showToast(`${label} atualizado.`, 'success');
          refetch();
        } catch (e) { showToast('Erro na atualização.', 'error'); }
      }
    }, inputType, maskType);
  };

  return (
    <div className="flex gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
      <div className="flex-1 space-y-8">
        
        {/* 🏷️ Cabeçalho MD3 */}
        <ProcessHeader 
          processo={processo}
          isAdmin={isAdmin}
          onBack={onBack}
          onGerarHonorarios={() => financeiroService.gerarHonorariosArbitrais(processo.id, processo.valor_causa || 0, processo.organization_id || '')}
          onSentencaIA={() => showModal('IA Jurídica', <SentenceGenerator processo={processo} onGenerate={(html) => documentService.downloadPDF(html, `SENTENCA_${processo.numero_processo}`)} onClose={() => {}} />)}
          onGerarTermo={async () => {
             setIsGeneratingDoc(true);
             await documentService.generateFromTemplate(2, { ...processo, data_hoje: new Date().toLocaleDateString('pt-BR') }, `Termo_${processo.numero_processo}`);
             setIsGeneratingDoc(false);
          }}
          isGeneratingDoc={isGeneratingDoc}
        />

        {/* 🏢 Container Principal (Surface Container) */}
        <div className="bg-md-surface rounded-[48px] border border-md-outline/5 shadow-md overflow-hidden relative min-h-[600px]">
          
          {/* 🛡️ Controles Adm */}
          <ProcessAdminControls 
            isAdmin={isAdmin} 
            arbitroId={processo.arbitro_id} 
            arbitros={arbitros} 
            isAssigning={isAssigning} 
            onAssign={(id) => processService.assignArbitrator(processo.id, id).then(refetch)} 
          />

          {/* 📑 Navegação por Abas MD3 */}
          <ProcessTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="p-8 lg:p-12 relative z-10">
            <AnimatePresence mode="wait">
              {activeTab === 'resumo' && (
                <motion.div key="resumo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <ProcessSummaryCards processo={processo} canEdit={canEditProcess} onEditField={handleEditField} />
                </motion.div>
              )}

              {activeTab === 'fatos' && (
                <motion.div key="fatos" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                  <div className="p-12 bg-md-surface-variant/20 rounded-[32px] border border-md-outline/5 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-md-primary" />
                    <h3 className="text-xs font-bold text-md-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                      <MessageSquare size={20} />
                      Causa Petendi & Narrativa
                    </h3>
                    <p className="text-lg text-md-on-surface leading-[1.8] font-medium whitespace-pre-wrap opacity-90">
                      {processo.resumo_fatos || 'Memorial descritivo pendente.'}
                    </p>
                    {canEditProcess && (
                        <Button variant="ghost" onClick={() => handleEditField('resumo_fatos', 'Resumo', processo.resumo_fatos)} className="mt-8 rounded-full text-xs font-bold">
                            Editar Narrativa
                        </Button>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'historico' && (
                <div className="space-y-12">
                  {currentUser && (
                    <div className="bg-md-surface-variant/10 p-6 rounded-[28px] border border-md-outline/10 focus-within:ring-4 focus-within:ring-md-primary/5 transition-all flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-md-primary text-md-on-primary flex items-center justify-center shrink-0 font-bold shadow-sm">
                            {currentUser.nome?.charAt(0)}
                        </div>
                        <div className="flex-1 flex gap-3">
                            <input 
                              type="text" 
                              value={novoAndamento} 
                              onChange={(e) => setNovoAndamento(e.target.value)} 
                              placeholder="Registrar nova movimentação processual..." 
                              className="flex-1 bg-transparent border-none outline-none text-sm font-medium placeholder:text-md-on-surface-variant/40" 
                            />
                            <Button onClick={handleAddAndamento} disabled={submitting || !novoAndamento.trim()} icon={Send} size="md" className="rounded-full px-8">
                                Registrar
                            </Button>
                        </div>
                    </div>
                  )}
                  <ProcessTimeline processoId={processId} />
                </div>
              )}

              {/* Componentes Legados renderizados condicionalmente */}
              {activeTab === 'documentos' && <DocumentCenter processo={processo} arbitroNome={(processo as any).arbitro?.nome} camaraConfig={{}} />}
              {activeTab === 'mensagens' && <ProcessChat processoId={processId} />}
              {activeTab === 'anexos' && <ProcessAttachments processoId={processId} />}
              {activeTab === 'auditoria' && <ProcessAudit processoId={processId} />}
              {activeTab === 'financeiro' && <FinanceiroTab processoId={processId} organizationId={processo.organization_id || ''} />}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
