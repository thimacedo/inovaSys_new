import React, { useState, useEffect } from 'react';
import { processService, Processo } from '../services/processService';
import { historyService, Andamento } from '../services/historyService';
import { attachmentService, Anexo } from '../services/attachmentService';
import { userService } from '../services/userService';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useModal } from '../context/ModalContext';
import { documentService } from '../services/documentService';
import { whatsappService } from '../services/whatsappService';
import { isValidDoc, isValidCEP } from '../utils/validators';
import { applyMask } from '../utils/masks';
import DocumentPreview from './DocumentPreview';
import BatchDocumentPreview from './BatchDocumentPreview';
import { Clock, Send } from 'lucide-react';

export default function ProcessDetails({ processId, onBack, camaraConfig: propCamaraConfig }: { processId: string, onBack: () => void, camaraConfig?: any }) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const [processo, setProcesso] = useState<Processo | null>(null);
  const [andamentos, setAndamentos] = useState<Andamento[]>([]);
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [arbitros, setArbitros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [activeTab, setActiveTab] = useState('resumo');
  const [novoAndamento, setNovoAndamento] = useState('');
  const [loadingAndamentos, setLoadingAndamentos] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { showToast, showModal, showPrompt, showConfirm } = useModal();

  const isAdmin = ['gestor', 'admin', 'god'].includes(currentUser?.tipo_usuario?.toLowerCase() || '');
  const canEditProcess = isAdmin || (processo && processo.arbitro_id === currentUser?.id);

  // Use prop if available, otherwise fallback to localStorage
  const camaraConfig = propCamaraConfig || JSON.parse(localStorage.getItem('camara_config') || '{}');

  useEffect(() => {
    carregarProcesso();
    carregarAndamentos();
    carregarAnexos();
  }, [processId]);

  const carregarArbitros = async (orgId?: string) => {
    if (!isAdmin || !orgId) return;
    try {
      const data = await userService.getArbitrosDaOrganizacao(orgId);
      setArbitros(data);
    } catch (e) {
      console.error('Erro ao carregar árbitros:', e);
    }
  };

  const carregarAnexos = async () => {
    try {
      const data = await attachmentService.getByProcesso(processId);
      setAnexos(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUploadAnexo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await attachmentService.upload(processId, file);
      showToast('Arquivo anexado com sucesso!', 'success');
      carregarAnexos();
    } catch (error) {
      showToast('Erro ao anexar arquivo.', 'error');
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleExcluirAnexo = async (id: string, url: string) => {
    showConfirm(
      "Excluir Anexo",
      "Tem certeza que deseja excluir este anexo?",
      async () => {
        try {
          await attachmentService.delete(id, url);
          showToast('Anexo excluído com sucesso!', 'success');
          carregarAnexos();
        } catch (error) {
          showToast('Erro ao excluir anexo.', 'error');
        }
      },
      "Excluir"
    );
  };

  const carregarProcesso = async () => {
    setLoading(true);
    try {
      const data = await processService.getById(processId);
      setProcesso(data);
      if (data.organization_id) {
        carregarArbitros(data.organization_id);
      }
    } catch (e) {
      console.error(e);
      showToast('Erro ao carregar processo', 'error');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const carregarAndamentos = async () => {
    setLoadingAndamentos(true);
    const data = await historyService.getByProcesso(processId);
    setAndamentos(data);
    setLoadingAndamentos(false);
  };

  const handleAddAndamento = async () => {
    if (!novoAndamento.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      await historyService.addAndamento({
        processo_id: processId,
        descricao: novoAndamento,
        usuario_id: currentUser.id,
        tipo: 'Atualizacao'
      });
      setNovoAndamento('');
      await carregarAndamentos();
      showToast('Andamento registrado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao registrar andamento.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGerarDocumento = (num: number, title: string) => {
    if (!processo) return;
    const arb = arbitros.find(a => a.id === processo.arbitro_id) || null;
    const html = documentService.visualizarDoc(num, processo, arb, camaraConfig);
    showModal(title, <DocumentPreview html={html} fileName={`${title}_${processo.numero_processo}`} />);
  };

  const handleGerarLote = () => {
    if (!processo) return;
    const arb = arbitros.find(a => a.id === processo.arbitro_id) || null;
    const docs = [
      { id: 1, name: '01 - CAPA DO PROCESSO' },
      { id: 2, name: '02 - TERMO DE APRESENTAÇÃO DO PEDIDO' },
      { id: 3, name: '03 - NOTIFICAÇÃO EXTRAJUDICIAL' },
      { id: 4, name: '04 - PORTARIA ARBITRAL (NOMEAÇÃO)' },
      { id: 5, name: '05 - TERMO DE COMPROMISSO DO ÁRBITRO' },
      { id: 6, name: '06 - TERMO DE COMPROMISSO ARBITRAL' },
      { id: 7, name: '07 - ATA DE AUDIÊNCIA ARBITRAL' },
      { id: 8, name: '08 - SENTENÇA ARBITRAL' },
      { id: 9, name: '09 - TERMO DE RECEBIMENTO DE SENTENÇA' },
      { id: 10, name: '10 - RECIBO DE VALORES DE ACORDO' },
      { id: 11, name: '11 - RECIBO DE HONORÁRIOS' },
      { id: 12, name: '12 - REQUERIMENTO' },
      { id: 13, name: '13 - ANEXO DE PROCESSO' }
    ].map(d => ({
      title: d.name,
      html: documentService.visualizarDoc(d.id, processo, arb, camaraConfig)
    }));

    showModal("Gerar Pacote Completo", <BatchDocumentPreview documents={docs} processNumber={processo.numero_processo} />);
  };

  const handleWhatsApp = (nomeParte: string, tipo: 'requerente' | 'requerido') => {
    if (!processo) return;
    
    showPrompt(
      `Notificar ${tipo === 'requerente' ? 'Requerente' : 'Requerido'}`,
      `Confirme o número do WhatsApp de ${nomeParte} (apenas números com DDD):`,
      '',
      (phone) => {
        if (!phone) return;
        const msg = whatsappService.templates.avisoAndamento(nomeParte, processo.numero_processo, "Houve uma nova atualização no seu processo. Por favor, acesse o sistema.");
        whatsappService.enviarMensagem(phone, msg);
        showToast('WhatsApp aberto!', 'success');
      }
    );
  };

  const handleAssignArbitrator = async (arbitroId: string) => {
    if (!processo) return;
    setIsAssigning(true);
    try {
      const updated = await processService.assignArbitrator(processo.id, arbitroId);
      setProcesso(updated);
      showToast('Árbitro designado com sucesso!', 'success');
    } catch (error: any) {
      showToast(error.message || 'Erro ao designar árbitro.', 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleEditField = async (field: keyof Processo, label: string, currentValue: any) => {
    let inputType: 'text' | 'date' | 'time' | 'textarea' = 'text';
    let maskType: 'doc' | 'money' | 'phone' | 'cep' | undefined = undefined;

    if (field === 'resumo_fatos') inputType = 'textarea';
    if (field.startsWith('valor_')) {
      inputType = 'text'; // Change to text for money mask
      maskType = 'money';
    }
    if (field === 'requerente_doc' || field === 'requerido_doc') {
      maskType = 'doc';
    }

    let initialVal = currentValue?.toString() || '';

    showPrompt('Editar Campo', label, initialVal, async (newValue) => {
      if (newValue !== null && newValue !== initialVal) {
        let finalValue: any = newValue;
        if (field === 'requerente_doc' || field === 'requerido_doc') {
          if (!isValidDoc(newValue)) {
            showToast('CPF ou CNPJ inválido.', 'attention');
            return;
          }
          finalValue = newValue.replace(/\D/g, '');
        }
        if (maskType === 'money') {
          const vRaw = newValue.replace('R$ ', '').replace(/\./g, '').replace(',', '.').trim();
          finalValue = vRaw ? parseFloat(vRaw) : 0;
        }
        try {
          await processService.update(processo!.id, { [field]: finalValue });
          showToast(`${label} atualizado com sucesso!`, 'success');
          carregarProcesso();
        } catch (e) {
          showToast(`Erro ao atualizar ${label}: ` + (e as Error).message, 'error');
        }
      }
    }, inputType as 'text' | 'date' | 'time' | 'textarea', maskType);
  };

  if (loading) return <div>Carregando detalhes do processo...</div>;
  if (!processo) return <div>Processo não encontrado.</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
          Processo: {processo.numero_processo}
        </h2>
        <button 
          className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2" 
          onClick={onBack}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Voltar ao Painel
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Painel de Administração - Visível apenas para Admins */}
        {isAdmin && (
          <div className="p-6 bg-blue-50/50 border-b border-slate-100">
            <h3 className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-3">Painel de Delegação</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-blue-700 mb-1">Designar Árbitro Responsável</label>
                <select 
                  className="w-full px-4 py-2 bg-white border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={processo.arbitro_id || ''}
                  onChange={(e) => handleAssignArbitrator(e.target.value)}
                  disabled={isAssigning}
                >
                  <option value="">-- Selecione um Árbitro --</option>
                  {arbitros.map(arb => (
                    <option key={arb.id} value={arb.id}>{arb.nome} ({arb.cpf})</option>
                  ))}
                </select>
              </div>
              {isAssigning && <span className="text-sm text-blue-600 font-medium">Salvando...</span>}
            </div>
          </div>
        )}

        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1">
          <button 
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all ${activeTab === 'resumo' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} 
            onClick={() => setActiveTab('resumo')}
          >
            Resumo
          </button>
          <button 
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all ${activeTab === 'documentos' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} 
            onClick={() => setActiveTab('documentos')}
          >
            Documentos
          </button>
          <button 
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all ${activeTab === 'anexos' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} 
            onClick={() => setActiveTab('anexos')}
          >
            Anexos
          </button>
          <button 
            className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all ${activeTab === 'historico' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} 
            onClick={() => setActiveTab('historico')}
          >
            Histórico
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'resumo' && (
            <div className="space-y-8">
              {/* Informações do Processo */}
              <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                <h4 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b border-slate-200">Informações do Processo</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      {processo.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">Início do Processo</p>
                    <p className="text-sm text-slate-700 font-medium mt-1">{new Date(processo.created_at).toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="group cursor-pointer" onClick={() => handleEditField('valor_causa', 'Valor da Causa', processo.valor_causa)}>
                    <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                      Valor da Causa
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </p>
                    <p className="text-lg font-bold text-slate-900 mt-1">R$ {processo.valor_causa?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="relative">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Árbitro Responsável</p>
                    <div className="text-sm text-slate-700 font-medium mt-1">
                      {arbitros.find(a => a.id === processo.arbitro_id)?.nome || 'Não atribuído'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  </div>
                  <h4 className="font-bold text-slate-900 text-lg">Quem participa (Partes)</h4>
                </div>
                {/* Card Requerente */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors group cursor-pointer" onClick={() => handleEditField('requerente_nome', 'Nome de quem inicia (Requerente)', processo.requerente_nome)}>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Quem inicia (Requerente)</h4>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:text-blue-500 transition-colors"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </div>
                  <p className="text-lg font-bold text-slate-900 mb-4">{processo.requerente_nome}</p>
                  <div className="grid grid-cols-1 gap-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Documento</p>
                      <p className="text-sm text-slate-700 font-medium hover:text-blue-600 transition-colors" onClick={(e) => { e.stopPropagation(); handleEditField('requerente_doc', 'CPF/CNPJ Requerente', processo.requerente_doc); }}>{processo.requerente_doc ? applyMask(processo.requerente_doc, 'doc') : '---'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Endereço</p>
                      <p className="text-sm text-slate-700 font-medium hover:text-blue-600 transition-colors" onClick={(e) => { e.stopPropagation(); handleEditField('requerente_end', 'Endereço Requerente', processo.requerente_end); }}>{processo.requerente_end || '---'}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleWhatsApp(processo.requerente_nome, 'requerente'); }}
                      className="mt-2 flex items-center gap-2 text-[10px] font-bold text-green-600 hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      Notificar via WhatsApp
                    </button>
                  </div>
                </div>

                {/* Card Requerido */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors group cursor-pointer" onClick={() => handleEditField('requerido_nome', 'Nome da parte acionada (Requerido)', processo.requerido_nome)}>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider">Parte acionada (Requerido)</h4>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-300 group-hover:text-blue-500 transition-colors"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </div>
                  <p className="text-lg font-bold text-slate-900 mb-4">{processo.requerido_nome}</p>
                  <div className="grid grid-cols-1 gap-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Documento</p>
                      <p className="text-sm text-slate-700 font-medium hover:text-blue-600 transition-colors" onClick={(e) => { e.stopPropagation(); handleEditField('requerido_doc', 'CPF/CNPJ Requerido', processo.requerido_doc); }}>{processo.requerido_doc ? applyMask(processo.requerido_doc, 'doc') : '---'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Endereço</p>
                      <p className="text-sm text-slate-700 font-medium hover:text-blue-600 transition-colors" onClick={(e) => { e.stopPropagation(); handleEditField('requerido_end', 'Endereço Requerido', processo.requerido_end); }}>{processo.requerido_end || '---'}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleWhatsApp(processo.requerido_nome, 'requerido'); }}
                      className="mt-2 flex items-center gap-2 text-[10px] font-bold text-green-600 hover:text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      Notificar via WhatsApp
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h4 className="text-lg font-bold text-slate-800">O que aconteceu (Resumo)</h4>
                    <button 
                      onClick={() => handleEditField('resumo_fatos', 'O que aconteceu (Resumo)', processo.resumo_fatos)}
                      className="text-blue-600 hover:text-blue-700 text-xs font-bold flex items-center gap-1"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Editar
                    </button>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-slate-200 text-slate-700 text-sm leading-relaxed whitespace-pre-wrap min-h-[200px]">
                    {processo.resumo_fatos || 'Nenhum fato registrado.'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'anexos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h4 className="text-lg font-bold text-slate-800">Anexos do Processo</h4>
                <div>
                  <input 
                    type="file" 
                    id="file-upload" 
                    className="hidden" 
                    onChange={handleUploadAnexo}
                    disabled={uploading}
                  />
                  <label 
                    htmlFor="file-upload" 
                    className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition-colors shadow-sm ${uploading ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    {uploading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Novo Anexo
                      </>
                    )}
                  </label>
                </div>
              </div>

              {anexos.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                  <svg className="mx-auto h-12 w-12 text-slate-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  <p className="text-sm text-slate-500 font-medium">Nenhum arquivo anexado a este processo.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {anexos.map(anexo => (
                    <div key={anexo.id} className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                        </div>
                        <button 
                          onClick={() => handleExcluirAnexo(anexo.id, anexo.url)}
                          className="text-slate-400 hover:text-red-500 transition-colors"
                          title="Excluir anexo"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                      <h5 className="font-semibold text-slate-800 text-sm mb-1 line-clamp-2" title={anexo.nome_arquivo}>
                        {anexo.nome_arquivo}
                      </h5>
                      <div className="flex justify-between items-center mt-auto pt-3">
                        <span className="text-xs text-slate-500">
                          {(anexo.tamanho / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <a 
                          href={anexo.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Baixar
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'documentos' && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex gap-3">
                  <svg className="text-blue-600 shrink-0" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  <p className="text-sm text-blue-800">Selecione um modelo para gerar o documento oficial em PDF. Você poderá editar campos específicos antes de baixar.</p>
                </div>
                <button 
                  onClick={handleGerarLote}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-200 shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Gerar Pacote Completo (Lote)
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { id: 1, name: '01 - CAPA DO PROCESSO' },
                  { id: 2, name: '02 - TERMO DE APRESENTAÇÃO DO PEDIDO' },
                  { id: 3, name: '03 - NOTIFICAÇÃO EXTRAJUDICIAL' },
                  { id: 4, name: '04 - PORTARIA ARBITRAL (NOMEAÇÃO)' },
                  { id: 5, name: '05 - TERMO DE COMPROMISSO DO ÁRBITRO' },
                  { id: 6, name: '06 - TERMO DE COMPROMISSO ARBITRAL' },
                  { id: 7, name: '07 - ATA DE AUDIÊNCIA ARBITRAL' },
                  { id: 8, name: '08 - SENTENÇA ARBITRAL' },
                  { id: 9, name: '09 - TERMO DE RECEBIMENTO DE SENTENÇA' },
                  { id: 10, name: '10 - RECIBO DE VALORES DE ACORDO' },
                  { id: 11, name: '11 - RECIBO DE HONORÁRIOS' },
                  { id: 12, name: '12 - REQUERIMENTO' },
                  { id: 13, name: '13 - ANEXO DE PROCESSO' }
                ].map(doc => (
                  <button 
                    key={doc.id}
                    className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all group text-left"
                    onClick={() => handleGerarDocumento(doc.id, doc.name)}
                  >
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">{doc.name}</span>
                    <svg className="text-slate-300 group-hover:text-blue-500 transition-colors" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="mt-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm w-full max-w-full overflow-hidden">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                <Clock size={20} className="text-blue-600" />
                <h3 className="text-lg font-bold text-slate-800">Linha do Tempo e Despachos</h3>
              </div>

              {/* Formulário de Inserção (Visível apenas se houver usuário autenticado) */}
              {currentUser && (
                <div className="mb-8 flex gap-3">
                  <input
                    type="text"
                    value={novoAndamento}
                    onChange={(e) => setNovoAndamento(e.target.value)}
                    placeholder="Registrar novo andamento ou despacho..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    disabled={submitting}
                  />
                  <button
                    onClick={handleAddAndamento}
                    disabled={submitting || !novoAndamento.trim()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 disabled:opacity-50 transition-all"
                  >
                    <Send size={16} />
                    {submitting ? 'Enviando...' : 'Registrar'}
                  </button>
                </div>
              )}

              {/* Lista Cronológica */}
              {loadingAndamentos ? (
                <p className="text-sm text-slate-500 animate-pulse">Carregando histórico...</p>
              ) : andamentos.length === 0 ? (
                <p className="text-sm text-slate-500 italic">Nenhum andamento registrado até o momento.</p>
              ) : (
                <div className="relative border-l-2 border-slate-100 ml-3 space-y-6">
                  {andamentos.map((item) => (
                    <div key={item.id} className="relative pl-6">
                      <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white bg-blue-500" />
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <p className="text-xs text-slate-400 font-medium mb-1">
                          {new Date(item.data_registro).toLocaleString('pt-BR')}
                        </p>
                        <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap">
                          {item.descricao}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
