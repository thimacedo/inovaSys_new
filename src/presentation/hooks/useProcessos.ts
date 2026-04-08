import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { processService } from '../../services/processService';
import { ProcessEntity } from '../../infrastructure/database/repositories/ProcessRepository';

export const PROCESSOS_QUERY_KEY = 'processos';

export function useProcessos(
  camaraId: string | undefined, 
  params?: { page: number, pageSize: number, search: string }
) {
  return useQuery({
    queryKey: [PROCESSOS_QUERY_KEY, camaraId, params],
    queryFn: async () => {
      if (!camaraId) return { data: [], count: 0 };
      
      // Se houver parâmetros de paginação/busca, usar getAll
      if (params) {
        return await processService.getAll(params.page, params.pageSize, params.search);
      }
      
      // Caso contrário, usar listByCamara legado (para casos de uso simples)
      const listFn = processService.listByCamara || (processService as any).getProcessosByCamara;
      const data = await listFn(camaraId);
      return { data, count: data.length };
    },
    enabled: !!camaraId,
    staleTime: 1000 * 60 * 5,
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
