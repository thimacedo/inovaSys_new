import { useState, useCallback } from 'react';
import { askLegalQuestion, checkOllamaHealth, WikiResponse } from '../services/knowledgeService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function useWikiAI() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOllamaAvailable, setIsOllamaAvailable] = useState<boolean | null>(null);

  // Verifica saúde do Ollama ao iniciar
  const checkHealth = useCallback(async () => {
    const available = await checkOllamaHealth();
    setIsOllamaAvailable(available);
    return available;
  }, []);

  const sendQuestion = useCallback(async (question: string, context?: string) => {
    if (!question.trim()) return;

    // Adiciona mensagem do usuário
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await askLegalQuestion(question, context);
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao consultar a IA';
      setError(errorMsg);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearConversation = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    isOllamaAvailable,
    sendQuestion,
    clearConversation,
    checkHealth,
  };
}