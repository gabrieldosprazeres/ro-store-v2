# ADR-005: Supabase Realtime para notificação de Pix confirmado

## Status: Accepted

## Contexto
Na tela de aguardo do Pix (`/checkout/[orderId]/pix`), o cliente precisa saber quando o pagamento foi confirmado pelo webhook do Asaas para ser redirecionado para a tela de sucesso. O webhook atualiza o campo `orders.status` para `'paid'` no Supabase. Precisamos propagar isso para o frontend sem o usuário precisar dar refresh manual.

## Decisão
Usar **Supabase Realtime** via `postgres_changes` no hook `use-order-realtime.ts`. O client assina mudanças na tabela `orders` filtradas pelo `id` do pedido atual. Quando o status muda para `'paid'`, o hook dispara o redirect para `/checkout/[orderId]/sucesso`.

```typescript
// hooks/use-order-realtime.ts
supabase
  .channel(`order-${orderId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'orders',
    filter: `id=eq.${orderId}`,
  }, (payload) => {
    if (payload.new.status === 'paid') router.push(`/checkout/${orderId}/sucesso`)
  })
  .subscribe()
```

## Alternativas descartadas
- **Polling (`useQuery` com `refetchInterval: 3000`):** Funciona, mas gera N requests por segundo por usuário esperando. Com volume, sobrecarrega o banco e o servidor. Realtime usa WebSocket — uma conexão por usuário, sem overhead de polling.
- **Server-Sent Events (SSE):** Precisaria de um Route Handler mantendo a conexão aberta — mais complexo de implementar e escalar do que o Realtime nativo do Supabase.
- **Redirect após submit + reload manual:** Péssima UX — o usuário não sabe quando foi confirmado.

## Consequências
- (+) UX imediata — redirect automático em < 2s após confirmação do Pix
- (+) Sem overhead de polling — uma conexão WebSocket por usuário
- (+) Usa infraestrutura já existente (Supabase) — sem serviço adicional
- (-) Requer RLS configurada para que o client só receba updates do próprio pedido
- (-) Se o Realtime estiver temporariamente indisponível, o usuário não é redirecionado automaticamente — fallback: botão "Verificar pagamento" para refresh manual
