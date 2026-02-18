# CLAUDE.md — ro-store-v2

> Apenas o que é específico deste projeto.
> Padrões globais em `~/.claude/CLAUDE.md` — não repetir aqui.

## Regras de Negócio Permanentes

- **LGPD — CPF/CNPJ nunca em logs ou analytics.** É dado fiscal sensível. Apenas acessível pelo próprio usuário e pelo admin via RLS.
- **Preço sempre do banco no servidor.** Ao criar um pedido, o preço deve ser buscado em `products.price` no servidor. Nunca usar valor de preço vindo do client.
- **`file_path_secure` nunca em API responses.** A coluna é usada apenas internamente para gerar Signed URLs. Nunca incluir em selects retornados ao client.
- **Audit log imutável.** A tabela `audit_logs` não tem política de DELETE para nenhum role, incluindo o admin. Logs são write-only.
- **Single-vendor.** Somente o role `admin` pode criar/editar/publicar produtos. Não existe fluxo de onboarding de vendedores.

## Regras de Schema

- **`is_admin()` nas RLS policies.** Nunca usar `EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')` inline nas policies — causa recursão infinita na tabela `profiles`. Sempre usar a função `is_admin()` (SECURITY DEFINER, definida na migration).
- **`file_path_secure` protegida no banco.** Além de nunca incluir em API responses, a coluna tem `REVOKE SELECT FROM authenticated` na migration. Proteção em duas camadas.

## Regras Técnicas do Projeto

- **`auth.getUser()` em todo server-side** — nunca `getSession()` em Server Components, Server Actions ou Route Handlers.
- **Webhook Asaas: validar token antes de tudo.** O Route Handler `/api/webhooks/asaas` deve verificar o header `asaas-access-token` como primeira operação — rejeitar com 401 se inválido, antes de fazer qualquer parse do body.
- **Idempotência no webhook.** Verificar `asaas_payment_id` antes de processar — rejeitar silenciosamente (200) se o pedido já estiver `paid`.
- **Supabase Realtime na tela de Pix.** Usar `use-order-realtime.ts` para redirect automático. Incluir fallback: botão "Verificar pagamento" para refresh manual caso o WebSocket esteja indisponível.
- **Invalidar sessão ao alterar role.** Ao promover ou revogar role de um usuário via admin, invalidar a sessão ativa com `supabase.auth.admin.signOut(userId)` — o JWT anterior continua válido até expirar (~1h) se não for invalidado.

## Documentação do Projeto

- `docs/ro-store-v2-prd.md` — produto, personas, MVP, métricas
- `docs/ro-store-v2-stories.md` — 28 User Stories em 8 épicos
- `docs/ro-store-v2-security-review.md` — requisitos de segurança, threat modeling, LGPD
- `docs/ro-store-v2-design-system.md` — tokens Void Purple, componentes, estados
- `docs/ro-store-v2-ui-flow.md` — wireframes das 15 telas, responsividade, estados de UI
- `docs/ro-store-v2-architecture.md` — estrutura de pastas, decisões técnicas
- `docs/adr/` — Architecture Decision Records (ADR-001 a ADR-005)
- `docs/ro-store-v2-data-architecture.md` — schema, RLS, migrations *(a criar — Data Architect)*
- `docs/ro-store-v2-backlog.md` — 7 sprints, 35 tasks, 28 stories
- `docs/ro-store-v2-status.md` — progresso atual da sessão
