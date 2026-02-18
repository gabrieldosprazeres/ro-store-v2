# Arquitetura: ro-store-v2
**Data:** 2026-02-18
**Referência:** [PRD](./ro-store-v2-prd.md) | [Security Review](./ro-store-v2-security-review.md) | [Design System](./ro-store-v2-design-system.md) | [UI Flow](./ro-store-v2-ui-flow.md) | [ADRs](./adr/)

---

## Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router, Server Components) | 16 |
| Linguagem | TypeScript | 5.x (strict) |
| Backend / Banco | Supabase (Postgres + Auth + Storage) | managed |
| Auth | Supabase Auth (Email/senha + Discord OAuth) | — |
| Pagamentos | Asaas (REST API + Webhooks) | v3 |
| E-mail transacional | Resend | — |
| Estilização | Tailwind CSS + shadcn/ui | 3.4 |
| Complementos UI | Tremor (KPIs/charts), TanStack Table, Vaul | — |
| Validação | Zod | 3.x |

---

## Estrutura de Pastas

```
ro-store-v2/
├── src/
│   ├── app/                             # App Router (Next.js 16)
│   │   │
│   │   ├── (store)/                     # Route group: loja pública
│   │   │   ├── layout.tsx               # StoreLayout (SiteHeader + Footer)
│   │   │   ├── page.tsx                 # Catálogo (/)
│   │   │   └── produtos/
│   │   │       └── [slug]/
│   │   │           └── page.tsx         # PDP (/produtos/[slug])
│   │   │
│   │   ├── (auth)/                      # Route group: autenticação
│   │   │   ├── layout.tsx               # AuthLayout (sem header/footer)
│   │   │   └── auth/
│   │   │       ├── login/page.tsx
│   │   │       ├── register/page.tsx
│   │   │       └── callback/route.ts    # Discord OAuth callback
│   │   │
│   │   ├── (customer)/                  # Route group: área do cliente (autenticado)
│   │   │   ├── layout.tsx               # StoreLayout + verificação de auth
│   │   │   └── pedidos/
│   │   │       ├── page.tsx             # /pedidos — Meus Pedidos
│   │   │       └── [id]/page.tsx        # /pedidos/[id] — Detalhe do pedido
│   │   │
│   │   ├── (checkout)/                  # Route group: checkout sem distração
│   │   │   ├── layout.tsx               # CheckoutLayout (logo só, sem nav)
│   │   │   └── checkout/
│   │   │       ├── [productId]/page.tsx          # Checkout
│   │   │       ├── [orderId]/pix/page.tsx         # Aguardando Pix
│   │   │       ├── [orderId]/boleto/page.tsx      # Boleto gerado
│   │   │       └── [orderId]/sucesso/page.tsx     # Compra confirmada
│   │   │
│   │   ├── (admin)/                     # Route group: painel admin (role: admin)
│   │   │   ├── layout.tsx               # AdminLayout (sidebar + auth + role check)
│   │   │   └── admin/
│   │   │       ├── page.tsx             # /admin — Dashboard KPIs
│   │   │       ├── produtos/
│   │   │       │   ├── page.tsx         # Lista de produtos
│   │   │       │   ├── novo/page.tsx    # Novo produto
│   │   │       │   └── [id]/page.tsx    # Editar produto
│   │   │       ├── pedidos/
│   │   │       │   ├── page.tsx         # Lista de pedidos
│   │   │       │   └── [id]/page.tsx    # Detalhe do pedido
│   │   │       ├── clientes/
│   │   │       │   ├── page.tsx         # Lista de clientes
│   │   │       │   └── [id]/page.tsx    # Detalhe do cliente
│   │   │       ├── licencas/page.tsx    # Lista de licenças
│   │   │       └── logs/page.tsx        # Audit logs
│   │   │
│   │   ├── api/                         # Route Handlers (endpoints HTTP públicos)
│   │   │   └── webhooks/
│   │   │       └── asaas/
│   │   │           └── route.ts         # POST /api/webhooks/asaas
│   │   │
│   │   ├── not-found.tsx                # Tela 404 global
│   │   ├── error.tsx                    # Error Boundary global (tela 500)
│   │   ├── layout.tsx                   # Root layout (html, body, providers)
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/                          # shadcn/ui — NUNCA modificar diretamente
│   │   ├── catalog/                     # Componentes do catálogo
│   │   │   ├── product-card.tsx
│   │   │   ├── product-grid.tsx
│   │   │   ├── catalog-filters.tsx      # Filtros desktop + Vaul mobile
│   │   │   └── active-filters.tsx       # Chips de filtros ativos
│   │   ├── product/                     # Componentes da PDP
│   │   │   ├── product-gallery.tsx      # Carousel de imagens
│   │   │   ├── youtube-embed.tsx        # Embed do YouTube
│   │   │   ├── compatibility-table.tsx
│   │   │   └── changelog-accordion.tsx
│   │   ├── checkout/                    # Componentes do checkout
│   │   │   ├── checkout-form.tsx        # Form principal (Client Component)
│   │   │   ├── payment-method-selector.tsx
│   │   │   ├── pix-panel.tsx            # QR Code + countdown + realtime
│   │   │   ├── boleto-panel.tsx
│   │   │   └── order-summary.tsx
│   │   ├── orders/                      # Componentes da área do cliente
│   │   │   ├── order-card.tsx
│   │   │   ├── license-key-field.tsx    # Input read-only + botão copiar
│   │   │   └── version-badge.tsx
│   │   ├── admin/                       # Componentes do painel admin
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── kpi-cards.tsx            # Tremor KPICards
│   │   │   ├── revenue-chart.tsx        # Tremor BarChart
│   │   │   ├── orders-status-chart.tsx  # Tremor DonutChart
│   │   │   ├── orders-table.tsx         # TanStack Table
│   │   │   ├── customers-table.tsx      # TanStack Table
│   │   │   ├── licenses-table.tsx       # TanStack Table
│   │   │   ├── audit-logs-table.tsx     # TanStack Table
│   │   │   └── product-form.tsx         # Formulário de produto (Client Component)
│   │   ├── auth/
│   │   │   ├── login-form.tsx           # Client Component
│   │   │   └── register-form.tsx        # Client Component
│   │   └── layouts/
│   │       ├── site-header.tsx
│   │       ├── site-footer.tsx
│   │       └── checkout-header.tsx      # Logo apenas, sem nav
│   │
│   ├── lib/
│   │   ├── supabase.ts                  # Client-side Supabase (browser)
│   │   ├── supabase-server.ts           # Server-side Supabase (cookies)
│   │   ├── supabase-middleware.ts       # Supabase para middleware.ts
│   │   ├── actions/                     # Server Actions (mutations)
│   │   │   ├── auth-actions.ts          # login, register, logout
│   │   │   ├── order-actions.ts         # createOrder, getOrderStatus
│   │   │   ├── product-actions.ts       # createProduct, updateProduct, publishProduct
│   │   │   ├── license-actions.ts       # revokeLicense, generateDownloadUrl
│   │   │   └── checkout-actions.ts      # initCheckout, confirmTermsAcceptance
│   │   ├── services/                    # Lógica de negócio (pura, testável)
│   │   │   ├── license-service.ts       # generateLicenseKey(), validateLicense()
│   │   │   ├── download-service.ts      # generateSignedUrl() — Supabase Storage
│   │   │   └── email-service.ts         # sendOrderConfirmation(), sendUpdateNotification()
│   │   ├── integrations/                # Clients de APIs externas
│   │   │   ├── asaas.ts                 # AsaasClient: createPix(), createBoleto(), createCharge()
│   │   │   └── resend.ts                # ResendClient: send()
│   │   ├── validators/                  # Schemas Zod
│   │   │   ├── checkout-schema.ts       # checkoutSchema, cpfCnpjSchema
│   │   │   ├── product-schema.ts        # createProductSchema, updateProductSchema
│   │   │   ├── webhook-schema.ts        # asaasWebhookSchema
│   │   │   └── env-schema.ts            # Validação de variáveis de ambiente
│   │   └── utils.ts                     # Funções puras (formatCurrency, formatDate, etc.)
│   │
│   ├── hooks/                           # Custom hooks (Client Components only)
│   │   ├── use-copy-to-clipboard.ts
│   │   └── use-order-realtime.ts        # Supabase Realtime — status do pedido
│   │
│   └── types/                           # TypeScript types e interfaces
│       ├── database.types.ts            # Tipos gerados pelo Supabase CLI
│       ├── order.ts
│       ├── product.ts
│       └── license.ts
│
├── middleware.ts                         # Auth + role guard (raiz do projeto)
├── next.config.ts                        # Headers de segurança + config
├── .env.local                            # Variáveis de ambiente (nunca commitar)
├── .env.example                          # Template sem valores reais (commitar)
├── CLAUDE.md                             # Instruções específicas do projeto
└── docs/                                 # Documentação gerada pelos agentes
```

