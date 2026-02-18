# Security Review: ro-store-v2
**Fase:** Planejamento — após PO
**Data:** 2026-02-18
**Referência:** [PRD](./ro-store-v2-prd.md) | [Stories](./ro-store-v2-stories.md)

---

## 1. Classificação de Dados

| Classificação | Dados | Tratamento obrigatório |
|--------------|-------|----------------------|
| **Público** | Título, descrição, preço, categoria, emulador, tabela de compatibilidade, changelog, URL YouTube | Nenhum tratamento especial |
| **Interno** | E-mail do usuário, histórico de pedidos, License Key, data de download | Acesso autenticado, RLS obrigatório |
| **Confidencial** | CPF/CNPJ, método de pagamento, asaas_payment_id, IP registrado nos logs | Nunca logar em plain text, nunca expor em APIs públicas, RLS por dono |
| **Restrito** | Asaas API Key, Discord Client Secret, Resend API Key, Supabase Service Role Key, Webhook Secret Asaas, caminhos de arquivo no bucket privado (`file_path_secure`) | Apenas server-side, nunca no client bundle, somente em variáveis de ambiente |

> **Atenção:** CPF/CNPJ é dado fiscal sensível protegido pela LGPD (Lei 13.709/2018). Qualquer exposição indevida — via log, API pública ou erro de RLS — pode gerar obrigação de notificação à ANPD.

---

## 2. Threat Modeling (STRIDE)

### Fluxo 1 — Autenticação (E-mail/senha + Discord OAuth)

| Ameaça | Vetor | Mitigação |
|--------|-------|-----------|
| **Spoofing** | Callback OAuth forjado sem validação do `state` parameter | Validar `state` no callback do Discord para prevenir CSRF em OAuth |
| **Spoofing** | Session hijacking via cookie roubado | Cookies com `HttpOnly`, `Secure`, `SameSite=Lax` — Supabase SSR faz isso via `@supabase/ssr` |
| **Tampering** | Manipulação de JWT client-side para elevar role | JWT assinado pelo Supabase Auth — nunca aceitar `role` vindo do cliente |
| **Information Disclosure** | Enumeration de e-mails no login ("Este e-mail não existe") | Sempre retornar "E-mail ou senha incorretos" independente do caso |
| **DoS** | Brute force no endpoint de login | Rate limiting no Supabase Auth (configurável no Dashboard) + opcionalmente middleware |
| **Elevation of Privilege** | Usuário POST para `/api/profile` passando `role: "admin"` | Role nunca aceito como input do cliente — definido apenas server-side na criação do perfil |

---

### Fluxo 2 — Checkout e Pagamento (Asaas)

| Ameaça | Vetor | Mitigação |
|--------|-------|-----------|
| **Spoofing** | Webhook falso para `/api/webhooks/asaas` confirmando pagamento fictício | Validar token/assinatura do Asaas em toda request antes de qualquer processamento |
| **Tampering** | Usuário altera o preço via DevTools antes de submeter o checkout | Preço sempre lido do banco no servidor no momento da criação do pedido — nunca confiar no preço vindo do cliente |
| **Tampering** | Criação de pedido para outro `user_id` via API | `user_id` sempre extraído da sessão server-side (`auth.getUser()`), nunca do body da request |
| **Repudiation** | Usuário nega ter aceitado os termos anti-chargeback | Aceite do checkbox registrado em `audit_log` com `user_id`, IP, `user-agent` e timestamp |
| **Information Disclosure** | Asaas API Key exposta no bundle client-side | API Key apenas em variável de ambiente server-side — nunca com prefixo `NEXT_PUBLIC_` |
| **DoS** | Spam de criação de pedidos/Pix para consumir quota da API Asaas | Rate limiting no endpoint de checkout por usuário e por IP |

---

### Fluxo 3 — Entrega Digital (Signed URLs + Licenças)

| Ameaça | Vetor | Mitigação |
|--------|-------|-----------|
| **Spoofing** | Usuário sem licença tenta gerar download passando `license_id` de outro | Verificar ownership da licença server-side antes de gerar Signed URL — nunca confiar em IDs do cliente |
| **Information Disclosure** | `file_path_secure` exposto em respostas de API | Coluna `file_path_secure` nunca incluída em respostas de API para clientes — apenas usada internamente no server para gerar a Signed URL |
| **Information Disclosure** | Arquivo acessível via URL direta do bucket | Bucket de arquivos privado — acesso apenas via Signed URL com expiração de 10 minutos |
| **Repudiation** | Usuário nega ter feito download para solicitar reembolso | Todo download registrado em `audit_log` com `user_id`, IP, `product_id`, `license_id` e timestamp |
| **Tampering** | Manipulação da Signed URL para acessar outro arquivo | Signed URLs geradas com HMAC pelo Supabase Storage — impossível manipular sem invalidar a assinatura |
| **Elevation of Privilege** | Usuário com licença revogada ainda tenta download | Status da licença verificado server-side antes de gerar a URL — licença revogada retorna 403 |

