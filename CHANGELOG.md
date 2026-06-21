# Changelog

Histórico das mudanças feitas durante a migração do Validate de HTML/CSS/JS estático para Next.js. Cada entrada documenta data, o que foi alterado e o motivo.

## 2026-06-21 — Troca de stack de auth/dados: Auth.js+Prisma → Firebase (parte 4: Firestore em validações, dashboard e limpeza)

**O que mudou:**
- `lib/firestore.ts`: tipo `ValidationDoc` e as funções `createValidation` (grava em `validations`) e `getValidationsByProject`.
- `components/StarRating.tsx` (novo): seletor de 1 a 5 estrelas, reaproveitando o visual `.star-rating` que já existia no site estático original (cinza → dourado ao selecionar), agora com `aria-label` em cada estrela.
- `components/ValidationForm.tsx` (novo, substitui `ChecklistForm.tsx`, removido): nota por estrela para Design e UX, campo de bugs e campo de comentário — sem nome/email, já que validações são anônimas por design. Envia para o Firestore via `createValidation`.
- `app/p/[id]` renomeado para `app/p/[slug]`: agora é client component (`useParams`), busca o projeto por slug no Firestore (`getProjectBySlug`) e mostra `ContentPreview` + `ValidationForm`. Projeto inexistente mostra o mesmo cartão de "não encontrado" (sem mais depender do `notFound()` do Next, que só funciona em Server Components).
- `components/ContentPreview.tsx`: atualizado para os tipos reais do Firestore (`link/video/document/file`, antes `site/video/document/executable` do mock).
- `components/DashboardContent.tsx` (novo): busca os projetos do usuário logado (`getProjectsByOwner`) e as validações de cada um (`getValidationsByProject`); mostra nº de validações, nota média de Design/UX e uma tabela com bugs/comentário/data. Estado vazio com link para `/create` se ainda não há projetos.
- Removidos: `lib/mock-data.ts`, `components/ChecklistForm.tsx`/`.module.css` — nada mais depende de dados mockados para projetos/validações.

**Testado de ponta a ponta contra o Firestore real (`validate-node-d42b8`):** criei um projeto logado, abri o link público deslogado (embed real do site funcionando no iframe), enviei uma validação anônima (4★ Design, 3★ UX, bugs e comentário) e confirmei que ela apareceu certinha no dashboard do dono, com a data formatada. Link de projeto inexistente mostra o cartão de "não encontrado" corretamente.

**Aviso de segurança (lembrete, agora que a migração para Firebase está completa):** as regras do Firestore continuam em modo de teste — leitura/escrita totalmente abertas para qualquer um, inclusive de fora do app. Antes de qualquer uso público real, precisamos escrever regras adequadas, por exemplo:
- `projects`: leitura aberta (a página pública precisa ler sem login); escrita (criar/editar/excluir) só permitida se `request.auth.uid == resource.data.ownerId`.
- `validations`: criação aberta para qualquer um (validações são anônimas, por design), mas sem permitir update/delete por ninguém que não seja o dono do projeto referenciado (ou desabilitar update/delete completamente, já que validações deveriam ser imutáveis).

## 2026-06-21 — Troca de stack de auth/dados: Auth.js+Prisma → Firebase (parte 3: Firestore em projetos)

**O que mudou:**
- `lib/firestore.ts`: tipos `ContentType` (`link/video/document/file`) e `ProjectDoc`, e as funções `createProject` (gera um slug aleatório de 6 caracteres e grava em `projects`), `getProjectBySlug` e `getProjectsByOwner`. Comentário no topo do arquivo avisando sobre o modo de teste das regras (ver aviso completo abaixo).
- `components/CreateProjectForm.tsx`: simplificado — sem o construtor de checklist customizado (nome, tipo de conteúdo e URL), usa `useAuth()` para o `ownerId` e grava de verdade no Firestore. O link gerado agora é real (`validate.com/p/<slug>`) e funciona com o botão "Ver como ficaria" apontando pro slug de verdade.
- `app/create/page.tsx`: texto atualizado (não é mais "protótipo, nada é salvo" — agora salva de verdade).

**Por que simplificar o checklist:** a coleção `validations` (próxima etapa) tem formato fixo — `designRating`, `uxRating`, `bugs`, `comment` — sem espaço para um checklist por projeto. Então o construtor de checklist na criação deixou de ter efeito; toda validação pública vai usar sempre esse mesmo formato fixo.

**Pendência temporária:** `app/p/[id]` e o dashboard ainda leem de `lib/mock-data.ts` (não dos projetos reais) — isso muda na próxima entrada, junto com a coleção `validations`. Por isso `ContentPreview` ainda não foi atualizado para os novos tipos `link/video/document/file` (fica pra quando a página pública for reescrita, pra cada commit continuar buildando sozinho).

**Testado contra o Firestore real:** criei um projeto de teste pelo `/create` logado e confirmei que o Firestore gravou o documento e devolveu um link funcional com slug novo.

**Aviso de segurança (lembrete):** as regras do Firestore continuam em modo de teste. Antes de uso público real, precisamos escrever regras adequadas — só o dono (`ownerId`) deve poder editar/excluir seu projeto.

## 2026-06-21 — Troca de stack de auth/dados: Auth.js+Prisma → Firebase (parte 2: autenticação)

