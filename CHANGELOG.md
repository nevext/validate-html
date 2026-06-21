# Changelog

Histórico das mudanças feitas durante a migração do Validate de HTML/CSS/JS estático para Next.js. Cada entrada documenta data, o que foi alterado e o motivo.

## 2026-06-21 — Remove o envio automático de email, tira sublinhados, ajusta layout do dashboard

**Por que remover o Resend:** testamos de ponta a ponta na entrada anterior e o envio automático funciona — mas só de verdade pro email cadastrado na própria conta Resend (modo sandbox, sem domínio verificado). Como não vamos criar um domínio agora, manter a feature instalada não tinha utilidade prática (só notificaria um endereço fixo, não o dono real de cada projeto). Decidimos remover, e reativamos quando houver um domínio.

**O que mudou:**
- Removidos: `app/api/send-validation-email/`, `lib/email.ts`, a dependência `resend` (`npm uninstall`), e as variáveis `RESEND_API_KEY` de `.env.local`/`.env.example`.
- `components/ValidationForm.tsx`: voltou a só gravar a validação no Firestore, sem disparar nada depois — mensagem de sucesso ajustada pra não mencionar email ("O dono do projeto vai ver tudo no dashboard").
- `app/(marketing)/p/[slug]/page.tsx`: não passa mais `ownerEmail`/`projectTitle`/`buildLabel` pro `ValidationForm` (não são mais usados ali). **O campo `ownerEmail` continua sendo salvo em `ProjectDoc`** (não removi do schema) — fica como dado guardado sem uso agora, caso a notificação por email volte no futuro com um domínio verificado.

**Sublinhados removidos do site inteiro:** a causa raiz era simples — `app/globals.css` nunca resetava o `text-decoration` padrão do navegador nos links (`a{color:inherit}`, sem `text-decoration:none`), então todo `<a>`/botão-como-link ficava sublinhado por padrão. Corrigido isso globalmente, e removidas as declarações `text-decoration:underline` que tinham sido adicionadas depois em `DashboardContent`, `ProfileForm`, `ContentPreview` e nos rodapés de `/login`/`/signup` (trocadas por `font-weight:600` + hover de cor, mantendo a affordance de "isso é clicável" sem a linha embaixo).

**Dashboard: espaço vazio e painel de resumo:** a causa do "espaço gigante à direita" era um `max-width:960px` que eu tinha colocado em `app/(app)/dashboard/page.module.css` durante a etapa de reestruturação das rotas — numa tela grande, isso deixava metade da área de conteúdo (`.content`, ao lado da sidebar) vazia. Aumentei pra `1320px` e `components/DashboardContent.tsx` agora usa esse espaço com um painel de **"Resumo"** fixo à direita (`position:sticky`) mostrando: total de validações recebidas, builds pendentes e builds aprovadas — somados de todos os projetos. **Sobre "issues pendentes/resolvidas":** o app não tem um sistema de issues granular (cada bug é só texto livre dentro de uma validação, sem estado de resolvido/pendente próprio) — então mapeei pro que já existe: uma build com selo verde ("Aprovado") conta como resolvida, qualquer outro status (cinza/amarelo/vermelho/azul) conta como pendente. Em telas ≤900px o painel empilha embaixo da lista de projetos.

**Testado:** build/lint limpos; fluxo completo de validação pública continua funcionando sem nenhuma referência a email; dashboard em 1920px usa a largura toda com o painel de resumo calculando os números certos; confirmado responsivo em mobile.

## 2026-06-21 — Email automático pro dono via Resend (substitui o mailto)

