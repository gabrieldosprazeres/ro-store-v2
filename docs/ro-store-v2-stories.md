# User Stories: ro-store-v2

**Versão:** 1.0
**Data:** 2026-02-18
**Referência:** [PRD ro-store-v2](./ro-store-v2-prd.md)

---

## Épico 1 — Autenticação e Perfil

**Outcome:** Usuário consegue criar conta, autenticar e ter seu perfil com dados fiscais prontos para o checkout.

---

### US-001: Cadastro via e-mail e senha

**Como** visitante
**Quero** criar uma conta com e-mail e senha
**Para** acessar a loja e realizar compras

**Contexto:** Ponto de entrada para novos usuários que não têm conta Discord ou preferem e-mail.

**Critérios de Aceite — Happy Path:**
- [ ] Dado que estou na tela de cadastro, quando preencho e-mail, senha e confirmo senha, então minha conta é criada e sou redirecionado para a loja autenticado
- [ ] Dado que me cadastrei, quando verifico meu e-mail, então recebo e-mail de confirmação do Supabase Auth

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Dado que preencho um e-mail já cadastrado, quando submeto, então vejo mensagem "Este e-mail já está em uso"
- [ ] Dado que as senhas não coincidem, quando submeto, então vejo mensagem de validação antes do envio
- [ ] Estado de loading: botão desabilitado com spinner durante o submit
- [ ] Estado de erro de rede: toast com "Erro ao criar conta. Tente novamente."

**Fora do escopo desta story:**
- Login social (tratado em US-003)
- Coleta de CPF/CNPJ no cadastro (coletado no checkout — US-012)

**Prioridade:** Alta
**Tamanho:** P
**Dependências:** —

---

### US-002: Login via e-mail e senha

**Como** usuário cadastrado
**Quero** fazer login com meu e-mail e senha
**Para** acessar minha conta e meus pedidos

**Critérios de Aceite — Happy Path:**
- [ ] Dado que estou na tela de login, quando preencho e-mail e senha corretos, então sou autenticado e redirecionado para a página anterior ou para o catálogo

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Dado que preencho credenciais incorretas, quando submeto, então vejo "E-mail ou senha incorretos"
- [ ] Dado que esqueço minha senha, quando clico em "Esqueci minha senha", então recebo e-mail de redefinição via Supabase Auth
- [ ] Estado de loading: botão com spinner durante autenticação

**Fora do escopo desta story:**
- Bloqueio por tentativas (pode ser feito pelo Supabase nativo)

**Prioridade:** Alta
**Tamanho:** P
**Dependências:** US-001

---

### US-003: Login via Discord OAuth

**Como** visitante
**Quero** fazer login com minha conta do Discord
**Para** criar conta e autenticar sem precisar de senha

**Contexto:** O público-alvo (admins de servidor RO) já usa Discord ativamente — reduz fricção no onboarding.

**Critérios de Aceite — Happy Path:**
- [ ] Dado que clico em "Entrar com Discord", quando autorizo o aplicativo no Discord, então sou redirecionado de volta à loja autenticado
- [ ] Dado que é meu primeiro acesso via Discord, quando autorizo, então minha conta é criada automaticamente com o e-mail do Discord

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Dado que cancelo a autorização no Discord, quando retorno à loja, então vejo a tela de login sem mensagem de erro excessiva
- [ ] Estado de loading: botão desabilitado enquanto aguarda retorno do OAuth

**Fora do escopo desta story:**
- Vinculação de conta Discord a conta e-mail existente (pós-MVP)

**Prioridade:** Alta
**Tamanho:** P
**Dependências:** —

---

### US-004: Logout

**Como** usuário autenticado
**Quero** sair da minha conta
**Para** encerrar minha sessão com segurança

**Critérios de Aceite — Happy Path:**
- [ ] Dado que estou autenticado, quando clico em "Sair", então minha sessão é encerrada e sou redirecionado para o catálogo como visitante

**Prioridade:** Alta
**Tamanho:** P
**Dependências:** US-001

---

## Épico 2 — Catálogo e Descoberta

**Outcome:** Visitante ou comprador encontra o produto certo rapidamente com confiança técnica antes de comprar.

---

### US-005: Listagem de produtos com filtros

**Como** visitante
**Quero** navegar pelo catálogo e filtrar por categoria e emulador
**Para** encontrar scripts compatíveis com meu servidor

