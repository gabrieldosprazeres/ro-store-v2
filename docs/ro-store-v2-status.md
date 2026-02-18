# Status: ro-store-v2
## Fase atual: Execução — Sprint 2
## Último agente: Next.js
## Branch: feature/sprint-1-fundacao

### Planejamento
- PO — Discovery e PRD ✅
- Security Review (PRD) ✅
- Design & UI ✅
- System Architect ✅
- Security Review (arquitetura) ✅
- Data Architect ✅
- Security Review (schema) ✅
- Backlog (sprints) ✅

### Outputs gerados
- `docs/ro-store-v2-prd.md` ✅
- `docs/ro-store-v2-stories.md` ✅ (28 stories / 8 épicos)
- `docs/ro-store-v2-security-review.md` ✅ (v1.0 PRD + v2.0 arquitetura + v1.2 schema)
- `docs/ro-store-v2-design-system.md` ✅ (Void Purple, radius 0.375rem)
- `docs/ro-store-v2-ui-flow.md` ✅ (15 telas, wireframes mobile + desktop)
- `docs/ro-store-v2-architecture.md` ✅
- `docs/adr/ADR-001` a `ADR-005` ✅
- `CLAUDE.md` (raiz do projeto) ✅
- `docs/ro-store-v2-data-architecture.md` ✅ v1.1 (is_admin(), REVOKE SELECT, triggers corrigidos, audit_logs expandido)
- `docs/ro-store-v2-backlog.md` ✅ v1.0 (7 sprints, 35 tasks, 28 stories)

### Sprint 1: Fundação ✅
- Task 1.1: Inicializar projeto Next.js 16 ✅
- Task 1.2: Validação de ambiente e Supabase clients ✅
- Task 1.3: Migration completa do banco — ⚠️ PENDENTE (aguardando .env.local com credenciais Supabase reais)
- Task 1.4: Headers de segurança e next.config.ts ✅
- Task 1.5: Middleware de autenticação (proxy.ts) ✅
- Task 1.6: Layouts de route groups e design tokens ✅
- `npm run build` ✅ (Partial Prerender em `/`, static em `/_not-found`)

### Pendências
- Task 1.3 (Migration SQL): executar após configurar `.env.local` com credenciais Supabase reais.
  Quando executar: Supabase Dashboard → SQL Editor → colar migration de `docs/ro-store-v2-data-architecture.md`
  Então: `npx supabase gen types --lang=typescript > src/types/database.types.ts` (substitui o placeholder)
- Tremor (`@tremor/react`): incompatível com React 19.2.3. Instalar na Sprint 6 com `--legacy-peer-deps`.

### Sprint 2: Autenticação — pendente
- Task 2.1: Páginas de auth (login, registro, forgot-password, update-password)
- Task 2.2: Server Actions de auth (signIn, signUp, signOut, resetPassword)
- Task 2.3: Discord OAuth (signInWithOAuth + callback route)
- Task 2.4: Componentes de auth (AuthForm, OAuthButton, PasswordInput)
- Code Review — pendente
- QA — pendente

### Próximo passo
Sprint 2 — Autenticação (US-001 a US-004).
Commit da Sprint 1 aprovado pelo desenvolvedor → criar branch feature/sprint-2-autenticacao.