---

## Padrão de Rotas

### Route Groups e seus layouts

| Route Group | Layout | Proteção |
|-------------|--------|----------|
| `(store)` | SiteHeader + Footer | Público |
| `(auth)` | Centralizado, sem nav | Público (redireciona se já logado) |
| `(customer)` | SiteHeader + Footer | `auth.getUser()` — redireciona se não autenticado |
| `(checkout)` | Logo apenas, sem nav | `auth.getUser()` — redireciona se não autenticado |
| `(admin)` | AdminSidebar + main | `auth.getUser()` + `role === 'admin'` — 403 se customer |

### Middleware (`middleware.ts`)

```
Todas as rotas → supabase.auth middleware (refresh de sessão)

/pedidos/*      → verificar auth.getUser() → redirecionar para /auth/login se não autenticado
/checkout/*     → verificar auth.getUser() → redirecionar para /auth/login se não autenticado
/admin/*        → verificar auth.getUser() + role → 403/redirecionar se não for admin

/api/webhooks/* → sem auth de usuário (autenticação via token do Asaas no header)
```

---

## Decisões de Arquitetura

Detalhes completos nos ADRs. Resumo:

| Decisão | Escolha | Referência |
|---------|---------|------------|
| Framework de roteamento | Next.js 16 App Router (Server Components) | ADR-001 |
| Gateway de pagamento | Asaas (REST) em vez de Banco Inter (mTLS) | ADR-002 |
| Receptor de webhook | Route Handler (`/api/webhooks/asaas`) em vez de Edge Function | ADR-003 |
| Mutations no servidor | Server Actions em vez de API Routes | ADR-004 |
| Notificação em tempo real (Pix) | Supabase Realtime em vez de polling | ADR-005 |

