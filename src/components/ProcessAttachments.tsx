import React, { useRef } from 'react';
import { useAttachments, useUploadAttachment, useDeleteAttachment } from '../presentation/hooks/useAttachments';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useSignature } from '../presentation/hooks/useExternalServices';
import { FileText, Trash2, Download, UploadCloud, Loader2, PenTool } from 'lucide-react';
import attachmentService from '../services/attachmentService';
import { useModal } from '../context/ModalContext';

export default function ProcessAttachments({ processoId }: { processoId: string }) {
  const { currentUser } = useAuthStore();
  const { data: attachments = [], isLoading } = useAttachments(processoId);
  const uploadMutation = useUploadAttachment();
  const deleteMutation = useDeleteAttachment();
  const { sendMutation } = useSignature(currentUser?.camara_id || undefined);
  const { showToast, showPrompt } = useModal();
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
       showToast("Erro ao baixar arquivo.", 'error');
    }
  };

  const handleSendToSignature = async (file: any) => {
    if (!file.nome_arquivo.toLowerCase().endsWith('.pdf')) {
      showToast("Apenas arquivos PDF podem ser enviados para assinatura.", 'attention');
      return;
    }

    showPrompt(
      "Enviar para Assinatura",
      "Informe o e-mail do signatário principal:",
      "",
      async (email) => {
        if (!email) return;
        try {
          showToast("Processando documento...", 'attention');
          
          // 1. Obter arquivo e converter para Base64
          const url = await attachmentService.getDownloadUrl(file.caminho_storage);
          const response = await fetch(url);
          const blob = await response.blob();
          
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = async () => {
            const base64data = (reader.result as string).split(',')[1];
            
            // 2. Enviar para provedor de assinatura
            await sendMutation.mutateAsync({
              documentKey: base64data,
              signers: [{ name: email.split('@')[0], email, documentation: '' }],
              apiToken: ''
            } as any);
            
            showToast("Documento enviado para assinatura!", 'success');
          };
        } catch (error: any) {
          showToast(`Erro na assinatura: ${error.message}`, 'error');
        }
      }
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Documentos e Evidências</h3>
          <p className="text-sm text-slate-500">Gestão de petições e provas do processo.</p>
        </div>
        <div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className={`flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-bold rounded-lg cursor-pointer hover:bg-slate-800 transition-colors ${uploadMutation.isPending ? 'opacity-50 pointer-events-none' : ''}`}>
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
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {((file.tamanho_bytes ?? 0) / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isPdf && (
                    <button onClick={() => handleSendToSignature(file)} disabled={sendMutation.isPending} className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Enviar para Assinatura Digital">
                      {sendMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <PenTool size={18} />}
                    </button>
                  )}
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
