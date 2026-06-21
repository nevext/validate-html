# Changelog

Histórico das mudanças feitas durante a migração do Validate de HTML/CSS/JS estático para Next.js. Cada entrada documenta data, o que foi alterado e o motivo.

## 2026-06-21 — Prisma + SQLite para contas de usuário

**O que mudou:**
- Adicionado `prisma/schema.prisma` com o modelo `User` (id, name, email único, passwordHash, createdAt) — único dado que passa a ter persistência real nesta fase; projetos/checklist/respostas continuam mockados.
- `lib/prisma.ts` com singleton do `PrismaClient` (evita múltiplas conexões em dev com hot-reload).
- Banco SQLite local (`prisma/dev.db`, gitignored) criado via `npx prisma migrate dev --name init`; migration SQL versionada em `prisma/migrations/`.
- `.env` (gitignored) e `.env.example` (commitado) com `DATABASE_URL` e `AUTH_SECRET`.
- Dependências novas: `@prisma/client` e `prisma` (devDependency), fixadas em `6.19.3` — a versão mais recente (7.x) removeu o suporte a `url` direto no `datasource` do schema, exigindo driver adapters extras; a 6.x mantém a configuração simples planejada para este protótipo.

**Por quê:** login/cadastro de quem cria projetos precisa de persistência real, mesmo com o resto do app ainda mockado, conforme pedido. SQLite via Prisma é a opção mais simples de configurar localmente sem depender de um serviço de banco externo.

## 2026-06-20 — Migração para Next.js (App Router + TypeScript)

**O que mudou:**
- Projeto estático (`index.html`, `style.css`, `script.js`) arquivado em `legacy-static/`, preservado intacto como referência.
- Novo projeto Next.js 16 (App Router, TypeScript, sem Tailwind) inicializado na raiz do repositório.
- Identidade visual original portada 1:1 via CSS Modules: fundo `#f6f6f5`, tipografia KazerFluro (carregada via `next/font/local`) e Poppins (`next/font/google`), hero "VALIDATE" em bold extremo, seção de lead cards (Glossário/Bem-vindo do CIESA) com a mesma animação de entrada por scroll.
- Fluxos antigos de modal com `mailto:`/query-string (Validar site, Gerar link, Ajude-me, Termos, rating) substituídos pela nova arquitetura de produto: criar projeto → link único `/p/[id]` → checklist de validação → dashboard.
- Páginas novas, com dados mockados em memória (`lib/mock-data.ts`): `/create` (formulário de criação de projeto com checklist por categoria), `/p/[id]` (página pública de validação com preview por tipo de conteúdo e formulário de checklist + comentário), `/dashboard` (lista de projetos e respostas mockadas).

**Por quê:** modernizar a stack para React/Next.js mantendo a identidade visual já validada, e trocar a lógica de protótipo antiga (sem backend, baseada em mailto) pela arquitetura real do produto descrita pelo usuário, antes de adicionar persistência e autenticação.
