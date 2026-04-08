import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useModal } from '../context/ModalContext';
import { Save, FileText, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { usePermissions } from '../hooks/usePermissions';

interface Template {
  id: string;
  nome: string;
  tipo_documento: number;
  conteudo_html: string;
}

export default function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useModal();
  const { isGlobalAdmin } = usePermissions();

  useEffect(() => {
    carregarTemplates();
  }, []);

  const carregarTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('templates_documentos')
        .select('*')
        .order('tipo_documento', { ascending: true });
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (e: any) {
      showToast('Erro ao carregar templates: ' + e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (t: Template) => {
    setSelectedTemplate(t);
    setEditContent(t.conteudo_html);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('templates_documentos')
        .update({ conteudo_html: editContent, updated_at: new Date().toISOString() })
        .eq('id', selectedTemplate.id);
      
      if (error) throw error;
      showToast('Template atualizado com sucesso!', 'success');
      carregarTemplates();
    } catch (e: any) {
      showToast('Erro ao salvar: ' + e.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const resetToDefault = () => {
     showToast('Funcionalidade de restauração em breve. Por enquanto, edite manualmente.', 'attention');
  };

  if (!isGlobalAdmin) {
    return (
      <div className="p-8 text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold">Acesso Negado</h2>
        <p className="text-slate-500">Apenas administradores globais podem gerenciar templates de documentos.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar: Lista de Templates */}
      <div className="lg:col-span-1 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="text-blue-600" size={24} />
          <h3 className="text-lg font-bold text-slate-800">Modelos</h3>
        </div>
        
        <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-xl" />
            ))
          ) : templates.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Nenhum template personalizado encontrado.</p>
          ) : (
            templates.map(t => (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${selectedTemplate?.id === t.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-400'}`}
              >
                <span className="text-xs font-bold line-clamp-1">{t.nome}</span>
                <ChevronRight size={14} className={selectedTemplate?.id === t.id ? 'text-white' : 'text-slate-300 opacity-0 group-hover:opacity-100'} />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="lg:col-span-3 space-y-6">
        {selectedTemplate ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[650px]"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10 rounded-t-2xl">
              <div>
                <h4 className="font-bold text-slate-900">{selectedTemplate.nome}</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Tipo: {selectedTemplate.tipo_documento}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={resetToDefault}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  Restaurar Original
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Salvando...' : (
                    <>
                      <Save size={14} />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-4 bg-slate-50">
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-4 flex gap-3">
                <AlertCircle size={18} className="text-blue-600 shrink-0" />
                <p className="text-[10px] text-blue-800 leading-tight">
                  <strong>Dica:</strong> Use as tags automáticas como <code>{`{requerente_nome}`}</code>, <code>{`{requerido_nome}`}</code> e <code>{`{numero_processo}`}</code> para personalização dinâmica. O suporte ao CKEditor será adicionado em breve.
                </p>
              </div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-[calc(100%-60px)] p-6 font-mono text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-inner"
                placeholder="Insira o HTML do modelo aqui..."
              />
            </div>
          </motion.div>
        ) : (
          <div className="h-[650px] flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400">
            <FileText size={64} className="mb-4 opacity-10" />
            <p className="font-medium">Selecione um modelo à esquerda para começar a editar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
