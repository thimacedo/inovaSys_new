# Project State: inovaSys

## 主线目标
- [√] 组织项目结构并追踪后续行动
- [√] 修复 Supabase 安全漏洞与表结构缺失
- [ ] 提升系统质量与自动化程度

## 正在做什么
- [√] 启动 HelloAGENTS 工作流
- [√] 完成项目初步诊断与架构识别
- [√] 初始化 `.helloagents/` 知识库空间
- [√] 制定详细实施计划
- [√] 给用户展示改动的可视化反馈
- [√] 配置 Supabase Service Role Key 自动化凭据
- [√] 配置 Supabase Project ID

## 关键上下文
- **技术栈**: React 19 + TypeScript + Vite + Supabase + TanStack Query + Zustand
- **当前状态**: 已识别核心架构（Clean Arch + SOLID）及关键安全风险（Supabase 密钥暴露已修复）
- **数据库**: Supabase Project ID (`tsgbvhfdceyjbyfstjol`) e Service Role Key já configurados no `.env`.

## 下一步
- [√] 批量执行 SQL 修复脚本 (REPAIR / RLS / SEED) através do SQL Editor do Supabase
- [√] 验证数据库 RLS 策略是否生效
- [√] 迁移 legacy/ 文件夹下的核心逻辑 (Peticionamento/Dashboard/Documentos) para React

## 阻塞项
- 无
