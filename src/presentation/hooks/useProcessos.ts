import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import processService from '../../services/processService';
import historyService from '../../services/historyService';
import { ProcessEntity } from '../../infrastructure/database/repositories/ProcessRepository';

// Interface de notificação para desacoplamento de UI
interface Notify {
  show: (title: string, message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
}

const toast: Notify = (window as any).toastManager || { show: console.log };

export const PROCESSOS_QUERY_KEY = 'processos';

export function useProcessos(
  camaraId: string | undefined, 
  params?: { page: number, pageSize: number, search: string }
) {
  return useQuery({
    queryKey: [PROCESSOS_QUERY_KEY, camaraId, params],
    queryFn: async () => {
      if (!camaraId) return { data: [], count: 0 };
      try {
        if (params) {
          return await processService.getAll(camaraId, params.page, params.pageSize, params.search);
        }
        const data = await processService.listByCamara(camaraId);
        return { data, count: data.length };
      } catch (error: any) {
        toast.show('Erro de Carregamento', 'Não foi possível listar os processos.', 'error');
        throw error;
      }
    },
    enabled: !!camaraId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProcesso(id: string | undefined) {
  return useQuery({
    queryKey: [PROCESSOS_QUERY_KEY, 'detail', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        return await processService.getById(id);
      } catch (error: any) {
        toast.show('Erro de Carregamento', 'Falha ao buscar detalhes do processo.', 'error');
        throw error;
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ProcessEntity>) => processService.create(data),
    onSuccess: (newProcess) => {
      queryClient.invalidateQueries({ queryKey: [PROCESSOS_QUERY_KEY] });
      toast.show('Sucesso', 'Novo processo protocolado com sucesso.', 'success');
      
      // Automação de Timeline (Auditoria)
      historyService.addEntry(
        newProcess.id,
        'Processo Protocolado',
        'sistema',
        'Protocolo inicial efetuado. Sistema de LegalOps ativado.',
        newProcess.autor_id || undefined
      );
    },
    onError: (error: any) => {
      toast.show('Erro no Protocolo', error.message || 'Falha ao criar processo.', 'error');
    }
  });
}

export function useUpdateProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<ProcessEntity> }) => 
      processService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PROCESSOS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [PROCESSOS_QUERY_KEY, 'detail', variables.id] });
      toast.show('Atualizado', 'Processo atualizado com sucesso.', 'info');
    },
    onError: (error: any) => {
      toast.show('Erro na Atualização', error.message || 'Falha ao atualizar dados.', 'error');
    }
  });
}

export function useDeleteProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => processService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROCESSOS_QUERY_KEY] });
      toast.show('Excluído', 'Processo removido permanentemente.', 'warning');
    },
    onError: (error: any) => {
      toast.show('Erro na Exclusão', error.message || 'Falha ao deletar processo.', 'error');
    }
  });
}