**Critérios de Aceite — Happy Path:**
- [ ] Dado que acesso o catálogo, quando a página carrega, então vejo cards de todos os produtos publicados com título, preço, categoria e emulador
- [ ] Dado que seleciono o filtro "rAthena", quando aplico, então vejo apenas produtos compatíveis com rAthena
- [ ] Dado que seleciono múltiplos filtros (ex: categoria PvP + emulador rAthena), quando aplico, então vejo apenas produtos que atendem ambos os critérios

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Estado vazio: quando nenhum produto corresponde aos filtros, exibir "Nenhum produto encontrado para essa combinação de filtros"
- [ ] Estado de loading: skeleton cards durante carregamento inicial

**Fora do escopo desta story:**
- Busca por texto livre (pós-MVP)
- Ordenação (pós-MVP)

**Prioridade:** Alta
**Tamanho:** M
**Dependências:** —

---

### US-006: Página de detalhe do produto (PDP)

**Como** visitante
**Quero** ver todas as informações de um produto antes de comprar
**Para** ter confiança técnica antes de tomar a decisão de compra

**Critérios de Aceite — Happy Path:**
- [ ] Dado que clico em um produto, quando a PDP carrega, então vejo: título, descrição, preço, galeria de imagens em carrossel, vídeo YouTube embedado, tabela de compatibilidade e aba de changelog
- [ ] Dado que a PDP carrega, quando clico nas imagens do carrossel, então navego entre as imagens
- [ ] Dado que a PDP carrega, quando vejo a tabela de compatibilidade, então vejo: emulador suportado, tipo de instalação e requisitos do cliente
- [ ] Dado que clico na aba "Changelog", quando ela abre, então vejo o histórico de versões com data e descrição de cada uma

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Dado que o produto não tem vídeo cadastrado, quando a PDP carrega, então a seção de vídeo não é exibida
- [ ] Dado que o produto não tem imagens na galeria, quando a PDP carrega, então exibe imagem placeholder
- [ ] Estado de loading: skeleton da PDP durante carregamento

**Fora do escopo desta story:**
- Avaliações/reviews de compradores (pós-MVP)

**Prioridade:** Alta
**Tamanho:** M
**Dependências:** US-005

---

## Épico 3 — Checkout e Pagamento

**Outcome:** Comprador conclui uma compra com segurança em menos de 3 minutos, independente do método de pagamento.

---

### US-007: Iniciar checkout

**Como** usuário autenticado
**Quero** clicar em "Comprar" em um produto e ir para o checkout
**Para** iniciar o processo de pagamento

**Critérios de Aceite — Happy Path:**
- [ ] Dado que estou autenticado e clico em "Comprar", quando a página de checkout carrega, então vejo: resumo do produto, preço, campo de CPF/CNPJ e seleção de método de pagamento
- [ ] Dado que a página de checkout carrega, então o header e footer da loja não são exibidos (checkout sem distração)

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Dado que não estou autenticado e clico em "Comprar", quando clico, então sou redirecionado para login com retorno ao checkout após autenticação
- [ ] Dado que já comprei este produto, quando acesso o checkout, então vejo aviso "Você já possui uma licença para este produto" com link para "Meus Pedidos"

**Prioridade:** Alta
**Tamanho:** M
**Dependências:** US-001, US-006

---

### US-008: Coleta de CPF/CNPJ no checkout

**Como** usuário no checkout
**Quero** informar meu CPF ou CNPJ
**Para** cumprir a exigência fiscal e do Asaas para emissão da cobrança

**Critérios de Aceite — Happy Path:**
- [ ] Dado que estou no checkout e ainda não tenho CPF/CNPJ no perfil, quando preencho o campo, então ele é salvo no meu perfil para futuras compras
- [ ] Dado que já tenho CPF/CNPJ no perfil, quando acesso o checkout, então o campo já vem preenchido e posso apenas confirmar

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Dado que preencho um CPF inválido (dígitos verificadores), quando submeto, então vejo "CPF inválido" antes do envio
- [ ] Dado que preencho um CNPJ inválido, quando submeto, então vejo "CNPJ inválido" antes do envio

**Prioridade:** Alta
**Tamanho:** P
**Dependências:** US-007

---

### US-009: Aceite de termos anti-chargeback

