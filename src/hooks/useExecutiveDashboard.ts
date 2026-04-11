import { useState, useEffect } from 'react';
import { analyticsService, DashboardMetrics } from '../services/analyticsService';

interface UseExecutiveDashboardOptions {
  camaraId: string;
  dataInicio?: string;
  dataFim?: string;
}

export function useExecutiveDashboard({ camaraId, dataInicio, dataFim }: UseExecutiveDashboardOptions) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = async () => {
    if (!camaraId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getDashboardMetrics(camaraId, dataInicio, dataFim);
      setMetrics(data);
    } catch (err) {
      setError('Erro ao carregar métricas do dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camaraId, dataInicio, dataFim]);

  return { metrics, loading, error, refresh: loadMetrics };
}