**O que mudou:**
- Instalei `resend` (SDK oficial) — única dependência nova, usada só no servidor.
- `app/api/send-validation-email/route.ts` (novo): API Route que recebe `ownerEmail`, `projectTitle`, `buildLabel`, `buildUrl`, `answers` (lista de pergunta+resposta do checklist já formatada), `bugs` e `comment`, monta um email HTML simples e chama `resend.emails.send(...)` com `from: "Validate <onboarding@resend.dev>"` (domínio padrão do Resend, sem precisar verificar domínio próprio ainda) e `to: ownerEmail`.
- `RESEND_API_KEY` em `.env.local`/`.env.example`, **sem** prefixo `NEXT_PUBLIC_` — só a API Route (servidor) lê essa variável; nunca é exposta no client. Você ainda precisa colar a chave real no seu `.env.local` (deixei a linha pronta, vazia).
- `lib/email.ts` reescrito: `formatChecklistAnswers()` (monta a lista de pergunta+resposta a partir de `lib/checklists.ts` + `ratings`) e `sendValidationEmail()` (faz o `fetch` pra API Route — sem `await` bloqueante no chamador, e qualquer erro de rede/resposta só vira um `console.warn`, nunca uma exceção visível pro validador). Removida a função antiga `buildValidationMailto`.
- `components/ValidationForm.tsx`: depois que `createValidation` salva no Firestore com sucesso, dispara `sendValidationEmail(...)` automaticamente (`void`, não bloqueia a tela) — não depende mais de o validador ter um cliente de email configurado nem de clicar em "enviar". Mensagem de sucesso voltou a dizer só "suas respostas já chegaram para o dono do projeto" (antes mencionava o passo manual do mailto).

**Por que Resend + API Route em vez da extensão "Trigger Email" do Firebase:** essa extensão (e Cloud Functions em geral) só roda em projetos no plano Blaze (pago, com cobrança por uso), mesmo que o uso real fique nos limites gratuitos — exigiria upgrade de conta sem necessidade real. Resend integrado via uma API Route do próprio Next.js continua 100% dentro do plano gratuito do Firebase (Spark) e do Resend (100 emails/dia gratuitos), sem infraestrutura adicional pra manter.

**Falha no envio não bloqueia o validador:** testei sem a `RESEND_API_KEY` configurada (você ainda vai colar a sua) — a API Route responde com erro claro (500 + mensagem), o `fetch` no client captura isso e só loga um aviso no console, e a validação continua sendo salva e confirmada normalmente pro validador (`"Validação enviada!"`), com a build aparecendo certinha no dashboard do dono. Não consegui testar um envio bem-sucedido de verdade, já que isso depende da sua chave real do Resend.

## 2026-06-21 — Ajustes de UX: foto de perfil, email pro dono, histórico no dashboard, header

**O que mudou:**

1. **Foto de perfil clicável** (`components/ProfileForm.tsx`): o `<input type="file">` ficou visualmente escondido (`clip:rect(0,0,0,0)`, mantendo acessibilidade) dentro de um `<label>` que envolve o avatar — clicar na foto (ou no texto "Clique na foto para trocar") abre o seletor de arquivo, sem o botão "Choose File" do navegador visível.

2. **Validação avisa o dono por email** (`lib/email.ts`, novo): como o projeto não tem backend, usei o padrão `mailto:` que o site estático original já usava — sem dependência nova, sem serviço externo. `ProjectDoc` ganhou o campo `ownerEmail` (salvo a partir do `user.email` na criação do projeto, em `createProject`). Depois que uma validação é gravada no Firestore, o `ValidationForm` monta um `mailto:` com assunto/corpo (link da build, cada resposta do checklist, bugs, comentário) endereçado ao dono e aciona `window.location.href` — isso abre o programa de email do navegador da pessoa que validou, com a mensagem pronta pra ela só clicar em enviar (exatamente como o `mailto:` do script.js original). Não é 100% automático (a pessoa que valida precisa confirmar o envio no cliente de email dela), mas não exige nenhuma infraestrutura nova.

3. **Histórico de validações no dashboard** (`components/DashboardContent.tsx`): a reescrita pra builds (etapa anterior) tinha deixado só agregados (nº de validações, nota média) — não tinha como ver o que cada pessoa respondeu. Agora cada build tem um botão "N validações ▲/▼" que expande uma lista com cada validação: data, resposta de cada pergunta do checklist (usando `lib/checklists.ts` pra mostrar o label certo, estrela ou sim/não), bugs e comentário.

