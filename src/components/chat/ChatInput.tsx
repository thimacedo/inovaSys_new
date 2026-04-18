import React from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  disabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ value, onChange, onSubmit, isLoading, disabled }) => {
  return (
    <form onSubmit={onSubmit} className="p-6 bg-md-surface border-t border-md-outline/5">
      <div className="flex gap-4 items-center bg-md-surface-variant/20 p-2.5 rounded-[24px] border border-md-outline/10 focus-within:ring-4 focus-within:ring-md-primary/10 transition-all duration-300">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e as any);
            }
          }}
          placeholder="Escreva sua manifestação oficial..."
          disabled={disabled || isLoading}
          className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-sm font-medium placeholder:text-md-on-surface-variant/30 resize-none max-h-32 min-h-[40px] custom-scrollbar"
          rows={1}
        />
        <button 
          type="submit"
          disabled={!value.trim() || isLoading || disabled}
          className="w-12 h-12 bg-md-primary text-md-on-primary rounded-full flex items-center justify-center hover:bg-md-primary/90 transition-all shadow-lg active:scale-90 disabled:opacity-30 disabled:shadow-none shrink-0"
          aria-label="Enviar Mensagem"
        >
          {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} className="ml-0.5" />}
        </button>
      </div>
    </form>
  );
};
