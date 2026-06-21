# Validate

Plataforma onde um usuário cria um projeto, gera um link único (`/p/[slug]`) e compartilha com outras pessoas para que testem e validem seu site, app, vídeo, documento ou executável — respondendo um checklist de avaliação (design, UX, bugs) e deixando comentários. O dono do projeto vê os resultados num dashboard.

Migrado de um protótipo estático em HTML/CSS/JS (preservado em [`legacy-static/`](./legacy-static)) para Next.js (App Router + TypeScript).

## Stack

- **Next.js 16** (App Router, TypeScript)
- **CSS Modules** para estilo (identidade visual original portada 1:1: fundo claro, tipografia bold extrema KazerFluro + Poppins, estilo editorial preto/branco)
- **Firebase Authentication** (email/senha) — só quem cria projetos precisa de conta; quem responde o checklist em `/p/[slug]` não precisa de login
- **Cloud Firestore** — projetos (`projects`) e validações (`validations`) são dados reais, não mockados

## Configuração

Crie um `.env.local` (veja `.env.example`) com as credenciais do seu projeto Firebase (Configurações do projeto → Geral → apps web). As regras do Firestore ainda estão em modo de teste — **antes de qualquer uso público real, é preciso escrever regras adequadas** (ver aviso no `CHANGELOG.md`).

## Estrutura

```
app/            rotas (App Router): home, /create, /p/[slug], /dashboard, /login, /signup
components/     componentes React + seus CSS Modules
lib/            firebase.ts (config), firestore.ts (projects/validations), auth-actions.ts
public/         imagens e ícones estáticos
legacy-static/  versão original em HTML/CSS/JS, preservada como referência
```

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Veja o [CHANGELOG.md](./CHANGELOG.md) para o histórico de mudanças.
