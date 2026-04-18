import React from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';

interface AttachmentDropzoneProps {
  isDragging: boolean;
  isPending: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export const AttachmentDropzone: React.FC<AttachmentDropzoneProps> = ({
  isDragging,
  isPending,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
  fileInputRef
}) => {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`bg-md-surface-variant/10 rounded-[32px] border-2 border-dashed transition-all p-10 text-center mb-8 ${
        isDragging ? 'border-md-primary bg-md-primary/5 scale-[1.01]' : 'border-md-outline/10'
      }`}
    >
      <UploadCloud size={48} className={`mx-auto mb-4 transition-colors ${isDragging ? 'text-md-primary' : 'text-md-on-surface-variant/30'}`} />
      <h4 className="text-sm font-bold text-md-on-surface mb-1">Upload de Provas e Documentos</h4>
      <p className="text-xs text-md-on-surface-variant opacity-60 mb-6">Arraste arquivos PDF, PNG ou JPG para anexar (Máx 10MB)</p>
      
      <input type="file" ref={fileInputRef} onChange={onFileSelect} className="hidden" id="file-upload-md" />
      <label 
        htmlFor="file-upload-md" 
        className={`rounded-full px-6 py-2.5 font-medium transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] active:scale-95 flex items-center justify-center gap-2 bg-md-primary text-md-on-primary hover:shadow-md hover:brightness-110 cursor-pointer inline-flex ${isPending ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {isPending ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
        Selecionar Arquivo
      </label>
    </div>
  );
};
