import React, { useRef, useEffect, useState } from 'react';
import * as html2pdfModule from 'html2pdf.js';
import { useModal } from '../context/ModalContext';
import { useAI } from '../presentation/hooks/useExternalServices';
import { Bot, Download, PenTool, Loader2 } from 'lucide-react';

const html2pdf = (html2pdfModule as any).default || html2pdfModule;

interface DocumentPreviewProps {
  html: string;
  fileName: string;
  onSignatureRequest?: (html: string) => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ html, fileName, onSignatureRequest }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { showPrompt, showToast } = useModal();
  const [isGenerating, setIsGenerating] = useState(false);
  const { suggestMutation } = useAI();

  useEffect(() => {
    if (!contentRef.current) return;
    const handleEditableClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.classList && target.classList.contains('editable-field')) {
        const currentText = target.innerText;
        showPrompt('Editar Campo', 'Conteúdo:', currentText, (newText) => {
          if (newText !== null) target.innerText = newText;
        });
      }
    };
    contentRef.current.addEventListener('click', handleEditableClick);
    return () => contentRef.current?.removeEventListener('click', handleEditableClick);
  }, [html]);

  const handleAIHelp = async () => {
    showPrompt("Assistente IA Jurídica", "O que você deseja incluir ou alterar neste documento?", "", async (prompt) => {
      if (!prompt) return;
      try {
        const suggestion = await suggestMutation.mutateAsync({ contexto: fileName, prompt });
        showPrompt("Sugestão da IA", "Deseja utilizar este texto?", suggestion, (confirmedText) => {
          if (confirmedText && contentRef.current) {
            // Insere ao final do documento ou em cursor se possível
            contentRef.current.innerHTML += `<div class="p-4 bg-blue-50 border-l-4 border-blue-500 my-4">${confirmedText.replace(/\n/g, '<br/>')}</div>`;
          }
        }, 'textarea');
      } catch (error) {
        showToast("Erro ao contatar IA.", 'error');
      }
    });
  };

  const handleDownloadPDF = () => {
    if (!contentRef.current || isGenerating) return;
    setIsGenerating(true);
    const element = contentRef.current;
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.width = '800px';
    document.body.appendChild(clone);

    const opt = {
      margin: 10,
      filename: `${fileName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(clone).save().then(() => {
      document.body.removeChild(clone);
      setIsGenerating(false);
    });
  };

  return (
    <div className="flex flex-col gap-6 relative">
      <div 
        ref={contentRef}
        className="bg-white p-12 shadow-2xl border border-slate-200 min-h-[800px] max-h-[75vh] overflow-auto text-slate-800 leading-relaxed font-serif text-lg"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner">
        <div className="flex gap-2">
          <button 
            onClick={handleAIHelp}
            disabled={suggestMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-lg disabled:opacity-50"
          >
            {suggestMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Bot size={16} />}
            Assistente IA
          </button>
        </div>

        <div className="flex gap-2">
          <button onClick={handleDownloadPDF} disabled={isGenerating} className="flex items-center gap-2 px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
            {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            PDF
          </button>
          {onSignatureRequest && (
            <button onClick={() => onSignatureRequest(contentRef.current?.innerHTML || html)} className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg">
              <PenTool size={16} />
              Assinar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
