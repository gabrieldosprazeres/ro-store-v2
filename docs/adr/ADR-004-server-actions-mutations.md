# ADR-004: Server Actions para mutations (em vez de API Routes)

## Status: Accepted

## Contexto
O projeto tem diversas operações de escrita: criar pedido, publicar produto, revogar licença, gerar download URL. Precisamos definir onde esse código vive e como o client o chama.

## Decisão
Usar **Server Actions** do Next.js 16 para todas as mutations, organizadas em `src/lib/actions/`. Client Components chamam as actions diretamente sem precisar de `fetch('/api/...')`.

Exceção: o **webhook** do Asaas é um Route Handler (ver ADR-003) — precisa de endpoint HTTP público que o Asaas consegue chamar externamente.

## Alternativas descartadas
- **API Routes para tudo:** Mais verboso — precisaria de endpoint, schema de request, headers manuais para cada operação. Server Actions abstraem isso dentro do framework.
- **Chamar Supabase direto do Client Component:** Exporia a lógica de negócio no client bundle. Qualquer validação no client pode ser bypassada. API Keys de terceiros (Asaas, Resend) estariam expostas.

## Consequências
- (+) Type-safety de ponta a ponta — o client passa tipos TypeScript diretamente para a action
- (+) Nenhuma API Key de terceiro exposta no client bundle
- (+) Revalidação de cache (`revalidatePath`) integrada ao Next.js Router
- (+) Código mais limpo — sem boilerplate de fetch/JSON/headers
- (-) Server Actions são exclusivas do Next.js — coupling com o framework
- (-) Debugging é ligeiramente diferente de endpoints REST tradicionais
