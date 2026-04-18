import React from 'react';
import { FileText, ScanText, PenTool, Eye, Download, Trash2, Loader2 } from 'lucide-react';
import { MD3Badge } from '../../presentation/ui/md3/MD3Badge';

interface AttachmentListProps {
  attachments: any[];
  isLoading: boolean;
  analyzingIds: string[];
  isAdmin: boolean;
  onAnalyze: (file: any) => void;
  onView: (path: string, name: string) => void;
  onDownload: (path: string, name: string) => void;
  onDelete: (file: any) => void;
  onSendToSignature: (file: any) => void;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  isLoading,
  analyzingIds,
  isAdmin,
  onAnalyze,
  onView,
  onDownload,
  onDelete,
  onSendToSignature
}) => {
  if (isLoading) return <div className="p-20 text-center text-md-on-surface-variant font-medium animate-pulse">Sincronizando arquivos...</div>;
  if (attachments.length === 0) return null;

  return (
    <div className="grid gap-4">
      {attachments.map((file) => {
        const isPdf = file.nome_arquivo.toLowerCase().endsWith('.pdf');
        return (
          <div key={file.id} className="flex items-center justify-between p-5 bg-md-surface rounded-[24px] border border-md-outline/5 hover:bg-md-surface-variant/10 transition-all group shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-md-primary/5 text-md-primary rounded-2xl">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-md-on-surface">{file.nome_arquivo}</p>
                <div className="flex items-center gap-2 mt-1">
                  {file.categoria && <MD3Badge label={file.categoria} variant="primary" className="!text-[8px] !px-2" />}
                  <p className="text-[10px] text-md-on-surface-variant/60 font-bold uppercase tracking-widest">
                    {((file.tamanho_bytes ?? 0) / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isAdmin && (
                <button onClick={() => onAnalyze(file)} disabled={analyzingIds.includes(file.id)} className="p-2 text-md-on-surface-variant/40 hover:text-md-primary transition-all" title="Análise IA">
                  {analyzingIds.includes(file.id) ? <Loader2 className="animate-spin" size={18} /> : <ScanText size={18} />}
                </button>
              )}
              {isPdf && (
                <button onClick={() => onSendToSignature(file)} className="p-2 text-md-on-surface-variant/40 hover:text-indigo-600 transition-all" title="Assinatura Gov.br">
                  <PenTool size={18} />
                </button>
              )}
              <button onClick={() => onView(file.caminho_storage, file.nome_arquivo)} className="p-2 text-md-on-surface-variant/40 hover:text-md-on-surface transition-all" title="Visualizar">
                <Eye size={18} />
              </button>
              <button onClick={() => onDownload(file.caminho_storage, file.nome_arquivo)} className="p-2 text-md-on-surface-variant/40 hover:text-md-primary transition-all" title="Baixar">
                <Download size={18} />
              </button>
              <button onClick={() => onDelete(file)} className="p-2 text-md-on-surface-variant/40 hover:text-rose-600 transition-all" title="Excluir">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
