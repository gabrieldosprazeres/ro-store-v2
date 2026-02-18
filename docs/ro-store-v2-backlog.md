# Backlog: ro-store-v2

**Versão:** 1.0
**Data:** 2026-02-18
**Referência:** [Stories](./ro-store-v2-stories.md) | [Arquitetura](./ro-store-v2-architecture.md) | [Data Architecture](./ro-store-v2-data-architecture.md) | [Security Review](./ro-store-v2-security-review.md)

---

## Resumo dos Sprints

| Sprint | Nome | Stories | Resultado |
|--------|------|---------|-----------|
| Sprint 1 | Fundação | — | Projeto inicializado, schema migrado, infra pronta |
| Sprint 2 | Autenticação | US-001, US-002, US-003, US-004 | Usuário pode criar conta, logar, usar Discord OAuth e sair |
| Sprint 3 | Catálogo e PDP | US-005, US-006 | Visitante navega, filtra e lê detalhes dos produtos |
| Sprint 4 | Checkout e Pagamentos | US-007, US-008, US-009, US-010, US-011, US-012 | Comprador conclui compra via Pix, Boleto ou Cartão |
| Sprint 5 | Entrega Digital | US-013, US-014, US-015, US-016, US-017, US-018, US-019 | Licença gerada, download liberado, e-mails enviados |
| Sprint 6 | Admin — Core | US-020, US-021, US-022, US-023 | Admin gerencia produtos, versões, pedidos e vê KPIs |
| Sprint 7 | Admin — Gestão + Polimento | US-024, US-025, US-026, US-027, US-028 | Admin gerencia clientes, licenças, audit logs; UI polida |

---

## Sprint 1: Fundação

**Goal:** Infraestrutura, configuração e schema prontos para o desenvolvimento começar.
**Stories cobertas:** Nenhuma story de usuário diretamente — pré-requisito para todas.
**Depende de:** —

---

### Task 1.1 — Inicializar projeto Next.js 16

**Escopo:**
- Criar projeto com `create-next-app` (App Router, TypeScript strict, Tailwind CSS 3.4)
- Instalar shadcn/ui (RSC: false, base color: slate, CSS variables)
- Instalar dependências do projeto: `@supabase/ssr`, `@supabase/supabase-js`, `zod`, `react-hook-form`, `@hookform/resolvers`, `sonner`, `lucide-react`, `recharts`, `@tremor/react`, `@tanstack/react-table`, `vaul`, `react-email`, `@react-email/components`
- Criar `.env.example` com todas as variáveis documentadas (sem valores reais)
- Criar `.gitignore` garantindo `.env.local` e `docs/credentials.md` ignorados

**Feito quando:**
- [ ] `npm run dev` sobe sem erros em `localhost:3000`
- [ ] `npm run build` completa sem erros de TypeScript
- [ ] `.env.example` tem todas as variáveis: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`, `ASAAS_BASE_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- [ ] `.env.local` e `docs/credentials.md` no `.gitignore`

---

### Task 1.2 — Validação de ambiente e Supabase clients

**Escopo:**
- `src/lib/validators/env-schema.ts` — schema Zod validando todas as env vars no startup; falha explícita se alguma estiver ausente
- `src/lib/supabase.ts` — client browser (`createBrowserClient`)
- `src/lib/supabase-server.ts` — client server-side com cookies (`createServerClient`)
- `src/lib/supabase-middleware.ts` — client para middleware (refresh de sessão)
- `src/types/database.types.ts` — placeholder; substituir por tipos gerados pelo Supabase CLI após a migration

**Feito quando:**
- [ ] Importar `env` de `lib/validators/env-schema.ts` lança erro explícito se env var ausente (não `undefined` silencioso)
- [ ] Os três clients compilam sem erros
- [ ] `database.types.ts` tem o tipo `Database` exportado (mesmo que vazio inicialmente)

**Nota de segurança:** `SUPABASE_SERVICE_ROLE_KEY` nunca referenciada em arquivos com `NEXT_PUBLIC_` — apenas em `supabase-server.ts`.

---

### Task 1.3 — Migration completa do banco

**Escopo:** Criar a migration SQL completa baseada em `docs/ro-store-v2-data-architecture.md` v1.1. Executar via Supabase Dashboard ou CLI (`supabase db push`).

