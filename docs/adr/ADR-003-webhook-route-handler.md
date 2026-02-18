# ADR-003: Webhook do Asaas via Route Handler (em vez de Edge Function)

## Status: Accepted

## Contexto
O Asaas precisa chamar um endpoint HTTP para confirmar pagamentos (PAYMENT_CONFIRMED). O processamento do webhook envolve: validar token → verificar idempotência → atualizar status do pedido → gerar License Key → enviar dois e-mails via Resend → registrar audit log. Precisamos decidir onde esse endpoint vive.

## Decisão
Usar um **Route Handler do Next.js** em `app/api/webhooks/asaas/route.ts`. O endpoint será `POST /api/webhooks/asaas`.

## Alternativas descartadas
- **Supabase Edge Function (Deno):** Rodaria mais perto do banco (menos latência para queries), mas o runtime Deno tem imports via URL — menos familiar, e a integração com Resend precisaria de adaptação para Deno. Também cria um segundo ponto de deploy para gerenciar (além do Next.js).
- **API Route separada (`/pages/api`):** Pages Router legado — não usamos. App Router Route Handler é o padrão equivalente no App Router.

## Consequências
- (+) Mesmo ambiente que o restante do código (Node.js, mesmos tipos TypeScript)
- (+) Acesso às libs do projeto (`lib/services/`, `lib/integrations/`) sem duplicação
- (+) Deploy único — o webhook sobe junto com o Next.js
- (+) Integração com Resend (Node.js SDK) sem adaptação para Deno
- (-) Ligeiramente mais latência que Edge Function para updates no banco (rede Next.js → Supabase)
- (-) Se o Next.js estiver fora do ar, o webhook falha (Asaas tem retry automático — mitigado)