---

## Onde Fica Cada Lógica

| Lógica | Onde | Por quê |
|--------|------|---------|
| Buscar dados para Server Component | Server Component (async `page.tsx`) | Roda no servidor, sem waterfall no client |
| Criar pedido, atualizar produto, revogar licença | Server Action em `lib/actions/` | Mutation com revalidação de cache automática |
| Receber webhook do Asaas | Route Handler em `app/api/webhooks/asaas/route.ts` | Precisa de endpoint HTTP público acessível pelo Asaas |
| Gerar License Key | `lib/services/license-service.ts` chamada pela Server Action | Lógica de negócio pura, separada do framework |
| Gerar Signed URL para download | `lib/services/download-service.ts` chamada pela Server Action | Usa Supabase Service Role Key — nunca no client |
| Enviar e-mail via Resend | `lib/services/email-service.ts` chamada pelo webhook handler | Resend API Key server-side only |
| Chamada à API do Asaas (criar Pix, Boleto, Charge) | `lib/integrations/asaas.ts` chamada pela Server Action | Asaas API Key nunca no client bundle |
| Validação de input | Zod em `lib/validators/` | Uma fonte de verdade, reutilizável em actions e route handlers |
| Formatação, cálculos | `lib/utils.ts` | Funções puras, sem side effects |
| Notificação em tempo real do status do Pix | `hooks/use-order-realtime.ts` (Client Component) | Supabase Realtime via WebSocket |
| Filtros do catálogo (estado de filtro ativo) | `catalog-filters.tsx` (Client Component) + URL params | Estado nos URL search params para compartilhamento e SSR |

