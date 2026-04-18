import React from 'react';
import { motion } from 'motion/react';
import { Clock, FileText, AlertCircle, CheckCircle2, Globe, User } from 'lucide-react';
import { MD3Card } from '../../presentation/ui/md3/MD3Card';

interface TimelineItemProps {
  item: any;
  index: number;
}

const getIcon = (tipo: string, titulo: string) => {
  const t = titulo.toLowerCase();
  if (t.includes('anexo') || t.includes('documento')) return <FileText size={18} />;
  if (t.includes('financeiro') || t.includes('pagamento')) return <AlertCircle size={18} />;
  if (tipo === 'sistema') return <CheckCircle2 size={18} />;
  if (tipo === 'externo') return <Globe size={18} />;
  return <User size={18} />;
};

const getTheme = (tipo: string) => {
  if (tipo === 'sistema') return 'bg-md-primary text-md-on-primary';
  if (tipo === 'externo') return 'bg-md-tertiary text-md-on-tertiary';
  return 'bg-md-secondary text-md-on-secondary';
};

export const TimelineItem: React.FC<TimelineItemProps> = ({ item, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5, ease: [0.2, 0, 0, 1] }}
      className="relative pl-14 mb-10 group"
    >
      {/* 🚀 Indicador Circular MD3 */}
      <div className={`absolute left-0 top-1 w-11 h-11 rounded-full flex items-center justify-center z-10 shadow-sm group-hover:scale-110 transition-transform duration-300 ${getTheme(item.tipo)}`}>
        {getIcon(item.tipo, item.titulo)}
      </div>

      <MD3Card variant="filled" className="!p-6 group-hover:!bg-md-surface-variant/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h4 className="text-sm font-black text-md-on-surface uppercase tracking-tight">{item.titulo}</h4>
          <div className="flex items-center gap-2 px-3 py-1 bg-md-surface-variant/50 rounded-full text-[10px] font-bold text-md-on-surface-variant/60 uppercase">
            <Clock size={12} />
            {new Date(item.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>

        {item.descricao && (
          <p className="text-base text-md-on-surface-variant leading-relaxed opacity-90 mb-6 font-medium">
            {item.descricao}
          </p>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-md-outline/5">
          <div className="w-8 h-8 rounded-full bg-md-primary-container text-md-on-primary-container flex items-center justify-center text-xs font-black">
            {((item as any).perfil?.nome || 'S').charAt(0).toUpperCase()}
          </div>
          <p className="text-[10px] font-bold text-md-on-surface-variant/40 uppercase tracking-[0.15em]">
            Movimentado por: <span className="text-md-primary">{(item as any).perfil?.nome || 'Sistema'}</span>
          </p>
        </div>
      </MD3Card>
    </motion.div>
  );
};
