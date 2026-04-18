import React, { useState } from 'react';
import { aiService } from '../services/aiService';
import { Bot, CheckCircle2, Wand2 } from 'lucide-react';
import { Button } from '../presentation/ui/components/Button';

interface SentenceGeneratorProps {
  processo: any;
  onGenerate: (html: string) => void;
  onClose: () => void;
}

export const SentenceGenerator: React.FC<SentenceGeneratorProps> = ({ processo, onGenerate, onClose }) => {
  const [diretrizes, setDiretrizes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const html = await aiService.generateSentence(processo, diretrizes);
      onGenerate(html);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 p-4">
      <div className="flex items-center gap-4 bg-blue-50 p-6 rounded-3xl border border-blue-100">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
          <Wand2 size={24} />
        </div>
        <div>
          <h3 className="text-lg font-black text-slate-900 uppercase italic">Assistente de Digitação</h3>
          <p className="text-xs text-blue-700 font-medium">A IA formatará a minuta baseada ESTRITAMENTE nas suas orientações e no preenchimento de metadados. Não há análise de mérito.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">Suas Diretrizes e Fundamentos</label>
          <textarea 
            className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[1.5rem] min-h-[150px] outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 leading-relaxed"
            placeholder="Dite ou escreva aqui a fundamentação e a decisão. Ex: 'O requerente não comprovou o pagamento. Julgo improcedente...'"
            value={diretrizes}
            onChange={(e) => setDiretrizes(e.target.value)}
          />
        </div>

        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
          <h4 className="text-[10px] font-black text-slate-400 uppercase mb-3">Escopo de Automação</h4>
          <div className="grid grid-cols-2 gap-3">
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                <CheckCircle2 size={12} className="text-emerald-500" /> Preenchimento de Cabeçalho
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                <CheckCircle2 size={12} className="text-emerald-500" /> Correção Gramatical
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                <CheckCircle2 size={12} className="text-emerald-500" /> Formatação ABNT
             </div>
             <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600">
                <CheckCircle2 size={12} className="text-emerald-500" /> Estruturação de Tópicos
             </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          className="flex-1 py-6 rounded-2xl" 
          onClick={onClose}
          disabled={isGenerating}
        >
          Cancelar
        </Button>
        <Button 
          className="flex-[2] py-6 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200"
          onClick={handleGenerate}
          isLoading={isGenerating}
          icon={Bot}
        >
          Gerar Minuta Formatada
        </Button>
      </div>
    </div>
  );
};
