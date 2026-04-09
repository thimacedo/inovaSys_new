import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProcessEntity as Processo } from '../infrastructure/database/repositories/ProcessRepository';
import { useModal } from '../context/ModalContext';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useProcessos, useDeleteProcess } from '../presentation/hooks/useProcessos';
import { toast } from 'sonner';
import {
  BarChart3,
  Search,
  Plus,
  LayoutList,
  LayoutGrid,
  Eye,
  Trash2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';
import { ProcessRowSkeleton } from '../presentation/ui/components/Skeleton';

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

  const camaraId = currentUser?.organization_id || currentUser?.camara_id;

  const { data: queryResult, isLoading: loading, isError } = useProcessos(camaraId, {
    page: currentPage,
    pageSize: pageSize,
    search: debouncedSearch
  });

  const processos = (queryResult?.data || []) as Processo[];
  const totalCount = queryResult?.count || 0;

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
      "A exclusão apagará TUDO relacionado a este processo. Esta ação não pode ser desfeita. Confirma?",
      async () => {
        const promise = deleteMutation.mutateAsync(id);

        toast.promise(promise, {
          loading: 'Excluindo processo...',
          success: 'Processo removido com sucesso!',
          error: 'Falha ao excluir processo.'
        });
      },
      "Excluir Permanentemente"
    );
  };

  const statusBadge = (status: string) => {
    if (status === 'Concluído') return 'bg-green-50 text-green-700 border-green-100';
    if (status === 'Suspenso') return 'bg-red-50 text-red-700 border-red-100';
    return 'bg-blue-50 text-blue-700 border-blue-100';
  };

  if (isError) {
    return (
      <div className="p-20 text-center flex flex-col items-center gap-4 bg-white rounded-2xl border border-red-100 shadow-sm">
        <AlertCircle size={48} className="text-red-500" />
        <h4 className="text-lg font-bold text-slate-900">Erro ao carregar processos</h4>
        <button onClick={() => window.location.reload()} className="text-xs font-bold text-blue-600 underline">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-500 w-full max-w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row flex-wrap lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <BarChart3 size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Painel de Processos</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Gestão e Acompanhamento</p>
          </div>
        </div>

        <div className="flex flex-1 flex-wrap items-center gap-3 justify-end">
          <div className="relative w-full sm:w-auto sm:min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
              placeholder="Buscar processos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setViewMode('list')}
            >
              <LayoutList size={16} />
            </button>
            <button
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setViewMode('kanban')}
            >
              <LayoutGrid size={16} />
            </button>
          </div>

          {onNewProcess && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 transition-all shadow-md flex items-center gap-2 uppercase tracking-wider shrink-0"
              onClick={onNewProcess}
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Novo</span>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processos Recentes</h4>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">{totalCount} REGISTROS</span>
            </div>

            {loading ? (
              <div className="divide-y divide-slate-50">
                {[...Array(5)].map((_, i) => <ProcessRowSkeleton key={i} />)}
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Processo</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quem participa</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Valor</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Situação</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {processos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <p className="text-sm font-bold text-slate-500">Nenhum processo encontrado</p>
                        </td>
                      </tr>
                    ) : (
                      processos.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                          <td className="px-6 py-5">
                            <span className="text-sm font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-xl border border-blue-100 shadow-sm">{p.numero_processo}</span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900">{(p as any).requerente_nome}</span>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{(p as any).requerido_nome}</span>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className="text-sm font-bold text-slate-700">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.valor_causa || 0)}</span>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${statusBadge(p.status || '')}`}>{p.status}</span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            <div className="flex justify-end gap-2">
                              <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" onClick={() => onProcessSelect(p.id)}><Eye size={18} /></button>
                              {isAtLeastAdmin && <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" onClick={() => excluirProcesso(p.id)}><Trash2 size={18} /></button>}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="kanban" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-6 overflow-x-auto pb-6 min-h-[600px] w-full max-w-full">
            {['Protocolado', 'Em Andamento', 'Concluído', 'Arquivado'].map(status => (
              <div key={status} className="flex-shrink-0 w-80 bg-slate-100/50 rounded-2xl border border-slate-200 p-4 flex flex-col gap-4">
                <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">{status}</h5>
                <div className="flex-1 space-y-3">
                  {loading ? [...Array(3)].map((_, i) => <ProcessRowSkeleton key={i} />) : processos.filter(p => p.status === status).map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => onProcessSelect(p.id)}>
                      <span className="text-[10px] font-mono font-bold text-blue-600 block mb-2">{p.numero_processo}</span>
                      <p className="text-sm font-bold text-slate-900 mb-1 line-clamp-1">{(p as any).requerente_nome}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase line-clamp-1">{(p as any).requerido_nome}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
