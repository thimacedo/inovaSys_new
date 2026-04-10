const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

export function validateEnv(): void {
  const missing = requiredEnvVars.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    console.error(`❌ Variáveis de ambiente ausentes: ${missing.join(', ')}`);
    
    if (import.meta.env.DEV) {
      setTimeout(() => {
        alert(`Erro de configuração:\nVariáveis ausentes: ${missing.join(', ')}\n\nVerifique o arquivo .env.local`);
      }, 100);
    }
  }
}