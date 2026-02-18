# PRD: ro-store-v2 — Marketplace de Mods para Ragnarok Online

**Status:** Planejamento
**Versão:** 1.0
**Data:** 2026-02-18

---

## TL;DR

Uma loja online especializada na venda de scripts, plugins e modificações visuais para servidores privados de Ragnarok Online, focada no mercado brasileiro, com entrega digital automatizada, licenciamento por compra e pagamentos via Asaas (Pix, Boleto e Cartão).

---

## Problema

O mercado de mods para servidores privados de RO opera hoje de forma caótica — vendas manuais via Discord, sem garantia de entrega, sem comprovação de compatibilidade e sem proteção para nenhum dos lados. O comprador tem medo de comprar código que não funciona ou de o vendedor sumir após o pagamento. O vendedor sofre com chargebacks, gestão manual e risco de pirataria.

**Para quem:** Administradores de servidores privados de Ragnarok Online (rAthena / Hercules) no Brasil.

**Evidência:** O próprio criador da plataforma opera neste mercado e conhece as dores de primeira mão.

---

## Personas e Jobs-to-be-Done

### Comprador — Admin de Servidor

- **Perfil:** Técnico, jovem (18–35 anos), administra servidor privado de RO como hobby ou negócio. Familiarizado com Discord e comunidades de RO.
- **Job:** Quando preciso de um script/plugin para meu servidor, quero comprar com segurança e receber o arquivo funcionando imediatamente, para que eu possa instalar e melhorar a experiência dos meus jogadores sem depender de terceiros.
- **Dores atuais:** Medo de produto bugado, dificuldade de instalação, vendedor que some, sem garantia de compatibilidade com seu emulador.
- **Ganhos esperados:** Entrega imediata, certeza de compatibilidade antes da compra, histórico de versões e atualizações futuras incluídas.

### Vendedor — Administrador da Plataforma (você)

- **Perfil:** Desenvolvedor, criador dos mods, opera a loja como produto próprio.
- **Job:** Quando um cliente compra um produto, quero que a entrega aconteça automaticamente e o pagamento seja confirmado sem intervenção manual, para que eu possa escalar as vendas sem aumentar o trabalho operacional.
- **Dores atuais:** Chargeback, pirataria, gestão manual via Discord, retrabalho em cada venda.
- **Ganhos esperados:** Automação total da entrega, proteção jurídica e técnica contra chargeback, visibilidade sobre downloads e clientes.

---

## Controle de Acesso (RBAC)

**Abordagem escolhida:** A — Roles fixos

**Roles do sistema:**

| Role | Descrição | Criado por |
|------|-----------|------------|
| `admin` | Acesso total ao sistema | Sistema (fixo — somente você) |
| `customer` | Compra produtos e gerencia suas licenças | Criado via cadastro |

**Matriz de permissões (alto nível):**

| Recurso | admin | customer |
|---------|-------|----------|
| Produtos (CRUD) | CRUD | R (somente publicados) |
| Pedidos | R (todos) | R (próprios) |
| Downloads | R (todos) | Executa (próprios) |
| Licenças | CRUD | R (próprias) |
| Clientes | R | — |
| Audit Logs | R | — |
| KPIs / Dashboard | R | — |

---

## Hipóteses

| # | Hipótese | Métrica de validação | Risco |
|---|----------|---------------------|-------|
| H1 | Admins de servidor pagarão por scripts com entrega automatizada e garantia de compatibilidade, pois hoje o processo é manual e inseguro | Primeira venda realizada sem intervenção manual | Alto |
| H2 | A tabela de compatibilidade reduz a taxa de suporte pós-venda | Volume de mensagens de suporte por pedido | Médio |
| H3 | O webhook do Asaas confirmará pagamentos Pix em menos de 1 minuto | Tempo médio entre pagamento e liberação de download | Médio |

---

## Validação de Riscos (Cagan)

| Risco | Avaliação | Mitigação |
|-------|-----------|-----------|
| **Valor** | Médio — dor real e conhecida, mas mercado de nicho | Lançar com produtos próprios já validados informalmente |
| **Usabilidade** | Baixo — UX bem definida, público técnico | Tabela de compatibilidade explícita, feedback visual em todos os estados |
| **Viabilidade** | Baixo — Asaas tem API REST simples, stack familiar | Nenhum bloqueador técnico identificado após substituição do Banco Inter |
| **Negócio** | Médio — mercado de servidores privados em área cinzenta legal | Focar em venda de código original, não de assets proprietários da Gravity |

