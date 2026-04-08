import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeiroService } from '../../services/financeiroService';
import { FinanceiroEntity } from '../../infrastructure/database/repositories/FinanceiroRepository';

export const FINANCEIRO_ORG_KEY = 'financeiro_org';
export const FINANCEIRO_PROCESS_KEY = 'financeiro_processo';

export function useFinanceiroByOrg(organizationId: string | undefined) {
  return useQuery({
    queryKey: [FINANCEIRO_ORG_KEY, organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      return await financeiroService.listByOrganization(organizationId);
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
      return await financeiroService.listByProcesso(processoId);
    },
    enabled: !!processoId,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateFinanceiro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<FinanceiroEntity>) => await financeiroService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [FINANCEIRO_ORG_KEY] });
      if (variables.processo_id) {
        queryClient.invalidateQueries({ queryKey: [FINANCEIRO_PROCESS_KEY, variables.processo_id] });
      }
    }
  });
}

export function useUpdateFinanceiro() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<FinanceiroEntity> }) => 
      await financeiroService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FINANCEIRO_ORG_KEY] });
      queryClient.invalidateQueries({ queryKey: [FINANCEIRO_PROCESS_KEY] });
    }
  });
}
