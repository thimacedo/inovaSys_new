import React, { useRef, useState } from 'react';
import { useAttachments, useUploadAttachment, useDeleteAttachment } from '../presentation/hooks/useAttachments';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useSignature } from '../presentation/hooks/useExternalServices';
import attachmentService from '../services/attachmentService';
import { ocrService } from '../services/ocrService';
import { pdfService } from '../services/pdfService';
import { aiService } from '../services/aiService';
import { auditService } from '../services/auditService';
import { useModal } from '../context/ModalContext';

// 🧩 Sub-módulos Modularizados (Material You MD3)
import { AttachmentDropzone } from './attachments/AttachmentDropzone';
import { AttachmentList } from './attachments/AttachmentList';

export default function ProcessAttachments({ processoId }: { processoId: string }) {
  const { currentUser } = useAuthStore();
  const { data: attachments = [], isLoading } = useAttachments(processoId);
  const uploadMutation = useUploadAttachment();
  const deleteMutation = useDeleteAttachment();
  const { sendMutation } = useSignature(currentUser?.camara_id || undefined);
  const { showToast, showConfirm, showModal } = useModal();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analyzingIds, setAnalyzingIds] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const isAdmin = ['gestor', 'admin', 'god'].includes(currentUser?.tipo_usuario?.toLowerCase() || '');

  // 🛠️ Handlers de Lógica
  const processFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) return showToast("Máximo 10MB.", 'attention');
    try {
      await uploadMutation.mutateAsync({ file, processoId, userId: currentUser?.id as string });
      showToast("Anexo enviado.", 'success');
    } catch (e) { showToast("Falha no upload.", 'error'); }
  };

  const handleAnalyzeFile = async (file: any) => {
    setAnalyzingIds(prev => [...prev, file.id]);
    try {
      showToast("Executando análise mecânica...", 'attention');
      const url = await attachmentService.getDownloadUrl(file.caminho_storage);
      const text = ocrService.isSupported(file.nome_arquivo) ? await ocrService.extractText(url) : await pdfService.extractText(url);
      
      if (text) {
        const techData = await aiService.extractMechanicalData(text);
        showModal("Análise de Dados IA", <div className="space-y-4 p-4"><pre className="text-[10px] bg-slate-900 text-emerald-400 p-4 rounded-xl overflow-auto">{JSON.stringify(techData, null, 2)}</pre></div>);
      }
    } catch (e: any) { showToast("Erro no processamento.", 'error'); }
    finally { setAnalyzingIds(prev => prev.filter(id => id !== file.id)); }
  };

  const handleView = async (path: string, name: string) => {
    const url = await attachmentService.getDownloadUrl(path);
    window.open(url, '_blank');
    if (currentUser?.id) auditService.registrarVisualizacao(`VIEW: ${name}`, processoId, currentUser.id);
  };

  const handleDelete = (file: any) => {
    showConfirm("Remover Anexo", `Excluir definitivamente ${file.nome_arquivo}?`, () => {
      deleteMutation.mutate({ id: file.id, storagePath: file.caminho_storage, processoId, userId: currentUser?.id as string, fileName: file.nome_arquivo });
      showToast("Removido.", 'success');
    });
  };

  return (
    <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* ☁️ Área de Upload MD3 */}
      <AttachmentDropzone 
        isDragging={isDragging}
        isPending={uploadMutation.isPending}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        onFileSelect={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }}
        fileInputRef={fileInputRef}
      />

      {/* 📂 Lista de Arquivos MD3 */}
      <AttachmentList 
        attachments={attachments}
        isLoading={isLoading}
        analyzingIds={analyzingIds}
        isAdmin={isAdmin}
        onAnalyze={handleAnalyzeFile}
        onView={handleView}
        onDownload={async (p, n) => { const url = await attachmentService.getDownloadUrl(p); const a = document.createElement('a'); a.href = url; a.download = n; a.click(); }}
        onDelete={handleDelete}
        onSendToSignature={(f) => sendMutation.mutate(f.id)}
      />

    </div>
  );
}
