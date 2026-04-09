import React, { useRef } from 'react';
import { useAttachments, useUploadAttachment, useDeleteAttachment } from '../presentation/hooks/useAttachments';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { FileText, Trash2, Download, UploadCloud, Loader2 } from 'lucide-react';
import attachmentService from '../services/attachmentService';

export default function ProcessAttachments({ processoId }: { processoId: string }) {
  const { currentUser } = useAuthStore();
  const { data: attachments = [], isLoading } = useAttachments(processoId);
  const uploadMutation = useUploadAttachment();
  const deleteMutation = useDeleteAttachment();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser?.id) return;
    
    try {
      await uploadMutation.mutateAsync({ file, processoId, userId: currentUser.id });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error("[UI] Erro ao enviar anexo:", error);
    }
  };

  const handleDownload = async (path: string, fileName: string) => {
    try {
      const url = await attachmentService.getDownloadUrl(path);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("[UI] Erro ao baixar arquivo:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Documentos e Evidências</h3>
          <p className="text-sm text-slate-500">Faça o upload de petições, laudos e provas.</p>
        </div>
        <div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            id="file-upload" 
          />
          <label 
            htmlFor="file-upload" 
            className={`flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg cursor-pointer hover:bg-slate-800 transition-colors ${uploadMutation.isPending ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {uploadMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
            Anexar Arquivo
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-slate-400" size={24} />
        </div>
      ) : attachments.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          <FileText className="mx-auto text-slate-300 mb-2" size={32} />
          <p className="text-sm font-medium text-slate-500">Nenhum documento anexado a este processo.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {attachments.map((file) => (
            <div key={file.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded shadow-sm border border-slate-100">
                  <FileText className="text-blue-500" size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">{file.nome_arquivo}</p>
                  <p className="text-xs text-slate-400">
                    {file.tamanho_bytes ? (file.tamanho_bytes / 1024 / 1024).toFixed(2) + ' MB' : 'Desconhecido'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDownload(file.caminho_storage, file.nome_arquivo)}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Baixar Documento"
                >
                  <Download size={18} />
                </button>
                <button 
                  onClick={() => deleteMutation.mutate({ id: file.id, storagePath: file.caminho_storage })}
                  disabled={deleteMutation.isPending}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Excluir Documento"
                >
                  {deleteMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
