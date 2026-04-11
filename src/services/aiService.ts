interface AIGenerateOptions {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  systemPrompt?: string;
}

interface AIChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  text: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

class OllamaClient {
  private baseUrl: string;
  private defaultModel: string;

  constructor(baseUrl = 'http://localhost:11434', defaultModel = 'deepseek-r1:7b') {
    this.baseUrl = baseUrl;
    this.defaultModel = defaultModel;
  }

  async generate(options: AIGenerateOptions): Promise<AIResponse> {
    const { prompt, model = this.defaultModel, temperature = 0.3, maxTokens = 2048, stream = false, systemPrompt } = options;

    const payload: Record<string, any> = {
      model,
      prompt,
      stream,
      options: {
        temperature,
        num_predict: maxTokens,
      },
    };

    if (systemPrompt) payload.system = systemPrompt;

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.response,
      model: data.model,
      usage: {
        promptTokens: data.prompt_eval_count || 0,
        completionTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
      },
    };
  }

  async chat(messages: AIChatMessage[], model?: string): Promise<AIResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || this.defaultModel,
        messages,
        stream: false,
        options: { temperature: 0.3 },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.message.content,
      model: data.model,
    };
  }

  async listModels(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/api/tags`);
    const data = await response.json();
    return data.models?.map((m: any) => m.name) || [];
  }

  async pullModel(modelName: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/pull`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: modelName }),
    });
    if (!response.ok) throw new Error(`Failed to pull model: ${response.status}`);
  }
}

// Singleton
export const ollamaClient = new OllamaClient();

// Função de conveniência para prompts jurídicos
export async function askLegalAI(prompt: string, context?: string): Promise<string> {
  const systemPrompt = `Você é um assistente jurídico especializado em arbitragem e direito brasileiro. 
Responda de forma técnica, precisa e baseada na legislação vigente. 
Utilize linguagem formal e adequada ao contexto jurídico.`;

  const fullPrompt = context 
    ? `Contexto: ${context}\n\nPergunta: ${prompt}`
    : prompt;

  const response = await ollamaClient.generate({
    prompt: fullPrompt,
    systemPrompt,
    temperature: 0.2,
  });

  return response.text;
}

// Funções exportadas para compatibilidade com componentes
export async function askAI(prompt: string): Promise<string> {
  const response = await ollamaClient.generate({ prompt });
  return response.text;
}

export async function askAIsuggestClausula(context: string, prompt: string): Promise<string> {
  return askLegalAI(prompt, context);
}

export async function askAIimproveDraft(text: string): Promise<string> {
  return askLegalAI(`Melhore o seguinte texto jurídico, mantendo o tom formal e preciso: ${text}`);
}
