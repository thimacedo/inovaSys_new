import React, { useRef, useState, useEffect } from 'react';
import * as html2pdfModule from 'html2pdf.js';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { auditService } from '../services/auditService';

const html2pdf = (html2pdfModule as any).default || html2pdfModule;

interface BatchDocumentPreviewProps {
  documents: { html: string; title: string }[];
  processNumber: string;
  processoId?: string;
}

export default function BatchDocumentPreview({ documents, processNumber, processoId }: BatchDocumentPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuthStore();

  useEffect(() => {
    if (processoId && currentUser) {
      auditService.registrarVisualizacao(
        `PACOTE_COMPLETO_${processNumber}`,
        processoId,
        currentUser.id
      );
    }
  }, [processoId, currentUser, processNumber]);

  const handleDownloadAll = () => {
    if (!containerRef.current || isGenerating) return;
    setIsGenerating(true);

    const element = containerRef.current;
    const opt: any = {
      margin: 10,
      filename: `PACOTE_COMPLETO_${processNumber}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 1.5, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      setIsGenerating(false);
    }).catch((err: any) => {
      console.error("Erro ao gerar PDF em lote:", err);
      setIsGenerating(false);
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
        <div className="p-2 bg-amber-100 text-amber-700 rounded-lg h-fit">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div>
          <h5 className="text-sm font-bold text-amber-900">Atenção ao Gerar Lote</h5>
          <p className="text-xs text-amber-800 leading-relaxed">
            Esta ação irá consolidar os 13 modelos de documentos em um único arquivo PDF. Verifique se os dados das partes e do árbitro estão atualizados antes de prosseguir.
          </p>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="bg-white p-8 border border-slate-200 shadow-inner max-h-[50vh] overflow-auto"
      >
        {documents.map((doc, idx) => (
          <div key={idx} className={idx > 0 ? "mt-12 pt-12 border-t-2 border-dashed border-slate-100" : ""}>
             <div className="mb-4 flex justify-between items-center text-slate-400 border-b border-slate-50 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest">{doc.title}</span>
                <span className="text-[10px] font-bold">Página {idx + 1}</span>
             </div>
             <div dangerouslySetInnerHTML={{ __html: doc.html }} />
             <div style={{ pageBreakAfter: 'always' }} />
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button 
          onClick={() => {
            const closeBtn = document.querySelector('button[class*="hover:text-slate-700"]');
            if (closeBtn instanceof HTMLElement) closeBtn.click();
          }}
          className="px-6 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl font-bold transition-all"
        >
          Cancelar
        </button>
        <button 
          onClick={handleDownloadAll}
          disabled={isGenerating}
          className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Gerando Pacote...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Baixar PDF Completo
            </>
          )}
        </button>
      </div>
    </div>
  );
}
