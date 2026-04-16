import React, { useState, useEffect } from 'react';
import { documentService } from '../services/documentService';
import { Processo } from '../services/processService';
import { signatureService } from '../services/signatureService';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useModal } from '../context/ModalContext';
import DocumentPreview from './DocumentPreview';
import { Button } from '../presentation/ui/components/Button';
import { FileText, Eye, X, ShieldCheck } from 'lucide-react';

interface DocumentCenterProps {
  processo: Processo;
  arbitroNome?: string;
  camaraConfig: any;
}

export const DocumentCenter: React.FC<DocumentCenterProps> = ({ processo, arbitroNome, camaraConfig }) => {
  const { showToast } = useModal();
  const currentUser = useAuthStore(state => state.currentUser);
  const [selectedDocType, setSelectedDocType] = useState<number | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [assinaturas, setAssinaturas] = useState<any[]>([]);

  const documentTypes = [
    { id: 1, name: 'Autuação' },
    { id: 2, name: 'Termo de Apresentação' },
    { id: 3, name: '1ª Notificação Extrajudicial' },
    { id: 8, name: 'Sentença Arbitral' }
  ];

  const carregarAssinaturas = async () => {
    try {
      const data = await signatureService.getAssinaturasByProcesso(processo.id);
      setAssinaturas(data);
    } catch (e) {
      console.error('Erro ao carregar assinaturas:', e);
    }
  };

  useEffect(() => {
    carregarAssinaturas();
  }, [processo.id]);

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
      showToast('Erro ao compilar documento.', 'error');
    } finally {
      setIsCompiling(false);
    }
  };

  const handleSign = async (htmlFinal: string) => {
    if (!currentUser || !selectedDocType) return;
    setIsSigning(true);
    try {
      const docName = documentTypes.find(d => d.id === selectedDocType)?.name || 'Documento';
      await signatureService.assinarDocumento({
        processoId: processo.id,
        documentoTipo: selectedDocType,
        nomeDocumento: docName,
        htmlFinal,
        signatarioId: currentUser.id,
        signatarioNome: currentUser.nome || 'Usuário'
      });
      showToast('Documento assinado com sucesso!', 'success');
      setPreviewHtml(null);
      carregarAssinaturas();
    } catch (error: any) {
      showToast('Erro ao assinar: ' + error.message, 'error');
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <div className="space-y-10">
      {!previewHtml ? (
        <>
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

          {assinaturas.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldCheck size={14} />
                Histórico de Assinaturas Digitais
              </h3>
              <div className="bg-slate-50 rounded-[2rem] border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="px-6 py-3 font-black uppercase text-slate-400">Documento</th>
                      <th className="px-6 py-3 font-black uppercase text-slate-400">Assinado por</th>
                      <th className="px-6 py-3 font-black uppercase text-slate-400">Data/Hora</th>
                      <th className="px-6 py-3 font-black uppercase text-slate-400">Integridade (Hash)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assinaturas.map((ass) => (
                      <tr key={ass.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-6 py-4 font-bold text-slate-700">{ass.nome_documento}</td>
                        <td className="px-6 py-4 font-medium text-slate-600">{ass.signatario_nome}</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(ass.created_at).toLocaleString('pt-BR')}</td>
                        <td className="px-6 py-4 font-mono text-[10px] text-emerald-600">{ass.hash_assinatura}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
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
            processoId={processo.id}
            onSignatureRequest={handleSign}
          />
        </div>
      )}
    </div>
  );
};
