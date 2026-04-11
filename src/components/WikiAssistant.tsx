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
      {/* Botão flutuante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all"
        aria-label="Ajuda do Sistema"
      >
        {isOpen ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
      </button>

      {/* Painel de chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
          {/* Cabeçalho */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              <h3 className="font-semibold">Assistente InovaSys</h3>
            </div>
            <p className="text-xs opacity-90 mt-1">
              {isOllamaAvailable === false && '⚠️ IA offline - usando fallback'}
              {isOllamaAvailable === true && '✓ Assistente ativo'}
            </p>
          </div>

          {/* Área de mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Olá! Sou o assistente do InovaSys.</p>
                <p className="text-sm mt-1">Pergunte-me como usar qualquer funcionalidade do sistema.</p>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {quickQuestions.slice(0, 4).map((q, i) => (
                    <button
                      key={i}
                      onClick={() => { setInput(q); }}
                      className="text-xs bg-white border border-gray-200 px-2 py-1 rounded-full hover:bg-gray-100"
                    >
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
                    className={`max-w-[85%] rounded-lg px-3 py-2 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <span className="text-xs opacity-70 block mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
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

          {/* Rodapé com input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Como posso ajudar?"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearConversation}
                className="text-xs text-gray-500 hover:text-gray-700 mt-2"
              >
                Limpar conversa
              </button>
            )}
            <div className="mt-2 flex flex-wrap gap-1">
              {quickQuestions.slice(4).map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInput(q)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {q}
                </button>
              ))}
            </div>
          </form>
        </div>
      )}
    </>
  );
};