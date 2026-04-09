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
      
      if (params) {
        return await processService.getAll(params.page, params.pageSize, params.search);
      }
      
      const listFn = processService.listByCamara || (processService as any).getProcessosByCamara;
      const data = await listFn(camaraId);
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
      const getFn = processService.getById || (processService as any).getProcessById;
      return await getFn(id);
    },
    enabled: !!id,
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
