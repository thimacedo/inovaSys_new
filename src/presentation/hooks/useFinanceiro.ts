import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeiroService } from '../../services/financeiroService';
import { FinanceiroEntity } from '../../infrastructure/database/repositories/FinanceiroRepository';
import { DependencyRegistry } from '../../infrastructure/di/DependencyRegistry';
import { HISTORY_KEY } from './useHistory';

export const FINANCEIRO_ORG_KEY = 'financeiro_org';
export const FINANCEIRO_PROCESS_KEY = 'financeiro_processo';

export function useFinanceiroByOrg(organizationId: string | undefined) {
  return useQuery({
    queryKey: [FINANCEIRO_ORG_KEY, organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      return await DependencyRegistry.getFinanceiroRepository().listByOrganization(organizationId);
    },
    enabled: !!organizationId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useFinanceiroByProcesso(processoId: string | undefined) {
  return useQuery({
    queryKey: [FINANCEIRO_PROCESS_KEY, processoId],
    queryFn: async () => {
      if (!processoId) return [];
      return await DependencyRegistry.getFinanceiroRepository().listByProcesso(processoId);
    },
    enabled: !!processoId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateFinanceiro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<FinanceiroEntity>) => await DependencyRegistry.getFinanceiroRepository().create(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [FINANCEIRO_ORG_KEY] });
      if (variables.processo_id) {
        queryClient.invalidateQueries({ queryKey: [FINANCEIRO_PROCESS_KEY, variables.processo_id] });
        
        // Registro automático no histórico do processo
        DependencyRegistry.getHistoryRepository().addEntry(
          variables.processo_id,
          'Lançamento financeiro',
          'usuario',
          `Novo registro de ${(variables.tipo as any)} no valor de R$ ${variables.valor}.`, // Cast para evitar erro de comparação
          variables.perfil_id
        ).then(() => {
          queryClient.invalidateQueries({ queryKey: [HISTORY_KEY, variables.processo_id] });
        });
      }
    }
  });
}

export function useUpdateFinanceiro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FinanceiroEntity> }) => 
      await DependencyRegistry.getFinanceiroRepository().update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [FINANCEIRO_ORG_KEY] });
      queryClient.invalidateQueries({ queryKey: [FINANCEIRO_PROCESS_KEY] });
      
      if (variables.data.processo_id) {
        DependencyRegistry.getHistoryRepository().addEntry(
          variables.data.processo_id,
          'Atualização financeira',
          'usuario',
          'Um registro financeiro vinculado a este processo foi atualizado.',
          variables.data.perfil_id
        ).then(() => {
          queryClient.invalidateQueries({ queryKey: [HISTORY_KEY, variables.data.processo_id] });
        });
      }
    }
  });
}
