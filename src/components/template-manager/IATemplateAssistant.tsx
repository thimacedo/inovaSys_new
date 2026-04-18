import React from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { MD3Card } from '../../presentation/ui/md3/MD3Card';

interface IATemplateAssistantProps {
  prompt: string;
  setPrompt: (v: string) => void;
  onAsk: () => void;
  loading: boolean;
  response: string;
  onInsert: () => void;
}

export const IATemplateAssistant: React.FC<IATemplateAssistantProps> = ({
  prompt,
  setPrompt,
  onAsk,
  loading,
  response,
  onInsert
}) => {
  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex items-center gap-3 px-1">
        <div className="p-2.5 bg-md-tertiary/10 text-md-tertiary rounded-xl">
          <Sparkles size={22} />
        </div>
        <h3 className="text-lg font-black text-md-on-surface uppercase tracking-tight italic">AI <span className="text-md-tertiary">Copilot</span></h3>
      </div>

      <MD3Card variant="filled" className="!bg-md-tertiary-container/10 flex-1 flex flex-col gap-6 !p-6 border-none">
        <div>
          <label className="text-[10px] font-black text-md-tertiary/60 uppercase tracking-[0.2em] mb-3 block ml-1">Instrução para Redação</label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 p-4 text-sm bg-md-surface border border-md-outline/10 rounded-2xl outline-none focus:ring-4 focus:ring-md-tertiary/10 transition-all resize-none font-medium placeholder:text-md-on-surface-variant/30"
            placeholder="Ex: Sugira uma cláusula de confidencialidade estrita para acordos trabalhistas..."
          />
        </div>

        <button 
          onClick={onAsk}
          disabled={loading || !prompt.trim()}
          className="rounded-full w-full py-4 bg-md-tertiary text-md-on-tertiary font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-md-tertiary/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 transition-all"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          Consultar Inteligência
        </button>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1 custom-scrollbar">
          {response ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-md-surface rounded-[24px] border border-md-tertiary/10 shadow-sm"
            >
               <p className="text-xs text-md-on-surface-variant leading-relaxed font-medium whitespace-pre-wrap">{response}</p>
               <button 
                  onClick={onInsert}
                  className="w-full mt-4 py-3 bg-md-tertiary-container text-md-on-tertiary-container rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-95 transition-all"
               >
                  Injetar Sugestão
               </button>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-4 opacity-30">
               <Sparkles size={40} />
               <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Redija textos complexos com auxílio de IA Jurídica especializada.</p>
            </div>
          )}
        </div>
      </MD3Card>
    </div>
  );
};
