import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { processService } from '../../services/processService';
import { ProcessEntity } from '../../infrastructure/database/repositories/ProcessRepository';

export const PROCESSOS_QUERY_KEY = 'processos';

export function useProcessos(camaraId: string | undefined) {
  return useQuery({
    queryKey: [PROCESSOS_QUERY_KEY, camaraId],
    queryFn: async () => {
      if (!camaraId) return [];
      // Suporte para o nome de método legado (listByCamara ou getProcessosByCamara)
      const listFn = processService.listByCamara || (processService as any).getProcessosByCamara;
      return await listFn(camaraId);
    },
    enabled: !!camaraId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useCreateProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ProcessEntity>) => {
      const createFn = processService.create || (processService as any).createProcess;
      return await createFn(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROCESSOS_QUERY_KEY] });
    },
    onError: (error) => {
      console.error('[Mutation Error] Falha ao criar processo:', error);
    }
  });
}