**Como** usuário no checkout
**Quero** ver e aceitar os termos de produto digital antes de finalizar
**Para** confirmar que entendo que a compra é definitiva após o acesso ao arquivo

**Critérios de Aceite — Happy Path:**
- [ ] Dado que estou no checkout, quando vejo o checkbox, então ele exibe: "Concordo que este é um produto digital consumível imediatamente e renuncio ao direito de arrependimento após o download/visualização da licença"
- [ ] Dado que marco o checkbox e finalizo a compra, então o aceite é registrado no audit_log com timestamp e IP

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Dado que tento finalizar sem marcar o checkbox, quando submeto, então o formulário bloqueia com mensagem "Você precisa aceitar os termos para continuar"

**Prioridade:** Alta
**Tamanho:** P
**Dependências:** US-007

---

### US-010: Pagamento via Pix

**Como** usuário no checkout
**Quero** pagar com Pix
**Para** ter confirmação instantânea e receber meu produto imediatamente

**Critérios de Aceite — Happy Path:**
- [ ] Dado que seleciono Pix e finalizo, quando o pedido é criado, então vejo QR Code e código Pix Copia e Cola na tela
- [ ] Dado que realizo o pagamento, quando o webhook do Asaas confirma (< 60s), então a tela atualiza automaticamente mostrando "Pagamento confirmado! Seu download está pronto."

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Dado que não pago em 30 minutos, quando o Pix expira, então o pedido muda para "Expirado" e exibo botão "Gerar novo Pix"
- [ ] Estado de loading: tela de "Aguardando pagamento" com countdown do tempo restante

**Prioridade:** Alta
**Tamanho:** G
**Dependências:** US-007, US-008, US-009

---

### US-011: Pagamento via Boleto

**Como** usuário no checkout
**Quero** pagar com Boleto bancário
**Para** realizar a compra sem cartão ou conta bancária com Pix

**Critérios de Aceite — Happy Path:**
- [ ] Dado que seleciono Boleto e finalizo, quando o pedido é criado, então vejo o link para visualizar/imprimir o boleto e o código de barras para copiar
- [ ] Dado que o boleto é pago e compensado, quando o webhook do Asaas confirma, então recebo e-mail com a licença e o download é liberado em "Meus Pedidos"

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Dado que o boleto vence sem pagamento, quando expira, então o pedido muda para "Expirado"
- [ ] Estado pendente: pedido aparece em "Meus Pedidos" como "Aguardando pagamento do boleto" com link para visualizar o boleto

**Prioridade:** Alta
**Tamanho:** M
**Dependências:** US-007, US-008, US-009

---

### US-012: Pagamento via Cartão de Crédito

**Como** usuário no checkout
**Quero** pagar com cartão de crédito
**Para** parcelar ou usar meu cartão preferido

**Critérios de Aceite — Happy Path:**
- [ ] Dado que seleciono Cartão e preencho os dados, quando o pagamento é processado pelo Asaas, então recebo confirmação imediata e o download é liberado

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Dado que o cartão é recusado, quando o Asaas retorna recusa, então vejo "Pagamento recusado. Verifique os dados do cartão ou tente outro método."
- [ ] Dado que preencho número de cartão inválido, quando saio do campo, então vejo validação imediata do formato
- [ ] Estado de loading: botão com spinner enquanto processa

**Fora do escopo desta story:**
- Parcelamento (pós-MVP — depende de configuração no Asaas)

**Prioridade:** Alta
**Tamanho:** M
**Dependências:** US-007, US-008, US-009

---

## Épico 4 — Entrega Digital e Licenciamento

**Outcome:** Após pagamento confirmado, o cliente recebe a licença e pode baixar o produto automaticamente, sem intervenção manual.

---

### US-013: Geração automática de licença e entrega após pagamento

**Como** sistema
**Quero** gerar automaticamente uma License Key e liberar o download quando o pagamento for confirmado
**Para** que a entrega seja instantânea e sem intervenção manual

**Critérios de Aceite — Happy Path:**
- [ ] Dado que o webhook do Asaas confirma o pagamento, quando processado, então: o pedido muda para "Pago", uma License Key única é gerada e associada ao pedido, e o download é liberado em "Meus Pedidos"
- [ ] Dado que o pagamento é confirmado, quando processado, então o e-mail de confirmação e o e-mail com a License Key são enviados via Resend em até 5 minutos

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Dado que o webhook chega duplicado (retry do Asaas), quando processado, então a licença NÃO é gerada duas vezes (idempotência garantida pelo asaas_payment_id)
- [ ] Dado que o webhook falha ao processar, quando ocorre erro, então o evento é logado para reprocessamento manual

