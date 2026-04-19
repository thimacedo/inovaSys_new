import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../presentation/state/useAuthStore';
import { useMessages } from '../presentation/hooks/useMessages';
import { webhookService } from '../services/webhookService';
import { notificationService } from '../services/notificationService';
import { processService } from '../services/processService';
import { User, Loader2 } from 'lucide-react';
import { AnimatePresence } from 'motion/react';

// 🧩 Sub-módulos Modularizados (Material You MD3)
import { ChatHeader } from './chat/ChatHeader';
import { ChatBubble } from './chat/ChatBubble';
import { ChatInput } from './chat/ChatInput';

export const ProcessChat: React.FC<{ processoId: string }> = ({ processoId }) => {
  const { currentUser } = useAuthStore();
  const { messages, isLoading, sendMessage, isSending } = useMessages(processoId);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    const msgText = newMessage;
    setNewMessage('');

    try {
      await sendMessage({
        processo_id: processoId,
        autor_id: currentUser.id,
        autor_nome: currentUser.nome || currentUser.email,
        mensagem: msgText,
      });

      // Notificação via Webhook (Workflow Omni-channel)
      processService.getById(processoId).then(processo => {
        if (processo) {
          webhookService.notify('nova_mensagem', {
            processo_id: processoId,
            numero_processo: processo.numero_processo || 'N/A',
            contato_nome: currentUser.nome || 'Parte',
            mensagem: msgText
          });

          const recipientId = currentUser.id === processo.arbitro_id 
            ? processo.user_id 
            : processo.arbitro_id;

          if (recipientId && recipientId !== currentUser.id) {
            notificationService.notify(recipientId, {
              titulo: 'Nova Mensagem',
              mensagem: `${currentUser.nome || 'Um participante'} enviou: ${msgText.substring(0, 40)}...`,
              tipo: 'info',
              processoId: processoId
            });
          }
        }
      });
    } catch (error) {
      console.error('[ProcessChat] Falha no envio:', error);
      setNewMessage(msgText); // Devolve o texto ao input para não perder o rascunho
    }
  };

  return (
    <div className="flex flex-col h-[700px] bg-md-surface rounded-[40px] border border-md-outline/5 overflow-hidden shadow-md animate-in fade-in duration-500">
      
      {/* 🏷️ Cabeçalho MD3 */}
      <ChatHeader />

      {/* 🧬 Área de Conversa Realtime */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-2 custom-scrollbar bg-md-surface-variant/5"
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
            <Loader2 className="animate-spin text-md-primary" size={32} />
            <p className="text-[10px] font-black text-md-on-surface-variant uppercase tracking-[0.2em]">Sincronizando Mensagens...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-md-on-surface-variant/30 gap-4 p-12">
            <User size={48} strokeWidth={1} />
            <p className="text-xs font-bold text-center uppercase tracking-widest leading-relaxed">
              Inicie uma comunicação segura entre o árbitro e as partes envolvidas.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <ChatBubble 
                key={msg.id}
                message={msg.mensagem}
                senderName={msg.autor_nome}
                timestamp={msg.created_at}
                isMe={msg.autor_id === currentUser?.id}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* ⌨️ Entrada de Texto MD3 */}
      <ChatInput 
        value={newMessage}
        onChange={setNewMessage}
        onSubmit={handleSendMessage}
        isLoading={isSending}
        disabled={!currentUser}
      />

    </div>
  );
};
