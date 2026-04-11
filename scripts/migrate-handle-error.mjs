import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const REPOS_DIR = "./src/infrastructure/database/repositories";

console.log(`🔍 Procurando chamadas handleError sem context em ${REPOS_DIR}...\n`);

let totalFixed = 0;

for (const file of readdirSync(REPOS_DIR).filter((f) => f.endsWith(".ts"))) {
  const filePath = join(REPOS_DIR, file);
  const original = readFileSync(filePath, "utf-8");

  const lines = original.split("\n");
  const result = [];
  const methodStack = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const methodMatch = line.match(/^\s+(?:async\s+)?(\w+)\s*\(/);
    if (methodMatch && !line.includes("//")) {
      methodStack.push(methodMatch[1]);
    }

    if (line.includes("this.handleError(") && !line.includes(", '")) {
      const currentMethod = methodStack[methodStack.length - 1] ?? "unknown";
      const fixed = line.replace(
        /this\.handleError\((\w+)\)/,
        `this.handleError($1, '${currentMethod}')`
      );
      result.push(fixed);
      totalFixed++;
      console.log(`  ✓ ${file}:${i + 1} → context: '${currentMethod}'`);
    } else {
      result.push(line);
    }
  }

  const updated = result.join("\n");
  if (updated !== original) {
    writeFileSync(filePath, updated, "utf-8");
    console.log(`\n📝 ${file} atualizado.\n`);
  }
}

console.log(`✅ Total de chamadas corrigidas: ${totalFixed}`);
console.log(`\n⏳ Executando verificação TypeScript...`);