---

### Fluxo 4 — Painel Administrativo

| Ameaça | Vetor | Mitigação |
|--------|-------|-----------|
| **Elevation of Privilege** | Customer acessa rotas `/admin/*` diretamente na URL | Middleware verifica role `admin` em toda rota `/admin` — redirecionamento para home se não autorizado |
| **Elevation of Privilege** | Customer chama Server Actions de admin diretamente | Server Actions do admin chamam `auth.getUser()` e verificam `role === 'admin'` antes de qualquer operação |
| **Information Disclosure** | Audit logs com dados sensíveis expostos via API | RLS na tabela `audit_log` — apenas role `admin` pode ler; `customer` sem acesso |
| **Tampering** | Admin apaga audit logs para encobrir fraude | Política de DELETE bloqueada na tabela `audit_log` — logs são imutáveis |

---

## 3. Requisitos de Segurança para o Backlog

Os itens abaixo devem ser implementados pelos agentes de desenvolvimento. Organizados por severidade esperada se não implementados.

---

### 🔴 Critical — Bloqueiam deploy se ausentes

#### Auth e Sessão
- [ ] **`auth.getUser()` em todo server-side** — usar `supabase.auth.getUser()` em Server Components, Middleware e Server Actions; nunca `getSession()` em server-side (não revalida token com o servidor)
- [ ] **Role nunca aceito do cliente** — o campo `role` nunca deve ser aceito como input do cliente em nenhum endpoint; sempre definido server-side na criação do perfil com valor padrão `customer`

#### Pagamentos
- [ ] **Validação de assinatura do webhook Asaas** — antes de processar qualquer evento de pagamento, validar o token de autenticação do webhook enviado pelo Asaas; rejeitar imediatamente qualquer request sem token válido
- [ ] **Preço lido do banco no servidor** — no momento da criação do pedido, o preço deve ser buscado na tabela `products` no servidor; nunca usar o preço enviado pelo cliente no body da request

#### Entrega Digital
- [ ] **Verificação de ownership da licença server-side** — antes de gerar Signed URL, verificar que a `license` pertence ao `user_id` da sessão atual e está ativa; rejeitar com 403 caso contrário
- [ ] **`file_path_secure` nunca exposto em API responses** — a coluna deve ser usada apenas internamente no servidor para gerar a Signed URL; nunca incluída em respostas retornadas ao cliente

#### Autorização
- [ ] **Middleware protegendo rotas `/admin`** — toda rota sob `/admin` deve ser protegida no `middleware.ts` verificando autenticação e role `admin`
- [ ] **Server Actions do admin verificam role** — cada Server Action do painel admin deve chamar `auth.getUser()` e validar `role === 'admin'` antes de executar qualquer operação
- [ ] **RLS habilitado em todas as tabelas** — `profiles`, `products`, `orders`, `order_items`, `licenses`, `product_versions`, `product_images`, `audit_logs`
- [ ] **Política de DELETE bloqueada em `audit_log`** — nenhum usuário, incluindo admin, pode deletar registros de auditoria

---

### 🟠 High — Devem ser implementados antes do lançamento

#### Autenticação
- [ ] **Validação do `state` parameter no callback do Discord OAuth** — implementar e validar o parâmetro `state` no fluxo OAuth para prevenir CSRF; verificar se o Supabase Auth gerencia isso automaticamente (deve gerenciar — confirmar na implementação)
- [ ] **Mensagem genérica no login** — endpoint de login sempre retorna "E-mail ou senha incorretos" independentemente de o e-mail existir ou não no banco
- [ ] **Rate limiting no Supabase Auth** — verificar e habilitar rate limiting nativo no Dashboard do Supabase (Auth → Rate Limits) para login, cadastro e reset de senha
- [ ] **Rate limiting no endpoint de checkout** — limitar criações de pedido por usuário autenticado (ex: máx 5 tentativas por minuto) para evitar abuso da API do Asaas

#### Dados Sensíveis
- [ ] **CPF/CNPJ tratado como confidencial** — nunca retornar em listagens públicas de API; acessível apenas pelo próprio usuário e pelo admin via RLS; nunca logar em plain text
- [ ] **Asaas API Key apenas server-side** — nunca usar prefixo `NEXT_PUBLIC_` na variável; apenas acessível em Server Components, Server Actions e Route Handlers

#### Webhook Asaas
- [ ] **Idempotência no processamento do webhook** — verificar `asaas_payment_id` antes de criar licença ou processar entrega; rejeitar eventos duplicados silenciosamente para evitar entregas múltiplas

---

### 🟡 Medium — Implementar no MVP, mas não bloqueiam lançamento