4. **Header**: logo da Nevext (`media/img/nevext-logo-icon.png` → `public/img/`, recortado com `sharp` — já estava no `node_modules` como dependência do Next, não precisei instalar nada novo — porque o arquivo original tinha bastante espaço em branco ao redor do ícone) no canto superior esquerdo, ao lado de "VALIDATE", linkando pro `github.com/nevext` — a marca de quem é dono da plataforma. `headerCard` virou um grid de 3 colunas (`1fr auto 1fr`) pra "Sobre"/"Política de Privacidade" ficarem centralizados de verdade em relação à página, e não só dentro do espaço que sobrava entre marca e botões (que tinham larguras diferentes). Hover mais visível nesses links (cor de acento + sublinhado). **Menu hambúrguer no mobile**: o header empilhado (marca, nav, nome, botões, tudo visível ao mesmo tempo) ocupava a tela inteira antes de qualquer conteúdo — agora em telas ≤600px aparece só marca + ícone de hambúrguer, e o menu completo (nav + botões/conta) abre num painel ao clicar.

**Pendência:** pra "avaliação vai pro email de quem gerou o link" funcionar de fato (não só abrir o cliente de email), a pessoa que valida precisa ter um cliente de email configurado no dispositivo e precisa clicar em enviar — isso é uma limitação do `mailto:`, não um bug. Se mais pra frente você quiser um envio 100% automático (sem depender do cliente de email de quem valida), aí sim precisaríamos de um serviço como EmailJS/Resend — combinamos que por agora ia de `mailto:`.

**Testado contra o Firebase real:** criei projeto, validei publicamente (o `mailto:` disparou sem navegar a página pra fora do app), conferi o histórico expandido no dashboard com os dados certos, e o logo/centralização/hambúrguer no header em desktop e mobile.

## 2026-06-21 — Página de perfil: foto, nome, curso, faculdade, trocar senha

**O que mudou:**
- `lib/firebase.ts`: agora também exporta `storage` (`getStorage`), usando o `storageBucket` que já estava no config.
- `lib/firestore.ts`: nova coleção `users/{uid}` (`getUserProfile`/`upsertUserProfile`) pra `curso` e `faculdade` — campos que não existem no perfil do Firebase Auth. Nome e foto continuam no Auth (`updateProfile`), sem duplicar.
- `lib/storage.ts` (novo): `uploadProfilePhoto(uid, file)` via Firebase Storage, com um timeout de 12s — o SDK do Storage fica tentando de novo (retry/backoff) em falha de rede/CORS antes de desistir, o que travava a tela "Salvando..." por bastante tempo quando o bucket não está disponível.
- `lib/auth-actions.ts`: `changePassword(senhaAtual, novaSenha)` — reautentica com a senha atual (`reauthenticateWithCredential`) antes de chamar `updatePassword`, porque o Firebase exige login "recente" pra essa operação.
- `components/ProfileForm.tsx` + `app/(app)/profile/page.tsx` (novos): formulário de dados (foto com preview, nome, curso, faculdade) e formulário separado de trocar senha. Se o upload da foto falhar, nome/curso/faculdade são salvos mesmo assim — só a foto fica de fora, com aviso específico.

**⚠️ Isso responde sua pergunta "precisa adicionar algo novo no Firebase?": SIM.** Testei o upload de foto contra o projeto real e **o Firebase Storage não está habilitado** — a chamada falha por CORS (o bucket não existe de fato ainda). Pra foto de perfil funcionar, é preciso ir no console do Firebase → Build → Storage → "Get started" e habilitar (pode ficar em modo de teste, como o Firestore). Sem isso, o formulário salva nome/curso/faculdade normalmente e mostra um aviso claro de que a foto não foi enviada — não fica travado nem finge que funcionou.

**Testado contra o Firebase real:** nome/curso/faculdade — salvei, recarreguei a página e os dados persistiram, e o nome novo apareceu na sidebar; senha — troquei, deslogei, e logei de novo só com a senha nova, confirmando que mudou de verdade; foto — confirmei o timeout gracioso com a mensagem certa (Storage indisponível).

**Limitação conhecida:** `changePassword` assume que o usuário tem uma senha (conta criada por email/senha). Quem entrou só pelo Google não tem senha pra reautenticar, então essa parte do formulário não funciona pra essas contas — não tratei esse caso especial.

