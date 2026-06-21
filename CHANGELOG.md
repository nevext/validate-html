# Changelog

Histórico das mudanças feitas durante a migração do Validate de HTML/CSS/JS estático para Next.js. Cada entrada documenta data, o que foi alterado e o motivo.

## 2026-06-21 — Exigir login para criar projeto e ver dashboard

**O que mudou:**
- `app/create/page.tsx` e `app/dashboard/page.tsx` agora chamam `requireUser()` (`lib/auth-helpers.ts`) antes de renderizar — sem sessão, redirecionam para `/login`. Confirmado via curl (307 → `/login` sem cookie) e fluxo completo no navegador (cadastro → acesso liberado → logout → redirecionado de novo).
- A lógica de formulário de `/create` foi extraída para `components/CreateProjectForm.tsx` (client component), já que a página em si precisa ser um Server Component para poder checar a sessão antes de renderizar; o CSS correspondente foi junto para `CreateProjectForm.module.css`.
- `/p/[id]` e a home continuam públicas, sem exigir login, como pedido.

**Por quê:** só quem cria projetos precisa de conta — a etapa anterior implementou login/cadastro, mas as páginas ainda estavam abertas; esta etapa fecha o requisito de controle de acesso.

## 2026-06-21 — Login e cadastro com Auth.js (Credentials)

**O que mudou:**
- `auth.ts`: configuração do Auth.js v5 (`next-auth@beta`) com Credentials provider — `authorize()` busca o usuário no Prisma e compara a senha com `bcrypt.compare`; sessão em estratégia JWT (sem `@auth/prisma-adapter`, que só seria necessário para provedores OAuth).
- `app/api/auth/[...nextauth]/route.ts`: rota de API que expõe os handlers do Auth.js.
- `lib/actions/auth.ts`: server actions `login` e `signUp` (cadastro cria o usuário com senha em hash via `bcryptjs` e já autentica automaticamente).
- `lib/auth-helpers.ts`: `requireUser()`, pronta para proteger páginas (usada na próxima etapa).
- `app/login/page.tsx` e `app/signup/page.tsx`: formulários client-side com `useActionState`, mensagens de erro inline.
- `components/SignOutButton.tsx`: usa `signOut` de `next-auth/react` (redirect "hard", via `window.location`) em vez de uma server action com `redirectTo` — uma server action redirecionando para a própria página em que o usuário já está não força o React a descartar a árvore renderizada (o header continuava mostrando o usuário antigo até uma navegação real); o hard redirect evita esse problema de cache do lado do cliente.
- `components/Header.tsx`: agora é async e chama `auth()` — mostra "Entrar"/"Cadastrar" deslogado, nome do usuário + "Sair" logado.
- `app/layout.tsx`: `export const dynamic = "force-dynamic"` para garantir que o layout (e o estado de sessão no header) nunca fique em cache entre navegações.
- Dependência nova: `next-auth@beta` (Auth.js v5, compatível com App Router/Server Actions).

**Por quê:** implementar o cadastro/login real pedido pelo usuário, mantendo só o necessário (sem adapter, sem middleware Edge) para o escopo deste protótipo. `/create` e `/dashboard` ainda não exigem login nesta etapa — isso vem a seguir.

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