---

## Integrações Externas

### Asaas (Pagamentos)

**Fluxo Pix:**
```
checkout-form.tsx (client)
  → createOrder() Server Action
    → AsaasClient.createPix() [lib/integrations/asaas.ts]
      → POST /api/v3/payments (Asaas REST)
    ← { pixQrCode, pixCopyPaste, id }
  ← { orderId, pixData }
→ Redirect para /checkout/[orderId]/pix

pix-panel.tsx (client)
  → use-order-realtime.ts (Supabase Realtime)
    → subscribe orders WHERE id = orderId
    ← status === 'paid' → redirect /sucesso

[Asaas webhooks]
  → POST /api/webhooks/asaas/route.ts
    → validar token header
    → asaasWebhookSchema.parse(body)
    → processar PAYMENT_CONFIRMED:
      → atualizar orders.status = 'paid'
      → license-service.generateLicenseKey()
      → inserir licenses
      → email-service.sendOrderConfirmation() + sendLicenseDelivery()
      → inserir audit_log (action: 'order_paid')
```

**Variáveis:**
```
ASAAS_API_KEY        # Server-side only — nunca NEXT_PUBLIC_
ASAAS_WEBHOOK_TOKEN  # Validar no header de toda request ao webhook
ASAAS_BASE_URL       # https://api.asaas.com/v3 (produção) | https://sandbox.asaas.com/api/v3
```

---

### Resend (E-mail Transacional)

**Fluxo:**
```
email-service.ts
  → ResendClient.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: customer.email,
      subject: '...',
      react: <EmailTemplate />  # ou html string
    })
```

**Templates de e-mail:**
- `src/components/emails/order-confirmation.tsx` — React Email template
- `src/components/emails/license-delivery.tsx`
- `src/components/emails/product-update.tsx`

**Variáveis:**
```
RESEND_API_KEY       # Server-side only
RESEND_FROM_EMAIL    # ex: noreply@seu-dominio.com (domínio verificado)
```

---

### Supabase Storage (Arquivos)

| Bucket | Tipo | Uso |
|--------|------|-----|
| `product-media` | Público | Imagens de produtos (galeria + thumbnails) |
| `product-files` | Privado | Arquivos para download (.zip, .dll, etc.) |

**Download seguro:**
```
license-actions.ts (Server Action)
  → validateLicenseOwnership(userId, licenseId)  ← NUNCA confiar em input
  → download-service.generateSignedUrl(filePath)
    → supabase.storage.from('product-files').createSignedUrl(path, 600) # 10 min
  ← signedUrl → redirect ou retorno ao client
```

> `file_path_secure` nunca é incluído em respostas de API — usado apenas internamente no servidor.

---

### Supabase Auth (Discord OAuth + Email/Senha)

**Fluxo Discord OAuth:**
```
/auth/login → Button "Entrar com Discord"
  → supabase.auth.signInWithOAuth({ provider: 'discord', redirectTo: '/auth/callback' })
  ← Redirect para Discord

/auth/callback/route.ts (Route Handler)
  → supabase.auth.exchangeCodeForSession(code)
  ← Session estabelecida → redirect para / ou URL original
```

**Proteção de rotas no middleware:**
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // Refresh de sessão (obrigatório para @supabase/ssr)
  const { supabase, response } = createSupabaseMiddlewareClient(request)
  const { data: { user } } = await supabase.auth.getUser()  // ← getUser(), nunca getSession()

  // Proteger /pedidos e /checkout
  if (!user && (request.nextUrl.pathname.startsWith('/pedidos')
             || request.nextUrl.pathname.startsWith('/checkout'))) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Proteger /admin
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) return NextResponse.redirect(new URL('/auth/login', request.url))
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'admin') return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}
```

---

## Regras Técnicas do Projeto

### Server vs Client Components

```
Server Component (padrão — sem 'use client')
  ✓ Páginas que buscam dados (page.tsx)
  ✓ Layouts
  ✓ Qualquer componente sem interação (galeria estática, tabela de compatibilidade)

