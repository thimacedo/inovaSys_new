import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DependencyRegistry } from '../../infrastructure/di/DependencyRegistry';

export const HISTORY_KEY = 'process_history';

export function useProcessHistory(processoId: string | undefined) {
  return useQuery({
    queryKey: [HISTORY_KEY, processoId],
    queryFn: async () => {
      if (!processoId) return [];
      return await DependencyRegistry.getHistoryRepository().listByProcesso(processoId);
    },
    enabled: !!processoId,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

export function useAddHistoryEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { processoId: string, titulo: string, tipo: 'sistema' | 'usuario' | 'externo', descricao?: string, autorId?: string }) => {
      return await DependencyRegistry.getHistoryRepository().addEntry(
        payload.processoId, 
        payload.titulo, 
        payload.tipo, 
        payload.descricao, 
        payload.autorId
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [HISTORY_KEY, variables.processoId] });
    }
  });
}
