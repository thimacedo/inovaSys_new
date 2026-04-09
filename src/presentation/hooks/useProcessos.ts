import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import processService from '../../services/processService';
import historyService from '../../services/historyService';
import { ProcessEntity } from '../../infrastructure/database/repositories/ProcessRepository';

export const PROCESSOS_QUERY_KEY = 'processos';
const HISTORY_KEY = 'process_history';

export function useProcessos(
  camaraId: string | undefined, 
  params?: { page: number, pageSize: number, search: string }
) {
  return useQuery({
    queryKey: [PROCESSOS_QUERY_KEY, camaraId, params],
    queryFn: async () => {
      if (!camaraId) return { data: [], count: 0 };
      
      if (params) {
        return await processService.getAll(params.page, params.pageSize, params.search);
      }
      
      const data = await processService.listByCamara(camaraId);
      return { data, count: data.length };
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
      return await processService.getById(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ProcessEntity>) => {
      return await processService.create(data);
    },
    onSuccess: (newProcess) => {
      queryClient.invalidateQueries({ queryKey: [PROCESSOS_QUERY_KEY] });
      
      // Registo automático de protocolo no histórico
      if (newProcess?.id) {
        historyService.addEntry(
          newProcess.id,
          'Processo Protocolado',
          'sistema',
          'O processo foi registado com sucesso no sistema.',
          (newProcess as any).user_id || (newProcess as any).autor_id
        ).then(() => {
          queryClient.invalidateQueries({ queryKey: [HISTORY_KEY, newProcess.id] });
        });
      }
    }
  });
}

export function useDeleteProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await processService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROCESSOS_QUERY_KEY] });
    }
  });
}
