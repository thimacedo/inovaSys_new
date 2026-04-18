import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  MessageSquare, 
  BookOpen, 
  HelpCircle,
  Search
} from 'lucide-react';
import { aiService } from '../services/aiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const HelpCenter: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Olá! Sou o Assistente IA da InovaSys. Como posso ajudar você hoje com dúvidas sobre o sistema ou procedimentos arbitrais?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await aiService.suggestClausula('Wiki Ajuda', input);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-md-on-surface/40 backdrop-blur-sm z-[60]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-lg bg-md-surface shadow-md-3 z-[70] flex flex-col rounded-l-[48px] overflow-hidden border-l border-md-outline/10"
          >
            {/* Header */}
            <div className="p-8 bg-md-primary text-md-on-primary">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-md-primary-container rounded-2xl shadow-sm">
                    <Sparkles className="text-md-on-primary-container" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Central de Ajuda IA</h2>
                    <p className="text-xs text-md-on-primary/70 font-bold uppercase tracking-widest">Suporte Inteligente InovaSys</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-md-on-primary/10 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-md-on-primary/60" size={18} />
                <input 
                  type="text" 
                  placeholder="Pesquisar em documentos..." 
                  className="w-full bg-md-on-primary/10 border border-md-on-primary/20 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-md-on-primary/30 transition-all placeholder:text-md-on-primary/40"
                />
              </div>
            </div>

            {/* Content Tabs */}
            <div className="flex bg-md-surface-variant/20 px-4">
              <button className="flex-1 py-4 text-sm font-black text-md-primary border-b-4 border-md-primary flex items-center justify-center gap-2 transition-all">
                <MessageSquare size={18} />
                Chat IA
              </button>
              <button className="flex-1 py-4 text-sm font-bold text-md-on-surface-variant/60 hover:text-md-primary transition-colors flex items-center justify-center gap-2">
                <BookOpen size={18} />
                Base Documental
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-8 space-y-6 bg-md-surface"
            >
              {messages.map((msg) => (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-4 max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      msg.role === 'user' ? 'bg-md-primary text-md-on-primary' : 'bg-md-secondary-container text-md-on-secondary-container'
                    }`}>
                      {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                    </div>
                    <div className={`space-y-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`p-4 rounded-[24px] text-sm shadow-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-md-primary text-md-on-primary rounded-tr-none' 
                          : 'bg-md-surface-variant text-md-on-surface-variant rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <p className="text-[10px] text-md-on-surface-variant/50 font-bold uppercase px-2 tracking-widest">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-md-secondary-container text-md-on-secondary-container flex items-center justify-center shadow-sm">
                    <Bot size={18} />
                  </div>
                  <div className="bg-md-surface-variant p-5 rounded-[24px] rounded-tl-none shadow-sm flex gap-1.5 items-center">
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-md-primary/40 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-md-primary/40 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-md-primary/40 rounded-full" />
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions */}
            <div className="px-8 py-4 bg-md-surface-variant/10 border-t border-md-outline/10 overflow-x-auto no-scrollbar">
              <div className="flex gap-3 whitespace-nowrap">
                {[
                  'Como iniciar um processo?',
                  'Tabela de custas',
                  'Regulamento Arbitral',
                  'Assinatura digital'
                ].map((s) => (
                  <button 
                    key={s}
                    onClick={() => { setInput(s); }}
                    className="px-4 py-2 bg-md-surface border border-md-outline/20 hover:bg-md-primary-container hover:text-md-on-primary-container text-md-on-surface-variant rounded-full text-xs font-bold transition-all shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-8 bg-md-surface border-t border-md-outline/10">
              <div className="flex gap-4">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Escreva sua dúvida aqui..."
                  className="flex-1 bg-md-surface-variant/30 border border-md-outline/20 rounded-[24px] px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-md-primary/20 focus:bg-white transition-all shadow-inner"
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-4 bg-md-primary hover:brightness-110 disabled:bg-md-outline/30 text-md-on-primary rounded-[24px] shadow-md-2 transition-all active:scale-95 flex items-center justify-center shrink-0"
                >
                  <Send size={24} />
                </button>
              </div>
              <p className="text-[10px] text-center text-md-on-surface-variant/50 font-bold uppercase tracking-widest mt-6 flex items-center justify-center gap-2">
                <HelpCircle size={14} className="text-md-primary" />
                IA treinada com normas da Câmara InovaSys
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HelpCenter;
