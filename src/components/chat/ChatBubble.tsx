import React from 'react';
import { motion } from 'motion/react';

interface ChatBubbleProps {
  message: string;
  senderName: string;
  timestamp: string;
  isMe: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message, senderName, timestamp, isMe }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}
    >
      <div className={`max-w-[85%] sm:max-w-[70%] rounded-[28px] p-5 shadow-sm transition-all hover:shadow-md ${
        isMe 
          ? 'bg-md-primary-container text-md-on-primary-container rounded-tr-lg' 
          : 'bg-md-surface-variant/40 text-md-on-surface-variant rounded-tl-lg border border-md-outline/5'
      }`}>
        {!isMe && (
          <p className="text-[10px] font-black uppercase mb-2 opacity-60 tracking-widest">
            {senderName}
          </p>
        )}
        <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap select-text">
          {message}
        </p>
        <div className={`flex items-center gap-1.5 mt-3 justify-end opacity-40`}>
          <p className="text-[9px] font-bold uppercase tracking-tighter">
            {new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
