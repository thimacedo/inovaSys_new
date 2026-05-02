import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProcessEntity as Processo } from '../infrastructure/database/repositories/ProcessRepository';
import { useModal } from '../context/ModalContext';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useProcessos, useDeleteProcess } from '../presentation/hooks/useProcessos';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';

// 🧩 Sub-módulos MD3
import { ProcessListHeader } from './process-list/ProcessListHeader';
import { ProcessTable } from './process-list/ProcessTable';
import { ProcessKanban } from './process-list/ProcessKanban';

export default function ProcessList({ onProcessSelect, onNewProcess }: { onProcessSelect: (id: string) => void, onNewProcess?: () => void }) {
  const { isAtLeastAdmin } = usePermissions();
  const currentUser = useAuthStore(state => state.currentUser);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { showConfirm } = useModal();
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [activeStatus, setActiveStatus] = useState<string>('Todos');

  const camaraId = currentUser?.organization_id || currentUser?.camara_id || undefined;

  const { data: queryResult, isLoading: loading, isError } = useProcessos(camaraId, {
    page: currentPage,
    pageSize: viewMode === 'kanban' ? 100 : pageSize,
    search: debouncedSearch
  });

  const processos = (queryResult?.data || []) as Processo[];
  const statuses = ['Todos', 'Protocolado', 'Em Andamento', 'Concluído', 'Arquivado'];
  
  const filteredProcessos = activeStatus === 'Todos'
    ? processos
    : processos.filter(p => (p.status || '').toLowerCase() === activeStatus.toLowerCase());

  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setCurrentPage(1);
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [searchTerm]);

  const deleteMutation = useDeleteProcess();

  const excluirProcesso = async (id: string) => {
    showConfirm(
      "Confirmar Exclusão",
      "A exclusão apagará permanentemente todos os dados vinculados a este processo. Confirma?",
      async () => {
        toast.promise(deleteMutation.mutateAsync(id), {
          loading: 'Excluindo processo...',
          success: 'Processo removido com sucesso!',
          error: 'Falha ao excluir processo.'
        });
      },
      "Excluir Permanentemente"
    );
  };

  if (isError) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4 bg-md-surface rounded-[32px] border border-rose-100 shadow-sm">
        <AlertCircle size={48} className="text-rose-500" />
        <h4 className="text-lg font-bold text-md-on-surface">Erro ao carregar processos</h4>
        <button onClick={() => window.location.reload()} className="text-xs font-bold text-md-primary underline">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 w-full max-w-full overflow-hidden pb-12">
      
      {/* 🏷️ Cabeçalho com Filtros (MD3) */}
      <ProcessListHeader 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewChange={setViewMode}
        onNewProcess={onNewProcess}
      />

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-md-surface rounded-[32px] border border-md-outline/5 shadow-sm overflow-hidden flex flex-col">
            
            {/* Filtros de Status em Pílulas MD3 */}
            <div className="p-5 border-b border-md-outline/5 flex flex-wrap items-center justify-between gap-4 bg-md-surface-variant/10">
              <div className="flex flex-wrap gap-2">
                {statuses.map(status => (
                  <button
                    key={status}
                    onClick={() => setActiveStatus(status)}
                    className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all ${
                      activeStatus === status 
                        ? 'bg-md-primary text-md-on-primary shadow-sm' 
                        : 'bg-md-surface text-md-on-surface-variant/70 border border-md-outline/10 hover:bg-md-surface-variant/30 hover:text-md-on-surface'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
              <span className="text-[10px] font-bold text-md-primary bg-md-primary/10 px-3 py-1.5 rounded-full uppercase tracking-wider">
                {filteredProcessos.length} registros
              </span>
            </div>

            {/* 🧾 Tabela de Processos */}
            <ProcessTable 
              processos={filteredProcessos}
              loading={loading}
              activeStatus={activeStatus}
              isAtLeastAdmin={isAtLeastAdmin}
              onSelect={onProcessSelect}
              onDelete={excluirProcesso}
            />

          </motion.div>
        ) : (
          /* 📋 Visualização Kanban */
          <ProcessKanban 
            processos={processos}
            loading={loading}
            onSelect={onProcessSelect}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
