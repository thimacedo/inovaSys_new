import React, { useRef, useEffect } from 'react';
import * as html2pdfModule from 'html2pdf.js';
import { useModal } from '../context/ModalContext';
import { signatureService } from '../services/signatureService';

const html2pdf = (html2pdfModule as any).default || html2pdfModule;

interface DocumentPreviewProps {
  html: string;
  fileName: string;
  onSignatureRequest?: (html: string) => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ html, fileName, onSignatureRequest }) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { showPrompt } = useModal();
  const [isGenerating, setIsGenerating] = React.useState(false);

  useEffect(() => {
    if (!contentRef.current) return;

    const handleEditableClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.classList && target.classList.contains('editable-field')) {
        const currentText = target.innerText;
        showPrompt('Editar Campo', 'Conteúdo do campo:', currentText, (newText) => {
          if (newText !== null) {
            target.innerText = newText;
          }
        }, 'text');
      }
    };

    const element = contentRef.current;
    element.addEventListener('click', handleEditableClick);

    return () => {
      element.removeEventListener('click', handleEditableClick);
    };
  }, [html]);

  const handleDownloadPDF = () => {
    if (!contentRef.current || isGenerating) return;
    
    setIsGenerating(true);
    const element = contentRef.current;
    
    // Create a clone to avoid freezing the UI and messing with the scroll container
    const clone = element.cloneNode(true) as HTMLElement;
    
    // Remove borders from editable fields in the clone
    const editables = clone.querySelectorAll('.editable-field');
    editables.forEach((el) => {
      (el as HTMLElement).style.borderBottom = 'none';
    });

    // Remove scroll and height restrictions from the clone
    clone.classList.remove('max-h-[70vh]', 'overflow-auto', 'shadow-inner', 'border', 'border-gray-200');
    clone.style.height = 'auto';
    clone.style.position = 'absolute';
    clone.style.left = '-9999px';
    clone.style.top = '0';
    clone.style.width = `${element.offsetWidth}px`; // maintain original width
    
    document.body.appendChild(clone);

    const opt: any = {
      margin: 10,
      filename: `${fileName}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 1.5, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(clone).save().then(() => {
      document.body.removeChild(clone);
      setIsGenerating(false);
    }).catch((err: any) => {
      console.error("Erro ao gerar PDF:", err);
      if (document.body.contains(clone)) {
        document.body.removeChild(clone);
      }
      setIsGenerating(false);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div 
        ref={contentRef}
        className="bg-white p-8 shadow-inner border border-gray-200 min-h-[600px] max-h-[70vh] overflow-auto text-black"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="flex justify-end gap-2">
        <button 
          onClick={() => {
            const closeBtn = document.querySelector('button[class*="hover:text-slate-700"]');
            if (closeBtn instanceof HTMLElement) closeBtn.click();
          }}
          className="bg-slate-200 text-slate-700 px-4 py-2 rounded hover:bg-slate-300 transition-colors font-semibold"
          disabled={isGenerating}
        >
          Fechar
        </button>
        <button 
          onClick={handleDownloadPDF}
          disabled={isGenerating}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Gerando PDF...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Baixar PDF
            </>
          )}
        </button>

        {onSignatureRequest && (
           <button 
             onClick={() => onSignatureRequest(contentRef.current?.innerHTML || html)}
             className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors flex items-center gap-2 font-semibold"
           >
             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"/><polygon points="18 2 22 6 12 16 8 16 8 12 18 2"/></svg>
             Enviar para Assinatura
           </button>
        )}
      </div>
    </div>
  );
};

export default DocumentPreview;
