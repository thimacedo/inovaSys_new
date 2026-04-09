import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DependencyRegistry } from '../../infrastructure/di/DependencyRegistry';
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
      
      const repo = DependencyRegistry.getProcessRepository();
      if (params) {
        return await repo.listWithPagination(params.page, params.pageSize, params.search);
      }
      
      const data = await repo.listByCamara(camaraId);
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
      return await DependencyRegistry.getProcessRepository().getById(id);
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<ProcessEntity>) => {
      return await DependencyRegistry.getProcessRepository().create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROCESSOS_QUERY_KEY] });
    }
  });
}

export function useDeleteProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await DependencyRegistry.getProcessRepository().delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROCESSOS_QUERY_KEY] });
    }
  });
}