## 2026-06-21 — Área logada separada: grupos de rotas, sidebar, hub "Projetos"

**Por que separar em grupos de rotas:** pra área logada (onde "acontece tudo") ficar visualmente diferente da home/marketing, sem duplicar `<RequireAuth>` em cada página, a forma mais limpa no App Router é dois grupos de rotas com layouts próprios. Grupos (`(marketing)`, `(app)`) não aparecem na URL, só organizam o layout.

**O que mudou:**
- `app/layout.tsx` (raiz) ficou só com `html`/`body`, fontes e `AuthProvider` — sem Header/Footer.
- `app/(marketing)/layout.tsx` (novo): tem o `<Header/>` + `<Footer/>` de sempre. Pra dentro dele foram movidas: home, `/login`, `/signup`, `/privacidade`, `/p/[slug]` — nenhuma URL mudou.
- `app/(app)/layout.tsx` (novo): shell da área logada — `<RequireAuth>` uma vez só, envolvendo uma barra lateral (`components/Sidebar.tsx`) + o conteúdo da página, com fundo branco e sem o hero/tipografia gigante da home, de propósito bem diferente visualmente. Pra dentro dele foram movidas `/create`, `/dashboard`, `/builds/new` (removi o `<RequireAuth>` que cada uma tinha individualmente, já que o layout cobre todas).
- `components/Sidebar.tsx` (novo): "Visão geral", "Submeter projeto", "Projetos em andamento", "Tutorial de submissão", "Tutorial de teste", "Meu perfil" e Sair, com o link ativo destacado. Em telas pequenas vira uma barra horizontal com scroll.
- `app/(app)/projects/page.tsx` (novo): hub que o botão "Projetos" do header abre — um menu com 4 cards (submeter novo projeto, projetos em andamento — já mostra quantos projetos existem —, tutorial de submissão, tutorial de teste).
- `app/(app)/projects/tutorial-submissao/page.tsx` e `tutorial-teste/page.tsx` (novos): **textos iniciais — rascunhos pra você revisar**, passo a passo de como criar/compartilhar um projeto e de como funciona o checklist pra quem valida.

**Pendência:** o link "Meu perfil" na sidebar e o nome clicável no header (desde a etapa anterior) ainda apontam pra `/profile`, que chega na próxima entrada.

**Testado contra o Firebase real:** deslogado, `/projects` redireciona pra `/login`; logado, naveguei entre os itens da sidebar (incluindo criar um projeto e ver no dashboard, tudo dentro do shell novo) e confirmei que `/p/[slug]` continua público, sem o shell da área logada.

## 2026-06-21 — Header novo: marca, navegação e estado logado

**O que mudou:**
- `components/Header.tsx`: marca virou só `VALIDATE` (antes "BEM VINDO AO VALIDATE"); os links de navegação `github`/`dashboard` foram trocados por `Sobre` (ancora `/#sobre`, reaproveitando a seção que já existe na home) e `Política de Privacidade` (`/privacidade`, novo). O link do GitHub continua no footer.
- Deslogado, os botões continuam Entrar/Cadastrar. Logado, o nome do usuário virou um link clicável pro perfil (`/profile` — chega na próxima entrada) e o botão "Criar projeto" virou "Projetos" (`/projects` — também chega na próxima entrada; por ora aponta pra uma rota que ainda não existe).
- `components/Button.module.css`: adicionado `:hover` (antes só existia `:active`); `.userName` no header também ganhou hover.
- `components/About.tsx`: seção ganhou `id="sobre"` + `scroll-margin-top` pra não ficar atrás do header fixo quando se navega direto pra `/#sobre`.
- `app/privacidade/page.tsx` (novo): **texto inicial de Política de Privacidade — é rascunho, preciso que você revise** antes de considerar definitivo (cobre dados coletados, uso, Firebase como infraestrutura, direitos do usuário, contato).

**Pendência visível nesta etapa:** os botões "Projetos" e o link do nome apontam pra `/projects` e `/profile`, que ainda não existem — ficam 404 até a próxima entrada (rotas + shell da área logada) e a seguinte (perfil).

