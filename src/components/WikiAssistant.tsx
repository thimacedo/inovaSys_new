import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, HelpCircle } from 'lucide-react';
import { useWikiAI } from '../hooks/useWikiAI';

export const WikiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isLoading, error, sendQuestion, clearConversation, isOllamaAvailable, checkHealth } = useWikiAI();

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    await sendQuestion(input);
    setInput('');
  };

  const quickQuestions = [
    'Como criar um novo processo?',
    'Como enviar um documento para assinatura?',
    'Como funciona o Kanban?',
    'Como gerar documentos em lote?',
    'Como adicionar um novo árbitro?',
    'Onde vejo as notificações?',
  ];

  return (
    <>
      {/* Botão flutuante (Oculto quando o chat está aberto) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 active:scale-95"
          aria-label="Abrir ajuda do sistema"
          id="btn-open-assistant"
        >
          <HelpCircle className="w-6 h-6" />
        </button>
      )}

      {/* Painel de chat */}
      {isOpen && (
        <div 
          className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
          id="assistant-panel"
        >
          {/* Cabeçalho */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold leading-none">Assistente InovaSys</h3>
                <p className="text-[10px] opacity-80 mt-1 uppercase tracking-wider font-medium">
                  {isOllamaAvailable === false ? 'Modo Offline (Fallback)' : 'Inteligência Artificial Ativa'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Fechar chat"
              id="btn-close-assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Área de mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HelpCircle className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Como posso ajudar?</h4>
                <p className="text-sm text-gray-500 mt-1 max-w-[240px] mx-auto">
                  Tire dúvidas sobre funcionalidades, processos ou navegação no sistema.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-2">
                  {quickQuestions.slice(0, 3).map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="text-left text-xs bg-white border border-gray-200 p-3 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm group"
                    >
                      <span className="text-blue-600 mr-2 opacity-0 group-hover:opacity-100">→</span>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    <span className={`text-[10px] block mt-1.5 ${msg.role === 'user' ? 'opacity-70 text-right' : 'text-gray-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></div>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs p-3 rounded-xl">
                {error}
              </div>
            )}
          </div>

          {/* Rodapé com input */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Digite sua dúvida..."
                className="w-full pl-4 pr-12 py-3 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                disabled={isLoading}
                id="input-assistant"
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="absolute right-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-all shadow-md"
                aria-label="Enviar pergunta"
                id="btn-send-question"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
            
            <div className="mt-3 flex items-center justify-between">
              <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar max-w-[70%]">
                {quickQuestions.slice(3, 6).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setInput(q)}
                    className="text-[10px] text-gray-500 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={clearConversation}
                  className="text-[10px] font-semibold text-red-500 hover:text-red-600 uppercase tracking-tighter"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
};