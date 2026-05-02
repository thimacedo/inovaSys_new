import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { MD3Card } from '../../presentation/ui/md3/MD3Card';

interface BIMetricsGridProps {
  stats: any[];
}

export const BIMetricsGrid: React.FC<BIMetricsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((s, idx) => (
        <MD3Card 
          key={idx}
          variant="elevated"
          className="group hover:!bg-md-primary hover:!text-md-on-primary transition-all duration-500"
        >
           <div className={`p-3.5 rounded-2xl w-fit mb-6 shadow-sm bg-md-surface-variant/50 group-hover:bg-white/20 group-hover:text-white transition-colors`}>
              <s.icon size={22} />
           </div>
           <p className="text-[10px] font-black text-md-on-surface-variant/50 group-hover:text-white/50 uppercase tracking-[0.2em] mb-2">{s.label}</p>
           <h4 className="text-2xl font-black text-md-on-surface group-hover:text-white tracking-tight">
             {s.isPercent ? `${s.value.toFixed(1)}%` : `R$ ${s.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
           </h4>
           <div className="mt-5 flex items-center gap-1.5 text-[10px] font-black group-hover:text-white/80 text-emerald-600 transition-colors uppercase tracking-widest">
              {s.color === 'red' ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
              <span>Tendência Estável</span>
           </div>
        </MD3Card>
      ))}
    </div>
  );
};
