import { useState, useCallback } from 'react';
import { ollamaClient, askLegalAI } from '../services/aiService';

interface UseAIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export function useAI(options: UseAIOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<string[]>([]);

  const generate = useCallback(async (prompt: string, systemPrompt?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await ollamaClient.generate({
        prompt,
        model: options.model,
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        systemPrompt,
      });
      setResponse(result.text);
      return result.text;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [options]);

  const askLegal = useCallback(async (question: string, context?: string) => {
    setLoading(true);
    setError(null);
    try {
      const answer = await askLegalAI(question, context);
      setResponse(answer);
      return answer;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadModels = useCallback(async () => {
    try {
      const modelList = await ollamaClient.listModels();
      setModels(modelList);
    } catch (err) {
      console.error('Erro ao carregar modelos:', err);
    }
  }, []);

  return {
    loading,
    response,
    error,
    models,
    generate,
    askLegal,
    loadModels,
  };
}