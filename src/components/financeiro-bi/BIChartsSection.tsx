import React from 'react';
import { BarChart3, PieChart } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { MD3Card } from '../../presentation/ui/md3/MD3Card';

interface BIChartsSectionProps {
  barData: any;
  doughnutData: any;
}

export const BIChartsSection: React.FC<BIChartsSectionProps> = ({ barData, doughnutData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
      <MD3Card variant="filled" className="lg:col-span-2 !p-10 !bg-md-surface-variant/10">
        <div className="flex justify-between items-center mb-10">
          <h3 className="text-sm font-black text-md-on-surface uppercase tracking-[0.2em] flex items-center gap-3">
             <BarChart3 className="text-md-primary" size={20} />
             Receita Operacional (6 Meses)
          </h3>
        </div>
        <div className="h-[300px]">
          <Bar 
            data={barData} 
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, grid: { display: false } }, x: { grid: { display: false } } }
            }} 
          />
        </div>
      </MD3Card>

      <MD3Card variant="filled" className="!p-10 !bg-md-surface-variant/10 flex flex-col items-center">
        <h3 className="text-sm font-black text-md-on-surface uppercase tracking-[0.2em] mb-10 w-full text-left flex items-center gap-3">
           <PieChart className="text-md-tertiary" size={20} />
           Distribuição de Verba
        </h3>
        <div className="w-full max-w-[240px] flex-1 flex items-center">
          <Doughnut 
            data={doughnutData} 
            options={{ 
              cutout: '80%',
              plugins: { legend: { position: 'bottom', labels: { font: { weight: 'bold', size: 10, family: 'Roboto' }, padding: 20 } } }
            }} 
          />
        </div>
      </MD3Card>
    </div>
  );
};
