import fs from 'fs';
import path from 'path';

const REQUIRED_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_GEMINI_API_KEY'
];

console.log('🔍 Iniciando validação de variáveis de ambiente...');

const missing = REQUIRED_VARS.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('❌ ERRO CRÍTICO: As seguintes variáveis de ambiente estão ausentes:');
  missing.forEach(v => console.error(`   - ${v}`));
  
  if (process.env.NODE_ENV === 'production' || process.env.CI) {
    console.error('\nBloqueando o build para evitar falhas em produção.');
    process.exit(1);
  } else {
    console.warn('\n⚠️ Continuando o build em modo de desenvolvimento (Fallback).');
  }
}

console.log('✅ Ambiente validado com sucesso.');
