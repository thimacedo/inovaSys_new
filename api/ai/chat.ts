import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * @file api/ai/chat.ts
 * @description Serveless Function da Vercel para processar requisições de IA
 * sem expor a GEMINI_API_KEY no cliente.
 */

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt é obrigatório.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY não definida no ambiente.');
      return new Response(JSON.stringify({ error: 'Configuração do servidor incompleta.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return new Response(JSON.stringify({ text: responseText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Erro na Edge Function AI:', error);
    return new Response(JSON.stringify({ error: 'Erro interno ao processar IA.', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
