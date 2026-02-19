# QA Report: Sprint 3 — Catálogo e PDP

## Status: ✅ Aprovado

**Data:** 2026-02-18
**Sprint:** 3 — Catálogo e PDP (Tasks 3.1–3.5)

---

## Validação Estática

| Check | Resultado |
|-------|-----------|
| `tsc --noEmit` | ✅ Sem erros |
| `eslint .` | ✅ Sem erros |

---

## Bug Encontrado e Corrigido

**Arquivo:** `src/components/product/youtube-embed.tsx` — `extractVideoId`

**Descrição:** URLs no formato `https://www.youtube.com/embed/ID` não eram processadas corretamente. O primeiro `if (hostname.includes('youtube.com'))` era executado e retornava `null` (sem parâmetro `?v=`), nunca alcançando o bloco de `/embed/`.

**Correção:** A verificação de `/embed/` foi movida para antes do check geral de `youtube.com`, garantindo que qualquer URL com pathname `/embed/ID` seja processada independente do hostname.

---

## Testes Escritos (Sprint 3)

| Arquivo | Tipo | Categoria | Testes | Passaram |
|---------|------|-----------|--------|----------|
| `src/tests/lib/utils.test.ts` | Unitário | Small | 8 | 8/8 ✅ |
| `src/tests/components/product/youtube-embed.test.tsx` | Componente | Medium | 6 | 6/6 ✅ |
| `src/tests/components/product/product-gallery.test.tsx` | Componente | Medium | 7 | 7/7 ✅ |
| `src/tests/components/catalog/product-grid.test.tsx` | Componente | Medium | 4 | 4/4 ✅ |
| **Total Sprint 3** | | | **25** | **25/25 ✅** |

### Detalhamento por arquivo

**`utils.test.ts`** — funções puras de utils.ts:
- `formatCurrency`: formato BRL, zero, valores grandes
- `formatDate`: string de data, objeto Date
- `formatDateTime`: data + tempo no output
- `getImageUrl`: composição correta com env var, fallback sem env var

**`youtube-embed.test.tsx`** — extração de video ID e renderização:
- youtube.com/watch?v= → iframe correto
- youtu.be/ → iframe correto
- youtube.com/embed/ → iframe correto (bug encontrado e corrigido)
- URL não-YouTube → null (sem render)
- URL inválida → null (sem render)
- Título do produto no atributo `title` do iframe

**`product-gallery.test.tsx`** — carrossel de imagens:
- Placeholder sem imagens
- Imagem principal renderizada
- Sem botões de navegação com 1 imagem
- Botões prev/next com múltiplas imagens
- Avanço correto ao clicar "Próxima imagem"
- Wrap-around ao clicar "Anterior" da primeira imagem
- Dots indicator presentes para cada imagem

**`product-grid.test.tsx`** — grid do catálogo:
- Empty state com mensagem e link "Limpar filtros"
- Link "Limpar filtros" aponta para `/`
- Cards renderizados para cada produto
- Link do card aponta para `/produtos/{slug}`

---

## Regressão

Testes Sprint 1 e 2 rodaram sem regressão:

| Arquivo | Testes | Resultado |
|---------|--------|-----------|
| `src/tests/lib/validators/auth-schema.test.ts` | 15 | ✅ |
| `src/tests/components/auth/login-form.test.tsx` | 10 | ✅ |
| `src/tests/components/auth/register-form.test.tsx` | 8 | ✅ |
| **Total regressão** | **33** | **33/33 ✅** |

---

## Resultado Total

| Categoria | Testes | Passaram |
|-----------|--------|----------|
| Sprint 3 (novos) | 25 | 25/25 ✅ |
| Regressão (Sprint 1+2) | 33 | 33/33 ✅ |
| **TOTAL** | **58** | **58/58 ✅** |

---

## Observações

- Warnings de `act()` nos testes de login-form e register-form (Sprint 2) são pré-existentes — comportamento de testes com react-hook-form + estado assíncrono, todos os testes passam corretamente.
- Warnings de `fill="true"` e `priority="true"` nos testes de product-gallery são consequência do mock simples de `next/image` — os atributos booleanos são passados para o `<img>` nativo. Não afetam os asserts dos testes.

---

## Veredicto

QA Sprint 3 aprovado. 58/58 testes passando. 1 bug encontrado e corrigido (`extractVideoId` com URLs `/embed/`). Pode avançar para Sprint 4.
