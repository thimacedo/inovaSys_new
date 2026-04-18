import React, { useState } from 'react';
import { aiService } from '../services/aiService';
import { Bot, FileText, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface IAAssistantPanelProps {
  processoId: string;
}

export const IAAssistantPanel: React.FC<IAAssistantPanelProps> = ({ processoId }) => {
  const [textToFormat, setTextToFormat] = useState('');
  const [formattedText, setFormattedText] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);

  const handleFormat = async () => {
    if (!textToFormat.trim()) return;
    setIsFormatting(true);
    try {
      const result = await aiService.improveDraft(textToFormat);
      setFormattedText(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFormatting(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedText);
  };

  return (
    <div className="w-80 flex flex-col bg-white border-l border-slate-200 h-full shadow-2xl">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <Bot size={18} />
          </div>
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Assistente Administrativo</h3>
        </div>
        <p className="text-[10px] text-slate-500 font-bold uppercase leading-tight">Revisão Gramatical e Formatação</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Texto Original</label>
          <textarea 
            value={textToFormat}
            onChange={(e) => setTextToFormat(e.target.value)}
            placeholder="Cole aqui um rascunho para correção ortográfica e adequação formal..."
            className="w-full h-32 p-3 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <button 
            onClick={handleFormat}
            disabled={isFormatting || !textToFormat.trim()}
            className="w-full py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-blue-100 disabled:opacity-50 transition-colors"
          >
            {isFormatting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Formatar Texto
          </button>
        </div>

        {formattedText && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2 pt-4 border-t border-slate-100"
          >
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Texto Formatado</label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 whitespace-pre-wrap">
              {formattedText}
            </div>
            <button 
              onClick={handleCopy}
              className="w-full py-2 bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
            >
              <FileText size={14} /> Copiar
            </button>
          </motion.div>
        )}
      </div>

      <div className="p-4 bg-slate-50 text-slate-400 text-center rounded-t-[2rem] border-t border-slate-200">
        <p className="text-[9px] font-bold uppercase">A IA não analisa provas ou mérito.</p>
      </div>
    </div>
  );
};
