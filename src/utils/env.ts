/**
 * @file env.ts
 * @description Validação de variáveis de ambiente em tempo de execução.
 */

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
] as const;

export function validateEnv(): void {
  const missing = requiredEnvVars.filter(key => {
    // No Vite, as variáveis de ambiente estão em import.meta.env
    return !import.meta.env[key];
  });

  if (missing.length > 0) {
    const errorMsg = `❌ Variáveis de ambiente ausentes: ${missing.join(', ')}`;
    console.error(errorMsg);
    
    // Alerta visual apenas em desenvolvimento para facilitar o debug célere
    if (import.meta.env.DEV) {
      alert(`Erro Crítico de Configuração: as variáveis ${missing.join(', ')} não foram encontradas. Verifique seu arquivo .env.local`);
    }
  } else {
    console.log('✅ Ambiente validado com sucesso.');
  }
}

export default validateEnv;
