# inovaSys - Guidelines

## 1. 编码规范
- **S.O.L.I.D. 原则**: 严格遵守 5 大原则，特别是 SRP 和 OCP。
- **命名**: camelCase 用于变量/函数，PascalCase 用于组件/类。
- **Early Return**: 优先处理异常分支，减少 `if-else` 嵌套。
- **无状态组件**: 尽量保持组件纯粹，逻辑抽离至 Hooks。

## 2. 数据访问 (DAL)
- 禁止直接在组件中调用 `supabase-js`。
- Todos as operações de dados devem passar pelo `src/infrastructure/database/repositories` através do Repository.
- Usar `DependencyRegistry` para obter instâncias de Repository.

## 3. Segurança
- **Proteção de Chaves**: Nenhuma chave Supabase deve ser hardcoded no frontend (exceto a chave `anon`, e mesmo esta deve ser gerenciada via `.env`).
- **Operações Sensíveis**: Operações que envolvem permissões de administrador devem ser rigorosamente validadas via servidor (Vercel Functions) ou RLS.

## 4. Validação
- Antes do commit, deve-se executar `npm run lint` e `npm test`.
- Novas funcionalidades devem ter testes Vitest.

## 5. Gestão de Quota e Modelos (Mandatório)
- **Alerta de Quota**: Avisar proativamente quando a quota da API estiver próxima do fim.
- **Prevenção de Falhas**: Não iniciar tarefas que dependam de IA se a quota disponível não for suficiente para a conclusão da atividade.
- **Seleção de Modelo**: Sempre que o motor padrão não for superior em desempenho de programação, interagir com o `qwen2.5` ou a melhor versão programadora disponível no diretório `E:\ollama\models` para tarefas de desenvolvimento.