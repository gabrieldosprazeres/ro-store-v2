# Code Review: Sprint 3 — Catálogo e PDP

## Status: ⚠️ Aprovado com ressalvas

**Data:** 2026-02-18
**Revisor:** Code Reviewer Agent
**Branch:** main (merged)
**Arquivos revisados:** 13 (4 novos em `src/components/product/`, 4 novos em `src/components/catalog/`, 3 novos em `src/app/(store)/`, 1 novo em `src/app/(store)/produtos/[slug]/`, 1 modificado em `src/lib/utils.ts`)

---

## Resumo

Sprint 3 implementada corretamente. Todos os Server Components usam `await params`/`await searchParams` conforme o padrão Next.js 16. Autenticação via `auth.getUser()` (sem `getSession()`). Filtros via URL (SSR-safe). Vaul drawer com draft state correto. Build e testes passaram sem erros.

Dois pontos de atenção identificados (sem bloqueadores):

---

## Warnings ⚠️

### W1 — `buildUrl` não utilizado em `catalog-filters.tsx`

**Arquivo:** `src/components/catalog/catalog-filters.tsx:21-35`
**Severidade:** Warning

A função `buildUrl` é definida mas nunca chamada. A lógica de navegação está corretamente implementada no callback `navigate` (linha 145). `buildUrl` é código morto.

```ts
// Linhas 21-35 — nunca chamado
function buildUrl(
  pathname: string,
  currentParams: URLSearchParams,
  key: 'categories' | 'emulators',
  values: string[]
): string {
  ...
}
```

**Ação:** Remover a função `buildUrl`.

---

### W2 — `select('*')` na PDP expõe colunas desnecessárias

**Arquivo:** `src/app/(store)/produtos/[slug]/page.tsx:45-50`
**Severidade:** Warning

```ts
const { data: product } = await supabase
  .from('products')
  .select(
    '*, product_images(id, storage_path, display_order), product_versions(id, version_number, changelog, created_at)'
  )
```

O `select('*')` retorna todas as colunas de `products` incluindo campos não usados no render. A proteção DB-level (`REVOKE SELECT FROM authenticated` na `file_path_secure`) garante que essa coluna não retorna — mas a prática de `select('*')` não é recomendada por três razões:

1. Fetches desnecessários aumentam payload e latência
2. Qualquer coluna sensível futura adicionada ao schema seria automaticamente incluída
3. Não é explícito sobre o contrato de dados esperado

**Ação:** Substituir por select explícito:
```ts
'id, slug, title, price, description, category, emulators, install_type, client_requirements, youtube_url, product_images(id, storage_path, display_order), product_versions(id, version_number, changelog, created_at)'
```

---

## Observações (sem ação obrigatória)

### O1 — Dupla query Supabase na PDP

`generateMetadata` e `PDPPage` fazem queries independentes para o mesmo `slug`. É comportamento esperado do Next.js (funções separadas), mas pode ser otimizado com `cache()` do React se a performance da PDP for prioridade futura.

### O2 — `useSearchParams` sem `Suspense` explícito

`CatalogFilters` usa `useSearchParams()` sem `Suspense` wrapper explícito. Funciona corretamente porque a rota usa PPR (Partial Prerender), que cria automaticamente a boundary. Manter em mente se PPR for desativado.

---

## Aprovações por arquivo

| Arquivo | Status |
|---|---|
| `src/app/(store)/page.tsx` | ✅ |
| `src/app/(store)/loading.tsx` | ✅ |
| `src/components/catalog/product-card.tsx` | ✅ |
| `src/components/catalog/product-grid.tsx` | ✅ |
| `src/components/catalog/catalog-filters.tsx` | ⚠️ W1 |
| `src/components/catalog/active-filters.tsx` | ✅ |
| `src/app/(store)/produtos/[slug]/page.tsx` | ⚠️ W2 |
| `src/app/(store)/produtos/[slug]/loading.tsx` | ✅ |
| `src/components/product/product-gallery.tsx` | ✅ |
| `src/components/product/youtube-embed.tsx` | ✅ |
| `src/components/product/compatibility-table.tsx` | ✅ |
| `src/components/product/changelog-accordion.tsx` | ✅ |
| `src/lib/utils.ts` | ✅ |

---

## Conformidade com docs

| Requisito | Status |
|---|---|
| `await searchParams` / `await params` (Next.js 16) | ✅ |
| `auth.getUser()` em server-side (nunca `getSession`) | ✅ |
| `file_path_secure` fora do select de API responses | ✅ (protegido pelo DB, W2 é boas práticas) |
| Preço sempre do banco no servidor | ✅ |
| Audit logs não afetados | ✅ |
| Mobile-first, shadcn/ui, Vaul para drawer | ✅ |
| Sem `'use client'` desnecessário | ✅ |
| Acessibilidade básica (aria-label, aria-hidden) | ✅ |

---

## Próximo passo

Corrigir W1 e W2, depois ativar o QA Sprint 3.