**Prioridade:** Alta
**Tamanho:** G
**Dependências:** US-010, US-011, US-012

---

### US-014: Download do produto via Signed URL

**Como** cliente com licença ativa
**Quero** clicar em "Download" em "Meus Pedidos"
**Para** baixar a versão mais recente do produto que comprei

**Critérios de Aceite — Happy Path:**
- [ ] Dado que tenho licença ativa e clico em "Download", quando clico, então o sistema gera uma Signed URL com validade de 10 minutos e o download inicia automaticamente
- [ ] Dado que uma nova versão do produto foi publicada, quando acesso "Meus Pedidos", então o download aponta para a versão mais recente

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Dado que a Signed URL expirou (após 10min), quando tento usar o link antigo, então recebo erro 403 e preciso gerar um novo clicando em "Download" novamente
- [ ] Dado que minha licença foi revogada pelo admin, quando clico em "Download", então vejo "Licença inativa. Entre em contato com o suporte."
- [ ] Dado que tento acessar o arquivo diretamente pelo bucket (URL pública), quando acesso, então recebo 403 — bucket é privado

**Fora do escopo desta story:**
- Limite de downloads por período (pós-MVP)

**Prioridade:** Alta
**Tamanho:** M
**Dependências:** US-013

---

## Épico 5 — Área do Cliente

**Outcome:** Cliente tem visibilidade completa das suas compras, licenças e atualizações disponíveis.

---

### US-015: Meus Pedidos

**Como** cliente autenticado
**Quero** ver o histórico de todas as minhas compras
**Para** acessar meus downloads e acompanhar o status dos pedidos

**Critérios de Aceite — Happy Path:**
- [ ] Dado que acesso "Meus Pedidos", quando a página carrega, então vejo lista de pedidos com: nome do produto, data da compra, método de pagamento, status e botão de download (se pago)
- [ ] Dado que um produto tem nova versão disponível, quando vejo o pedido, então vejo badge "Nova versão disponível" ao lado do produto

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Estado vazio: quando não tenho nenhuma compra, exibo "Você ainda não tem pedidos. Explore o catálogo!" com link para o catálogo
- [ ] Estado de loading: skeleton da lista durante carregamento

**Prioridade:** Alta
**Tamanho:** M
**Dependências:** US-013

---

### US-016: Visualização da License Key

**Como** cliente com pedido pago
**Quero** ver minha License Key no detalhe do pedido
**Para** ter acesso à chave que identifica minha licença

**Critérios de Aceite — Happy Path:**
- [ ] Dado que acesso o detalhe de um pedido pago, quando a página carrega, então vejo a License Key com botão "Copiar"
- [ ] Dado que clico em "Copiar", quando copio, então vejo feedback visual "Copiado!" por 2 segundos

**Prioridade:** Alta
**Tamanho:** P
**Dependências:** US-015

---

## Épico 6 — Notificações por E-mail

**Outcome:** Cliente recebe comunicações automáticas relevantes em cada etapa da jornada.

---

### US-017: E-mail de confirmação de pedido

**Como** cliente que acabou de comprar
**Quero** receber um e-mail confirmando meu pedido
**Para** ter comprovante da transação

**Critérios de Aceite — Happy Path:**
- [ ] Dado que o pagamento é confirmado, quando o sistema processa, então recebo e-mail com: número do pedido, produto comprado, valor pago e método de pagamento

**Prioridade:** Alta
**Tamanho:** P
**Dependências:** US-013

---

### US-018: E-mail de entrega da licença

**Como** cliente com pagamento confirmado
**Quero** receber minha License Key por e-mail
**Para** ter o código salvo mesmo sem acessar o site

**Critérios de Aceite — Happy Path:**
- [ ] Dado que o pagamento é confirmado, quando o sistema gera a licença, então recebo e-mail com a License Key e link direto para "Meus Pedidos"

**Prioridade:** Alta
**Tamanho:** P
**Dependências:** US-013

---

### US-019: E-mail de notificação de atualização de produto

**Como** cliente com licença ativa de um produto
**Quero** receber um e-mail quando o admin publicar uma nova versão
**Para** saber que há atualização disponível para download

