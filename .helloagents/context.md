# inovaSys 2.0 - Project Context

## 1. 核心架构 (Clean Architecture)
系统采用分层架构，解耦核心逻辑与基础设施：
- **Infrastructure 层**:
  - `src/infrastructure/database/repositories`: 处理与 Supabase 的交互。
  - `src/infrastructure/di/DependencyRegistry.ts`: 统一的依赖注入容器。
- **Presentation 层**:
  - `src/presentation/hooks`: 封装业务逻辑的 React Hooks（基于 TanStack Query）。
  - `src/presentation/components`: 无状态或受控的 UI 组件。
- **Domain/Types 层**:
  - `E:\inovasys\types.ts` 和各模块内部定义。

## 2. 技术栈
- **Frontend**: React 19, TypeScript, Vite.
- **Styling**: Tailwind CSS 4.
- **State**: TanStack Query v5 (Server State), Zustand (Client State).
- **Backend**: Supabase (PostgreSQL, Auth).
- **Quality**: Vitest, ESLint, Vercel Analytics.

## 3. 目录结构索引
- `api/`: Vercel Serverless Functions.
- `scripts/`: 构建与验证脚本。
- `src/`: 核心源码。
- `DOC/`: 额外文档。
- `SQL Files`: Supabase 数据库初始化与修复脚本（在项目根目录）。

## 4. 关键文件
- `DIAGNOSTICO.md`: 最近的修复历史与待办事项。
- `server.ts`: 可能的本地后端测试脚本。
- `vite.config.ts`: Vite 构建配置。