## 2026-06-21 — Copy da home atualizada pro conceito de builds

**O que mudou:**
- `components/Hero.tsx`: novo título "Teste cada **build**. Acompanhe cada evolução." (só a palavra "build" em `var(--accent)`, não a frase toda — diferente do destaque anterior, que era uma linha inteira); novo parágrafo; card de demonstração ganhou um rótulo "Build 2" acima do link, pra contextualizar o exemplo no conceito de versões.
- `components/HowItWorks.tsx`: os 3 passos atualizados — "Crie um projeto e sua primeira build", "Compartilhe e receba feedback" (checklist adaptado ao tipo de conteúdo, sem login), "Evolua build após build" (histórico, próxima build a partir da anterior).
- Header, footer, seção de exemplo (placeholder de imagem) e seção "Sobre" não foram tocados, como pedido.

## 2026-06-21 — Login com Google

**O que mudou:**
- `lib/auth-actions.ts`: `loginWithGoogle()` via `signInWithPopup` + `GoogleAuthProvider` (provedor já habilitado no console do Firebase). Fechar o popup sem login não mostra erro nem redireciona — só não faz nada.
- `components/GoogleSignInButton.tsx` (novo), adicionado em `/login` e `/signup` com um divisor "ou" abaixo do formulário de email/senha. Funciona tanto pra cadastro quanto pra login (o Google cria a conta automaticamente se for a primeira vez).

**Verificação:** confirmei que o botão abre o popup do Firebase corretamente, apontando pro `providerId=google.com` do projeto real (`validate-node-d42b8`) — não dá pra automatizar o login completo com uma conta Google de teste (não tenho credenciais pra isso, e não seria apropriado simular isso), então a parte "logar de verdade com uma conta Google" fica sem teste automatizado de ponta a ponta; o restante (popup abrindo, fluxo de erro/cancelamento) foi verificado.

## 2026-06-21 — Dashboard mostra builds, status e nota média por build

**O que mudou:**
- `components/StatusBadge.tsx` (novo): selo colorido pros 5 status (`gray` "Sem avaliação", `green` "Aprovado", `yellow` "Atenção", `red` "Com problemas", `blue` "Em revisão" — rótulos que escolhi eu, já que o pedido definia só as cores/chaves).
- `components/DashboardContent.tsx` reescrito: agora é projeto → lista de builds (mais recente primeiro), cada uma com label, `StatusBadge`, nº de validações, nota média (média de todos os valores numéricos em `ratings` das validações daquela build — estrela e sim/não entram juntos na mesma média, de forma simples), data de criação, link público e um `<select>` pra trocar o status manualmente (`updateBuildStatus`, grava direto no Firestore). Link "+ nova build" por projeto, levando pra `/builds/new?projectId=...`.

**Testado contra o Firestore real:** dashboard mostrou a build criada antes com 1 validação e nota média 3.2 (média de `[4,5,0,4,3]`, onde o `0` é a resposta "Não" da pergunta booleana); troquei o status manualmente pelo seletor e a mudança refletiu no Firestore.

## 2026-06-21 — Checklist adaptativo por tipo de conteúdo

**O que mudou:**
- `lib/checklists.ts` (novo): um mapa `ContentType -> perguntas`, cada pergunta com `key`, `label` em linguagem simples e `type` (`stars` ou `boolean`). Perguntas diferentes pra `link` (aparência, funcionou no celular, link quebrado, texto claro, velocidade), `file` (instalou sem problema, travou, toque, intuitivo), `video` (sincronia, qualidade, clareza, duração) e `document` (legibilidade, erros de português, precisão das informações).
- `components/BooleanRating.tsx` (novo): par de botões Sim/Não pra perguntas booleanas, mesma linguagem visual do `StarRating` já existente.
- `components/ValidationForm.tsx` reescrito: recebe `buildId` + `contentType`, renderiza as perguntas certas pra aquele tipo de conteúdo (estrela ou sim/não) e monta o `ratings` dinamicamente antes de gravar a validação.
- `app/p/[slug]/page.tsx`: busca a build pelo slug, depois o projeto (pra saber o `contentType` certo pro checklist); mostra o `ownerNote` da build (se houver) num destaque visual antes do preview do conteúdo.

