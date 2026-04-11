import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const apiKey = process.env.VERCEL_API_KEY;
const projectId = process.env.VERCEL_PROJECT_ID;

if (!apiKey || !projectId) {
  console.error('❌ Erro: VERCEL_API_KEY e VERCEL_PROJECT_ID devem estar definidos');
  process.exit(1);
}

console.log('🚀 Iniciando deploy na Vercel...\n');

// Verificar se o build existe
const distPath = join(process.cwd(), 'dist');
if (!existsSync(distPath)) {
  console.error('❌ Erro: Pasta dist/ não encontrada. Execute npm run build primeiro');
  process.exit(1);
}

console.log('✅ Build encontrado em dist/');
console.log('📦 Fazendo deploy...\n');

// O deploy será feito via CLI do Vercel
// Este script é apenas um placeholder para futuros deployments via API
console.log('ℹ️  Use o comando: vercel --prod');
console.log('ℹ️  Ou acesse: https://vercel.com/dashboard para gerenciar deployments');