**Ordem de execução obrigatória:**
1. `CREATE EXTENSION IF NOT EXISTS "pgcrypto"`
2. Criar tipos ENUM (`user_role`, `order_status`, `payment_method`)
3. Criar `is_admin()` (SECURITY DEFINER, SET search_path = public) — antes de qualquer tabela que a usa
4. Criar tabelas na ordem: `profiles`, `products`, `product_versions`, `product_images`, `orders`, `order_items`, `licenses`, `audit_logs`
5. Habilitar RLS em todas as 8 tabelas (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`)
6. Criar todas as RLS policies usando `is_admin()` (nunca inline EXISTS em `profiles`)
7. Criar funções: `fn_handle_new_user` (SET search_path), `fn_check_duplicate_license`, `fn_update_updated_at`
8. Criar triggers: `on_auth_user_created`, `before_license_insert`, `set_updated_at`
9. Criar buckets: `product-media` (público), `product-files` (privado)
10. Criar Storage policies para os dois buckets
11. `REVOKE SELECT (file_path_secure) ON product_versions FROM authenticated`

**Feito quando:**
- [ ] Migration executa sem erros
- [ ] Tabelas existem com todas as colunas e constraints
- [ ] RLS habilitado em todas as 8 tabelas — verificável via `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public'`
- [ ] `is_admin()` retorna `false` para usuário não-admin e `true` para admin (teste manual)
- [ ] `REVOKE SELECT (file_path_secure)` aplicado — authenticated não consegue `SELECT file_path_secure FROM product_versions`
- [ ] Buckets `product-media` e `product-files` criados com suas policies
- [ ] Gerar `src/types/database.types.ts` com Supabase CLI: `supabase gen types typescript --local > src/types/database.types.ts`

**Nota de segurança:** Conferir que nenhuma policy usa `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')` diretamente — todas devem usar `is_admin()`.

---

### Task 1.4 — Headers de segurança e next.config.ts

**Escopo:**
- `next.config.ts` com os headers de segurança da arquitetura: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`
- CSP deve permitir: `frame-src https://www.youtube.com` (PDP), `connect-src` com URL do Supabase + WSS para Realtime, `img-src 'self' data: https:` para imagens de produto
- Configurar `images.domains` ou `remotePatterns` para o domínio do Supabase Storage

**Feito quando:**
- [ ] `npm run build` passa sem warnings de config
- [ ] Headers presentes na resposta HTTP verificados via DevTools ou `curl -I`
- [ ] YouTube embed funciona na PDP (frame-src configurado)
- [ ] Supabase Realtime via WSS não bloqueado pelo CSP

---

### Task 1.5 — Middleware de autenticação e route guards

**Escopo:**
- `middleware.ts` na raiz do projeto (padrão Next.js App Router)
- Usar `createSupabaseMiddlewareClient` de `lib/supabase-middleware.ts`
- Refresh de sessão em todas as rotas (obrigatório para `@supabase/ssr`)
- Guards:
  - `/pedidos/*` → redirecionar para `/auth/login` se não autenticado
  - `/checkout/*` → redirecionar para `/auth/login` se não autenticado
  - `/admin/*` → redirecionar para `/auth/login` se não autenticado; redirecionar para `/` se autenticado mas `role !== 'admin'`
- `/api/webhooks/*` → sem auth de usuário (autenticação via token no header, tratada dentro do handler)
- `matcher` configurado para excluir assets estáticos (`_next/static`, `_next/image`, `favicon.ico`)

**Feito quando:**
- [ ] Acesso a `/pedidos` sem sessão redireciona para `/auth/login`
- [ ] Acesso a `/admin` com usuário `customer` redireciona para `/`
- [ ] Acesso a `/api/webhooks/asaas` não requer sessão de usuário
- [ ] Sessão atualizada automaticamente sem logout inesperado
- [ ] TypeScript compila sem erros

**Nota de segurança:** Usar `auth.getUser()` no middleware — nunca `getSession()` (JWT pode estar expirado; `getUser()` valida com o servidor Supabase).

---

### Task 1.6 — Layouts de route groups e design tokens

**Escopo:**
- `src/app/globals.css` — variáveis CSS do design system Void Purple: `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--card`, `--border`, `--radius: 0.375rem`, etc. Dark mode como padrão
- `src/app/(store)/layout.tsx` — `StoreLayout`: `SiteHeader` + `Footer` + `{children}`
- `src/app/(auth)/layout.tsx` — `AuthLayout`: centralizado sem nav
- `src/app/(checkout)/layout.tsx` — `CheckoutLayout`: `CheckoutHeader` (logo apenas, sem nav) + `{children}`
- `src/app/(admin)/layout.tsx` — `AdminLayout`: `AdminSidebar` (skeleton — links virão na Sprint 6) + `{children}` + verificação de role (redundante ao middleware, defesa em profundidade)
- `src/components/layouts/site-header.tsx` — logo, link para catálogo, botão Login/Conta (Server Component)
- `src/components/layouts/site-footer.tsx`
- `src/components/layouts/checkout-header.tsx`
- `src/app/not-found.tsx` — 404 global
- `src/app/error.tsx` — Error Boundary global (500) — Client Component (`'use client'`)

**Feito quando:**
- [ ] Todas as rotas de cada route group usam o layout correto (sem header/footer no checkout, sem sidebar no store)
- [ ] Design tokens aplicados: cor primária Void Purple, radius 0.375rem
- [ ] 404 e 500 renderizam sem erros

---

## Sprint 2: Autenticação

**Goal:** Usuário pode criar conta, fazer login (e-mail + Discord), e sair com segurança.
**Stories cobertas:** US-001, US-002, US-003, US-004
**Depende de:** Sprint 1 completa

---

### Task 2.1 — Schemas de validação de auth

**Escopo:**
- `src/lib/validators/auth-schema.ts`:
  - `registerSchema`: e-mail, senha (mín. 8 chars), confirmação de senha (refine)
  - `loginSchema`: e-mail, senha
  - `resetPasswordSchema`: e-mail

**Feito quando:**
- [ ] Schemas exportados e tipados com `z.infer<typeof ...>`
- [ ] `registerSchema.safeParse` rejeita quando senhas não coincidem
- [ ] Sem `any` nos tipos inferidos

---

### Task 2.2 — Telas de Login e Cadastro

**Escopo:**
- `src/app/(auth)/auth/login/page.tsx` — Server Component; renderiza `LoginForm` + botão Discord
- `src/app/(auth)/auth/register/page.tsx` — Server Component; renderiza `RegisterForm`
- `src/components/auth/login-form.tsx` — `'use client'`; react-hook-form + `loginSchema`; campos: e-mail, senha; link "Esqueci minha senha"; estados: loading (botão com spinner), erro (toast via sonner)
- `src/components/auth/register-form.tsx` — `'use client'`; react-hook-form + `registerSchema`; campos: e-mail, senha, confirmar senha; estados: loading, erro

**Feito quando:**
- [ ] Campos com validação client-side antes de submeter
- [ ] Botão desabilitado + spinner durante submit
- [ ] Mensagem de erro de rede exibida via sonner toast
- [ ] Redirecionamento para `/auth/login` quando tenta acessar rota protegida sem sessão (já funciona pelo middleware)

---

### Task 2.3 — Server Actions de autenticação

**Escopo:**
- `src/lib/actions/auth-actions.ts` (`'use server'`):
  - `signUp(input)` — validar com `registerSchema`, chamar `supabase.auth.signUp`, retornar erro estruturado se e-mail já em uso
  - `signIn(input)` — validar com `loginSchema`, chamar `supabase.auth.signInWithPassword`, retornar erro estruturado se credenciais inválidas
  - `signOut()` — chamar `supabase.auth.signOut`, redirecionar para `/`
  - `resetPassword(input)` — chamar `supabase.auth.resetPasswordForEmail`
  - Registrar `customer_login` em `audit_logs` após `signIn` bem-sucedido: `{ action: 'customer_login', user_id, metadata: { method: 'email' } }`

**Feito quando:**
- [ ] `signIn` com credenciais corretas autentica e redireciona para `/` (ou URL de retorno)
- [ ] `signIn` com credenciais incorretas retorna erro sem expor qual campo está errado ("E-mail ou senha incorretos")
- [ ] `signUp` com e-mail duplicado retorna erro legível
- [ ] `signOut` limpa sessão e redireciona para `/`
- [ ] `customer_login` registrado em `audit_logs` após login bem-sucedido
- [ ] `auth.getUser()` usado em toda ação server-side — nunca `getSession()`

---

### Task 2.4 — Discord OAuth

**Escopo:**
- Botão "Entrar com Discord" nos forms de login e cadastro — chama `supabase.auth.signInWithOAuth({ provider: 'discord', redirectTo: '/auth/callback' })`
- `src/app/(auth)/auth/callback/route.ts` — Route Handler GET; troca code por sessão (`exchangeCodeForSession`); redireciona para `/` ou URL de retorno
- Registrar `customer_login` em `audit_logs` com `{ method: 'discord' }` no callback
- Configurar Discord OAuth no Supabase Dashboard (client ID, secret, redirect URI) — documentar em `docs/credentials.md`

**Feito quando:**
- [ ] Clicar "Entrar com Discord" redireciona para tela de autorização do Discord
- [ ] Após autorizar, retorna à loja autenticado
- [ ] Cancelar autorização retorna à tela de login sem erro excessivo
- [ ] Primeira vez: perfil criado via trigger `fn_handle_new_user` (verificar na tabela `profiles`)
- [ ] `customer_login` com `method: discord` em `audit_logs`

---

### Task 2.5 — Proteção de rotas e estados de sessão no header

**Escopo:**
- Atualizar `site-header.tsx` para exibir: "Login" quando não autenticado; nome/avatar do usuário + "Sair" quando autenticado
- Verificar sessão no Server Component (`auth.getUser()` server-side)
- Botão "Sair" chama `signOut()` via form action ou button action

**Feito quando:**
- [ ] Header exibe estado correto para visitante e usuário autenticado
- [ ] Clicar "Sair" encerra sessão e atualiza header
- [ ] Usuário já logado que acessa `/auth/login` é redirecionado para `/` (verificar no layout da route group `(auth)`)

---

## Sprint 3: Catálogo e PDP

**Goal:** Visitante navega no catálogo, filtra produtos e lê detalhes completos na PDP.
**Stories cobertas:** US-005, US-006
**Depende de:** Sprint 1 completa (Sprint 2 não bloqueia — catálogo é público)

---

### Task 3.1 — Server Component do catálogo

**Escopo:**
- `src/app/(store)/page.tsx` — Server Component; buscar produtos publicados (`is_published = true`) do Supabase com `select('id, slug, title, price, category, compatible_emulators')` ordenados por `created_at DESC`; ler `searchParams` para filtros ativos (categoria, emulador) e passar para o componente de grid
- Supabase query com `.eq('is_published', true)` — RLS garante que apenas publicados são retornados para anon, mas filtro explícito é mais claro
- Passar `searchParams` como prop para `CatalogFilters` (filtros via URL, sem estado client-side desnecessário)

**Feito quando:**
- [ ] Página carrega produtos do banco sem erros
- [ ] Filtros por URL param funcionam (`?category=pvp&emulator=rathena`)
- [ ] Sem dados de `price` buscados de fontes client-side

---

### Task 3.2 — ProductCard, ProductGrid e estados de loading

**Escopo:**
- `src/components/catalog/product-card.tsx` — exibe: thumbnail, título, preço formatado (`formatCurrency`), categoria, emulador(es); link para `/produtos/[slug]`
- `src/components/catalog/product-grid.tsx` — grid responsivo (1 col mobile, 2 md, 3 lg); recebe array de produtos; renderiza `ProductCard` por item; renderiza estado vazio ("Nenhum produto encontrado para essa combinação de filtros") quando array vazio
- `src/app/(store)/loading.tsx` — skeleton grid com cards usando shadcn/ui `Skeleton`

**Feito quando:**
- [ ] Grid responsivo funcionando em mobile (1 col) e desktop (3 col)
- [ ] Estado vazio exibe mensagem adequada
- [ ] Skeleton aparece durante carregamento (Next.js streaming via `loading.tsx`)
- [ ] `formatCurrency` em `lib/utils.ts` formata preço em BRL

---

### Task 3.3 — CatalogFilters e ActiveFilters

**Escopo:**
- `src/components/catalog/catalog-filters.tsx` — `'use client'`; sidebar de filtros no desktop; usa Vaul `Drawer` no mobile (bottom sheet); filtros: Categoria (checkboxes), Emulador (checkboxes); atualiza URL search params ao selecionar (`useSearchParams` + `useRouter`)
- `src/components/catalog/active-filters.tsx` — chips dos filtros ativos com botão X para remover; exibido acima do grid quando há filtros ativos
- Valores possíveis de categoria e emulador: buscar do banco na page.tsx (via Supabase `select DISTINCT`) ou hardcoded por enquanto (confirmar com product_schema os enum values)

**Feito quando:**
- [ ] Selecionar filtro atualiza URL e filtra produtos sem reload completo (Next.js shallow navigation)
- [ ] Filtros combinados (categoria + emulador) funcionam com AND
- [ ] Estado vazio do grid quando combinação sem resultados
- [ ] Mobile: filtros acessíveis via Vaul bottom sheet
- [ ] Chips de filtros ativos visíveis com opção de remover cada um

---

### Task 3.4 — PDP — Server Component e dados

**Escopo:**
- `src/app/(store)/produtos/[slug]/page.tsx` — Server Component; buscar produto por `slug` com `select('*, product_versions(version, changelog, published_at, created_at), product_images(url, alt_text, display_order)')` ordenado; verificar `is_published = true`; retornar 404 se não encontrado (`notFound()`)
- Verificar se usuário autenticado já tem licença ativa para o produto (Server Component) — exibir aviso "Você já possui uma licença" em vez do botão Comprar
- `src/app/(store)/produtos/[slug]/loading.tsx` — skeleton da PDP

**Feito quando:**
- [ ] PDP carrega dados completos do produto
- [ ] Slug inexistente retorna 404 (página `not-found.tsx`)
- [ ] Produto não publicado retorna 404
- [ ] Usuário com licença ativa vê aviso em vez do botão Comprar

---

### Task 3.5 — Componentes da PDP

**Escopo:**
- `src/components/product/product-gallery.tsx` — `'use client'`; carrossel de imagens (shadcn/ui `Carousel` ou implementação custom com CSS); imagem placeholder se galeria vazia
- `src/components/product/youtube-embed.tsx` — embed de iframe YouTube responsivo (aspect-ratio 16:9); só renderizado se `youtube_url` não for null; CSP já configurada para `frame-src https://www.youtube.com`
- `src/components/product/compatibility-table.tsx` — tabela com: emulador, tipo de instalação, requisitos do cliente
- `src/components/product/changelog-accordion.tsx` — `'use client'`; shadcn/ui `Accordion`; lista versões com data e changelog; aba separada na PDP

**Feito quando:**
- [ ] Carrossel navega entre imagens com swipe (mobile) e botões prev/next
- [ ] YouTube embed só aparece quando URL preenchida
- [ ] Tabela de compatibilidade renderiza corretamente
- [ ] Changelog exibe versões em ordem decrescente (mais recente primeiro)
- [ ] Botão "Comprar" leva para `/checkout/[productId]` (autenticado) ou `/auth/login?redirect=/checkout/[productId]` (não autenticado)

---

## Sprint 4: Checkout e Pagamentos

**Goal:** Comprador conclui compra em menos de 3 minutos via Pix, Boleto ou Cartão de Crédito.
**Stories cobertas:** US-007, US-008, US-009, US-010, US-011, US-012
**Depende de:** Sprint 2 (auth), Sprint 3 (PDP com botão Comprar)

---

### Task 4.1 — Schemas de validação do checkout

**Escopo:**
- `src/lib/validators/checkout-schema.ts`:
  - `cpfCnpjSchema` — string; valida dígitos verificadores de CPF e CNPJ (algoritmo de validação real — não apenas formato); mensagem "CPF inválido" ou "CNPJ inválido" conforme o caso
  - `checkoutSchema` — `productId` (UUID), `cpfCnpj` (via `cpfCnpjSchema`), `paymentMethod` (enum: `pix | boleto | credit_card`), `termsAccepted` (boolean com `.refine(v => v === true, 'Você precisa aceitar os termos para continuar')`)
  - `creditCardSchema` — número do cartão (Luhn algorithm), validade, CVV, nome no cartão
- `src/lib/validators/webhook-schema.ts` — `asaasWebhookSchema`: `event` (string), `payment.id` (string), `payment.status` (string), campos opcionais de Pix/Boleto

**Feito quando:**
- [ ] `cpfCnpjSchema.safeParse('123.456.789-09')` retorna erro (CPF inválido)
- [ ] `cpfCnpjSchema.safeParse('000.000.001-91')` retorna sucesso (CPF válido de teste)
- [ ] `checkoutSchema` rejeita se `termsAccepted = false`
- [ ] Schemas tipados com `z.infer<typeof ...>`

---

### Task 4.2 — Checkout layout e componentes de UI

**Escopo:**
- `src/app/(checkout)/checkout/[productId]/page.tsx` — Server Component; buscar produto por `productId`; verificar auth com `auth.getUser()`; verificar licença duplicada (aviso em vez de checkout se já possui); buscar `cpf_cnpj` do perfil se já salvo
- `src/components/checkout/order-summary.tsx` — resumo readonly: nome do produto, imagem thumbnail, preço (lido do banco — nunca do client)
- `src/components/checkout/payment-method-selector.tsx` — `'use client'`; tabs Pix / Boleto / Cartão
- `src/components/checkout/checkout-form.tsx` — `'use client'`; react-hook-form + `checkoutSchema`; campo CPF/CNPJ (pré-preenchido se já no perfil); checkbox de termos; selector de método de pagamento; submit chama Server Action

**Feito quando:**
- [ ] Acesso não autenticado redireciona para login (já feito pelo middleware — verificar com `next_url`)
- [ ] Produto inexistente retorna 404
- [ ] Usuário com licença ativa vê aviso com link para "Meus Pedidos"
- [ ] CPF/CNPJ pré-preenchido quando já no perfil
- [ ] Checkbox de termos bloqueia submit quando não marcado
- [ ] Preço exibido vem do banco (Server Component), nunca de param na URL ou state client-side

---

### Task 4.3 — Server Actions de checkout e integração Asaas

**Escopo:**
- `src/lib/integrations/asaas.ts` — `AsaasClient` com métodos: `createPix(payload)`, `createBoleto(payload)`, `createCharge(payload)` — usa `ASAAS_API_KEY` e `ASAAS_BASE_URL` do `env`; nunca exposto no bundle client
- `src/lib/actions/checkout-actions.ts` (`'use server'`):
  - `initCheckout(input)`:
    1. Verificar `auth.getUser()` — lançar se não autenticado
    2. Validar `input` com `checkoutSchema`
    3. Buscar `product.price` do banco (nunca usar valor do client)
    4. Verificar licença duplicada (`licenses` WHERE `product_id` + `user_id` + `is_active`)
    5. Salvar `cpf_cnpj` no perfil se ainda não salvo
    6. Criar pedido em `orders` com `status: 'pending'`
    7. Chamar `AsaasClient.createPix/createBoleto/createCharge` conforme método
    8. Salvar `asaas_payment_id` e dados de pagamento no pedido
    9. Registrar `order_created` em `audit_logs`
    10. Retornar `{ orderId, pixData? | boletoData? }` e redirecionar para a tela correta
  - `confirmTermsAcceptance(orderId, ip)`:
    1. Verificar `auth.getUser()`
    2. Registrar `terms_accepted` em `audit_logs` com `metadata: { order_id, ip, timestamp }`

**Feito quando:**
- [ ] `initCheckout` com Pix cria pedido, chama Asaas, retorna QR Code
- [ ] Preço lido do banco — não é possível manipular via client
- [ ] Licença duplicada bloqueada antes de criar pedido
- [ ] `cpf_cnpj` salvo no perfil para futuras compras
- [ ] `order_created` e `terms_accepted` registrados em `audit_logs`
- [ ] Sem `console.log` com dados sensíveis (CPF/CNPJ, API key)

**Nota de segurança:** `ASAAS_API_KEY` só referenciada em `lib/integrations/asaas.ts` (server-side). CPF/CNPJ nunca em logs nem em respostas de API além do necessário.

---

### Task 4.4 — PixPanel e Supabase Realtime

**Escopo:**
- `src/app/(checkout)/checkout/[orderId]/pix/page.tsx` — Server Component; buscar pedido por `orderId` (verificar ownership via RLS); passar `pixData` e `orderId` para `PixPanel`
- `src/components/checkout/pix-panel.tsx` — `'use client'`:
  - Exibir QR Code (imagem base64 do Asaas) e código Pix Copia e Cola com botão copiar
  - Countdown do tempo restante (30 minutos) usando `useEffect` + `setInterval`
  - `use-order-realtime.ts` para redirect automático quando `status === 'paid'`
  - Fallback: botão "Verificar pagamento" (refetch manual do status via Server Action)
- `src/hooks/use-order-realtime.ts` — `'use client'`; assina `postgres_changes` na tabela `orders` filtrado pelo `orderId`; quando `status === 'paid'` dispara `router.push('/checkout/[orderId]/sucesso')`

**Feito quando:**
- [ ] QR Code exibido na tela
- [ ] Countdown regressivo de 30 minutos
- [ ] Quando status muda para `paid` (simular via Supabase Dashboard), redirect automático para `/sucesso`
- [ ] Botão "Verificar pagamento" funciona como fallback se Realtime indisponível
- [ ] Pedido expirado (após 30min) exibe botão "Gerar novo Pix"

**Nota de segurança:** RLS na tabela `orders` garante que o client só recebe updates do próprio pedido via Realtime.

---

### Task 4.5 — BoletoPanel, CartãoPanel e página de sucesso

**Escopo:**
- `src/app/(checkout)/checkout/[orderId]/boleto/page.tsx` — Server Component; renderiza `BoletoPanel`
- `src/components/checkout/boleto-panel.tsx` — exibe: link para visualizar/imprimir boleto, código de barras para copiar; aviso "Download liberado após compensação do boleto (até 3 dias úteis)"
- `src/app/(checkout)/checkout/[orderId]/sucesso/page.tsx` — Server Component; buscar pedido; renderizar confirmação: nome do produto, valor pago, método; link para "Meus Pedidos"
- Pagamento via Cartão de Crédito: após `initCheckout` com `credit_card`, Asaas processa sincronamente e retorna `status: 'confirmed'` — redirecionar direto para `/sucesso` se aprovado; exibir erro "Pagamento recusado" se recusado

**Feito quando:**
- [ ] Boleto exibe código de barras copiável
- [ ] Cartão aprovado: redirect para `/sucesso` imediato
- [ ] Cartão recusado: toast de erro "Pagamento recusado. Verifique os dados do cartão ou tente outro método."
- [ ] Página de sucesso exibe resumo correto do pedido

---

## Sprint 5: Entrega Digital

**Goal:** Após pagamento confirmado, licença gerada automaticamente, download liberado e e-mails enviados.
**Stories cobertas:** US-013, US-014, US-015, US-016, US-017, US-018, US-019
**Depende de:** Sprint 4 (pedidos criados com `asaas_payment_id`)

---

### Task 5.1 — Webhook handler do Asaas

**Escopo:**
- `src/app/api/webhooks/asaas/route.ts` — Route Handler POST:
  1. **Primeiro:** validar header `asaas-access-token` contra `env.ASAAS_WEBHOOK_TOKEN` — retornar 401 se inválido (antes de qualquer parse do body)
  2. Parse do body com `asaasWebhookSchema.safeParse()` — retornar 400 se inválido
  3. Processar apenas evento `PAYMENT_CONFIRMED` (ignorar outros silenciosamente com 200)
  4. Verificar idempotência: buscar pedido por `asaas_payment_id`; se `status === 'paid'`, retornar 200 sem reprocessar
  5. Usar Supabase Service Role client (bypassa RLS — necessário para escrita de admin)
  6. Atualizar `orders.status = 'paid'`
  7. Chamar `generateLicenseKey()` do `license-service.ts`
  8. Inserir `licenses` com `license_key`, `product_id`, `user_id`, `order_id`
  9. Chamar `email-service.sendOrderConfirmation()` e `email-service.sendLicenseDelivery()`
  10. Inserir `audit_logs` com `action: 'order_paid'`
  11. Retornar 200

**Feito quando:**
- [ ] Request sem token retorna 401 (sem processar body)
- [ ] Token inválido retorna 401
- [ ] Webhook duplicado (mesmo `asaas_payment_id`, status já `paid`) retorna 200 sem gerar nova licença
- [ ] Após webhook: `orders.status = 'paid'`, `licenses` inserida com chave única
- [ ] `audit_logs` com `order_paid` registrado
- [ ] Testar com payload real do Asaas sandbox

**Nota de segurança:** Token validado antes de qualquer operação. Service Role Key usada apenas server-side. Sem log de CPF/CNPJ ou dados bancários.

---

### Task 5.2 — License Service e Download Service

**Escopo:**
- `src/lib/services/license-service.ts`:
  - `generateLicenseKey()` — gerar UUID v4 via `crypto.randomUUID()` (nativo do Node.js/Edge) como License Key
  - `validateLicense(userId, licenseId)` — verificar que `licenses` com `id = licenseId` tem `user_id = userId` e `is_active = true`; retornar objeto de licença ou lançar erro
- `src/lib/actions/license-actions.ts` (`'use server'`):
  - `generateDownloadUrl(licenseId)`:
    1. `auth.getUser()` — verificar autenticação
    2. `validateLicense(user.id, licenseId)` — verificar ownership
    3. Buscar `file_path_secure` via Server-side (nunca retornar ao client)
    4. `download-service.generateSignedUrl(filePath)` — Signed URL de 10 minutos
    5. Registrar `download_file` em `audit_logs` com `metadata: { product_id, version, ip }`
    6. Retornar `signedUrl` (não o `file_path_secure`)
- `src/lib/services/download-service.ts`:
  - `generateSignedUrl(filePath)` — `supabaseAdmin.storage.from('product-files').createSignedUrl(filePath, 600)` — usa Service Role

**Feito quando:**
- [ ] `generateLicenseKey()` retorna string UUID única a cada chamada
- [ ] `validateLicense` com `userId` diferente do dono lança erro (sem vazar dados da licença de outro usuário)
- [ ] Signed URL expira após 10 minutos (testar com URL expirada — Storage retorna 403)
- [ ] `file_path_secure` nunca retornado ao client (só usado internamente)
- [ ] `download_file` registrado em `audit_logs` com IP e `product_id`

**Nota de segurança:** `file_path_secure` é buscado pelo server e passado direto para `generateSignedUrl` — nunca incluso em nenhum response ao client. Proteção em duas camadas: REVOKE SELECT na coluna + nunca incluída em selects retornados ao client.

---

### Task 5.3 — Email Service, ResendClient e templates

**Escopo:**
- `src/lib/integrations/resend.ts` — `ResendClient` com método `send(payload)` usando `RESEND_API_KEY`
- `src/lib/services/email-service.ts`:
  - `sendOrderConfirmation(orderId)` — buscar dados do pedido + produto + cliente; enviar template `order-confirmation`
  - `sendLicenseDelivery(licenseId)` — buscar licença + pedido + produto + cliente; enviar template `license-delivery` com a License Key
  - `sendUpdateNotification(productId, newVersion)` — buscar todos os usuários com `licenses.is_active = true` para o `product_id`; enviar `product-update` para cada um (em batch, sem expor dados de outros clientes)
- Templates React Email em `src/components/emails/`:
  - `order-confirmation.tsx` — número do pedido, produto, valor, método de pagamento
  - `license-delivery.tsx` — License Key destacada, link para "Meus Pedidos"
  - `product-update.tsx` — nome do produto, versão nova, changelog, link para "Meus Pedidos"

**Feito quando:**
- [ ] E-mail de confirmação enviado após webhook `PAYMENT_CONFIRMED`
- [ ] E-mail de licença enviado com License Key correta
- [ ] Templates renderizam HTML válido (testar com `react-email preview`)
- [ ] `sendUpdateNotification` envia apenas para clientes com licença ativa do produto
- [ ] Sem CPF/CNPJ nos e-mails (dado fiscal — não pertence a e-mails transacionais)

---

### Task 5.4 — Meus Pedidos (US-015) e Detalhe do Pedido (US-016)

**Escopo:**
- `src/app/(customer)/pedidos/page.tsx` — Server Component; `auth.getUser()`; buscar pedidos do usuário com RLS (`orders` WHERE `user_id = auth.uid()`); incluir join com `products` (nome, imagem) e `licenses` (para badge de nova versão); renderizar `OrderCard` por pedido; estado vazio com link para catálogo
- `src/components/orders/order-card.tsx` — card do pedido: nome do produto, data, método de pagamento, status (badge colorida), botão "Download" (se `status = 'paid'` e licença ativa), badge "Nova versão disponível" se versão atual do produto > versão do `product_versions` associado à licença
- `src/app/(customer)/pedidos/[id]/page.tsx` — Server Component; buscar pedido por `id` (RLS garante ownership); exibir `LicenseKeyField` + botão Download
- `src/components/orders/license-key-field.tsx` — `'use client'`; input read-only com a License Key; botão "Copiar" com feedback "Copiado!" por 2 segundos usando `use-copy-to-clipboard.ts`
- `src/hooks/use-copy-to-clipboard.ts` — hook para copiar texto para clipboard com estado de feedback

**Feito quando:**
- [ ] Lista de pedidos exibe todos os pedidos do usuário autenticado (RLS garante que vê apenas os seus)
- [ ] Badge "Nova versão disponível" aparece quando há nova versão do produto
- [ ] Estado vazio exibe mensagem com link para catálogo
- [ ] License Key visível no detalhe do pedido com botão copiar
- [ ] Botão "Download" chama `generateDownloadUrl` e inicia download
- [ ] Usuário sem pedidos vê estado vazio (não erro)

---

## Sprint 6: Painel Admin — Core

**Goal:** Admin gerencia produtos, versões, pedidos e monitora KPIs do negócio.
**Stories cobertas:** US-020, US-021, US-022, US-023
**Depende de:** Sprint 5 (dados de pedidos e licenças existem)

---

### Task 6.1 — AdminLayout e AdminSidebar

**Escopo:**
- `src/app/(admin)/layout.tsx` — verificar `auth.getUser()` + `profile.role === 'admin'`; redirecionar se não for admin (defesa em profundidade além do middleware)
- `src/components/admin/admin-sidebar.tsx` — sidebar com links: Dashboard (`/admin`), Produtos (`/admin/produtos`), Pedidos (`/admin/pedidos`), Clientes (`/admin/clientes`), Licenças (`/admin/licencas`), Logs (`/admin/logs`); responsivo (colapsável em mobile)
- `src/app/(admin)/admin/page.tsx` — placeholder enquanto KPIs não implementados; ou já conectar na Task 6.2

**Feito quando:**
- [ ] Usuário com `role = 'customer'` redirecionado para `/` ao acessar `/admin`
- [ ] Sidebar exibe todos os links com ícones (lucide-react)
- [ ] Link ativo com estilo destacado (`aria-current="page"`)
- [ ] Layout responsivo: sidebar colapsável em telas pequenas

---

### Task 6.2 — Dashboard de KPIs (US-020)

**Escopo:**
- `src/app/(admin)/admin/page.tsx` — Server Component; buscar agregados do banco:
  - Receita total filtrada por período (hoje/semana/mês/total) — via Supabase query com `gte/lte` em `orders.updated_at` WHERE `status = 'paid'`
  - Contagem de pedidos por status
  - Top 5 produtos mais vendidos (JOIN `order_items` + `products`)
  - Total de clientes (COUNT `profiles`)
  - Total de downloads (COUNT `audit_logs` WHERE `action = 'download_file'`)
- `src/components/admin/kpi-cards.tsx` — Tremor `Card` + `Metric` + `Text`; cards: Receita Total, Pedidos Pagos, Pedidos Pendentes, Total Clientes
- `src/components/admin/revenue-chart.tsx` — `'use client'`; Tremor `BarChart` com receita por dia (últimos 30 dias)
- `src/components/admin/orders-status-chart.tsx` — `'use client'`; Tremor `DonutChart` com distribuição de status
- Selector de período (hoje/semana/mês) — `'use client'`; atualiza URL search params; page.tsx lê e refiltra

**Feito quando:**
- [ ] Cards de KPI exibem valores corretos do banco
- [ ] Trocar período de "hoje" para "mês" atualiza os números
- [ ] Estado vazio: zeros com mensagem "Nenhuma venda registrada ainda"
- [ ] Skeleton dos cards durante carregamento

---

### Task 6.3 — CRUD de Produtos (US-021)

**Escopo:**
- `src/app/(admin)/admin/produtos/page.tsx` — lista de produtos admin (publicados e rascunhos); botão "Novo Produto"
- `src/app/(admin)/admin/produtos/novo/page.tsx` e `src/app/(admin)/admin/produtos/[id]/page.tsx` — renderizam `ProductForm`
- `src/components/admin/product-form.tsx` — `'use client'`; react-hook-form + `createProductSchema/updateProductSchema`; campos: título, descrição (textarea), preço (número), categoria (select), emuladores (checkboxes), tipo de instalação (select), requisitos do cliente (textarea), URL do YouTube (optional), upload de imagens (galeria), upload de arquivo principal
- Upload de arquivo para `product-files` (privado): barra de progresso; salvar `file_path_secure` apenas no banco, nunca expor; upload de imagens para `product-media` (público)
- `src/lib/validators/product-schema.ts` — `createProductSchema`, `updateProductSchema`
- `src/lib/actions/product-actions.ts` (`'use server'`):
  - `createProduct(input)` — verificar `is_admin()`; validar com schema; criar `products` (rascunho) + `product_versions` v1.0.0; salvar `file_path_secure` na versão
  - `updateProduct(id, input)` — verificar `is_admin()`; atualizar `products`
  - `publishProduct(id)` — verificar `is_admin()`; setar `is_published = true` em `products`

**Feito quando:**
- [ ] Criar produto cria rascunho (não aparece no catálogo)
- [ ] "Publicar" torna produto visível no catálogo público
- [ ] Upload de arquivo mostra barra de progresso
- [ ] `file_path_secure` salvo no banco mas nunca retornado em responses ao client
- [ ] Validações client-side nos campos obrigatórios antes do submit
- [ ] Usuário não-admin não consegue chamar as Server Actions (verificação `is_admin()` na action)

**Nota de segurança:** `is_admin()` verificado na Server Action além do RLS — defesa em profundidade. `file_path_secure` nunca incluído no `select()` retornado ao client.

---

### Task 6.4 — Gestão de Versões e Changelog (US-022)

**Escopo:**
- Seção "Nova Versão" na página de edição do produto `[id]/page.tsx`
- Formulário: número da versão (ex: `1.2.0`), changelog (textarea), upload do novo arquivo
- `product-actions.ts` — `publishNewVersion(productId, input)`:
  1. Verificar `is_admin()`
  2. Inserir nova `product_versions` (nova versão ativa)
  3. A versão anterior é mantida no histórico (não deletar)
  4. Disparar `email-service.sendUpdateNotification(productId, newVersion)` para todos os clientes com licença ativa
  5. Registrar `product_version_published` em `audit_logs`
- Exibir histórico de versões na página de edição (tabela com versão, data, changelog)

**Feito quando:**
- [ ] Publicar nova versão cria entrada em `product_versions`
- [ ] Versão anterior mantida no histórico
- [ ] Clientes com licença ativa recebem e-mail de atualização
- [ ] Download em "Meus Pedidos" aponta para a versão mais recente
- [ ] `product_version_published` em `audit_logs`

---

### Task 6.5 — Gerenciamento de Pedidos Admin (US-023)

**Escopo:**
- `src/app/(admin)/admin/pedidos/page.tsx` — Server Component; buscar todos os pedidos com join: `profiles` (email), `products` (título), `order_items`; passar para `OrdersTable`
- `src/components/admin/orders-table.tsx` — `'use client'`; TanStack Table com: colunas (ID, cliente, produto, valor, método, status, data); sort por data (padrão: mais recente); filter por status (dropdown); paginação
- `src/app/(admin)/admin/pedidos/[id]/page.tsx` — detalhe do pedido: todos os campos + dados do cliente + License Key gerada

**Feito quando:**
- [ ] Tabela exibe todos os pedidos paginados
- [ ] Filtro por status funciona
- [ ] Sort por data funciona
- [ ] Detalhe do pedido exibe License Key e dados completos
- [ ] RLS garante que este endpoint só funciona para admin (verificado pela policy + verificação no layout)

---

## Sprint 7: Admin — Gestão + Polimento

**Goal:** Admin gerencia clientes, licenças e logs; sistema polido com todos os estados de UI.
**Stories cobertas:** US-024, US-025, US-026, US-027, US-028
**Depende de:** Sprint 6

---

### Task 7.1 — Gerenciamento de Clientes (US-024)

**Escopo:**
- `src/app/(admin)/admin/clientes/page.tsx` — Server Component; buscar `profiles` com aggregates: contagem de pedidos, total gasto (SUM de `orders.amount` WHERE `status = 'paid'`); passar para `CustomersTable`
- `src/components/admin/customers-table.tsx` — `'use client'`; TanStack Table com: nome/e-mail, data de cadastro, número de pedidos, total gasto; sort e paginação
- `src/app/(admin)/admin/clientes/[id]/page.tsx` — detalhe do cliente: dados do perfil (exibir CPF/CNPJ — acessível para admin via RLS), histórico de pedidos, licenças ativas

**Feito quando:**
- [ ] Lista de clientes com paginação e sort
- [ ] Detalhe do cliente exibe CPF/CNPJ (apenas para admin — RLS permite)
- [ ] CPF/CNPJ não aparece em logs do servidor nem em respostas de API que não sejam o detalhe do admin
- [ ] Estado vazio exibido quando sem clientes

---

### Task 7.2 — Gerenciamento de Licenças (US-025)

**Escopo:**
- `src/app/(admin)/admin/licencas/page.tsx` — Server Component; buscar `licenses` com join: `profiles` (email), `products` (título)
- `src/components/admin/licenses-table.tsx` — `'use client'`; TanStack Table com: License Key (truncada com tooltip full), produto, cliente, status (ativa/revogada), data de emissão; botão "Revogar" apenas para licenças ativas
- `src/lib/actions/license-actions.ts` — adicionar `revokeLicense(licenseId)`:
  1. `auth.getUser()` + verificar `is_admin()`
  2. Atualizar `licenses.is_active = false`
  3. Registrar `license_revoked` em `audit_logs` com `metadata: { license_id, revoked_by: userId }`
- Modal de confirmação antes de revogar: "Tem certeza? O cliente perderá o acesso ao download."

**Feito quando:**
- [ ] Lista de licenças com status visual (badge verde = ativa, vermelha = revogada)
- [ ] Botão Revogar abre modal de confirmação
- [ ] Após revogação, `is_active = false` no banco — cliente não consegue mais baixar o produto
- [ ] `license_revoked` em `audit_logs`
- [ ] Usuário não-admin não consegue chamar `revokeLicense` (verificação na action)

---

### Task 7.3 — Logs de Auditoria (US-026)

**Escopo:**
- `src/app/(admin)/admin/logs/page.tsx` — Server Component; buscar `audit_logs` com join `profiles` (email); ordenado por `created_at DESC`
- `src/components/admin/audit-logs-table.tsx` — `'use client'`; TanStack Table com: timestamp, usuário (email), ação (badge por tipo), produto associado (se houver), IP; filtro por usuário (input de busca) e por ação (select); read-only — sem botões de ação
- Verificar cobertura de ações em `audit_logs`:
  - `customer_login` — Sprint 2
  - `terms_accepted` — Sprint 4
  - `order_created` — Sprint 4
  - `order_paid` — Sprint 5
  - `download_file` — Sprint 5
  - `license_revoked` — Sprint 7
  - `product_version_published` — Sprint 6

**Feito quando:**
- [ ] Tabela exibe logs com paginação (mais recentes primeiro)
- [ ] Filtro por ação funciona
- [ ] Busca por e-mail do usuário funciona
- [ ] Nenhum botão de edição ou exclusão visível (logs são imutáveis)
- [ ] Todas as ações críticas do sistema têm entradas em `audit_logs`

---

### Task 7.4 — Validação de segurança ponta a ponta (US-027, US-028)

**Escopo:** Checklist de segurança antes do MVP ser considerado completo.

**Feito quando:**
- [ ] **RLS**: `SELECT * FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false` retorna zero resultados (RLS em todas as tabelas)
- [ ] **Bucket privado**: acesso direto a qualquer URL de `product-files` sem Signed URL retorna 403
- [ ] **REVOKE SELECT**: `SELECT file_path_secure FROM product_versions` com role `authenticated` retorna erro de permissão
- [ ] **is_admin()**: nenhuma RLS policy usa `EXISTS (SELECT 1 FROM profiles WHERE ...)` inline — verificar com `\d+ nome_da_tabela` ou inspecionar via Dashboard
- [ ] **Webhook token**: request para `/api/webhooks/asaas` sem header `asaas-access-token` retorna 401
- [ ] **Idempotência**: webhook duplicado não gera segunda licença
- [ ] **Preço do banco**: inspecionar `initCheckout` — preço nunca vem do request body
- [ ] **CPF/CNPJ**: buscar em logs do servidor — não deve aparecer em nenhum log
- [ ] **Service Role Key**: buscar `SUPABASE_SERVICE_ROLE_KEY` no código — só deve aparecer em arquivos server-side (nunca com prefixo `NEXT_PUBLIC_`)
- [ ] **Headers de segurança**: verificar com [securityheaders.com](https://securityheaders.com) — score mínimo A
- [ ] **Audit log coverage**: verificar que todas as 7 ações críticas têm entradas reais no banco (criar dados de teste)

---

### Task 7.5 — Polimento de UI e estados globais

**Escopo:**
- `src/app/not-found.tsx` — 404 global com estilo do design system: mensagem "Página não encontrada", botão "Voltar ao catálogo"
- `src/app/error.tsx` — Error Boundary global: mensagem "Algo deu errado", botão "Tentar novamente" (`reset()`)
- Revisar estados vazios em todas as listas: catálogo, pedidos, clientes, licenças, logs — garantir mensagem contextual em cada um
- Revisar loading states: skeleton em todas as páginas com `loading.tsx` ou `Suspense`
- Garantir sonner toast em todas as Server Actions com erro (try/catch retornando `{ error: string }` em vez de throw — ou using `useFormState`)
- Revisar acessibilidade básica: `aria-label` em botões de ícone, `alt` em imagens, foco visível nos campos
- `docs/credentials.md` — criar com credenciais de teste do Supabase Auth + Asaas sandbox

**Feito quando:**
- [ ] 404 e 500 renderizam com estilo correto (não a tela padrão do Next.js)
- [ ] Todos os estados vazios têm mensagem contextual + CTA
- [ ] Todas as páginas têm skeleton de loading
- [ ] Erros de Server Actions exibem toast de erro via sonner
- [ ] `docs/credentials.md` criado e no `.gitignore`

---

## Notas Globais de Desenvolvimento

### Padrões obrigatórios em toda Server Action

```typescript
'use server'

export async function minhaAction(input: unknown) {
  // 1. Autenticação
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  // 2. Validação (nunca confiar no input do client)
  const validated = schema.parse(input)

  // 3. Lógica de negócio (preço sempre do banco)

  // 4. Audit log

  // 5. revalidatePath() se necessário
}
```

### Regras que nunca quebrar

| Regra | Consequência se quebrar |
|-------|------------------------|
| `auth.getUser()` em todo server-side (nunca `getSession()`) | JWT expirado não detectado — usuário removido continua autenticado |
| Preço sempre do banco no servidor | Comprador manipula preço via DevTools |
| `file_path_secure` nunca em API responses | Exposição do caminho real do arquivo no Storage |
| Validar token antes de tudo no webhook | Qualquer um pode confirmar pagamentos falsos |
| `is_admin()` nas policies (nunca inline EXISTS em `profiles`) | Recursão infinita — sistema cai |
| CPF/CNPJ nunca em logs | Violação de LGPD — dado fiscal sensível |
| Audit log imutável (sem DELETE policy) | Destruição de evidências em chargebacks |

---

## Histórico de Versões

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0 | 2026-02-18 | Versão inicial — 7 sprints, 35 tasks, 28 stories |
