import React from 'react';
import { useProcessHistory } from '../presentation/hooks/useHistory';
import { 
  CheckCircle2, 
  User, 
  Globe, 
  Clock, 
  MessageSquare, 
  FileText, 
  AlertCircle 
} from 'lucide-react';
import { motion } from 'motion/react';

export default function ProcessTimeline({ processoId }: { processoId: string }) {
  const { data: history = [], isLoading } = useProcessHistory(processoId);

  const getIcon = (tipo: string, titulo: string) => {
    const t = titulo.toLowerCase();
    if (t.includes('anexo') || t.includes('documento')) return <FileText size={16} />;
    if (t.includes('financeiro') || t.includes('pagamento')) return <AlertCircle size={16} />;
    if (tipo === 'sistema') return <CheckCircle2 size={16} />;
    if (tipo === 'externo') return <Globe size={16} />;
    return <User size={16} />;
  };

  const getColor = (tipo: string) => {
    if (tipo === 'sistema') return 'bg-blue-50 text-blue-600 border-blue-100';
    if (tipo === 'externo') return 'bg-purple-50 text-purple-600 border-purple-100';
    return 'bg-slate-50 text-slate-600 border-slate-100';
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reconstruindo linha do tempo...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
        <Clock className="mx-auto text-slate-200 mb-2" size={32} />
        <p className="text-sm text-slate-400 font-medium">Nenhum evento registrado neste processo.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-100 before:via-slate-100 before:to-transparent">
      {history.map((item, index) => (
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          key={item.id} 
          className="relative pl-12 group"
        >
          {/* Dot/Icon Container */}
          <div className={`absolute left-0 p-2.5 rounded-xl border-2 shadow-sm z-10 bg-white transition-all group-hover:scale-110 ${getColor(item.tipo)}`}>
            {getIcon(item.tipo, item.titulo)}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group-hover:border-blue-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-3">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.titulo}</h4>
              <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-50 px-2 py-1 rounded-lg flex items-center gap-1.5">
                <Clock size={10} />
                {new Date(item.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            {item.descricao && (
              <p className="text-sm text-slate-600 leading-relaxed mb-4">{item.descricao}</p>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
              <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400">
                {( (item.perfil as any)?.nome || 'S').charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Portado por: <span className="text-slate-600">{(item.perfil as any)?.nome || 'Sistema Automático'}</span>
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
