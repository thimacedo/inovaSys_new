import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DependencyRegistry } from '../../infrastructure/di/DependencyRegistry';
import { CamaraEntity } from '../../infrastructure/database/repositories/CamaraRepository';

export const SETTINGS_KEY = 'camara_settings';
export const AUDIT_KEY = 'audit_logs';

export function useCamaraSettings(camaraId: string | undefined) {
  return useQuery({
    queryKey: [SETTINGS_KEY, camaraId],
    queryFn: async () => {
      if (!camaraId) return null;
      return await DependencyRegistry.getCamaraRepository().getById(camaraId);
    },
    enabled: !!camaraId,
    staleTime: 1000 * 60 * 30, // 30 minutos (configurações mudam raramente)
  });
}

export function useUpdateCamaraSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CamaraEntity> }) => {
      return await DependencyRegistry.getCamaraRepository().update(id, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_KEY, variables.id] });
      // Atualiza o localStorage para refletir a mudança no branding imediatamente (Logo/Nome)
      localStorage.removeItem('camara_config');
    }
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: [AUDIT_KEY],
    queryFn: async () => await DependencyRegistry.getAuditRepository().listAll(200),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}