Client Component ('use client' explícito)
  ✓ Formulários (checkout, login, produto) — react-hook-form precisa do client
  ✓ Componentes com estado (filtros, carousel, contador de Pix)
  ✓ Hooks de browser (use-copy-to-clipboard, use-order-realtime)
  ✓ Tremor charts (recharts precisa do client)
  ✓ TanStack Table com sort/filter interativo

Regra: mover 'use client' o mais para a folha da árvore possível.
Nunca marcar um layout inteiro como Client Component por causa de um botão.
```

### Server Actions

```typescript
// Padrão obrigatório para TODA Server Action
'use server'

import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function createOrder(input: unknown) {
  // 1. Sempre verificar quem é o usuário
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  // 2. Validar input com Zod — nunca confiar no que veio do client
  const validated = checkoutSchema.parse(input)

  // 3. Buscar dados do banco — nunca usar dados de preço do client
  const { data: product } = await supabase
    .from('products')
    .select('id, price')
    .eq('id', validated.productId)
    .single()

  // 4. Executar a lógica de negócio
  // ...

  // 5. Registrar audit log
  await supabase.from('audit_logs').insert({ ... })
}
```

### Webhook Handler

```typescript
// app/api/webhooks/asaas/route.ts
export async function POST(request: Request) {
  // 1. Validar token ANTES de qualquer processamento
  const token = request.headers.get('asaas-access-token')
  if (token !== process.env.ASAAS_WEBHOOK_TOKEN) {
    return new Response('Unauthorized', { status: 401 })
  }

  // 2. Validar body com Zod
  const body = await request.json()
  const parsed = asaasWebhookSchema.safeParse(body)
  if (!parsed.success) return new Response('Bad Request', { status: 400 })

  // 3. Garantir idempotência
  const { data: existing } = await supabase
    .from('orders')
    .select('id, status')
    .eq('asaas_payment_id', parsed.data.payment.id)
    .single()
  if (existing?.status === 'paid') return new Response('OK') // já processado

  // 4. Processar
  // ...
}
```

### Variáveis de Ambiente

Validar no startup com Zod em `lib/validators/env-schema.ts`:

```typescript
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL:          z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY:     z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY:         z.string().min(1),
  ASAAS_API_KEY:                     z.string().min(1),
  ASAAS_WEBHOOK_TOKEN:               z.string().min(1),
  ASAAS_BASE_URL:                    z.string().url(),
  RESEND_API_KEY:                    z.string().min(1),
  RESEND_FROM_EMAIL:                 z.string().email(),
})

export const env = envSchema.parse(process.env)
```

### Headers de Segurança (`next.config.ts`)

```typescript
const securityHeaders = [
  { key: 'Strict-Transport-Security',   value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Content-Type-Options',      value: 'nosniff' },
  { key: 'X-Frame-Options',             value: 'DENY' },
  { key: 'Referrer-Policy',             value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',          value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'nonce-{nonce}' 'strict-dynamic'",
      "style-src 'self' 'unsafe-inline'",
      `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL} wss://${new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').host}`,
      "img-src 'self' data: https:",
      "frame-src https://www.youtube.com",
      "font-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
]
```

### Convenções Gerais

- Arquivos: `kebab-case.ts` | Componentes: `PascalCase`
- Server Component por padrão — `'use client'` apenas quando necessário
- Sem `any` — inferir tipos de schemas Zod com `z.infer<typeof schema>`
- Sem `console.log` em produção — usar logger estruturado ou omitir
- Arquivos acima de 300 linhas devem ser divididos (exceto `database.types.ts`)
- Um componente por arquivo
- `supabase.auth.getUser()` em todo server-side — nunca `getSession()`
- Preço sempre lido do banco no servidor — nunca do input do client

---

## Histórico de Versões

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0 | 2026-02-18 | Versão inicial — projeto novo |
