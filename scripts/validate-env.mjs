import fs from 'fs';
import path from 'path';

const REQUIRED_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

console.log('🔍 Iniciando validação de variáveis de ambiente...');

const missing = REQUIRED_VARS.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.log('⚠️  Aviso: As seguintes variáveis de ambiente estão ausentes:');
  missing.forEach(v => console.log(`   - ${v}`));
  console.log('\n⚠️  Continuando o build em modo de desenvolvimento. Configure as variáveis para produção.');
}

console.log('✅ Ambiente validado com sucesso.');
