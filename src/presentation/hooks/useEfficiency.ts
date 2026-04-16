import { useQuery } from '@tanstack/react-query';
import efficiencyService from '../../services/efficiencyService';

export const EFFICIENCY_KEY = 'efficiency_metrics';

export function useEfficiencyMetrics(organizationId?: string) {
  return useQuery({
    queryKey: [EFFICIENCY_KEY, organizationId],
    queryFn: () => efficiencyService.getGlobalMetrics(organizationId),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: true
  });
}