**Critérios de Aceite — Happy Path:**
- [ ] Dado que o admin publica uma nova versão de um produto, quando o sistema detecta clientes com licença ativa para aquele produto, então envia e-mail via Resend para cada um com: nome do produto, versão nova, changelog e link para "Meus Pedidos"

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Dado que não há clientes com licença ativa para o produto, quando a versão é publicada, então nenhum e-mail é enviado (sem erro)

**Prioridade:** Alta
**Tamanho:** M
**Dependências:** US-013

---

## Épico 7 — Painel Administrativo

**Outcome:** Admin tem controle total sobre produtos, pedidos, clientes, licenças e visibilidade do negócio via dashboard.

---

### US-020: Dashboard de KPIs

**Como** admin
**Quero** ver as métricas principais do negócio ao entrar no painel
**Para** ter visibilidade rápida do desempenho da loja

**Critérios de Aceite — Happy Path:**
- [ ] Dado que acesso o painel admin, quando a página carrega, então vejo: receita total (hoje / semana / mês / total), número de pedidos por status (pago, pendente, expirado), produtos mais vendidos (ranking), total de clientes cadastrados e total de downloads realizados
- [ ] Dado que clico em um período diferente (hoje / semana / mês), quando seleciono, então os números de receita e pedidos atualizam para o período escolhido

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Estado vazio: quando não há dados ainda, exibir zeros e mensagem "Nenhuma venda registrada ainda"
- [ ] Estado de loading: skeleton dos cards de KPI

**Prioridade:** Alta
**Tamanho:** M
**Dependências:** US-013

---

### US-021: Cadastro e edição de produto

**Como** admin
**Quero** cadastrar e editar produtos no painel
**Para** publicar novos mods e manter as informações atualizadas

**Critérios de Aceite — Happy Path:**
- [ ] Dado que acesso "Novo Produto", quando preencho todos os campos e salvo, então o produto é criado como rascunho (não publicado)
- [ ] Campos obrigatórios: título, descrição, preço, categoria, emulador(es) compatível(eis), tipo de instalação, arquivo principal para download
- [ ] Campos opcionais: URL do YouTube, imagens da galeria, requisitos do cliente
- [ ] Dado que salvo e clico em "Publicar", então o produto aparece no catálogo público
- [ ] Dado que edito um produto existente e altero o arquivo principal, quando salvo com uma nova versão e changelog, então o sistema registra a nova versão em product_versions e dispara e-mails de atualização (US-019)

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Dado que não preencho campos obrigatórios, quando salvo, então vejo validações por campo antes do envio
- [ ] Dado que faço upload de arquivo > limite do Supabase configurado, quando upload falha, então vejo mensagem de erro clara com o limite permitido
- [ ] Estado de loading: barra de progresso durante upload de arquivo

**Prioridade:** Alta
**Tamanho:** G
**Dependências:** —

---

### US-022: Gestão de versões e changelog de produto

**Como** admin
**Quero** publicar novas versões de um produto com changelog
**Para** manter compradores informados sobre melhorias e correções

**Critérios de Aceite — Happy Path:**
- [ ] Dado que acesso a edição de um produto, quando clico em "Nova Versão", então posso subir novo arquivo, informar número da versão (ex: 1.2.0) e escrever o changelog
- [ ] Dado que publico a nova versão, quando salvo, então a versão anterior é mantida em histórico e a nova passa a ser a versão ativa para download

**Prioridade:** Alta
**Tamanho:** M
**Dependências:** US-021

---

### US-023: Gerenciamento de pedidos

**Como** admin
**Quero** visualizar todos os pedidos da loja com filtros
**Para** acompanhar vendas e resolver problemas operacionais

**Critérios de Aceite — Happy Path:**
- [ ] Dado que acesso "Pedidos", quando a lista carrega, então vejo: ID do pedido, cliente, produto, valor, método de pagamento, status e data
- [ ] Dado que aplico filtro por status (ex: "Pago"), quando filtro, então vejo apenas pedidos com aquele status
- [ ] Dado que clico em um pedido, quando abro o detalhe, então vejo todas as informações do pedido, incluindo dados do cliente e License Key gerada

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Estado vazio: quando não há pedidos, exibir "Nenhum pedido encontrado"
- [ ] Estado de loading: skeleton da tabela

**Prioridade:** Alta
**Tamanho:** M
**Dependências:** US-013

