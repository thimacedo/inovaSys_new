import { useState } from 'react';
import { processService, Processo } from '../../services/processService';
import { documentService } from '../../services/documentService';
import { whatsappService } from '../../services/whatsappService';
import { useAddHistoryEntry } from './useHistory';
import { useModal } from '../../context/ModalContext';
import { isValidDoc } from '../../utils/validators';

export function useProcessActions(processo: Processo | null | undefined, refetch?: () => void) {
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showToast, showPrompt } = useModal();
  const addHistoryMutation = useAddHistoryEntry();

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
        arbitro_nome: processo.arbitro?.nome || 'Designação Pendente',
        camara_nome: localStorage.getItem('camara_config') ? JSON.parse(localStorage.getItem('camara_config')!).nome : 'InovaSys',
        resumo_fatos: processo.resumo_fatos || 'Sem resumo cadastrado.',
        data_hoje: new Date().toLocaleDateString('pt-BR')
      }, `Termo_Arbitragem_${processo.numero_processo}`);
      showToast('Download iniciado!', 'success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      showToast('Erro ao gerar documento: ' + message, 'error');
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  const handleWhatsApp = (nomeParte: string, tipo: 'requerente' | 'requerido') => {
    if (!processo) return;
    showPrompt(`Notificar ${tipo === 'requerente' ? 'Requerente' : 'Requerido'}`, `Confirme o número do WhatsApp de ${nomeParte} (apenas números com DDD):`, '', (phone) => {
      if (!phone || !processo) return;
      const msg = whatsappService.templates.avisoAndamento(nomeParte, processo.numero_processo || '', "Houve uma nova atualização no seu processo. Por favor, acesse o sistema.");
      whatsappService.enviarMensagem(phone, msg);
      showToast('WhatsApp aberto!', 'success');
    });
  };

  const handleAssignArbitrator = async (arbitroId: string) => {
    if (!processo || !arbitroId) return;
    setIsAssigning(true);
    try {
      await processService.assignArbitrator(processo.id, arbitroId);
      if (refetch) await refetch();
      showToast('Árbitro designado com sucesso!', 'success');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      showToast(message || 'Erro ao designar árbitro.', 'error');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleEditField = async (field: keyof Processo, label: string, currentValue: unknown) => {
    if (!processo) return;
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
        let finalValue: string | number = newValue;
        if (field === 'requerente_doc' || field === 'requerido_doc') {
          if (!isValidDoc(newValue)) { showToast('CPF ou CNPJ inválido.', 'attention'); return; }
          finalValue = newValue.replace(/\D/g, '');
        }
        if (maskType === 'money') {
          const vRaw = newValue.replace('R$ ', '').replace(/\./g, '').replace(',', '.').trim();
          finalValue = vRaw ? parseFloat(vRaw) : 0;
        }
        try {
          await processService.update(processo.id, { [field]: finalValue });
          if (refetch) await refetch();
          showToast(`${label} atualizado com sucesso!`, 'success');
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : 'Erro desconhecido';
          showToast(`Erro ao atualizar ${label}: ` + message, 'error');
        }
      }
    }, inputType, maskType, options);
  };

  const handleAddAndamento = async (descricao: string, autorId: string, onSuccess: () => void) => {
    if (!descricao.trim() || !processo) return;
    setSubmitting(true);
    try {
      await addHistoryMutation.mutateAsync({
        processoId: processo.id,
        titulo: 'Atualização do Processo',
        tipo: 'usuario',
        descricao: descricao,
        autorId: autorId
      });
      onSuccess();
      showToast('Andamento registrado com sucesso!', 'success');
    } catch (error) {
      showToast('Erro ao registrar andamento.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return {
    isGeneratingDoc,
    isAssigning,
    submitting,
    handleGerarTermo,
    handleWhatsApp,
    handleAssignArbitrator,
    handleEditField,
    handleAddAndamento
  };
}
