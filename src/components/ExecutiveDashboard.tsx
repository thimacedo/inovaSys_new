import React, { useState } from 'react';
import { useExecutiveDashboard } from '../hooks/useExecutiveDashboard';
import { MetricCard } from './MetricCard';
import { ProcessStatusChart } from './ProcessStatusChart';
import { MonthlyEvolutionChart } from './MonthlyEvolutionChart';
import {
  Scale,
  Clock,
  DollarSign,
  AlertCircle,
  Loader2,
  Filter,
} from 'lucide-react';

interface ExecutiveDashboardProps {
  camaraId: string;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ camaraId }) => {
  const [periodo, setPeriodo] = useState<'30d' | '90d' | 'ano' | 'todos'>('90d');
  const { metrics, loading, error, refresh } = useExecutiveDashboard({
    camaraId,
    dataInicio: periodo === 'todos' ? undefined : getStartDate(periodo),
    dataFim: new Date().toISOString().split('T')[0],
  });

  function getStartDate(periodo: string): string {
    const hoje = new Date();
    if (periodo === '30d') hoje.setDate(hoje.getDate() - 30);
    else if (periodo === '90d') hoje.setDate(hoje.getDate() - 90);
    else if (periodo === 'ano') hoje.setFullYear(hoje.getFullYear() - 1);
    return hoje.toISOString().split('T')[0];
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error || 'Não foi possível carregar o dashboard.'}
        <button onClick={refresh} className="ml-4 underline">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho com filtros */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Executivo</h2>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value="30d">Últimos 30 dias</option>
            <option value="90d">Últimos 90 dias</option>
            <option value="ano">Último ano</option>
            <option value="todos">Todo período</option>
          </select>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Processos"
          value={metrics.totalProcessos}
          icon={Scale}
          color="blue"
        />
        <MetricCard
          title="Taxa de Congestionamento"
          value={metrics.taxaCongestionamento}
          icon={AlertCircle}
          color="amber"
        />
        <MetricCard
          title="Tempo Médio de Tramitação"
          value={metrics.tempoMedioDias}
          icon={Clock}
          color="green"
        />
        <MetricCard
          title="Valor Total Envolvido"
          value={metrics.valorTotalEnvolvido}
          icon={DollarSign}
          color="blue"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProcessStatusChart data={metrics.processosPorStatus} />
        <MonthlyEvolutionChart data={metrics.processosPorMes} />
      </div>

      {/* Tabela de Processos Recentes */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Processos Recentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Título</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {metrics.processosRecentes.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm">{p.numero}</td>
                  <td className="px-4 py-2 text-sm">{p.titulo}</td>
                  <td className="px-4 py-2 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      p.status === 'concluido' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-500">
                    {new Date(p.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};