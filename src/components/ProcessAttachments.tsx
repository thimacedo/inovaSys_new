import React, { useRef } from 'react';
import { useAttachments, useUploadAttachment, useDeleteAttachment } from '../presentation/hooks/useAttachments';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useSignature } from '../presentation/hooks/useExternalServices';
import { FileText, Trash2, Download, UploadCloud, Loader2, PenTool, Eye, ScanText } from 'lucide-react';
import attachmentService from '../services/attachmentService';
import { ocrService } from '../services/ocrService';
import { pdfService } from '../services/pdfService';
import { aiService } from '../services/aiService';
import { financeService } from '../services/financeService';
import { auditService } from '../services/auditService';
import { useModal } from '../context/ModalContext';

/**
 * Componente principal para gestão, upload e análise técnica de anexos.
 * Integra OCR (Tesseract) e Extração de PDF (PDF.js) com IA Neutra.
 */
export default function ProcessAttachments({ processoId }: { processoId: string }) {
  const { currentUser } = useAuthStore();
  const { data: attachments = [], isLoading } = useAttachments(processoId);
  const uploadMutation = useUploadAttachment();
  const deleteMutation = useDeleteAttachment();
  const { sendMutation } = useSignature(currentUser?.camara_id || undefined);
  const { showToast, showPrompt, showModal } = useModal();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analyzingIds, setAnalyzingIds] = React.useState<string[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);

  /**
   * Abre o simulador de atualização financeira baseado nos dados extraídos.
   */
  const handleOpenCalculator = (techData: any) => {
    const valorBase = techData.valores?.[0] || 0;
    const dataExtraida = techData.datas?.[0] ? new Date(techData.datas[0]) : new Date();
    
    const calculation = financeService.calculateInterest(valorBase, dataExtraida, new Date());

    showModal(
      "Simulador de Atualização Financeira (Juros 1% a.m.)",
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Valor Original</p>
            <p className="text-lg font-black text-slate-700">{financeService.formatBRL(calculation.valorOriginal)}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-[10px] text-slate-400 font-black uppercase mb-1">Meses Transcorridos</p>
            <p className="text-lg font-black text-slate-700">{calculation.meses} Meses</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
            <p className="text-[10px] text-blue-400 font-black uppercase mb-1">Total de Juros (1% a.m.)</p>
            <p className="text-lg font-black text-blue-700">{financeService.formatBRL(calculation.valorJuros)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-100">
            <p className="text-[10px] text-green-400 font-black uppercase mb-1">Valor Atualizado</p>
            <p className="text-lg font-black text-green-700">{financeService.formatBRL(calculation.valorTotal)}</p>
          </div>
        </div>

        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
          <p className="text-[10px] text-amber-700 font-bold">
            * Referência: {calculation.referencia.inicio} até {calculation.referencia.fim}.
            O cálculo utiliza juros simples mensais conforme o Passo 3 do Roadmap.
          </p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => showToast("Dados prontos para o Termo de Arbitragem!", 'success')}
            className="flex-1 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all"
          >
            Usar na Liquidação
          </button>
        </div>
      </div>
    );
  };

  /**
   * Processa o arquivo selecionado para upload.
   * 
   * Args:
   *   file (File): O arquivo capturado pelo input ou drop.
   */
  const processFile = async (file: File) => {
    try {
      if (file.size > 10 * 1024 * 1024) {
        showToast("Arquivo muito grande (Máx 10MB).", 'attention');
        return;
      }
      const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
      if (!allowed.includes(file.type)) {
        showToast("Tipo não suportado (PDF, PNG, JPG).", 'attention');
        return;
      }

      await uploadMutation.mutateAsync({ file, processoId, userId: currentUser?.id as string });
      showToast("Anexo enviado com sucesso!", 'success');
    } catch (error) {
      console.error('[ProcessAttachments] Erro no upload:', error);
      showToast("Falha técnica ao realizar o upload do arquivo.", 'error');
    }
  };

  /**
   * Captura evento de mudança no input de arquivo.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /**
   * Gestão visual de Drag and Drop.
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  /**
   * Dispara a análise mecânica do arquivo via OCR ou Leitura de PDF.
   * 
   * Args:
   *   file (any): O objeto de arquivo vindo do banco (metadata).
   */
  const handleAnalyzeFile = async (file: any) => {
    setAnalyzingIds(prev => [...prev, file.id]);
    try {
      showToast("Iniciando análise técnica...", 'attention');

      const url = await attachmentService.getDownloadUrl(file.caminho_storage);
      let text = "";

      // Direcionamento do Motor de Extração
      if (ocrService.isSupported(file.nome_arquivo)) {
        showToast("Executando OCR na imagem...", 'attention');
        text = await ocrService.extractText(url);
      } else if (pdfService.isPDF(file.nome_arquivo)) {
        showToast("Extraindo texto nativo do PDF...", 'attention');
        text = await pdfService.extractText(url);
      } else {
        showToast("Formato não suportado para extração automática.", 'attention');
        return;
      }

      // Extração de Dados Técnicos via IA Neutra
      if (text) {
        showToast("Extraindo dados estruturados...", 'attention');
        const techData = await aiService.extractMechanicalData(text);

        if (techData && techData.tipo_documento) {
          await attachmentService.updateMetadata(file.id, {
            categoria: techData.tipo_documento,
            metadados_ia: techData
          });
          showToast(`Documento classificado: ${techData.tipo_documento}`, 'success');
        }

        showModal(
          "Análise de Dados Técnicos",
          <div className="space-y-4">
            <p className="text-xs text-slate-500">Dados técnicos identificados mecanicamente (Sujeito a conferência):</p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-[10px] overflow-auto max-h-60">
              <pre>{JSON.stringify(techData, null, 2)}</pre>
            </div>
            
            {techData.valores?.length > 0 && (
              <button 
                onClick={() => handleOpenCalculator(techData)}
                className="w-full py-3 bg-green-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200"
              >
                <ScanText size={16} />
                Calcular Atualização Financeira
              </button>
            )}

            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-[10px] text-red-600 font-black uppercase tracking-tighter">
                * Aviso: A IA atua como ferramenta mecânica. Revise antes de validar judicialmente.
              </p>
            </div>
          </div>
        );
      }
    } catch (error: any) {
      console.error('[ProcessAttachments] Falha na análise:', error);
      showToast("Erro técnico no processamento: " + error.message, 'error');
    } finally {
      setAnalyzingIds(prev => prev.filter(id => id !== file.id));
    }
  };

  const handleDownload = async (path: string, name: string) => {
    try {
      const url = await attachmentService.getDownloadUrl(path);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();

      // Registro de Auditoria (Passo 4 Roadmap 3.0)
      if (currentUser?.id) {
        auditService.registrarVisualizacao(`DOWNLOAD: ${name}`, processoId, currentUser.id);
      }
    } catch (e) {
      showToast("Erro ao baixar arquivo.", 'error');
    }
  };

  const handleView = async (path: string, name: string) => {
    try {
      const url = await attachmentService.getDownloadUrl(path);
      window.open(url, '_blank');

      // Registro de Auditoria (Passo 4 Roadmap 3.0)
      if (currentUser?.id) {
        auditService.registrarVisualizacao(`VISUALIZAÇÃO: ${name}`, processoId, currentUser.id);
      }
    } catch (e) {
      showToast("Erro ao visualizar arquivo.", 'error');
    }
  };

  const handleSendToSignature = async (file: any) => {
    try {
      await sendMutation.mutateAsync(file.id);
      showToast("Enviado para assinatura!", 'success');
    } catch (e) {
      showToast("Erro ao enviar para assinatura.", 'error');
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`bg-white rounded-[2rem] border-2 transition-all p-8 mt-6 ${
        isDragging ? 'border-blue-500 border-dashed bg-blue-50/50 scale-[1.01]' : 'border-slate-200 border-solid'
      }`}
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Documentos e Evidências</h3>
          <p className="text-sm text-slate-500 font-medium">Arraste arquivos ou use o botão para anexar provas.</p>
        </div>
        <div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className={`flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl cursor-pointer hover:bg-slate-800 transition-all shadow-lg ${uploadMutation.isPending ? 'opacity-50 pointer-events-none' : ''}`}>
            {uploadMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
            Anexar Arquivo
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" size={24} /></div>
      ) : attachments.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <FileText className="mx-auto text-slate-300 mb-2" size={32} />
          <p className="text-sm font-medium text-slate-500">Nenhum documento anexado.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {attachments.map((file) => {
            const isPdf = file.nome_arquivo.toLowerCase().endsWith('.pdf');
            return (
              <div key={file.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-500" size={20} />
                  <div>
                    <p className="text-sm font-bold text-slate-700">{file.nome_arquivo}</p>
                    <div className="flex items-center gap-2">
                      {file.categoria && (
                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-tighter">
                          {file.categoria}
                        </span>
                      )}
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        {((file.tamanho_bytes ?? 0) / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {['gestor', 'admin', 'god'].includes(currentUser?.tipo_usuario?.toLowerCase() || '') && (
                    <button
                      onClick={() => handleAnalyzeFile(file)}
                      disabled={analyzingIds.includes(file.id)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Analisar Conteúdo (OCR/IA)"
                    >
                      {analyzingIds.includes(file.id) ? <Loader2 className="animate-spin" size={18} /> : <ScanText size={18} />}
                    </button>
                  )}
                  {isPdf && (
                    <button onClick={() => handleSendToSignature(file)} disabled={sendMutation.isPending} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Enviar para Assinatura Digital">
                      {sendMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <PenTool size={18} />}
                    </button>
                  )}
                  <button onClick={() => handleView(file.caminho_storage, file.nome_arquivo)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Visualizar">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => handleDownload(file.caminho_storage, file.nome_arquivo)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Baixar">
                    <Download size={18} />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate({
                      id: file.id,
                      storagePath: file.caminho_storage,
                      processoId: processoId as string,
                      userId: currentUser?.id as string,
                      fileName: file.nome_arquivo
                    })}
                    disabled={deleteMutation.isPending}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
