import { useState, useCallback } from 'react';
import { askSystemQuestion, checkOllamaHealth } from '../services/knowledgeService';

export interface Message {
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

  const checkHealth = useCallback(async () => {
    const available = await checkOllamaHealth();
    setIsOllamaAvailable(available);
    return available;
  }, []);

  const sendQuestion = useCallback(async (question: string) => {
    if (!question.trim()) return;

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
      const response = await askSystemQuestion(question);
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao consultar o assistente';
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