import React, { useMemo } from 'react';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useFinanceiroByOrg } from '../presentation/hooks/useFinanceiro';
import { DollarSign, TrendingUp, ArrowDownRight, Calendar } from 'lucide-react';

// 🧩 Sub-módulos Modularizados (Material You MD3)
import { BIHeader } from './financeiro-bi/BIHeader';
import { BIMetricsGrid } from './financeiro-bi/BIMetricsGrid';
import { BIChartsSection } from './financeiro-bi/BIChartsSection';
import { BIRecentCashflow } from './financeiro-bi/BIRecentCashflow';

export default function FinanceiroBI() {
  const currentUser = useAuthStore(state => state.currentUser);
  const camaraId = currentUser?.organization_id || currentUser?.camara_id;
  const { data: rawData = [], isLoading, refetch } = useFinanceiroByOrg(camaraId);

  const processedData = useMemo(() => {
    // 1. Processamento por Mês (Últimos 6 meses)
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      months.push({ label: d.toLocaleString('pt-BR', { month: 'short' }), month: d.getMonth(), year: d.getFullYear(), total: 0 });
    }

    rawData.forEach(reg => {
      if (reg.status === 'Pago') {
        const d = new Date(reg.created_at || '');
        const idx = months.findIndex(m => m.month === d.getMonth() && m.year === d.getFullYear());
        if (idx !== -1) months[idx].total += Number(reg.valor);
      }
    });

    // 2. Distribuição por Tipo
    const dist = { Custa: 0, Hon_Arbitral: 0, Hon_Sucumbencia: 0 };
    rawData.forEach(reg => {
      const tipo = reg.tipo as keyof typeof dist;
      if (dist[tipo] !== undefined) dist[tipo] += Number(reg.valor);
    });

    const totalReceita = rawData.filter(d => d.status === 'Pago').reduce((acc, curr) => acc + Number(curr.valor), 0);
    const totalPendente = rawData.filter(d => d.status === 'Pendente').reduce((acc, curr) => acc + Number(curr.valor), 0);

    return {
      bar: { labels: months.map(m => m.label), datasets: [{ label: 'Receita', data: months.map(m => m.total), backgroundColor: '#6750A4', borderRadius: 12 }] },
      doughnut: { labels: ['Custas', 'Hon. Arbitrais', 'Sucumbência'], datasets: [{ data: [dist.Custa, dist.Hon_Arbitral, dist.Hon_Sucumbencia], backgroundColor: ['#006A60', '#6750A4', '#92400E'], borderWidth: 0 }] },
      stats: [
        { label: 'Receita Líquida', value: totalReceita, icon: DollarSign, color: 'emerald' },
        { label: 'Fluxo Pendente', value: totalPendente, icon: Calendar, color: 'blue' },
        { label: 'Ticket Médio', value: totalReceita / (rawData.length || 1), icon: TrendingUp, color: 'purple' },
        { label: 'Inadimplência', value: (totalPendente / (totalReceita + totalPendente || 1)) * 100, isPercent: true, icon: ArrowDownRight, color: 'red' },
      ],
      transactions: rawData.slice(0, 8)
    };
  }, [rawData]);

  if (isLoading && rawData.length === 0) return <div className="flex items-center justify-center py-40"><div className="w-12 h-12 border-4 border-md-surface-variant border-t-md-primary rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      
      <BIHeader onRefresh={refetch} loading={isLoading} />

      <BIMetricsGrid stats={processedData.stats} />

      <BIChartsSection barData={processedData.bar} doughnutData={processedData.doughnut} />

      <BIRecentCashflow transactions={processedData.transactions} />

    </div>
  );
}