---

## Story Map (resumo)

```
[Descobrir Produto] → [Avaliar Produto] → [Comprar] → [Receber] → [Usar / Atualizar]
        ↓                    ↓               ↓            ↓               ↓
  Catálogo c/ filtros    PDP completa    Checkout     Signed URL      Meus Pedidos
  Cards de produto       YouTube embed   Pix/Bol/CC   License Key     Download v. mais recente
  Filtro emulador        Compatibilidade  CPF/CNPJ    E-mail confirm  Badge nova versão
                         Changelog        Anti-chrgbk  E-mail licença  E-mail atualização
```

MVP: corte horizontal completo — todas as atividades têm ao menos uma task funcional.

---

## MVP — O que entra

| Feature | MoSCoW | Justificativa |
|---------|--------|---------------|
| Auth (email + Discord OAuth) | Must | Pré-requisito para compra e área do cliente |
| Catálogo com filtros facetados | Must | Descoberta do produto |
| PDP (galeria, YouTube, compatibilidade, changelog) | Must | Conversão — comprador precisa de confiança antes de comprar |
| Checkout sem distração (Pix, Boleto, Cartão) | Must | Coração do negócio |
| CPF/CNPJ no checkout | Must | Exigência fiscal e do Asaas |
| Checkbox anti-chargeback | Must | Proteção jurídica |
| Integração Asaas (API + Webhooks) | Must | Processamento de pagamentos |
| Entrega digital automatizada (Signed URL 10min) | Must | Proposta de valor central |
| License Key por pedido | Must | Identificação e rastreabilidade da compra |
| Área do cliente — Meus Pedidos | Must | Acesso pós-compra e downloads futuros |
| Download da versão mais recente | Must | Updates incluídos na licença |
| Badge "Nova versão disponível" | Must | Visibilidade de updates para o cliente |
| E-mails via Resend (confirmação, licença, atualização) | Must | Comunicação automatizada |
| Admin — CRUD de produtos | Must | Operação da loja |
| Admin — Gestão de pedidos | Must | Visibilidade operacional |
| Admin — Logs de auditoria | Must | Anti-chargeback e rastreabilidade |
| Admin — KPI Dashboard | Must | Visibilidade do negócio |
| Admin — Gestão de clientes | Must | Suporte e relacionamento |
| Admin — Gestão de licenças (visualização + revogação) | Must | Controle operacional |
| Bucket privado + RLS | Must | Segurança dos arquivos |

---

## Fora do MVP — O que fica pra depois

| Feature | Motivo de exclusão | Quando revisar |
|---------|--------------------|----------------|
| Google OAuth | Discord atende o público-alvo; simplifica o MVP | v1.1 |
| Banco Inter / mTLS | Substituído pelo Asaas — elimina risco técnico | Se necessário |
| IP Lock no DLL | Requer lógica compilada no binário — projeto separado | v2.0 |
| Multi-vendor (marketplace aberto) | Fora do modelo de negócio inicial | v2.0 |
| Refund automatizado | Volume inicial comporta processo manual | v1.1 |
| App mobile | Público desktop, sem demanda imediata | v2.0 |

---

## Fluxo Principal — Happy Path (Compra)

1. Visitante acessa o catálogo e filtra por emulador (ex: rAthena)
2. Clica em um produto → PDP com galeria, vídeo YouTube e tabela de compatibilidade
3. Clica em "Comprar" → redirecionado para login/cadastro se não autenticado
4. Preenche CPF/CNPJ (se não cadastrado no perfil), seleciona método de pagamento
5. Aceita checkbox anti-chargeback → confirma pedido
6. Para Pix: exibe QR Code → aguarda pagamento → webhook Asaas confirma em < 1 min
7. Sistema gera License Key → libera download → envia e-mail com licença
8. Cliente acessa "Meus Pedidos" → clica em "Download" → Signed URL de 10min gerado
9. Arquivo baixado com sucesso

---

## Fluxo de Atualização de Produto

1. Admin acessa painel → edita produto → sobe novo arquivo → registra changelog
2. Sistema identifica todos os clientes com licença ativa para aquele produto
3. Dispara e-mail via Resend notificando a atualização disponível
4. Cliente acessa "Meus Pedidos" → vê badge "Nova versão disponível" → baixa

---

## Métricas de Sucesso

