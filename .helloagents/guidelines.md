# inovaSys - Guidelines

## 1. 编码规范
- **S.O.L.I.D. 原则**: 严格遵守 5 大原则，特别是 SRP 和 OCP。
- **命名**: camelCase 用于变量/函数，PascalCase 用于组件/类。
- **Early Return**: 优先处理异常分支，减少 `if-else` 嵌套。
- **无状态组件**: 尽量保持组件纯粹，逻辑抽离至 Hooks。

## 2. 数据访问 (DAL)
- 禁止直接在组件中调用 `supabase-js`。
- 所有数据操作必须通过 `src/infrastructure/database/repositories` 下的 Repository。
- 使用 `DependencyRegistry` 获取 Repository 实例。

## 3. 安全规范
- **密钥保护**: 不得在前端硬编码 Supabase 密钥（除 `anon` 键外，即使是 `anon` 也建议通过 `.env` 管理）。
- **敏感操作**: 涉及管理权限的操作必须通过服务端（Vercel Functions）或 RLS 严格校验。

## 4. 验证规范
- 提交前必须运行 `npm run lint` 和 `npm test`。
- 新功能必须附带 Vitest 测试用例。