**O que mudou:**
- Removidos `auth.ts`, `lib/prisma.ts`, `lib/auth-helpers.ts`, `lib/actions/auth.ts`, `app/api/auth/[...nextauth]/`, `types/next-auth.d.ts` e a pasta `prisma/` inteira (schema, migrations, banco SQLite). Dependências removidas: `next-auth`, `prisma`, `@prisma/client`, `bcryptjs`, `@types/bcryptjs`.
- `components/AuthProvider.tsx`: contexto + hook `useAuth()` (`user`, `loading`) via `onAuthStateChanged` do Firebase. Envolve o app inteiro em `app/layout.tsx`.
- `lib/auth-actions.ts`: `login()`/`signUp()` usando `signInWithEmailAndPassword`/`createUserWithEmailAndPassword` + `updateProfile` (nome), com mapeamento dos códigos de erro do Firebase para mensagens em português.
- `app/login/page.tsx` e `app/signup/page.tsx`: viraram client components com `useState`, chamando as funções acima (antes eram server actions do Auth.js).
- `components/Header.tsx` e `components/SignOutButton.tsx`: reescritos para usar `useAuth()`/`signOut` do Firebase em vez da sessão do Auth.js.
- `components/RequireAuth.tsx` (novo): protege `/create` e `/dashboard` no cliente — mostra "Carregando...", redireciona pra `/login` se não houver usuário. Importante: como o SDK usado é o client (`firebase`, não `firebase-admin`), não existe mais sessão verificada no servidor; a proteção dessas rotas passou a ser client-side.
- `app/layout.tsx`: removido `export const dynamic = "force-dynamic"` (só existia por causa do cache da sessão do Auth.js; sem sessão de servidor, não faz mais sentido) — `/`, `/create`, `/dashboard`, `/login` e `/signup` voltaram a ser estáticos.

**Testado de ponta a ponta contra o projeto Firebase real (`validate-node-d42b8`):** cadastro cria usuário de verdade e loga automático, `/create` redireciona pra `/login` quando deslogado, login funciona, logout funciona.

**Bug encontrado e corrigido no caminho:** ao clicar em "Sair" estando em `/create` ou `/dashboard`, o próprio botão tentava navegar pra `/` ao mesmo tempo que o `RequireAuth` da página redirecionava pra `/login` (a sessão cai, o `RequireAuth` reage) — uma corrida entre os dois redirecionamentos, e `/login` sempre vencia. `SignOutButton` agora só força a navegação pra `/` quando a página atual não é protegida; em páginas protegidas, deixa o `RequireAuth` cuidar do redirecionamento.

## 2026-06-21 — Troca de stack de auth/dados: Auth.js+Prisma → Firebase (parte 1: config)

**O que mudou:**
- Instalado o SDK client do `firebase` (Auth + Firestore). Nenhuma outra dependência nova.
- `lib/firebase.ts`: inicializa o app do Firebase (idempotente via `getApps()`) e exporta `auth`/`db`. Sem `getAnalytics` — não vamos usar Analytics nesta fase.
- Config movida para variáveis de ambiente `NEXT_PUBLIC_FIREBASE_*` em `.env.local` (não commitado — já cobertas pelo `.env*` do `.gitignore`); `.env.example` atualizado com os nomes das variáveis.

**Por quê:** decisão do usuário de substituir o plano anterior (Auth.js/Prisma/Supabase) por Firebase Authentication + Cloud Firestore, tanto para login/cadastro de quem cria projetos quanto para persistir projetos e validações de verdade. Esta primeira etapa só prepara a configuração; a troca efetiva da autenticação e dos dados vem nas próximas entradas.

**Aviso de segurança (pendência):** as regras do Firestore continuam em modo de teste (leitura/escrita aberta para qualquer um), como configurado no console. Antes de qualquer uso público real, precisamos voltar e escrever regras adequadas — por exemplo: só o dono (`ownerId`) pode editar/excluir seu próprio projeto; qualquer pessoa pode criar uma validação (são anônimas, por design), mas ninguém deve poder editar ou apagar validações de outros.

## 2026-06-21 — Novo layout da home (hero, como funciona, exemplo, sobre)

**O que mudou:**
- `components/Hero.tsx`: nova mensagem principal ("Pare de perguntar 'vê aí se tá bom' / Valida aí.") com card de demonstração ao lado (link em fonte monoespaçada, avaliação por estrelas de Design/UX, contagem de bugs e um comentário de exemplo), baseado no protótipo HTML aprovado.
- `components/HowItWorks.tsx`: nova seção "Como funciona" com os 3 passos (Suba o link / Compartilhe / Veja o resultado).
- `components/MediaShowcase.tsx`: seção de exemplo do produto em ação. Recebe uma prop opcional `media: { type: "image" | "video", src, alt }` — sem ela, mostra um placeholder; já preparado para receber um vídeo no futuro sem mudar a estrutura.
- `components/About.tsx`: seção "Sobre o Validate" com texto explicando o que é e por que existe. **Texto é um rascunho inicial — pendente de revisão.**
- `app/globals.css`: novo token `--accent: #d85a30`, usado com moderação (destaque "Valida aí" e contagem de bugs no card de demonstração).
- A seção de lead cards (Glossário/Bem-vindo CIESA) saiu da home, já que não faz parte da nova estrutura pedida; o componente (`LeadCardsSection`) continua no projeto, sem uso por enquanto, caso seja reaproveitado em outra página.
- `app/page.tsx` atualizado para a nova ordem: Header (inalterado) → Hero → Como funciona → Exemplo → Sobre → Footer (inalterado).

**Por quê:** redesenho de conteúdo/mensagem da home a partir de um protótipo visual aprovado, com foco em comunicar a proposta de valor (checklist real de design/UX/bugs, link compartilhável sem login) de forma mais direta que a versão anterior.

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
