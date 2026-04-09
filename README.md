# InovaSys 2.0 - Plataforma de Gestão Arbitral

O **InovaSys** é uma plataforma corporativa de classe mundial desenhada para modernizar e automatizar operações de Câmaras de Arbitragem. O sistema evoluiu de uma arquitetura legada para um ecossistema reativo, resiliente e escalável, focado em governança de dados e produtividade jurídica.

## 🚀 Stack Tecnológica

- **Frontend:** React 19 + TypeScript
- **Estilização:** Tailwind CSS para layouts responsivos e modernos.
- **Gerenciamento de Estado:**
  - **Assíncrono:** [TanStack Query v5](https://tanstack.com/query) (Gerenciamento de cache, invalidação e reatividade).
  - **Global/Sessão:** [Zustand](https://github.com/pmndrs/zustand) (Estado leve para autenticação e UI).
- **Backend-as-a-Service:** [Supabase](https://supabase.com/) (PostgreSQL, Autenticação, Realtime WebSockets e Storage).
- **Qualidade e Testes:** [Vitest](https://vitest.dev/) + React Testing Library + Coverage (v8).
- **CI/CD:** GitHub Actions + Vercel.

## 🏗️ Arquitetura de Software

O sistema adota os princípios de **Clean Architecture** e **S.O.L.I.D.** para garantir manutenibilidade e isolamento de responsabilidades.

### 1. Camada DAL (Data Access Layer)
Localizada em `src/infrastructure/database/repositories`, esta camada centraliza toda a interação com o Supabase.
- **BaseSupabaseRepository:** Classe base genérica que padroniza operações de CRUD e tratamento de erros.
- **Isolamento:** A camada de apresentação nunca chama o Supabase diretamente; ela consome os Repositórios via Injeção de Dependência.

### 2. DependencyRegistry (Injeção de Dependência)
Localizado em `src/infrastructure/di/DependencyRegistry.ts`.
- Atua como um contêiner Singleton para instanciar repositórios e casos de uso.
- Facilita a substituição de implementações para testes ou migrações futuras.

### 3. Hooks Reativos de Domínio
Localizados em `src/presentation/hooks`.
- Utilizam o TanStack Query para orquestrar o estado assíncrono.
- **Padrão:** O hook invoca o repositório (via DI) e gerencia automaticamente estados de `loading`, `error` e `success`.
- **Invalidação de Cache:** Mutações são seguidas de `queryClient.invalidateQueries` para garantir consistência visual imediata.

## 🛠️ Guia de Desenvolvimento

### Adicionando uma Nova Funcionalidade (ex: Módulo X)
1. **Contrato/Entidade:** Defina a interface em um novo arquivo de Repositório.
2. **Repositório:** Crie o arquivo em `src/infrastructure/database/repositories/XRepository.ts` herdando de `BaseSupabaseRepository`.
3. **Registro:** Adicione o repositório no `DependencyRegistry.ts`.
4. **Hook:** Crie o hook em `src/presentation/hooks/useX.ts` utilizando `useQuery` ou `useMutation`.

### Padrões de Clean Code
- **Nomenclatura:** Variáveis e funções em camelCase, classes em PascalCase. Use nomes descritivos (ex: `excluirDocumento` em vez de `delDoc`).
- **Early Return:** Trate condições de erro no início da função para evitar aninhamentos profundos.
- **Single Responsibility:** Cada componente ou hook deve fazer apenas uma coisa e fazê-la bem.

## ⚙️ Infraestrutura e DevOps

### Variáveis de Ambiente Necessárias (.env)
```env
VITE_SUPABASE_URL=https://sua-url.supabase.co
VITE_SUPABASE_ANON_KEY=seu-anon-key
```

### Comandos Disponíveis
- `npm run dev`: Inicia o ambiente de desenvolvimento.
- `npm run build`: Valida o ambiente, checa tipos e gera o bundle de produção.
- `npm test`: Executa a suíte de testes de unidade.
- `npm run test:coverage`: Gera o relatório de cobertura de código.
- `npm run lint`: Valida padrões de código e boas práticas.

### Pipeline de CI/CD
O projeto utiliza **GitHub Actions** (`.github/workflows/ci.yml`). Qualquer código enviado para a branch `main` passa por um crivo automatizado de:
1. Instalação e Build.
2. Lint Check.
3. Execução de Testes com Cobertura.

---

**Nota Técnica:** O sistema foi blindado contra falhas de produção via script de pré-build que audita variáveis de ambiente obrigatórias.
