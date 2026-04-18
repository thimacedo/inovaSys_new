import React from 'react';
import { useProcessHistory } from '../presentation/hooks/useHistory';
import { Clock } from 'lucide-react';

// 🧩 Sub-módulos Modularizados (Material You MD3)
import { TimelineItem } from './timeline/TimelineItem';

export default function ProcessTimeline({ processoId }: { processoId: string }) {
  const { data: history = [], isLoading } = useProcessHistory(processoId);

  // 🛡️ Filtro de Unicidade (Evita Duplicatas por Reconexão)
  const uniqueHistory = history.filter((item, index, self) =>
    index === self.findIndex((t) => t.id === item.id)
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="w-12 h-12 border-4 border-md-surface-variant border-t-md-primary rounded-full animate-spin"></div>
        <p className="text-[11px] font-bold text-md-on-surface-variant uppercase tracking-[0.2em] opacity-60">Sincronizando Histórico...</p>
      </div>
    );
  }

  if (uniqueHistory.length === 0) {
    return (
      <div className="text-center py-24 border-2 border-dashed border-md-outline/10 rounded-[48px] bg-md-surface-variant/5">
        <Clock className="mx-auto text-md-on-surface-variant opacity-20 mb-4" size={48} />
        <p className="text-sm text-md-on-surface-variant font-bold uppercase tracking-widest opacity-40">Nenhum evento registrado.</p>
      </div>
    );
  }

  return (
    <div className="relative mt-8 pb-12">
      {/* 🧬 Linha Vertical Decorativa (Padrão MD3 Stepper) */}
      <div className="absolute left-[21px] top-4 bottom-0 w-0.5 bg-gradient-to-b from-md-primary/20 via-md-outline/10 to-transparent" />
      
      <div className="space-y-4">
        {uniqueHistory.map((item, index) => (
          <TimelineItem 
            key={item.id} 
            item={item} 
            index={index} 
          />
        ))}
      </div>
    </div>
  );
}
