import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Square, Check, AlertCircle } from 'lucide-react';

interface Processo {
  id: string;
  numero: string;
  titulo: string;
  status: string;
  created_at: string;
}

interface ProcessSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  processos: Processo[];
  onConfirm: (selectedIds: string[]) => void;
  title?: string;
}

export const ProcessSelectorModal: React.FC<ProcessSelectorModalProps> = ({
  isOpen,
  onClose,
  processos,
  onConfirm,
  title = 'Selecionar Processos',
}) => {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setSelected(new Set());
      setFilter('');
    }
  }, [isOpen]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filteredProcessos.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredProcessos.map(p => p.id)));
    }
  };

  const filteredProcessos = processos.filter(p => 
    p.numero.toLowerCase().includes(filter.toLowerCase()) ||
    p.titulo.toLowerCase().includes(filter.toLowerCase())
  );

  const handleConfirm = () => {
    onConfirm(Array.from(selected));
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Cabeçalho */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filtro */}
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Buscar por número ou título..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Ações em lote */}
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            {selected.size === filteredProcessos.length && filteredProcessos.length > 0 ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
            Selecionar todos
          </button>
          <span className="text-sm text-gray-500">
            {selected.size} de {filteredProcessos.length} selecionado(s)
          </span>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto max-h-[400px]">
          {filteredProcessos.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Nenhum processo encontrado
            </div>
          ) : (
            filteredProcessos.map((processo) => (
              <div
                key={processo.id}
                onClick={() => toggleSelect(processo.id)}
                className={`px-4 py-3 border-b border-gray-100 cursor-pointer transition-colors flex items-center gap-3 ${
                  selected.has(processo.id) ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                {selected.has(processo.id) ? (
                  <CheckSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                      {processo.numero}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      processo.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {processo.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 mt-1 truncate">{processo.titulo}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={selected.size === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Confirmar ({selected.size})
          </button>
        </div>
      </div>
    </div>
  );
};