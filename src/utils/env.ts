/**
 * Validação de Variáveis de Ambiente em Runtime
 * 
 * Este arquivo garante que as variáveis necessárias estejam presentes antes da
 * aplicação tentar carregar os serviços que dependem delas.
 */

const REQUIRED_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

export function validateEnv() {
  const missing: string[] = [];

  REQUIRED_VARS.forEach((key) => {
    if (!import.meta.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    const errorMsg = `[InovaSys] Falha crítica: Variáveis de ambiente ausentes: ${missing.join(', ')}`;
    console.error(errorMsg);
    
    // Em desenvolvimento, apenas avisa para não travar o dev server se não estiver configurado
    if (import.meta.env.DEV) {
      console.warn('⚠️ Configuração incompleta detectada. Algumas funcionalidades podem falhar.');
    } else {
      // Em produção, podemos querer lançar erro ou redirecionar para uma página de erro
      // throw new Error(errorMsg);
    }
  } else {
    console.log('✅ Ambiente InovaSys validado com sucesso.');
  }
}

export const env = {
  get supabaseUrl() { return import.meta.env.VITE_SUPABASE_URL || ''; },
  get supabaseAnonKey() { return import.meta.env.VITE_SUPABASE_ANON_KEY || ''; },
  get isProd() { return import.meta.env.PROD; },
  get isDev() { return import.meta.env.DEV; },
  get ollamaUrl() { return import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434'; },
};
