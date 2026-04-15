import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const srcDir = path.join(rootDir, 'src');

console.log('🛡️ Iniciando Auditoria de Segurança InovaSys...');

const patterns = [
  { name: 'Hardcoded Supabase Key', regex: /'eyJ[a-zA-Z0-9\-_]+\.eyJ[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+'/g },
  { name: 'Direct Supabase Call (Outside Repository)', regex: /supabase\.from\(/g, exclude: 'repositories' },
  { name: 'Missing CSRF/Security Headers mentioned', regex: /X-Frame-Options/g, reverse: true }
];

let issuesFound = 0;

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') walk(fullPath);
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.html')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        patterns.forEach(p => {
          if (p.exclude && fullPath.includes(p.exclude)) return;
          const match = content.match(p.regex);
          if (match && !p.reverse) {
            console.warn(`⚠️ [${p.name}] encontrado em: ${fullPath}`);
            issuesFound++;
          }
        });
      }
    }
  }
}

walk(rootDir);

if (issuesFound === 0) {
  console.log('✅ Nenhum risco crítico imediato encontrado na varredura de padrões.');
} else {
  console.log(`❌ Auditoria concluída com ${issuesFound} alertas.`);
}
