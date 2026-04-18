import React from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';

interface Template {
  id: string;
  nome: string;
  tipo_documento: number;
  conteudo_html: string;
}

interface TemplateSidebarProps {
  templates: Template[];
  selectedId?: string;
  onSelect: (t: Template) => void;
  loading: boolean;
}

export const TemplateSidebar: React.FC<TemplateSidebarProps> = ({ templates, selectedId, onSelect, loading }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-1">
        <div className="p-2.5 bg-md-primary/10 text-md-primary rounded-xl">
          <FileText size={22} />
        </div>
        <h3 className="text-lg font-black text-md-on-surface uppercase tracking-tight">Modelos de Atos</h3>
      </div>
      
      <div className="grid grid-cols-1 gap-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-14 bg-md-surface-variant/20 animate-pulse rounded-2xl" />
          ))
        ) : (
          templates.map(t => (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center justify-between group active:scale-95 ${
                selectedId === t.id 
                  ? 'bg-md-primary text-md-on-primary shadow-lg shadow-md-primary/20' 
                  : 'bg-md-surface border border-md-outline/10 text-md-on-surface-variant hover:border-md-primary/40 hover:bg-md-primary/5'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-black uppercase tracking-widest opacity-60">Tipo {t.tipo_documento}</span>
                <span className="text-sm font-bold line-clamp-1">{t.nome}</span>
              </div>
              <ChevronRight size={16} className={selectedId === t.id ? 'text-white' : 'text-md-outline opacity-0 group-hover:opacity-100 transition-all'} />
            </button>
          ))
        )}
      </div>
    </div>
  );
};
