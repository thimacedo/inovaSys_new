import React, { useState, useEffect } from 'react';
import { processService } from '../services/processService';
import { ProcessEntity as Processo } from '../infrastructure/database/repositories/ProcessRepository';
import { historyService, Andamento } from '../services/historyService';
import { attachmentService, Anexo } from '../services/attachmentService';
import { userService } from '../services/userService';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useModal } from '../context/ModalContext';
import { documentService } from '../services/documentService';
import { whatsappService } from '../services/whatsappService';
import { calendarService } from '../services/calendarService';
import { useProcesso } from '../presentation/hooks/useProcessos';
import { isValidDoc } from '../utils/validators';
import { applyMask } from '../utils/masks';
// DocumentPreview e BatchDocumentPreview foram mantidos para compatibilidade, 
// embora a nova arquitetura foque em download direto de PDF.
import DocumentPreview from './DocumentPreview';
import BatchDocumentPreview from './BatchDocumentPreview';
import FinanceiroTab from './FinanceiroTab';
import { Clock, Send, Calendar as CalendarIcon, ExternalLink, FileText, Download, Trash2 } from 'lucide-react';

export default function ProcessDetails({ processId, onBack, camaraConfig: propCamaraConfig }: { processId: string, onBack: () => void, camaraConfig?: any }) {
  const currentUser = useAuthStore((state) => state.currentUser);
  
  // TanStack Query Hook
  const { data: processo, isLoading: loading, isError } = useProcesso(processId);

  const [andamentos, setAndamentos] = useState<Andamento[]>([]);
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [arbitros, setArbitros] = useState<any[]>([]);
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
    if (processId) {
      carregarAndamentos();
      carregarAnexos();
    }
  }, [processId]);

  useEffect(() => {
    if (processo?.organization_id && isAdmin) {
      carregarArbitros(processo.organization_id);
    }
  }, [processo?.organization_id, isAdmin]);

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
      e.target.value = '';
    }
  };

  const handleExcluirAnexo = async (id: string, url: string) => {
    showConfirm("Excluir Anexo", "Tem certeza que deseja excluir este anexo?", async () => {
      try {
        await attachmentService.delete(id, url);
        showToast('Anexo excluído com sucesso!', 'success');
        carregarAnexos();
      } catch (error) {
        showToast('Erro ao excluir anexo.', 'error');
      }
    }, "Excluir");
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

  const handleGerarTermo = async () => {
    if (!processo) return;
    showToast('Gerando PDF...', 'info');
    try {
      await documentService.generateFromTemplate(2, {
        requerente_nome: processo.requerente_nome || 'Não informado',
        requerido_nome: processo.requerido_nome || 'Não informado',
        numero_processo: processo.numero_processo || processo.id,
        valor_causa: Number(processo.valor_causa || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        data_hoje: new Date().toLocaleDateString('pt-BR')
      }, `Termo_Arbitragem_${processo.numero_processo}`);
      showToast('Download iniciado!', 'success');
    } catch (error: any) {
      showToast('Erro ao gerar documento: ' + error.message, 'error');
    }
  };

  const handleGerarLote = async () => {
    console.log('Implementar lote');
  };

  const handleWhatsApp = (nomeParte: string, tipo: 'requerente' | 'requerido') => {
    if (!processo) return;
    showPrompt(`Notificar ${tipo === 'requerente' ? 'Requerente' : 'Requerido'}`, `Confirme o número do WhatsApp de ${nomeParte} (apenas números com DDD):`, '', (phone) => {
      if (!phone) return;
      const msg = whatsappService.templates.avisoAndamento(nomeParte, processo.numero_processo, "Houve uma nova atualização no seu processo. Por favor, acesse o sistema.");
      whatsappService.enviarMensagem(phone, msg);
      showToast('WhatsApp aberto!', 'success');
    });
  };

  const handleAssignArbitrator = async (arbitroId: string) => {
    if (!processo) return;
    setIsAssigning(true);
    try {
      await processService.assignArbitrator(processo.id, arbitroId);
      showToast('Árbitro designado com sucesso!', 'success');
      // O cache será atualizado pelo hook se o componente for montado novamente ou via invalidação
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
    if (field.toString().startsWith('valor_')) { inputType = 'text'; maskType = 'money'; }
    if (field === 'requerente_doc' || field === 'requerido_doc') { maskType = 'doc'; }

    let initialVal = currentValue?.toString() || '';
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
          await processService.update(processo!.id, { [field]: finalValue });
          showToast(`${label} atualizado com sucesso!`, 'success');
        } catch (e) {
          showToast(`Erro ao atualizar ${label}: ` + (e as Error).message, 'error');
        }
      }
    }, inputType as any, maskType);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Carregando detalhes do processo...</p>
    </div>
  );
  if (isError || !processo) return (
    <div className="p-20 text-center bg-white rounded-2xl border border-red-100 shadow-sm">
      <h4 className="text-lg font-bold text-red-600">Erro: Processo não encontrado.</h4>
      <button onClick={onBack} className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold">Voltar</button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
            <FileText size={24} />
          </div>
          Processo: <span className="text-blue-600">{processo.numero_processo}</span>
        </h2>
        <div className="flex gap-2">
            <button 
                onClick={handleGerarTermo}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 uppercase tracking-wider"
            >
                <Download size={18} />
                Gerar Termo
            </button>
            <button 
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2" 
                onClick={onBack}
            >
                <ExternalLink size={16} />
                Voltar
            </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {isAdmin && (
          <div className="p-6 bg-slate-50 border-b border-slate-100">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Painel de Delegação Governamental</h3>
            <div className="flex flex-col sm:flex-row items-end gap-4">
              <div className="flex-1 w-full">
                <label className="block text-xs font-bold text-slate-700 mb-2 ml-1">Árbitro Responsável pelo Veredito</label>
                <select 
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                  value={processo.arbitro_id || ''}
                  onChange={(e) => handleAssignArbitrator(e.target.value)}
                  disabled={isAssigning}
                >
                  <option value="">-- Selecione o Magistrado --</option>
                  {arbitros.map(arb => (
                    <option key={arb.id} value={arb.id}>{arb.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="flex border-b border-slate-100 bg-slate-50/30 p-1.5 overflow-x-auto">
          {['resumo', 'documentos', 'anexos', 'historico', 'financeiro'].map((tab) => (
            <button 
              key={tab}
              className={`flex-1 min-w-[120px] py-3 px-4 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-white text-blue-600 shadow-md border border-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`} 
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-8">
          {activeTab === 'resumo' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 bg-slate-50/50 p-8 rounded-3xl border border-slate-100">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Status do Caso</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-lg shadow-blue-200">
                    {processo.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Data do Protocolo</p>
                  <p className="text-sm text-slate-900 font-bold">{new Date(processo.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="group cursor-pointer" onClick={() => handleEditField('valor_causa', 'Valor da Causa', processo.valor_causa)}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    Valor da Causa
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </p>
                  <p className="text-xl font-black text-slate-900 tracking-tight">R$ {Number(processo.valor_causa).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Árbitro Nomeado</p>
                  <div className="text-sm text-slate-900 font-bold">
                    {arbitros.find(a => a.id === processo.arbitro_id)?.nome || 'Em definição'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Requerente */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                      </div>
                      <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-2">Requerente</h4>
                    </div>
                    <p className="text-xl font-black text-slate-900 mb-4">{processo.requerente_nome}</p>
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Documento Identificação</p>
                            <p className="text-sm font-bold text-slate-700">{processo.requerente_doc ? applyMask(processo.requerente_doc, 'doc') : '---'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Domicílio Declarado</p>
                            <p className="text-sm font-bold text-slate-700">{processo.requerente_end || 'Endereço não informado'}</p>
                        </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleWhatsApp(processo.requerente_nome, 'requerente')}
                    className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
                  >
                    Notificar WhatsApp
                  </button>
                </div>

                {/* Requerido */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-amber-400 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                      </div>
                      <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-2">Requerido</h4>
                    </div>
                    <p className="text-xl font-black text-slate-900 mb-4">{processo.requerido_nome}</p>
                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Documento Identificação</p>
                            <p className="text-sm font-bold text-slate-700">{processo.requerido_doc ? applyMask(processo.requerido_doc, 'doc') : '---'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Domicílio Declarado</p>
                            <p className="text-sm font-bold text-slate-700">{processo.requerido_end || 'Endereço não informado'}</p>
                        </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleWhatsApp(processo.requerido_nome, 'requerido')}
                    className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
                  >
                    Notificar WhatsApp
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-3">
                    Resumo dos Fatos
                    <div className="flex-1 h-px bg-slate-100"></div>
                </h4>
                <div className="bg-white p-8 rounded-3xl border border-slate-200 text-slate-700 text-base leading-relaxed whitespace-pre-wrap min-h-[300px] shadow-sm">
                  {processo.resumo_fatos || 'Nenhum fato registrado.'}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'anexos' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h4 className="text-sm font-bold text-slate-900">Gerenciar Documentos Anexos</h4>
                <div>
                  <input type="file" id="file-upload" className="hidden" onChange={handleUploadAnexo} disabled={uploading} />
                  <label htmlFor="file-upload" className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all shadow-md ${uploading ? 'bg-slate-200 text-slate-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    {uploading ? 'Enviando...' : 'Fazer Upload'}
                  </label>
                </div>
              </div>

              {anexos.length === 0 ? (
                <div className="text-center py-24 bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Aguardando Documentação</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {anexos.map(anexo => (
                    <div key={anexo.id} className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xl transition-all group flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={24} /></div>
                            <button onClick={() => handleExcluirAnexo(anexo.id, anexo.url)} className="p-2 text-slate-300 hover:text-red-600 transition-colors"><Trash2 size={20} /></button>
                        </div>
                        <h5 className="font-bold text-slate-900 text-sm line-clamp-2">{anexo.nome_arquivo}</h5>
                      </div>
                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{(anexo.tamanho / 1024 / 1024).toFixed(2)} MB</span>
                        <a href={anexo.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Download</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'documentos' && (
            <div className="space-y-8">
              <div className="bg-indigo-600 p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl text-white"><Download size={24} /></div>
                  <div>
                    <h4 className="font-black text-lg tracking-tight">Motor de Documentos Legais</h4>
                    <p className="text-xs text-indigo-100 font-medium opacity-80">Gere peças processuais autenticadas em tempo real utilizando os templates da Câmara.</p>
                  </div>
                </div>
                <button onClick={handleGerarLote} className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg whitespace-nowrap">Baixar Arquivos em Lote</button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: 1, name: 'Capa do Processo' },
                  { id: 2, name: 'Termo de Apresentação' },
                  { id: 3, name: 'Notificação Extrajudicial' },
                  { id: 4, name: 'Portaria de Nomeação' },
                  { id: 5, name: 'Termo do Árbitro' },
                  { id: 6, name: 'Compromisso Arbitral' }
                ].map(doc => (
                  <button 
                    key={doc.id}
                    className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-3xl hover:border-indigo-400 hover:shadow-xl transition-all group"
                    onClick={() => handleGerarTermo()}
                  >
                    <span className="text-sm font-bold text-slate-900">{doc.name}</span>
                    <div className="p-2 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-lg transition-all"><Download size={16} /></div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6 uppercase tracking-widest">
                    <Clock size={20} className="text-blue-600" />
                    <h3 className="text-xs font-black text-slate-900">Linha Temporal do Procedimento</h3>
                </div>

                {currentUser && (
                    <div className="mb-10 flex gap-3">
                        <input type="text" value={novoAndamento} onChange={(e) => setNovoAndamento(e.target.value)} placeholder="Digite o despacho ou movimentação..." className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all" disabled={submitting} />
                        <button onClick={handleAddAndamento} disabled={submitting || !novoAndamento.trim()} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg">
                            {submitting ? 'Salvando...' : 'Registrar'}
                        </button>
                    </div>
                )}

                <div className="relative border-l-4 border-slate-100 ml-4 space-y-10 pl-8">
                    {andamentos.map((and) => (
                        <div key={and.id} className="relative">
                            <div className="absolute -left-[42px] top-1 w-6 h-6 rounded-full border-4 border-white bg-blue-600 shadow-md ring-4 ring-blue-50" />
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 group hover:shadow-md transition-all">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {new Date(and.data_registro).toLocaleDateString('pt-BR')} — {new Date(and.data_registro).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <a href={calendarService.generateGoogleLink(`InovaSys: ${processo.numero_processo}`, and.data_registro, and.descricao)} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-all">Google Cal</a>
                                    </div>
                                </div>
                                <p className="text-sm font-bold text-slate-800 leading-relaxed">{and.descricao}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {activeTab === 'financeiro' && (
            <FinanceiroTab processoId={processId} organizationId={processo.organization_id || ''} />
          )}
        </div>
      </div>
    </div>
  );
}
