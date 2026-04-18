import React from 'react';
import { BarChart3, Search, Plus, LayoutList, LayoutGrid } from 'lucide-react';
import { MD3Card } from '../../presentation/ui/md3/MD3Card';

interface ProcessListHeaderProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  viewMode: 'list' | 'kanban';
  onViewChange: (mode: 'list' | 'kanban') => void;
  onNewProcess?: () => void;
}

export const ProcessListHeader: React.FC<ProcessListHeaderProps> = ({
  searchTerm,
  onSearchChange,
  viewMode,
  onViewChange,
  onNewProcess
}) => {
  return (
    <MD3Card variant="filled" className="flex flex-col lg:flex-row flex-wrap lg:items-center justify-between gap-6 !p-5 mb-6">
      <div className="flex items-center gap-4 shrink-0">
        <div className="w-12 h-12 bg-md-primary rounded-2xl flex items-center justify-center text-md-on-primary shadow-sm">
          <BarChart3 size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-md-on-surface tracking-tight">Painel de Processos</h2>
          <p className="text-[10px] text-md-on-surface-variant/70 font-bold uppercase tracking-[0.2em]">Gestão e Acompanhamento</p>
        </div>
      </div>

      <div className="flex flex-1 flex-wrap items-center gap-4 justify-end">
        <div className="relative w-full sm:w-auto sm:min-w-[240px] flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-surface-variant/50" size={18} />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 bg-md-surface border border-md-outline/10 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-md-primary/20 transition-all placeholder:text-md-on-surface-variant/40 text-md-on-surface shadow-sm"
            placeholder="Buscar processos..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex bg-md-surface-variant/30 p-1.5 rounded-full border border-md-outline/5 shrink-0">
          <button
            className={`p-2 rounded-full transition-all ${viewMode === 'list' ? 'bg-md-primary text-md-on-primary shadow-sm' : 'text-md-on-surface-variant/60 hover:text-md-on-surface hover:bg-md-surface-variant/50'}`}
            onClick={() => onViewChange('list')}
          >
            <LayoutList size={18} />
          </button>
          <button
            className={`p-2 rounded-full transition-all ${viewMode === 'kanban' ? 'bg-md-primary text-md-on-primary shadow-sm' : 'text-md-on-surface-variant/60 hover:text-md-on-surface hover:bg-md-surface-variant/50'}`}
            onClick={() => onViewChange('kanban')}
          >
            <LayoutGrid size={18} />
          </button>
        </div>

        {onNewProcess && (
          <button
            className="btn-md-primary shrink-0"
            onClick={onNewProcess}
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Novo Processo</span>
          </button>
        )}
      </div>
    </MD3Card>
  );
};