**Testado contra o Firestore real:** abri a página pública de uma build do tipo `link`, vi as 5 perguntas certas (estrela e sim/não misturados), enviei a validação e confirmei que ficou registrada com a chave de cada pergunta dentro de `ratings`.

## 2026-06-21 — Modelo de dados: Project → Validations vira Project → Builds → Validations

**Por que essa mudança (e não é só visual):** até aqui, cada projeto tinha um único link/conteúdo e recebia validações direto. Isso não dava pra representar versões: se o dono corrigia algo e queria testar de novo, não tinha como ligar a nova rodada de feedback à anterior, nem mostrar pra quem ia validar o que já tinha mudado. A partir de agora, um **projeto** (`title`, `contentType`, `ownerId`) pode ter várias **builds** — cada build é uma versão concreta, com seu próprio link público (`slug`), conteúdo (`contentUrl`), nota do dono pra quem for testar (`ownerNote`), selo de status manual (`status`) e, opcionalmente, uma referência à build anterior (`previousBuildId`). As validações passam a apontar pra uma build (`buildId`), não mais pro projeto direto.

**O que mudou:**
- `lib/firestore.ts` reescrito por completo: `ProjectDoc` perdeu `contentUrl`/`slug` (agora vivem em `BuildDoc`); nova coleção `builds`; `ValidationDoc.projectId` virou `ValidationDoc.buildId`, e `designRating`/`uxRating` fixos viraram `ratings: Record<string, number>` (suporta os checklists adaptativos da próxima entrada). Funções novas: `createBuild`, `getBuild`, `getBuildBySlug`, `getBuildsByProject`, `updateBuildStatus`.
- `lib/checklists.ts` (novo, ver próxima entrada do changelog).
- `components/CreateProjectForm.tsx`: agora cria o projeto **e a primeira build** numa única tela (nome do projeto, tipo de conteúdo, nome da build, URL) — sem build não há link pra compartilhar, então faz sentido andarem juntos.
- `components/CreateBuildForm.tsx` + `app/builds/new/page.tsx` (novos): tela pra criar uma build a partir de uma build anterior de um projeto já existente (acessível pelo dashboard). Mostra um seletor de build anterior (padrão: a mais recente), um resumo somente-leitura dos bugs/comentários recebidos nela (`components/PreviousBuildSummary.tsx`) e o campo `ownerNote` pra avisar quem for testar o que já mudou.

**Decisões minhas, além do que foi pedido literalmente:**
- Adicionei `ownerId` também na `BuildDoc` (não pedido, mas evita precisar de um `get()` cruzado até o projeto só pra checar o dono nas futuras regras de segurança).
- Perguntas do tipo sim/não (próxima entrada) ficam dentro do mesmo `ratings: Record<string, number>` como `0`/`1`, em vez de uma estrutura separada — um único mapa numérico é mais simples de agregar no dashboard.
- Nenhuma query usa `orderBy` — ordeno os arrays já carregados em JS. `where + orderBy` em campos diferentes exige um índice composto que eu não tenho como criar daqui sem acesso ao console/CLI do Firebase autenticado; ordenar em memória evita esse risco de quebra em produção.
- Não migrei os documentos de teste do formato antigo que já estavam no Firestore (da verificação da etapa anterior) — é dado de teste em modo de teste, sem custo deixar órfão.

**Testado contra o Firestore real:** criei um projeto com a build 1, validei publicamente, criei a build 2 a partir da build 1 (vendo o resumo de bugs/comentários da build 1) e escrevi um `ownerNote` — confirmado que ele aparece na página pública da build 2 antes do checklist.

**Aviso de segurança atualizado (regras ainda em modo de teste):**
- `projects`: leitura aberta; escrita só se `request.auth.uid == ownerId`.
- `builds`: leitura aberta (a página pública precisa ler sem login); criação/edição só se `request.auth.uid == ownerId` (denormalizado na build, ver decisão acima).
- `validations`: criação aberta pra qualquer um (anônimas, por design); sem permitir update/delete — devem ser imutáveis.

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
