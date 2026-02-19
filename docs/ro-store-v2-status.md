# Status: ro-store-v2
## Fase atual: Execução — Sprint 3 (Catálogo e PDP)
## Último agente: QA
## Branch: main

### Planejamento ✅ (concluído)

### Sprint 1: Fundação ✅
- Task 1.1: Inicializar projeto Next.js 16 ✅
- Task 1.2: Validação de ambiente e Supabase clients ✅
- Task 1.3: Migration completa do banco — ⚠️ PENDENTE (.env.local com credenciais reais)
- Task 1.4: Headers de segurança e next.config.ts ✅
- Task 1.5: Middleware de autenticação (proxy.ts) ✅
- Task 1.6: Layouts de route groups e design tokens ✅
- `npm run build` ✅

### Sprint 2: Autenticação ✅
- Task 2.1: Schemas de validação de auth ✅ (`src/lib/validators/auth-schema.ts`)
- Task 2.2: Telas de Login e Cadastro ✅ (login, register, forgot-password, update-password)
- Task 2.3: Server Actions de autenticação ✅ (signIn, signUp, signOut, resetPassword, updatePassword)
- Task 2.4: Discord OAuth ✅ (OAuthButton + callback route)
- Task 2.5: Proteção de rotas e estados de sessão no header ✅
- `npm run build` ✅ (login/register: Static, callback: Dynamic, /: Partial Prerender)

### Padrões identificados no Next.js 16 com `cacheComponents: true`
- `export const dynamic = 'force-dynamic'` é INCOMPATÍVEL — usar `<Suspense>` nos Server Components
- Páginas auth (Client Components com useSearchParams): wrappadas em `<Suspense>` nas pages
- `await searchParams` no page component também causa o erro — usar `useSearchParams()` nos Client Components
- Auth redirects (usuário logado → /) devem estar no proxy.ts, não nas páginas

### Pendências
- Task 1.3 (Migration SQL): ✅ executada com sucesso em novo projeto Supabase (`tuncvhornxneptnzwpvj`) via `supabase db push`. `database.types.ts` regenerado com tipos reais. Workarounds `as never` removidos.
- Tremor: instalar na Sprint 6 com `--legacy-peer-deps`
- Discord OAuth: configurar no Supabase Dashboard (client ID, secret, redirect URI)
- `NEXT_PUBLIC_SITE_URL` adicionado em `auth-actions.ts` para resetPassword — adicionar ao `.env.example`

### Sprint 2: Autenticação — revisões
- Code Review: ✅ Aprovado (1 blocker + 2 warnings corrigidos, re-review ✅)
- QA: ✅ Aprovado (33/33 testes passando)
- Commits: `feat(auth): ...`, `fix(auth): address code review findings`

### Sprint 3: Catálogo e PDP — código completo 🔄
- Task 3.1: Server Component do catálogo (`src/app/(store)/page.tsx`) ✅
- Task 3.2: ProductCard, ProductGrid e loading skeleton ✅
- Task 3.3: CatalogFilters e ActiveFilters (Vaul drawer no mobile) ✅
- Task 3.4: PDP — Server Component e dados ✅
- Task 3.5: PDP — ProductGallery, YouTubeEmbed, CompatibilityTable, ChangelogAccordion ✅
- `npm run build` ✅ (/, /produtos/[slug]: Partial Prerender)
- `npm test` ✅ 33/33 (regressão — testes Sprint 2)
- Code Review: ⚠️ Aprovado com ressalvas → W1 (buildUrl morto) + W2 (select('*')) corrigidos → ✅
- QA: ✅ Aprovado (58/58 testes | 1 bug corrigido: extractVideoId com /embed/ URLs)

### Arquivos criados (Sprint 3)
- `src/app/(store)/page.tsx` — catálogo com filtros por searchParams
- `src/app/(store)/loading.tsx` — skeleton do catálogo
- `src/app/(store)/produtos/[slug]/page.tsx` — PDP com verificação de licença
- `src/app/(store)/produtos/[slug]/loading.tsx` — skeleton da PDP
- `src/components/catalog/product-card.tsx`
- `src/components/catalog/product-grid.tsx`
- `src/components/catalog/catalog-filters.tsx` — sidebar desktop + Vaul mobile
- `src/components/catalog/active-filters.tsx`
- `src/components/product/product-gallery.tsx`
- `src/components/product/youtube-embed.tsx`
- `src/components/product/compatibility-table.tsx`
- `src/components/product/changelog-accordion.tsx`
- `src/lib/utils.ts` — adicionado `getImageUrl`

### Próximo passo
Sprint 3 completa ✅. Iniciar Sprint 4 (Checkout e Pagamentos).