#### HTTP Security Headers (Next.js — `next.config.ts`)
- [ ] **`Strict-Transport-Security`**: `max-age=31536000; includeSubDomains`
- [ ] **`X-Content-Type-Options`**: `nosniff`
- [ ] **`X-Frame-Options`**: `DENY`
- [ ] **`Referrer-Policy`**: `strict-origin-when-cross-origin`
- [ ] **`Content-Security-Policy`** — configurar com diretivas mínimas:
  ```
  default-src 'self';
  script-src 'self' 'nonce-{nonce}' 'strict-dynamic';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://{projeto}.supabase.co wss://{projeto}.supabase.co;
  img-src 'self' data: https:;
  frame-src https://www.youtube.com;
  font-src 'self';
  frame-ancestors 'none';
  ```
  > Nota: `frame-src https://www.youtube.com` é obrigatório para o embed de YouTube funcionar com CSP ativo.

#### Auditoria
- [ ] **Aceite do checkbox anti-chargeback auditado** — registrar em `audit_log` com: `user_id`, `action: "terms_accepted"`, `order_id`, `ip_address`, `user_agent`, `timestamp`
- [ ] **Login/logout auditado** — registrar em `audit_log` com: `user_id`, `action: "login"/"logout"`, `ip_address`, `user_agent`, `timestamp`
- [ ] **Revogação de licença auditada** — registrar em `audit_log` com: `admin_id`, `action: "license_revoked"`, `license_id`, `user_id`, `timestamp`

#### Secrets e Variáveis de Ambiente
- [ ] **`.env.local` no `.gitignore`** — verificar que o arquivo com credenciais reais nunca é commitado
- [ ] **`.env.example` sem valores reais** — criar template com nomes das variáveis e valores placeholder
- [ ] **`SUPABASE_SERVICE_ROLE_KEY` apenas server-side** — verificar que não aparece com prefixo `NEXT_PUBLIC_` nem no bundle

#### Edge Functions / Route Handlers
- [ ] **Timeout em chamadas ao Asaas** — configurar timeout máximo (ex: 10s) em chamadas à API do Asaas; retornar erro amigável ao cliente se timeout ocorrer
- [ ] **Erros da API do Asaas não expostos ao cliente** — logar detalhes do erro no servidor; retornar mensagem genérica ao cliente ("Erro ao processar pagamento. Tente novamente.")

---

### 🟢 Low — Recomendações para hardening futuro

- [ ] **Política de senha no Supabase Auth** — configurar mínimo de 8 caracteres no Dashboard (Auth → Providers → Email)
- [ ] **Source maps desabilitados em produção** — `productionBrowserSourceMaps: false` em `next.config.ts`
- [ ] **`Permissions-Policy` header** — desabilitar features não usadas: `camera=(), microphone=(), geolocation=()`
- [ ] **CORS restrito nos Route Handlers** — especificar domínio permitido; nunca `Access-Control-Allow-Origin: *` em endpoints autenticados
- [ ] **Audit log com retenção definida** — definir política de retenção (ex: 12 meses) para os logs de auditoria

---

## 4. Variáveis de Ambiente Obrigatórias

Todas as variáveis abaixo devem estar em `.env.local` e nunca commitadas:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=          # ← nunca prefixo NEXT_PUBLIC_

# Asaas
ASAAS_API_KEY=                      # ← nunca prefixo NEXT_PUBLIC_
ASAAS_WEBHOOK_TOKEN=                # ← para validação do webhook

# Discord OAuth (configurado no Supabase Auth Dashboard)
# Client Secret fica no Supabase Dashboard — não precisa em .env local

