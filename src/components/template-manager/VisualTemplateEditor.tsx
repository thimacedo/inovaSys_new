import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Code, Eye, RefreshCw, Save, AlertCircle, Info } from 'lucide-react';
import { MD3Card } from '../../presentation/ui/md3/MD3Card';

interface VisualTemplateEditorProps {
  template: any;
  content: string;
  setContent: (val: string) => void;
  onSave: () => void;
  isSaving: boolean;
  onReset: () => void;
  viewMode: 'friendly' | 'code';
  setViewMode: (mode: 'friendly' | 'code') => void;
}

export const VisualTemplateEditor: React.FC<VisualTemplateEditorProps> = ({
  template,
  content,
  setContent,
  onSave,
  isSaving,
  onReset,
  viewMode,
  setViewMode
}) => {
  
  // 🛡️ Função robusta para limpar HTML e reidratar o conteúdo amigável
  const stripHtml = (html: string) => {
    if (!html) return '';
    
    // Cria um DOM temporário para manipulação segura
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove elementos indesejados que podem causar "sujeira" no modo amigável
    const elementsToRemove = doc.querySelectorAll('script, style, iframe, object, embed');
    elementsToRemove.forEach(el => el.remove());

    // Converte blocos comuns em quebras de linha para manter a estrutura mínima
    const blockElements = ['p', 'div', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr'];
    blockElements.forEach(tag => {
      const elements = doc.getElementsByTagName(tag);
      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i];
        if (tag === 'br') {
          el.parentNode?.replaceChild(doc.createTextNode('\n'), el);
        } else {
          // Adiciona quebra de linha após blocos
          const newline = doc.createTextNode('\n');
          el.parentNode?.insertBefore(newline, el.nextSibling);
        }
      }
    });

    const result = doc.body.innerText || doc.body.textContent || "";
    // Limpeza de espaços excessivos mantendo quebras intencionais
    return result.replace(/\n\s*\n/g, '\n\n').trim();
  };

  const getHtmlFromText = (text: string) => {
    if (!text.trim()) return '';
    // Converte texto simples de volta para parágrafos HTML básicos
    return text.split('\n')
      .map(line => line.trim() ? `<p>${line}</p>` : '')
      .filter(Boolean)
      .join('');
  };

  const handleModeSwitch = (mode: 'friendly' | 'code') => {
    if (mode === viewMode) return;
    
    if (mode === 'friendly') {
      // 🔄 Reidratação: De Código para Amigável
      const cleanText = stripHtml(content);
      setContent(cleanText);
    } else {
      // 🔄 Reidratação: De Amigável para Código
      // Só envolve em HTML se detectarmos que é texto puro (sem tags)
      const hasTags = /<[a-z][\s\S]*>/i.test(content);
      if (!hasTags) {
        setContent(getHtmlFromText(content));
      }
    }
    setViewMode(mode);
  };
  
  return (
    <MD3Card variant="elevated" className="!p-0 flex flex-col h-[700px] overflow-hidden bg-md-surface-variant/10">
      {/* 🛠️ Toolbar do Editor */}
      <div className="p-5 bg-md-surface border-b border-md-outline/5 flex items-center justify-between">
        <div>
          <h4 className="text-base font-black text-md-on-surface uppercase tracking-tight">{template.nome}</h4>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[9px] font-black bg-md-primary/10 text-md-primary px-2 py-0.5 rounded uppercase tracking-widest">Ativo</span>
             <span className="text-[9px] font-bold text-md-on-surface-variant/40 uppercase tracking-widest italic">Edição em Tempo Real</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Alternador de Visão */}
          <div className="flex bg-md-surface-variant/30 p-1 rounded-full border border-md-outline/10 mr-2 shadow-inner">
             <button 
              onClick={() => handleModeSwitch('friendly')}
              className={`p-2 rounded-full transition-all ${viewMode === 'friendly' ? 'bg-md-primary text-md-on-primary shadow-sm' : 'text-md-on-surface-variant/60 hover:text-md-on-surface'}`}
              title="Editor Amigável"
            >
              <Eye size={16} />
            </button>
            <button 
              onClick={() => handleModeSwitch('code')}
              className={`p-2 rounded-full transition-all ${viewMode === 'code' ? 'bg-md-primary text-md-on-primary shadow-sm' : 'text-md-on-surface-variant/60 hover:text-md-on-surface'}`}
              title="Ver Código Fonte"
            >
              <Code size={16} />
            </button>
          </div>

          <button onClick={onReset} className="p-3 text-md-on-surface-variant/40 hover:text-md-primary hover:bg-md-primary/5 rounded-2xl transition-all" title="Restaurar Padrão">
            <RefreshCw size={18} />
          </button>
          
          <button 
            onClick={onSave}
            disabled={isSaving}
            className="btn-md-primary !px-8 shadow-lg shadow-md-primary/10 disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Publicar Modelo'}
            <Save size={16} className="ml-1" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-hidden flex flex-col gap-6">
        {/* 💡 Banner de Ajuda */}
        <div className="bg-md-primary-container/30 border border-md-primary/10 p-5 rounded-[24px] flex gap-4 items-start animate-in slide-in-from-top-2">
           <div className="p-2 bg-md-primary text-md-on-primary rounded-xl shrink-0 shadow-sm">
             <Info size={18} />
           </div>
           <div>
             <p className="text-xs font-bold text-md-on-primary-container mb-1 uppercase tracking-wider">Dica de Edição</p>
             <p className="text-[11px] text-md-on-primary-container opacity-80 leading-relaxed font-medium">
               Utilize chaves para campos dinâmicos: <code className="bg-white/40 px-1.5 py-0.5 rounded font-black text-md-primary">{"{numero_processo}"}</code>, <code className="bg-white/40 px-1.5 py-0.5 rounded font-black text-md-primary">{"{requerente_nome}"}</code>. O sistema formatará o documento final automaticamente.
             </p>
           </div>
        </div>

        {/* 📄 Área do Papel */}
        <div className="flex-1 bg-white rounded-[32px] shadow-inner border border-md-outline/10 relative overflow-hidden flex flex-col">
           <AnimatePresence mode="wait">
             {viewMode === 'friendly' ? (
                <motion.div 
                  key="friendly"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col"
                >
                   {/* Editor de Texto Amigável (Sem HTML Visível) */}
                   <textarea
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     className="w-full h-full p-12 font-serif text-lg leading-loose border-none outline-none resize-none text-slate-800 placeholder:text-slate-200 selection:bg-md-primary-container selection:text-md-on-primary-container"
                     placeholder="Escreva o conteúdo do modelo aqui..."
                   />
                   <div className="absolute bottom-6 right-8 text-[10px] font-black text-slate-300 uppercase tracking-widest pointer-events-none">
                     Modo de Escrita Jurídica
                   </div>
                </motion.div>
             ) : (
                <motion.div 
                  key="code"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex-1 bg-slate-900"
                >
                   <textarea
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     className="w-full h-full p-10 font-mono text-xs leading-relaxed border-none outline-none resize-none text-emerald-400 bg-transparent selection:bg-white/20"
                     placeholder="Insira o código HTML/CSS bruto aqui..."
                   />
                   <div className="absolute bottom-6 right-8 text-[10px] font-black text-emerald-900 uppercase tracking-widest pointer-events-none">
                     Source Code Editor
                   </div>
                </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </MD3Card>
  );
};
