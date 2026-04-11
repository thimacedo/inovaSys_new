const OLLAMA_URL = 'http://localhost:11434/api/generate';
const MODEL = 'deepseek-r1:7b'; // ou 'llama3.2:3b' para respostas mais rápidas

export interface WikiResponse {
  answer: string;
  model: string;
  tokensUsed?: number;
}

/**
 * Faz uma pergunta jurídica ao modelo local.
 * @param question Pergunta do usuário
 * @param context Contexto adicional (ex.: tipo de processo, área do direito)
 */
export async function askLegalQuestion(question: string, context?: string): Promise<WikiResponse> {
  const systemPrompt = `Você é um assistente jurídico especializado em arbitragem e direito brasileiro.
Responda de forma clara, didática e fundamentada, citando leis e princípios quando relevante.
Se a pergunta não for jurídica, recuse educadamente.`;

  const fullPrompt = context 
    ? `Contexto adicional: ${context}\n\nPergunta do usuário: ${question}`
    : question;

  const response = await fetch(OLLAMA_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      prompt: fullPrompt,
      system: systemPrompt,
      stream: false,
      options: {
        temperature: 0.2,
        num_predict: 1024,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama retornou erro ${response.status}`);
  }

  const data = await response.json();
  return {
    answer: data.response,
    model: data.model,
    tokensUsed: data.eval_count,
  };
}

/**
 * Verifica se o Ollama está acessível.
 */
export async function checkOllamaHealth(): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:11434/api/tags');
    return res.ok;
  } catch {
    return false;
  }
}