---

### US-024: Gerenciamento de clientes

**Como** admin
**Quero** ver a lista de todos os clientes cadastrados e seus detalhes
**Para** oferecer suporte e entender minha base de clientes

**Critérios de Aceite — Happy Path:**
- [ ] Dado que acesso "Clientes", quando a lista carrega, então vejo: nome/e-mail, data de cadastro, número de pedidos e total gasto
- [ ] Dado que clico em um cliente, quando abro o detalhe, então vejo: dados do perfil (CPF/CNPJ), histórico de pedidos e licenças ativas

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Estado vazio: quando não há clientes ainda, exibir mensagem adequada

**Prioridade:** Alta
**Tamanho:** M
**Dependências:** US-001

---

### US-025: Gerenciamento de licenças

**Como** admin
**Quero** visualizar todas as licenças emitidas e revogar quando necessário
**Para** ter controle sobre o acesso aos produtos e agir em casos de chargeback ou fraude

**Critérios de Aceite — Happy Path:**
- [ ] Dado que acesso "Licenças", quando a lista carrega, então vejo: License Key, produto, cliente, status (ativa/revogada), data de emissão
- [ ] Dado que clico em "Revogar" em uma licença ativa, quando confirmo a ação, então a licença muda para "Revogada" e o cliente perde acesso ao download

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Dado que clico em "Revogar", então exibo modal de confirmação "Tem certeza? O cliente perderá o acesso ao download." antes de executar
- [ ] Dado que a licença é revogada, então o evento é registrado no audit_log

**Prioridade:** Alta
**Tamanho:** M
**Dependências:** US-013

---

### US-026: Logs de auditoria

**Como** admin
**Quero** ver o registro de todas as ações relevantes no sistema (downloads, compras, revogações)
**Para** ter evidência em casos de chargeback e monitorar uso indevido

**Critérios de Aceite — Happy Path:**
- [ ] Dado que acesso "Logs de Auditoria", quando a lista carrega, então vejo: timestamp, usuário, ação (ex: "download", "license_revoked", "order_paid"), produto associado e IP do usuário
- [ ] Dado que filtro por usuário ou por ação, quando aplico o filtro, então vejo apenas os registros correspondentes

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Logs são apenas para leitura — nenhuma ação de edição ou exclusão disponível para o admin

**Prioridade:** Alta
**Tamanho:** M
**Dependências:** US-013, US-014

---

## Épico 8 — Segurança e Infraestrutura

**Outcome:** O sistema protege os arquivos dos produtos, registra todas as ações críticas e garante que só usuários autorizados acessam recursos protegidos.

---

### US-027: Proteção de arquivos por RLS e bucket privado

**Como** sistema
**Quero** garantir que arquivos de produtos sejam acessíveis apenas por clientes com licença ativa
**Para** proteger os produtos contra pirataria e acesso não autorizado

**Critérios de Aceite — Happy Path:**
- [ ] Dado que um arquivo está no bucket privado, quando qualquer requisição direta sem autenticação tenta acessá-lo, então recebe 403
- [ ] Dado que um cliente com licença ativa solicita download, quando o sistema gera a Signed URL, então ela expira automaticamente em 10 minutos
- [ ] RLS habilitado em todas as tabelas críticas: orders, licenses, audit_logs, profiles

**Critérios de Aceite — Edge Cases e Erros:**
- [ ] Dado que um usuário sem licença tenta acessar um endpoint de download diretamente, quando a request chega, então recebe 403 com mensagem genérica

**Prioridade:** Alta
**Tamanho:** M
**Dependências:** —

---

### US-028: Registro de audit log em ações críticas

**Como** sistema
**Quero** registrar automaticamente ações críticas com IP e timestamp
**Para** ter rastreabilidade completa para casos de chargeback e disputas

**Critérios de Aceite — Happy Path:**
- [ ] Dado que qualquer uma das ações abaixo ocorre, então é registrada em audit_logs:
  - Aceite do checkbox anti-chargeback (checkout)
  - Pagamento confirmado
  - Download de arquivo (com IP)
  - Revogação de licença
  - Login do admin

**Prioridade:** Alta
**Tamanho:** M
**Dependências:** US-009, US-013, US-014

---

## Histórico de Versões

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0 | 2026-02-18 | Versão inicial — 28 stories em 8 épicos |
