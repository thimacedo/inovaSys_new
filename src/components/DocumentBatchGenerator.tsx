import React, { useState } from 'react';
import { FileText, Download, Loader2, RefreshCw, CheckCircle, XCircle, FileArchive } from 'lucide-react';
import { useDocumentBatch } from '../hooks/useDocumentBatch';
import { ProcessSelectorModal } from './ProcessSelectorModal';

interface Processo {
  id: string;
  numero: string;
  titulo: string;
  status: string;
  created_at: string;
}

interface DocumentBatchGeneratorProps {
  processos: Processo[];
}

export const DocumentBatchGenerator: React.FC<DocumentBatchGeneratorProps> = ({ processos }) => {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [selectedProcessos, setSelectedProcessos] = useState<Processo[]>([]);
  const [generateConsolidated, setGenerateConsolidated] = useState(true);
  
  const {
    job,
    loading,
    generate,
    downloadZip,
    reset,
    successCount,
    errorCount,
    isRunning,
    isCompleted,
  } = useDocumentBatch();

  const handleSelectConfirm = (selectedIds: string[]) => {
    const selected = processos.filter(p => selectedIds.includes(p.id));
    setSelectedProcessos(selected);
  };

  const handleGenerate = async () => {
    await generate(selectedProcessos, {
      generateConsolidated,
      concurrency: 3,
    });
  };

  const handleReset = () => {
    reset();
    setSelectedProcessos([]);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-4">
        <div className="flex items-center gap-3 text-white">
          <FileArchive className="w-6 h-6" />
          <div>
            <h3 className="font-bold text-lg">Geração de Documentos em Lote</h3>
            <p className="text-emerald-100 text-sm">Gere múltiplos PDFs de uma única vez</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {/* Estado inicial */}
        {!job && (
          <>
            <div className="space-y-4">
              <button
                onClick={() => setSelectorOpen(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                {selectedProcessos.length === 0 
                  ? 'Selecionar processos para geração' 
                  : `${selectedProcessos.length} processo(s) selecionado(s)`
                }
              </button>

              {selectedProcessos.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
                  {selectedProcessos.map(p => (
                    <div key={p.id} className="text-sm py-1.5 flex items-center gap-2 text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="font-mono text-xs bg-gray-200 px-1.5 py-0.5 rounded">{p.numero}</span>
                      <span className="truncate">{p.titulo}</span>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={generateConsolidated}
                  onChange={(e) => setGenerateConsolidated(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                Incluir relatório consolidado no pacote
              </label>

              <button
                onClick={handleGenerate}
                disabled={selectedProcessos.length === 0 || loading}
                className="w-full py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
                Gerar {selectedProcessos.length} Documentos
              </button>
            </div>
          </>
        )}

        {/* Em andamento */}
        {isRunning && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{job?.progress}%</div>
              <div className="text-gray-600">Processando documentos...</div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all duration-300 ease-out"
                style={{ width: `${job?.progress}%` }}
              />
            </div>

            <div className="flex justify-center gap-6 text-sm">
              <span className="flex items-center gap-1.5 text-green-600">
                <CheckCircle className="w-4 h-4" /> {successCount} concluídos
              </span>
              <span className="flex items-center gap-1.5 text-red-600">
                <XCircle className="w-4 h-4" /> {errorCount} erros
              </span>
            </div>
          </div>
        )}

        {/* Concluído */}
        {isCompleted && (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-bold text-xl text-gray-800">Geração Concluída!</h4>
              <p className="text-gray-600">
                {successCount} de {job?.total} documentos gerados com sucesso
                {errorCount > 0 && <span className="text-red-600"> ({errorCount} com erro)</span>}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={downloadZip}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Baixar Pacote ZIP
              </button>
              <button
                onClick={handleReset}
                className="px-5 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Novo Lote
              </button>
            </div>
          </div>
        )}
      </div>

      <ProcessSelectorModal
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        processos={processos}
        onConfirm={handleSelectConfirm}
        title="Selecionar Processos para Geração"
      />
    </div>
  );
};