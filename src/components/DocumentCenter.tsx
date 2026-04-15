import React, { useState } from 'react';
import { documentService } from '../services/documentService';
import { Processo } from '../services/processService';
import DocumentPreview from './DocumentPreview';
import { Button } from '../presentation/ui/components/Button';
import { FileText, Eye, X } from 'lucide-react';

interface DocumentCenterProps {
  processo: Processo;
  arbitroNome?: string;
  camaraConfig: any;
}

export const DocumentCenter: React.FC<DocumentCenterProps> = ({ processo, arbitroNome, camaraConfig }) => {
  const [selectedDocType, setSelectedDocType] = useState<number | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);

  const documentTypes = [
    { id: 1, name: 'Autuação' },
    { id: 2, name: 'Termo de Apresentação' },
    { id: 3, name: '1ª Notificação Extrajudicial' },
    { id: 8, name: 'Sentença Arbitral' }
  ];

  const handlePreview = async (typeId: number) => {
    setIsCompiling(true);
    try {
      const now = new Date();
      const html = await documentService.compileHTML(typeId, {
        numero_processo: processo.numero_processo || '---',
        camara_nome: camaraConfig.nome || 'InovaSys',
        camara_cnpj: camaraConfig.cnpj || '00.000.000/0001-00',
        camara_endereco: camaraConfig.endereco || 'Endereço não cadastrado',
        camara_fone: camaraConfig.fone || '(00) 0000-0000',
        requerente_nome: processo.requerente_nome || '---',
        requerente_doc: processo.requerente_doc || '---',
        requerente_end: (processo as any).requerente_end || '---',
        requerido_nome: processo.requerido_nome || '---',
        requerido_doc: processo.requerido_doc || '---',
        requerido_end: (processo as any).requerido_end || '---',
        data_entrada: new Date(processo.created_at || '').toLocaleDateString('pt-BR'),
        dia: now.getDate().toString(),
        mes: now.toLocaleString('pt-BR', { month: 'long' }),
        ano: now.getFullYear().toString(),
        valor_causa: Number(processo.valor_causa || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        arbitro_nome: arbitroNome || 'Não designado',
        local_data: `${camaraConfig.cidade || 'Parnamirim'}/RN, ${now.toLocaleDateString('pt-BR')}`,
        data_audiencia: '__/__/____ às __:__',
        resumo_fatos: processo.resumo_fatos || '',
        sentenca_texto: (processo as any).sentenca_texto || 'Texto da sentença pendente.'
      });
      setPreviewHtml(html);
      setSelectedDocType(typeId);
    } catch (error) {
      console.error(error);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="space-y-6">
      {!previewHtml ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentTypes.map((doc) => (
            <div key={doc.id} className="p-6 bg-white border border-slate-200 rounded-[1.5rem] shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText size={20} />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handlePreview(doc.id)}
                  isLoading={isCompiling && selectedDocType === doc.id}
                  icon={Eye}
                >
                  Visualizar
                </Button>
              </div>
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{doc.name}</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Template Oficial</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="animate-in fade-in zoom-in duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Eye size={16} className="text-blue-600" />
              Pré-visualização do Documento
            </h3>
            <button onClick={() => setPreviewHtml(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900">
              <X size={20} />
            </button>
          </div>
          <DocumentPreview 
            html={previewHtml} 
            fileName={`${documentTypes.find(d => d.id === selectedDocType)?.name}_${processo.numero_processo}`} 
          />
        </div>
      )}
    </div>
  );
};
