import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyEvolutionChartProps {
  data: Array<{ mes: string; count: number }>;
}

export const MonthlyEvolutionChart: React.FC<MonthlyEvolutionChartProps> = ({ data }) => {
  const formattedData = data.map(item => {
    const [ano, mes] = item.mes.split('-');
    return {
      ...item,
      label: `${mes}/${ano}`,
    };
  });

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Evolução de Novos Processos</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" />
            <YAxis />
            <Tooltip formatter={(value) => `${value} processo(s)`} />
            <Line type="monotone" dataKey="count" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};