import React from 'react';
import { Building2, CreditCard, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { MD3Card } from '../../presentation/ui/md3/MD3Card';

interface PlatformMetricsProps {
  metrics: any;
}

export const PlatformMetrics: React.FC<PlatformMetricsProps> = ({ metrics }) => {
  const data = [
    { label: 'Câmaras Ativas', value: metrics?.contasAtivas || 0, icon: Building2, color: 'md-primary', trend: '+12%' },
    { label: 'MRR Global', value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(metrics?.totalMrr || 0), icon: CreditCard, color: 'md-tertiary', trend: '+8%' },
    { label: 'Participantes', value: '1.4k', icon: Users, color: 'md-secondary', trend: '+24%' },
    { label: 'Churn Rate', value: '1.2%', icon: TrendingUp, color: 'rose-500', trend: '-2%', negative: true }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {data.map((m, i) => (
        <MD3Card key={i} variant="filled" className="group">
          <div className="flex justify-between items-start">
            <div className={`p-3 rounded-2xl bg-md-surface-variant/50 text-md-on-surface group-hover:bg-md-primary group-hover:text-md-on-primary transition-all duration-500 shadow-sm`}>
              <m.icon size={22} />
            </div>
            <span className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-wider ${m.negative ? 'text-rose-600' : 'text-emerald-600'}`}>
              {m.negative ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
              {m.trend}
            </span>
          </div>
          <div className="mt-6">
            <p className="text-[10px] font-black text-md-on-surface-variant/50 uppercase tracking-[0.2em]">{m.label}</p>
            <h4 className="text-3xl font-black text-md-on-surface mt-1 tracking-tight">{m.value}</h4>
          </div>
        </MD3Card>
      ))}
    </div>
  );
};
