import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useModal } from '../context/ModalContext';
import { useProcesso } from '../presentation/hooks/useProcessos';
import { userService } from '../services/userService';
import { documentService } from '../services/documentService';
import { processService, Processo } from '../services/processService';
import { useAddHistoryEntry } from '../presentation/hooks/useHistory';

// 🧩 Sub-componentes Modularizados (Material You MD3)
import { ProcessHeader } from './process-details/ProcessHeader';
import { ProcessAdminControls } from './process-details/ProcessAdminControls';
import { ProcessTabs } from './process-details/ProcessTabs';
import { ProcessSummaryCards } from './process-details/ProcessSummaryCards';

// 📦 Componentes de Aba Legados
import FinanceiroTab from './FinanceiroTab';
import ProcessAttachments from './ProcessAttachments';
import ProcessTimeline from './ProcessTimeline';
import { DocumentCenter } from './DocumentCenter';
import { ProcessChat } from './ProcessChat';
import { ProcessAudit } from './ProcessAudit';
import { SentenceGenerator } from './SentenceGenerator';

import { MessageSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function ProcessDetails({ processId, onBack }: { processId: string, onBack: () => void }) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const { data: processo, isLoading: loading, isError, refetch } = useProcesso(processId);
  const addHistoryMutation = useAddHistoryEntry();

  const [arbitros, setArbitros] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('resumo');
  const [novoAndamento, setNovoAndamento] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const { showToast, showPrompt, showModal } = useModal();

  const isAdmin = ['gestor', 'admin', 'god'].includes(currentUser?.tipo_usuario?.toLowerCase() || '');
  const canEditProcess = isAdmin || (processo && (processo as any).arbitro_id === currentUser?.id);

  useEffect(() => {
    if (isAdmin) {
      userService.getArbitrosDisponiveis().then(setArbitros).catch(console.error);
    }
  }, [isAdmin]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-6">
      <div className="w-14 h-14 border-[5px] border-md-surface-variant border-t-md-primary rounded-full animate-spin"></div>
      <p className="text-xs font-bold text-md-on-surface-variant uppercase tracking-[0.2em]">Sincronizando dados...</p>
    </div>
  );

  if (isError || !processo) return (
    <div className="p-20 text-center bg-md-surface rounded-[32px] border border-md-outline/10">
      <h4 className="text-xl font-bold text-rose-600 mb-6">Acesso negado.</h4>
      <button onClick={onBack} className="rounded-full px-8 py-3 bg-md-surface-variant text-md-on-surface font-bold">Voltar</button>
    </div>
  );

  const handleAddAndamento = async () => {
    if (!novoAndamento.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      await addHistoryMutation.mutateAsync({ processoId: processId, titulo: 'Movimentação', tipo: 'usuario', descricao: novoAndamento, autorId: currentUser.id });
      setNovoAndamento('');
      showToast('Registrado.', 'success');
    } catch (e) { showToast('Falha.', 'error'); } finally { setSubmitting(false); }
  };

  const handleEditField = async (field: keyof Processo, label: string, currentValue: any) => {
    let inputType: any = 'text';
    if (field === 'resumo_fatos') inputType = 'textarea';
    
    showPrompt('Refinar Registro', label, currentValue?.toString() || '', async (newValue) => {
      if (newValue !== null && newValue !== currentValue) {
        try {
          await processService.update(processo.id, { [field]: newValue });
          showToast(`${label} atualizado.`, 'success');
          refetch();
        } catch (e) { showToast('Erro.', 'error'); }
      }
    }, inputType);
  };

  const currentProcesso = processo as any;

  return (
    <div className="w-full max-w-full overflow-hidden flex flex-col xl:flex-row gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
      <div className="flex-1 min-w-0 space-y-8">
        
        <ProcessHeader 
          processo={processo}
          isAdmin={isAdmin}
          onBack={onBack}
          onSentencaIA={() => showModal('IA Jurídica', <SentenceGenerator processo={processo} onGenerate={(html) => documentService.downloadPDF(html, `SENTENCA_${currentProcesso.numero_processo}`)} onClose={() => {}} />)}
          onGerarTermo={async () => {
             setIsGeneratingDoc(true);
             const templateData: Record<string, string> = {};
             Object.entries(currentProcesso).forEach(([key, val]) => {
               if (val !== null && val !== undefined) templateData[key] = String(val);
             });
             await documentService.generateFromTemplate(2, { ...templateData, data_hoje: new Date().toLocaleDateString('pt-BR') }, `Termo_${currentProcesso.numero_processo}`);
             setIsGeneratingDoc(false);
          }}
          isGeneratingDoc={isGeneratingDoc}
        />

        <div className="bg-md-surface rounded-[48px] border border-md-outline/5 shadow-md overflow-hidden relative min-h-[600px]">
          <ProcessAdminControls 
            isAdmin={isAdmin} 
            arbitroId={currentProcesso.arbitro_id || null} 
            arbitros={arbitros} 
            isAssigning={false} 
            onAssign={(id) => processService.assignArbitrator(processo.id, id).then(() => refetch())} 
          />

          <ProcessTabs activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="p-8 lg:p-12 relative z-10">
            <AnimatePresence mode="wait">
              {activeTab === 'resumo' && (
                <motion.div key="resumo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <ProcessSummaryCards processo={processo} canEdit={!!canEditProcess} onEditField={handleEditField} />
                </motion.div>
              )}

              {activeTab === 'fatos' && (
                <motion.div key="fatos" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                  <div className="p-12 bg-md-surface-variant/20 rounded-[32px] border border-md-outline/5 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-md-primary" />
                    <h3 className="text-xs font-bold text-md-primary uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                      <MessageSquare size={20} />
                      Narrativa
                    </h3>
                    <p className="text-lg text-md-on-surface leading-[1.8] font-medium whitespace-pre-wrap">
                      {currentProcesso.resumo_fatos || 'Pendente.'}
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'historico' && (
                <div className="space-y-12">
                  <div className="bg-md-surface-variant/10 p-6 rounded-[28px] border border-md-outline/10 flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-md-primary text-md-on-primary flex items-center justify-center shrink-0 font-bold">
                          {currentUser?.nome?.charAt(0)}
                      </div>
                      <div className="flex-1 flex gap-3">
                          <input 
                            type="text" value={novoAndamento} onChange={(e) => setNovoAndamento(e.target.value)} 
                            placeholder="Nova movimentação..." 
                            className="flex-1 bg-transparent border-none outline-none text-sm font-medium" 
                          />
                          <button onClick={handleAddAndamento} disabled={submitting || !novoAndamento.trim()} className="rounded-full px-8 bg-md-primary text-white text-xs font-bold">
                              Registrar
                          </button>
                      </div>
                  </div>
                  <ProcessTimeline processoId={processId} />
                </div>
              )}

              {activeTab === 'documentos' && <DocumentCenter processo={processo} arbitroNome={currentProcesso.arbitro?.nome} camaraConfig={{}} />}
              {activeTab === 'mensagens' && <ProcessChat processoId={processId} />}
              {activeTab === 'anexos' && <ProcessAttachments processoId={processId} />}
              {activeTab === 'auditoria' && <ProcessAudit processoId={processId} />}
              {activeTab === 'financeiro' && <FinanceiroTab processoId={processId} organizationId={currentProcesso.organization_id || ''} />}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
