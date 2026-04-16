import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useMessages } from '../presentation/hooks/useMessages';
import { webhookService } from '../services/webhookService';
import { notificationService } from '../services/notificationService';
import { processService } from '../services/processService';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProcessChat: React.FC<{ processoId: string }> = ({ processoId }) => {
  const { currentUser } = useAuthStore();
  const { messages, isLoading, sendMessage, isSending } = useMessages(processoId);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const msg = newMessage;
    setNewMessage('');

    try {
      await sendMessage({
        processo_id: processoId,
        autor_id: currentUser.id,
        autor_nome: currentUser.nome || currentUser.email,
        mensagem: msg,
      });

      // Notifica via Webhook (Assíncrono)
      webhookService.notify('nova_mensagem', {
        processo_id: processoId,
        numero_processo: 'Ver autos',
        contato_nome: currentUser.nome || 'Parte',
        mensagem: msg
      });

      // Registro de Notificação Interna (Eficiência Mecânica - Roadmap 3.0)
      const processo = await processService.getById(processoId);
      if (processo) {
        // Notificar o outro participante (ex: árbitro ou partes contrárias)
        const recipientId = currentUser.id === processo.arbitro_id 
          ? processo.user_id // Se o árbitro enviou, notifica o requerente/dono
          : processo.arbitro_id; // Se outro enviou, notifica o árbitro

        if (recipientId && recipientId !== currentUser.id) {
          notificationService.notify(recipientId, {
            titulo: 'Nova Mensagem no Processo',
            mensagem: `${currentUser.nome || 'Um participante'} enviou uma mensagem: ${msg.substring(0, 30)}...`,
            tipo: 'info',
            processoId: processoId
          });
        }
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setNewMessage(msg); // Devolve a mensagem em caso de erro
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-50 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-inner">
      <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
            <Bot size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Sala de Mediação</h3>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">● Online em Tempo Real</p>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <Loader2 className="animate-spin text-blue-600" size={24} />
            <p className="text-[10px] font-black text-slate-400 uppercase">Carregando Conversa...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
            <User size={32} className="opacity-20" />
            <p className="text-xs font-medium italic text-center px-10">Nenhuma mensagem registrada ainda. Use este espaço para comunicação oficial entre as partes.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => {
              const isMe = msg.autor_id === currentUser?.id;
              return (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-[1.5rem] p-4 shadow-sm ${
                    isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}>
                    {!isMe && <p className="text-[9px] font-black uppercase mb-1 opacity-50">{msg.autor_nome}</p>}
                    <p className="text-sm font-medium leading-relaxed">{msg.mensagem}</p>
                    <p className={`text-[8px] font-bold mt-2 uppercase ${isMe ? 'text-blue-200' : 'text-slate-400'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100">
        <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
          <input 
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem oficial..."
            disabled={isSending}
            className="flex-1 bg-transparent border-none outline-none px-4 text-sm font-bold placeholder:text-slate-300"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:shadow-none"
          >
            {isSending ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
          </button>
        </div>
      </form>
    </div>
  );
};