# Resend
RESEND_API_KEY=                     # ← nunca prefixo NEXT_PUBLIC_
RESEND_FROM_EMAIL=                  # ex: noreply@seu-dominio.com
```

---

## 5. Superfície de Ataque — Endpoints Críticos

| Endpoint | Risco | Proteção obrigatória |
|----------|-------|---------------------|
| `POST /api/webhooks/asaas` | Confirmação falsa de pagamento | Validar token Asaas + idempotência |
| `POST /api/orders` | Price tampering, pedido para outro user | Preço do banco + `user_id` da sessão |
| `POST /api/licenses/[id]/download` | Download sem licença, licença revogada | Ownership check + status check server-side |
| `POST /auth/login` | Brute force, enumeration | Rate limiting + mensagem genérica |
| `POST /auth/callback` (Discord) | CSRF OAuth | Validar `state` parameter |
| Rotas `/admin/*` | Acesso não autorizado | Middleware + verificação de role |

---

## 6. LGPD — Considerações sobre CPF/CNPJ

O sistema coleta CPF/CNPJ como dado pessoal obrigatório para checkout. Pela LGPD:

- [ ] **Base legal:** A coleta deve ter base legal explícita — no caso, "execução de contrato" (venda de produto digital) e "cumprimento de obrigação legal" (fiscal). Documentar na política de privacidade.
- [ ] **Minimização de dados:** Coletar apenas o necessário. CPF/CNPJ é coletado para emissão de cobrança e eventual nota fiscal — uso legítimo.
- [ ] **Direito de acesso:** O titular pode solicitar seus dados. Implementar endpoint ou processo de exportação de dados do usuário (pós-MVP, mas deve ser planejado).
- [ ] **Retenção:** Definir por quanto tempo CPF/CNPJ e dados de pedidos são mantidos após cancelamento de conta.

> Para o MVP: garantir que CPF/CNPJ é acessível apenas pelo próprio usuário e pelo admin, conforme RLS definido no PRD. A política de privacidade deve ser criada antes do lançamento (fora do escopo técnico, mas bloqueante jurídico).

---

---

## PARTE 2 — Review da Arquitetura (após System Architect)

**Data:** 2026-02-18
**Referência:** [Architecture](./ro-store-v2-architecture.md) | [ADRs](./adr/)

---

### 1. Segurança das Decisões de Arquitetura

#### Webhook Route Handler (`/api/webhooks/asaas/route.ts`)

| Verificação | Status | Observação |
|------------|--------|------------|
| Validação de token antes de qualquer processamento | ✅ | Documentado na arquitetura — primeira operação |
| Body parsed apenas após validação do token | ✅ | Padrão definido na arquitetura |
| Idempotência por `asaas_payment_id` | ✅ | Documentado — rejeita silenciosamente se já `paid` |
| Erros internos não expostos ao client (Asaas) | ⚠️ **Requere atenção** | Definir: em caso de erro interno, retornar `500` sem stack trace. Asaas fará retry automático. |
| Timeout em chamadas externas (Resend, Supabase) | ⚠️ **Requere atenção** | Configurar timeout em `email-service.ts` e nas queries Supabase dentro do webhook |
| Retry com backoff (chamada ao Asaas) | ℹ️ N/A | O webhook *recebe* do Asaas — Asaas que faz retry. No fluxo de criação de cobranças, configurar timeout de 10s. |

**Requisito adicional:**
- [ ] Webhook handler captura todos os erros com try/catch e retorna `500` genérico ao Asaas — logs detalhados apenas no servidor, sem stack trace na response

---

#### Server Actions (mutations)

| Verificação | Status | Observação |
|------------|--------|------------|
| `auth.getUser()` como primeira operação | ✅ | Padrão definido e explicitado na arquitetura |
| Input validado com Zod antes de usar | ✅ | Padrão definido |
| Preço sempre do banco, nunca do client | ✅ | Regra de negócio no CLAUDE.md |
| `user_id` da sessão, nunca do input | ✅ | Padrão definido |
| Erros genéricos retornados ao client | ⚠️ **Requere atenção** | Definir padrão: `return { error: 'Erro ao processar. Tente novamente.' }` — sem detalhes de implementação |
| Server Actions com revalidação de cache | ✅ | `revalidatePath()` após mutations — padrão Next.js |

**Requisito adicional:**
- [ ] Definir tipo de retorno padrão para Server Actions: `{ data?: T, error?: string }` — `error` sempre string genérica, sem detalhes de banco ou exceção

---

#### Middleware de Autenticação e Autorização

| Verificação | Status | Observação |
|------------|--------|------------|
| `auth.getUser()` (não `getSession()`) | ✅ | Explicitado no código de exemplo da arquitetura |
| `/admin/*` verifica role no banco | ✅ | Query `profiles.role` no middleware |
| `/pedidos/*` verifica autenticação | ✅ | Documentado |
| `/checkout/*` verifica autenticação | ✅ | Documentado |
| Redirect após auth preserva URL original | ⚠️ **Requere atenção** | Ao redirecionar para `/auth/login?redirect=...`, validar que a URL de redirect é interna (começa com `/`) — prevenir open redirect |
| `/api/webhooks/*` não exige auth de usuário | ✅ | Correto — autenticação é pelo token Asaas, não por sessão |

**Requisito adicional:**
- [ ] No middleware, ao construir o redirect URL, validar que `redirect` param começa com `/` — nunca redirecionar para domínio externo após login

---

#### Supabase Realtime (ADR-005 — Pix waiting screen)

| Verificação | Status | Observação |
|------------|--------|------------|
| Client só recebe updates do próprio pedido | ⚠️ **Requere atenção** | O Supabase Realtime respeita RLS quando o `filter` bate com a policy. A policy RLS em `orders` deve garantir `auth.uid() = user_id`. O Data Architect deve confirmar isso. |
| Canal isolado por pedido (`order-${orderId}`) | ✅ | Documentado no ADR-005 |
| Unsubscribe no cleanup (memory leak) | ⚠️ **Requere atenção** | O hook `use-order-realtime.ts` deve retornar cleanup function (`channel.unsubscribe()`) no `useEffect` return |
| Fallback se Realtime indisponível | ✅ | Botão "Verificar pagamento" mencionado no ADR-005 |

**Requisito adicional:**
- [ ] `use-order-realtime.ts` deve chamar `channel.unsubscribe()` no cleanup do `useEffect` para evitar memory leak e conexões WebSocket orphans

---

#### `file_path_secure` — Proteção de Coluna

| Verificação | Status |
|------------|--------|
| Nunca incluído em selects públicos de produtos | ⚠️ **Requere atenção** |
| Usado apenas em `download-service.ts` (server-side) | ✅ |

**Requisito adicional:**
- [ ] Em toda query `SELECT` na tabela `products` fora de `download-service.ts`, nunca incluir `file_path_secure`. Usar `products.select('id, title, price, ...')` com campos explícitos — nunca `select('*')` em produtos.

---

#### Discord OAuth — Open Redirect

| Verificação | Status |
|------------|--------|
| `state` parameter validado pelo Supabase Auth | ✅ (Supabase gerencia automaticamente) |
| Redirect após callback para URL interna | ⚠️ **Requere atenção** |

**Requisito adicional:**
- [ ] Em `/auth/callback/route.ts`, após `exchangeCodeForSession`, o redirect deve ser para uma URL interna validada. Nunca usar o parâmetro `next` (ou similar) passado pela URL sem validar que começa com `/`.

---

### 2. HTTP Security Headers

Configurados em `next.config.ts`. Validar implementação na fase de Security Audit.

| Header | Configurado na Arquitetura | Observação |
|--------|--------------------------|------------|
| `Strict-Transport-Security` | ✅ | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | ✅ | `nosniff` |
| `X-Frame-Options` | ✅ | `DENY` |
| `Referrer-Policy` | ✅ | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | ✅ | camera, mic, geolocation desabilitados |
| `Content-Security-Policy` | ✅ | Inclui `frame-src youtube.com` para embed |
| `X-XSS-Protection` | ℹ️ Não listado | Com CSP ativo, é redundante. Omitir ou setar `0`. |

**Ponto de atenção — CSP e nonce:**
O template de CSP na arquitetura usa `'nonce-{nonce}'` como placeholder. A implementação real no Next.js 16 exige que o nonce seja gerado por request e injetado via `middleware.ts`. O Data Architect não precisa se preocupar com isso, mas o stack agent deve implementar durante o desenvolvimento.

---

### 3. Proteção das Integrações

#### Asaas

- [ ] `ASAAS_API_KEY` e `ASAAS_WEBHOOK_TOKEN` apenas em variáveis de ambiente server-side — nunca prefixo `NEXT_PUBLIC_`
- [ ] `AsaasClient` em `lib/integrations/asaas.ts` — nunca importado em Client Components
- [ ] Timeout de 10s configurado em todas as chamadas para a API do Asaas
- [ ] Em caso de erro da API Asaas, retornar mensagem genérica ao client — nunca expor `response.body` da Asaas

#### Resend

- [ ] `RESEND_API_KEY` apenas server-side — nunca `NEXT_PUBLIC_`
- [ ] `ResendClient` apenas importado em `lib/services/email-service.ts`
- [ ] Templates de e-mail não renderizam conteúdo HTML de input do usuário sem sanitizar

#### Supabase Storage (bucket privado)

- [ ] Bucket `product-files` com `public: false` — verificar na criação
- [ ] `SUPABASE_SERVICE_ROLE_KEY` usada apenas no `download-service.ts` para gerar Signed URL — nunca no client
- [ ] Signed URL gerada com validade máxima de 600 segundos (10 minutos)

---

### 4. Checklist Consolidado — Arquitetura

#### 🔴 Critical (bloqueia desenvolvimento se ausente)
- [ ] Middleware valida `redirect` param — nunca redirecionar para domínio externo após login
- [ ] Webhook captura todos os erros e retorna `500` genérico — sem stack trace

#### 🟠 High (implementar antes do lançamento)
- [ ] `use-order-realtime.ts` com cleanup (`channel.unsubscribe()`) no `useEffect`
- [ ] Queries em `products` nunca incluem `file_path_secure` exceto em `download-service.ts`
- [ ] Server Actions com tipo de retorno padronizado — `error` sempre string genérica

#### 🟡 Medium
- [ ] Timeout de 10s em chamadas à API do Asaas
- [ ] Timeout em chamadas ao Resend dentro do webhook handler
- [ ] CSP com nonce implementado no middleware (Next.js 16)

---

---

## PARTE 3 — Review do Schema (após Data Architect)

**Data:** 2026-02-18
**Referência:** [Data Architecture](./ro-store-v2-data-architecture.md)

---

### 1. RLS Review — Tabela a Tabela

| Tabela | SELECT | INSERT | UPDATE | DELETE | Status |
|--------|--------|--------|--------|--------|--------|
| `profiles` | Próprio + admin | Bloqueado (trigger) | Próprio (sem role) + admin | Bloqueado | 🔴 Recursão |
| `products` | Publicados (todos) + rascunhos (admin) | Admin | Admin | Admin | 🟠 Recursão |
| `product_versions` | Autenticado (changelog) + admin | Admin | Admin | Bloqueado | 🟠 `file_path_secure` exposto |
| `product_images` | Todos | Admin | Admin | Admin | ✅ |
| `orders` | Próprio + admin | Autenticado (próprio) | service_role | Bloqueado | ✅ |
| `order_items` | Próprio (via order) + admin | service_role | service_role | Bloqueado | ✅ |
| `licenses` | Próprio + admin | service_role | Admin | Bloqueado | ✅ |
| `audit_logs` | Admin | service_role | Bloqueado | Bloqueado | ✅ |

---

### 2. Findings Detalhados

#### 🔴 CRÍTICO — Recursão Infinita nas Políticas RLS de `profiles`

**Problema:**

Todas as políticas que verificam status de admin usam o padrão:

```sql
EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
```

Quando esta subquery é executada **dentro de uma policy da própria tabela `profiles`**, o PostgreSQL aplica as políticas RLS de SELECT para `profiles` ao executar a subquery — que por sua vez dispara a mesma política, causando **recursão infinita** e erro em tempo de execução.

As policies afetadas diretamente na tabela `profiles`:
- `profiles_select_own_or_admin` — usa a subquery admin dentro de uma SELECT policy de `profiles`
- `profiles_update_own` — `WITH CHECK (role = (SELECT role FROM profiles WHERE id = auth.uid()))` — mesma recursão

**Impacto:** Login, leitura do perfil e qualquer operação autenticada pode falhar com `ERROR: infinite recursion detected in policy for relation "profiles"`.

**Correção obrigatória:** Criar uma função `is_admin()` com `SECURITY DEFINER` que bypassa RLS ao ler a role:

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _role TEXT;
BEGIN
  SELECT role INTO _role FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(_role = 'admin', false);
END;
$$;
```

Depois substituir **todas** as ocorrências de `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')` por `is_admin()` em todas as tabelas. O `SET search_path = public` é obrigatório em funções SECURITY DEFINER para prevenir search_path injection.

Políticas de `profiles` corrigidas:

```sql
CREATE POLICY profiles_select_own_or_admin ON profiles
  FOR SELECT USING (id = auth.uid() OR is_admin());

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM profiles p WHERE p.id = auth.uid())
  );
  -- A subquery em WITH CHECK (não em USING) não causa recursão da mesma forma,
  -- mas por segurança, substituir por: WITH CHECK (id = auth.uid() AND NOT is_admin())
  -- Lógica: o usuário comum só pode atualizar seus próprios campos; is_admin() usa SECURITY DEFINER

CREATE POLICY profiles_update_admin ON profiles
  FOR UPDATE USING (is_admin());
```

---

#### 🟠 HIGH — `file_path_secure` Acessível por Qualquer Usuário Autenticado

**Problema:**

A política RLS de `product_versions` permite que qualquer usuário autenticado faça SELECT em toda a linha, incluindo a coluna `file_path_secure`:

```sql
CREATE POLICY product_versions_select_authenticated ON product_versions
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM products WHERE id = product_id AND is_published = true)
    OR is_admin()
  );
```

RLS controla acesso a **linhas**, não a **colunas**. Um customer autenticado com a `anon key` pode executar:

```javascript
const { data } = await supabase
  .from('product_versions')
  .select('file_path_secure')
  .eq('product_id', 'algum-id')
```

E obter o caminho do arquivo no bucket privado — quebrando a proteção de `file_path_secure` que depende apenas da camada de aplicação.

**Impacto:** O caminho do arquivo (`file_path_secure`) exposto permite que alguém com acesso direto ao Supabase Storage (via URL direta, não Signed URL) tente acessar o arquivo, mesmo que o bucket seja privado (precisaria da `service_role key` para isso — risco baixo, mas viola o princípio de defense in depth).

**Correção — Column-Level Privilege (recomendada):**

```sql
-- Revogar SELECT na coluna file_path_secure do role authenticated
REVOKE SELECT (file_path_secure) ON product_versions FROM authenticated;

-- O role authenticated passa a não poder ler file_path_secure mesmo com a policy de SELECT ativa
-- service_role (que bypassa RLS e tem todos os privileges) ainda consegue ler
```

Incluir no migration, após as policies de RLS.

**Alternativa:** Mover `file_path_secure` para uma tabela separada `product_files` com policy `FOR SELECT USING (false)` para usuários regulares. Mais custoso de implementar, mesma proteção.

---

#### 🟡 MEDIUM — `fn_handle_new_user` sem `SET search_path`

**Problema:**

A função `fn_handle_new_user` tem `SECURITY DEFINER` mas não define `SET search_path = public`:

```sql
CREATE OR REPLACE FUNCTION fn_handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
```

Funções com `SECURITY DEFINER` são vulneráveis a search_path injection: um atacante com permissão de criar objetos no schema poderia criar uma tabela `profiles` em outro schema e redirecionar o INSERT.

**Correção:**

```sql
CREATE OR REPLACE FUNCTION fn_handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'customer')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
```

A mesma correção se aplica à função `is_admin()` (já incluída na definição acima).

---

#### 🟡 MEDIUM — `login` e `logout` de Customers não Auditados

**Problema:**

A Parte 1 deste security review define como requisito 🟡 Medium:

> **Login/logout auditado** — registrar em `audit_log` com: `user_id`, `action: "login"/"logout"`, `ip_address`, `user_agent`, `timestamp`

A tabela `audit_logs` documenta apenas 6 ações: `terms_accepted`, `order_paid`, `license_generated`, `file_downloaded`, `license_revoked`, `admin_login`. Faltam:

- `customer_login` — rastreabilidade de acesso do cliente
- `customer_logout` — (opcional, mas complementa o trail)
- `order_created` — evidência adicional de criação do pedido (além do `terms_accepted`)

**Impacto:** Sem login de customers auditado, não é possível detectar uso de credenciais comprometidas ou acessos suspeitos de IPs diferentes.

**Correção — Adicionar ações ao catálogo:**

| Action | Quando | Metadata |
|--------|--------|----------|
| `customer_login` | Login via email/senha ou Discord OAuth | `{ provider: 'email'/'discord' }` |
| `order_created` | Criação de pedido (antes da confirmação de pagamento) | `{ order_id, payment_method, total_amount }` |

Nota: `customer_logout` pode ser omitido no MVP (valor informacional menor) — mas `customer_login` e `order_created` são prioritários.

---

#### 🟡 MEDIUM — `fn_check_duplicate_license` com Query Desnecessariamente Complexa

**Problema:**

A trigger `fn_check_duplicate_license` verifica se o usuário já tem licença via JOIN em `order_items`:

```sql
IF EXISTS (
    SELECT 1 FROM licenses l
    JOIN orders o ON o.id = (
      SELECT oi.order_id FROM order_items oi WHERE oi.id = l.order_item_id
    )
    WHERE l.product_id = NEW.product_id
      AND o.user_id = (SELECT user_id FROM orders WHERE id = NEW.order_id)
      AND l.is_active = true
  )
```

A tabela `licenses` já tem a coluna `user_id` diretamente — o JOIN via `order_items` é desnecessário e torna o código mais difícil de manter e mais propenso a bugs silenciosos.

**Correção — Query simplificada:**

```sql
IF EXISTS (
    SELECT 1 FROM licenses l
    WHERE l.product_id = NEW.product_id
      AND l.user_id = (SELECT user_id FROM orders WHERE id = NEW.order_id)
      AND l.is_active = true
  )
```

Semanticamente idêntico, mais legível e com melhor plano de execução (usa o índice `idx_licenses_user_id` + `idx_licenses_product_id`).

---

#### 🟢 LOW — `cpf_cnpj` em Texto Plano

**Observação:**

`profiles.cpf_cnpj` é armazenado como TEXT sem criptografia. A proteção atual é via RLS (acesso apenas pelo próprio usuário e admin). Em caso de vazamento do banco (dump), o CPF/CNPJ estaria exposto em clear text.

**Recomendação (pós-MVP):** Considerar Supabase Vault (`pgsodium`) para criptografia da coluna:

```sql
-- Usando Supabase Vault para criptografar cpf_cnpj
SELECT vault.create_secret('chave-vault') AS key_id;
-- Criptografar ao INSERT/UPDATE, descriptografar apenas server-side
```

Para o MVP: a proteção via RLS é suficiente. Registrar como item de hardening para versão futura.

---

#### 🟢 LOW — Ausência de Audit para Ações de Produto pelo Admin

**Observação:**

O catálogo de ações do `audit_logs` não inclui ações de produto (`product_published`, `product_updated`, `version_uploaded`). Para um sistema de venda de software, rastrear o que o admin publicou/editou pode ser útil para auditoria de conteúdo e resolução de disputas.

**Recomendação (pós-MVP):**

| Action | Quando | Metadata |
|--------|--------|----------|
| `product_published` | Admin publica produto | `{ product_id, title }` |
| `product_updated` | Admin edita produto | `{ product_id, fields_changed: [] }` |
| `version_uploaded` | Admin faz upload de nova versão | `{ product_id, version_number }` |

---

### 3. Dados Sensíveis no Banco

| Coluna | Tabela | Classificação | Proteção atual | Status |
|--------|--------|--------------|----------------|--------|
| `cpf_cnpj` | `profiles` | Confidencial (LGPD) | RLS (acesso pelo dono + admin) | 🟡 Sem criptografia |
| `file_path_secure` | `product_versions` | Restrito | Comment + app layer | 🟠 Sem proteção de coluna |
| `asaas_payment_id` | `orders` | Confidencial | RLS (dono + admin) | ✅ |
| `pix_copy_paste` | `orders` | Interno | RLS (dono + admin) | ✅ (expira com o Pix) |
| `license_key` | `licenses` | Interno | RLS (dono + admin) | ✅ |
| `metadata` (JSONB) | `audit_logs` | Confidencial | RLS (admin only) | ✅ — verificar que `license_key` nunca vai completo no JSONB |

**Atenção — `audit_logs.metadata`:** O catálogo documenta que `license_generated` registra `license_key (apenas os últimos 4 chars)`. Este padrão deve ser aplicado consistentemente: **nunca** armazenar license_key completa, asaas_payment_id completo ou outros dados sensíveis inteiros em `metadata`. Registrar apenas sufixos ou hashes quando necessário para identificação.

---

### 4. RBAC Review

| Verificação | Status | Observação |
|------------|--------|------------|
| Escalonamento de privilégio | ✅ | `profiles_update_own` tem WITH CHECK impedindo alterar role — mas requer correção da recursão para funcionar |
| Apenas dois roles fixos (`admin`, `customer`) | ✅ | TEXT + CHECK IN — sem catálogo dinâmico de roles |
| Verificação server-side (não só UI) | ✅ | Middleware + Server Actions verificam role |
| RLS como segunda camada além da app | ✅ | Todas as tabelas com RLS habilitado |
| Admin criado apenas via SQL manual | ✅ | Seed pós-deploy — nenhum endpoint de promoção a admin |
| Token refresh ao mudar role | ⚠️ | Supabase Auth: o JWT tem expiração padrão de 1h. Se o role mudar no banco, o token anterior ainda é válido até expirar. Mitigação: Supabase tem `auth.admin.updateUserById()` + `signOut()` para invalidar sessão quando role é alterado. Documentar no CLAUDE.md |

---

### 5. Checklist Consolidado — Schema

#### 🔴 Critical (bloqueia migração para produção)

- [ ] **Criar função `is_admin()` com SECURITY DEFINER + SET search_path = public** — substituir todas as subqueries inline de verificação de admin em todas as políticas RLS
- [ ] **Aplicar `is_admin()` nas policies de `profiles`** — eliminar recursão nas policies `profiles_select_own_or_admin` e `profiles_update_own`

#### 🟠 High (implementar antes do lançamento)

- [ ] **`REVOKE SELECT (file_path_secure) ON product_versions FROM authenticated`** — proteção de coluna no nível do banco; incluir no final da migration, após as policies
- [ ] **`is_admin()` em todas as tabelas** — substituir o padrão `EXISTS (SELECT 1 FROM profiles ... role = 'admin')` em todas as N tabelas que usam este padrão

#### 🟡 Medium

- [ ] **`fn_handle_new_user` com `SET search_path = public`** — proteção contra search_path injection em função SECURITY DEFINER
- [ ] **Adicionar `customer_login` e `order_created` ao catálogo de `audit_logs`** — documentar no data architecture e implementar nas Server Actions correspondentes
- [ ] **Simplificar `fn_check_duplicate_license`** — usar `licenses.user_id` direto em vez do JOIN por `order_items`
- [ ] **Documentar no CLAUDE.md:** ao alterar role de um usuário, invalidar sessão via `auth.admin.updateUserById()` + forçar novo login

#### 🟢 Low (hardening futuro)

- [ ] **`cpf_cnpj` com Supabase Vault** — pós-MVP; por agora, RLS é proteção suficiente
- [ ] **Auditoria de ações de produto do admin** — `product_published`, `product_updated`, `version_uploaded` — pós-MVP
- [ ] **`audit_logs.metadata` sem license_key completa** — garantir no código que apenas os últimos 4 chars são registrados

---

### 6. Migration — Alterações Necessárias

Os seguintes blocos devem ser adicionados/modificados em `supabase/migrations/20260218000000_initial_schema.sql`:

**1. Adicionar `is_admin()` (logo após `fn_update_timestamp`):**

```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _role TEXT;
BEGIN
  SELECT role INTO _role FROM profiles WHERE id = auth.uid();
  RETURN COALESCE(_role = 'admin', false);
END;
$$;
```

**2. Substituir todas as subqueries admin nas policies** por `is_admin()`.

**3. Corrigir `fn_handle_new_user`** para incluir `SET search_path = public`.

**4. Simplificar `fn_check_duplicate_license`** (ver seção de findings).

**5. Adicionar ao final (após policies RLS, antes de Realtime):**

```sql
-- Column-level security: file_path_secure nunca visível ao role authenticated
REVOKE SELECT (file_path_secure) ON product_versions FROM authenticated;
```

---

## Histórico de Versões

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0 | 2026-02-18 | Versão inicial — review do PRD após PO |
| 1.1 | 2026-02-18 | Parte 2 adicionada — review da arquitetura após System Architect |
| 1.2 | 2026-02-18 | Parte 3 adicionada — review do schema após Data Architect |
