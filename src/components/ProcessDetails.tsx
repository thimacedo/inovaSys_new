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
import { Clock, ExternalLink, FileText, Download } from 'lucide-react';

export default function ProcessDetails({ processId, onBack }: { processId: string, onBack: () => void }) {
  if (!processId) return null;
  const currentUser = useAuthStore((state) => state.currentUser);
  
  // TanStack Query Hook
  const { data: processo, isLoading: loading, isError } = useProcesso(processId);
  const addHistoryMutation = useAddHistoryEntry();

  const [arbitros, setArbitros] = useState<any[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [activeTab, setActiveTab] = useState('resumo');
  const [novoAndamento, setNovoAndamento] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { showToast, showPrompt } = useModal();

  const isAdmin = ['gestor', 'admin', 'god'].includes(currentUser?.tipo_usuario?.toLowerCase() || '');
  const canEditProcess = isAdmin || (processo && processo.arbitro_id === currentUser?.id);

  useEffect(() => {
    if (isAdmin) {
      carregarArbitros();
    }
  }, [isAdmin]);

  const carregarArbitros = async () => {
    if (!isAdmin) return;
    try {
      const data = await userService.getArbitrosDisponiveis();
      setArbitros(data);
    } catch (e) {
      console.error('Erro ao carregar árbitros:', e);
    }
  };

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
    showToast('Gerando PDF...', 'attention');
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
      await processService.assignArbitrator(processo.id, arbitroId);
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
            <button onClick={handleGerarTermo} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center gap-2 uppercase tracking-wider">
                <Download size={18} />
                Gerar Termo
            </button>
            <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2" onClick={onBack}>
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
                  {arbitros.map(a => <option key={a.id} value={a.id}>{a.nome} ({a.email})</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="border-b border-slate-100 bg-slate-50/50">
          <div className="flex overflow-x-auto no-scrollbar">
            {['resumo', 'partes', 'fatos', 'anexos', 'historico', 'financeiro'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-5 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex-shrink-0 ${activeTab === tab ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {activeTab === 'resumo' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group">
                {canEditProcess && <button onClick={() => handleEditField('numero_processo', 'Número do Processo', processo.numero_processo)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"><ExternalLink size={14} /></button>}
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Protocolo Oficial</span>
                <p className="text-lg font-black text-slate-900">{processo.numero_processo}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group">
                {canEditProcess && <button onClick={() => handleEditField('status', 'Situação do Processo', processo.status)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"><ExternalLink size={14} /></button>}
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Instância Atual</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <p className="text-lg font-black text-slate-900 uppercase">{processo.status || 'Não Informado'}</p>
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group">
                {canEditProcess && <button onClick={() => handleEditField('valor_causa', 'Valor da Causa', processo.valor_causa)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"><ExternalLink size={14} /></button>}
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Valor em Disputa</span>
                <p className="text-lg font-black text-blue-600">{Number(processo.valor_causa || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
              </div>
            </div>
          )}

          {activeTab === 'partes' && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {['requerente', 'requerido'].map((tipo) => (
                  <div key={tipo} className="space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${tipo === 'requerente' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                         {tipo}
                       </h3>
                       <button onClick={() => handleWhatsApp(processo[`${tipo}_nome` as keyof Processo] as string, tipo as any)} className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-all">Notificar via WhatsApp</button>
                    </div>
                    <div className="space-y-4">
                       {[
                         { field: `${tipo}_nome`, label: 'Nome Completo' },
                         { field: `${tipo}_doc`, label: 'CPF/CNPJ' },
                         { field: `${tipo}_email`, label: 'E-mail Oficial' },
                         { field: `${tipo}_fone`, label: 'Telefone' }
                       ].map((item) => (
                         <div key={item.field} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                           {canEditProcess && <button onClick={() => handleEditField(item.field as any, item.label, processo[item.field as keyof Processo])} className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all"><ExternalLink size={12} /></button>}
                           <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{item.label}</span>
                           <p className="text-sm font-bold text-slate-700">{processo[item.field as keyof Processo] || '---'}</p>
                         </div>
                       ))}
                    </div>
                  </div>
                ))}
             </div>
          )}

          {activeTab === 'fatos' && (
            <div className="space-y-6 relative group">
              {canEditProcess && <button onClick={() => handleEditField('resumo_fatos', 'Resumo dos Fatos', processo.resumo_fatos)} className="absolute -top-2 -right-2 p-3 bg-white border border-slate-200 text-blue-600 rounded-2xl shadow-lg hover:scale-110 transition-all z-10"><ExternalLink size={20} /></button>}
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <FileText size={18} className="text-blue-600" />
                  Memorial Descritivo dos Fatos
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{processo.resumo_fatos || 'Nenhum relato detalhado disponível para este protocolo.'}</p>
              </div>
            </div>
          )}

          {activeTab === 'anexos' && (
            <ProcessAttachments processoId={processId} />
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

                <ProcessTimeline processoId={processId} />
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
