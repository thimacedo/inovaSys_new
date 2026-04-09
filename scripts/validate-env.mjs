import fs from 'fs';
import path from 'path';

const REQUIRED_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

console.log('🔍 Iniciando validação de variáveis de ambiente...');

const missing = REQUIRED_VARS.filter(v => !process.env[v]);

if (missing.length > 0) {
  console.error('❌ Erro de Configuração: As seguintes variáveis de ambiente estão ausentes:');
  missing.forEach(v => console.error(`   - ${v}`));
  console.error('\nO build foi interrompido para evitar falhas em tempo de execução.');
  process.exit(1);
}

console.log('✅ Ambiente validado com sucesso.');
