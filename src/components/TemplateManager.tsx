import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useModal } from '../context/ModalContext';
import { usePermissions } from '../hooks/usePermissions';
import { aiService } from '../services/aiService';
import { AlertCircle, FileText } from 'lucide-react';

// 🧩 Sub-módulos Modularizados (Material You MD3 - Friendly View)
import { TemplateSidebar } from './template-manager/TemplateSidebar';
import { VisualTemplateEditor } from './template-manager/VisualTemplateEditor';
import { IATemplateAssistant } from './template-manager/IATemplateAssistant';

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
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  // 🟢 Estado do modo de visualização elevado para controle da injeção de IA
  const [viewMode, setViewMode] = useState<'friendly' | 'code'>('friendly');
  
  const { showToast } = useModal();
  const { isGlobalAdmin } = usePermissions();

  useEffect(() => { carregarTemplates(); }, []);

  const carregarTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('templates_documentos').select('*').order('tipo_documento', { ascending: true });
      if (error) throw error;
      setTemplates(data || []);
    } catch (e: any) { showToast('Erro ao carregar modelos.', 'error'); } finally { setLoading(false); }
  };

  const handleSelectTemplate = (t: Template) => {
    setSelectedTemplate(t);
    setEditContent(t.conteudo_html);
    // Ao trocar de template, voltamos para o modo amigável por padrão para evitar sustos com código
    setViewMode('friendly');
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setIsSaving(true);
    try {
      const { error } = await supabase.from('templates_documentos').update({ conteudo_html: editContent, updated_at: new Date().toISOString() }).eq('id', selectedTemplate.id);
      if (error) throw error;
      showToast('Modelo publicado!', 'success');
      carregarTemplates();
    } catch (e: any) { showToast('Erro ao salvar.', 'error'); } finally { setIsSaving(false); }
  };

  // 🤖 Função de tratamento de erro aprimorada para IA
  const handleAiAssist = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      const resp = await aiService.suggestClausula(editContent, aiPrompt);
      if (!resp) throw new Error("A IA retornou uma resposta vazia ou inválida.");
      setAiResponse(resp as string);
    } catch (e: any) { 
      console.error('[ERRO IA DETALHADO]:', e);
      const errorMsg = e.message || (typeof e === 'string' ? e : 'Falha na conexão com o cérebro da IA.');
      showToast(`[ERRO IA]: ${errorMsg}`, 'error'); 
    } finally { 
      setIsAiLoading(false); 
    }
  };

  // 🧹 Função robusta para limpar HTML antes da injeção no modo amigável
  const stripHtml = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.innerText || div.textContent || "";
  };

  if (!isGlobalAdmin) return (
    <div className="p-20 text-center bg-md-surface rounded-[48px] border border-md-outline/10 animate-in zoom-in duration-500">
      <AlertCircle size={64} className="text-rose-500 mx-auto mb-6 opacity-20" />
      <h2 className="text-2xl font-black text-md-on-surface uppercase tracking-tight">Acesso Institucional Restrito</h2>
      <p className="text-md-on-surface-variant font-medium mt-2">Apenas Administradores Globais podem gerenciar Atos Processuais.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 animate-in fade-in duration-700 pb-20">
      
      {/* 📂 Navegação de Modelos (3 colunas) */}
      <div className="xl:col-span-3">
        <TemplateSidebar 
          templates={templates} 
          selectedId={selectedTemplate?.id} 
          onSelect={handleSelectTemplate} 
          loading={loading} 
        />
      </div>

      {/* 📄 Visual Editor (6 colunas) */}
      <div className="xl:col-span-6">
        {selectedTemplate ? (
          <VisualTemplateEditor 
            template={selectedTemplate}
            content={editContent}
            setContent={setEditContent}
            onSave={handleSave}
            isSaving={isSaving}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onReset={() => showToast("Funcionalidade em desenvolvimento.", "attention")}
          />
        ) : (
          <div className="h-[700px] flex flex-col items-center justify-center bg-md-surface-variant/10 border-2 border-dashed border-md-outline/10 rounded-[48px] text-md-on-surface-variant/30 gap-4">
            <FileText size={80} strokeWidth={1} />
            <p className="text-sm font-bold uppercase tracking-[0.2em]">Selecione um ato para editar</p>
          </div>
        )}
      </div>

      {/* ✨ AI Copilot (3 colunas) */}
      <div className="xl:col-span-3">
        <IATemplateAssistant 
          prompt={aiPrompt}
          setPrompt={setAiPrompt}
          onAsk={handleAiAssist}
          loading={isAiLoading}
          response={aiResponse}
          onInsert={() => { 
            // 🛡️ Garante que se estivermos no modo amigável, o conteúdo inserido seja texto puro
            const contentToInsert = viewMode === 'friendly' ? stripHtml(aiResponse) : aiResponse;
            setEditContent(prev => prev + "\n" + contentToInsert); 
            setAiResponse(''); 
            setAiPrompt(''); 
          }}
        />
      </div>
    </div>
  );
}
