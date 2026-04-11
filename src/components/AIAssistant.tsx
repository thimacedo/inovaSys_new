import React, { useState } from 'react';
import { useAI } from '../hooks/useAI';
import { Loader2, Sparkles, FileText, Scale } from 'lucide-react';

interface AIAssistantProps {
  context?: string;
  placeholder?: string;
  title?: string;
  onSuggestion?: (text: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  context,
  placeholder = 'Digite sua pergunta jurídica...',
  title = 'Assistente Jurídico IA',
  onSuggestion,
}) => {
  const [prompt, setPrompt] = useState('');
  const { loading, response, error, askLegal } = useAI({ temperature: 0.2 });
  const [history, setHistory] = useState<Array<{ role: string; content: string }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setHistory(prev => [...prev, { role: 'user', content: prompt }]);
    const answer = await askLegal(prompt, context);
    
    if (answer) {
      setHistory(prev => [...prev, { role: 'assistant', content: answer }]);
    }
    setPrompt('');
  };

  const quickPrompts = [
    { label: 'Analisar Cláusula', prompt: 'Analise esta cláusula contratual e identifique riscos:' },
    { label: 'Resumir Documento', prompt: 'Resuma os principais pontos deste documento:' },
    { label: 'Sugerir Jurisprudência', prompt: 'Sugira jurisprudência relevante sobre:' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Cabeçalho */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3">
        <div className="flex items-center gap-2 text-white">
          <Scale className="w-5 h-5" />
          <h3 className="font-semibold">{title}</h3>
          <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">
            DeepSeek-R1-7B
          </span>
        </div>
      </div>

      {/* Histórico */}
      <div className="p-4 max-h-80 overflow-y-auto space-y-3 bg-gray-50">
        {history.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Assistente jurídico local ativado</p>
            <p className="text-sm mt-1">100% privado – dados não saem da sua máquina</p>
          </div>
        ) : (
          history.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            </div>
          </div>
        )}
        {error && (
          <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
            Erro: {error}
          </div>
        )}
      </div>

      {/* Prompts rápidos */}
      <div className="px-4 py-2 border-t border-gray-200 flex gap-2 overflow-x-auto">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => setPrompt(qp.prompt)}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full whitespace-nowrap transition-colors"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={loading || !prompt.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar'}
          </button>
        </div>
        {context && (
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Contexto do documento ativo
          </p>
        )}
      </form>
    </div>
  );
};