| Métrica | Baseline | Meta | Prazo |
|---------|----------|------|-------|
| Primeira venda sem intervenção manual | 0 | 1 | Semana 1 pós-lançamento |
| Tempo entre pagamento Pix e liberação de download | — | < 60s | Contínuo |
| Taxa de chargeback | — | < 1% | Primeiros 3 meses |
| Clientes com pelo menos 1 download | — | 10 | Primeiro mês |

---

## Critérios de Aceite do MVP

- [ ] Usuário consegue criar conta via e-mail ou Discord
- [ ] Usuário consegue filtrar produtos por emulador e categoria
- [ ] Usuário consegue visualizar PDP com vídeo YouTube, galeria, compatibilidade e changelog
- [ ] Usuário gera um Pix via Asaas, paga e o sistema reconhece em menos de 1 minuto
- [ ] Após pagamento, download é liberado automaticamente e License Key exibida
- [ ] E-mail de confirmação e de licença enviados automaticamente via Resend
- [ ] Cliente consegue baixar a versão mais recente do produto a qualquer momento em "Meus Pedidos"
- [ ] Cliente recebe e-mail quando produto que comprou é atualizado
- [ ] Admin consegue cadastrar produto com arquivo, imagens, URL de vídeo e tabela de compatibilidade
- [ ] Admin consegue ver todos os pedidos, clientes, logs de download e KPIs
- [ ] Admin consegue revogar uma licença manualmente
- [ ] Arquivos de produto nunca expostos publicamente — apenas via Signed URL temporária

---

## Requisitos Não-Funcionais

- **Performance:** Listagem do catálogo carrega em < 2s. Geração de Signed URL em < 500ms.
- **Segurança:** RLS habilitado em todas as tabelas. Bucket de arquivos privado. Audit log com IP em toda ação de download. Webhook do Asaas validado por assinatura.
- **Responsividade:** Mobile-first. Funcional em 320px+. Dark mode padrão (tema gamer).
- **E-mail:** Entrega de e-mail transacional em < 5 minutos via Resend.
- **Disponibilidade:** Sem SLA formal no MVP — Supabase managed garante base adequada.

---

## Suposições e Restrições

**Suposições:**
- Conta Asaas já criada e API Key disponível antes do desenvolvimento
- Discord OAuth App criado no Discord Developer Portal
- Conta Resend criada com domínio verificado para envio de e-mails
- Produtos iniciais (scripts/plugins) já existem e estão prontos para upload

**Restrições:**
- Single-vendor: somente o admin pode cadastrar produtos
- Apenas mercado brasileiro (Pix, CPF/CNPJ, português pt-BR)
- Stack definida: Next.js 16 (App Router) + Supabase + Tailwind + shadcn/ui

---

## Riscos e Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Chargeback fraudulento | Médio | Alto | Audit log de IP + aceite de termos + descritor claro na fatura |
| Pirataria (vazamento de arquivos) | Médio | Alto | Signed URLs temporárias (10min) + bucket privado |
| Webhook Asaas com delay | Baixo | Alto | Timeout + status "Aguardando pagamento" com polling |
| E-mail cair em spam | Médio | Médio | Domínio verificado no Resend + SPF/DKIM configurados |
| Produto incompatível após venda | Baixo | Médio | Tabela de compatibilidade explícita + changelog visível |

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16 (App Router, Server Components) |
| Backend / Banco | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (Email/senha + Discord OAuth) |
| Pagamentos | Asaas (Pix, Boleto, Cartão) via API REST |
| Storage | Supabase Storage (bucket público: imagens; bucket privado: arquivos) |
| E-mail transacional | Resend |
| Estilização | Tailwind CSS + shadcn/ui (dark mode padrão) |

---

## Modelo de Dados (Alto Nível)

- `profiles`: (id, user_id, email, cpf_cnpj, role, created_at)
- `products`: (id, title, slug, description, price, category, emulator, file_path_secure, youtube_url, is_published, created_at)
- `product_versions`: (id, product_id, version, changelog, file_path_secure, created_at)
- `product_images`: (id, product_id, storage_path, order)
- `orders`: (id, user_id, status, payment_method, asaas_payment_id, total, created_at)
- `order_items`: (id, order_id, product_id, price_at_purchase)
- `licenses`: (id, order_item_id, user_id, product_id, license_key, is_active, created_at)
- `audit_logs`: (id, user_id, action, product_id, order_id, ip_address, metadata, created_at)

---

## Histórico de Versões

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0 | 2026-02-18 | Versão inicial — discovery com desenvolvedor |
