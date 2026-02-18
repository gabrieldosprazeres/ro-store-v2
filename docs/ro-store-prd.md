# Documento de Requisitos do Produto (PRD)
**Projeto:** Marketplace de Mods para Ragnarok Online (MVP Brasil)
**Versão:** 1.0
**Status:** Planejamento

## 1. Visão Geral do Produto
Criar uma loja online segura e especializada na venda de scripts, plugins (C++) e modificações visuais para servidores de Ragnarok Online. O foco inicial é o mercado brasileiro, priorizando pagamentos instantâneos (Pix) e entrega automatizada segura.
A plataforma deve resolver a desconfiança inerente ao mercado de "servidores privados" através de uma **Arquitetura de Confiança** (demonstrações claras, compatibilidade técnica explícita e suporte verificado).

## 2. Personas e Problemas
*   **Comprador (Admin de Servidor):**
    *   *Dores:* Medo de comprar código que não funciona ("bugado"), dificuldade em instalar, medo de o vendedor sumir após o pagamento.
    *   *Necessidade:* Entrega imediata, garantia de compatibilidade com o emulador (rAthena/Hercules).
*   **Vendedor (Você/Plataforma):**
    *   *Dores:* Chargeback (fraude amigável), pirataria (vazamento de scripts), gestão manual de entregas via Discord.
    *   *Necessidade:* Automação total de entrega, proteção jurídica e técnica contra reembolso indevido.

---

## 3. Especificações Funcionais (O que o sistema fará)

### 3.1. Gestão de Catálogo e Página de Produto (PDP)
Baseado nas melhores práticas de e-commerce técnico:
*   **Galeria de Mídia:** Suporte nativo para embed de vídeos do YouTube (gameplay do script) e carrossel de imagens.
*   **Tabela de Compatibilidade (Feature Crítica):** Campo estruturado para exibir:
    *   Emulador Suportado (ex: rAthena Hash X).
    *   Tipo de Instalação (Source C++, Script NPC, Plugin).
    *   Requisitos do Cliente (ex: Data do Hexed 2021-11-03).
*   **Versionamento:** Aba de "Changelog" visível na PDP para mostrar a evolução do script.

### 3.2. Checkout e Pagamentos (Foco Brasil)
*   **Gateway:** Integração direta com API do **Banco Inter**.
*   **Métodos de Pagamento:**
    *   **Pix (Prioritário):** Geração de QR Code dinâmico com baixa automática (webhook).
    *   **Boleto:** Com registro (para vendas B2B/PJ).
    *   **Cartão de Crédito:** Com tokenização segura.
*   **Dados Obrigatórios:** Coleta de **CPF/CNPJ** no checkout (exigência fiscal e do Banco Inter para emissão de cobrança).
*   **Proteção Legal (Anti-Chargeback):** Checkbox obrigatório: *"Concordo que este é um produto digital consumível imediatamente e renuncio ao direito de arrependimento após o download/visualização da licença"*.

### 3.3. Entrega Digital e Licenciamento
*   **Cofre de Arquivos:** Os arquivos (.zip, .dll) ficam em um bucket privado (Supabase Storage) e nunca são expostos publicamente.
*   **Links Assinados (Signed URLs):** O botão de download gera um link temporário (validade de 10 min) único para aquele usuário/sessão.
*   **Gerador de Licença:** Ao confirmar o pagamento (Webhook Inter -> Sucesso), o sistema deve gerar um hash único (License Key) e associar ao pedido.

### 3.4. Área do Cliente
*   **Meus Pedidos:** Lista de compras com status.
*   **Gestão de Licença (Binding):** Campo para o cliente inserir o IP do servidor onde o script será instalado. O sistema deve permitir alterar esse IP uma vez a cada X dias (Self-service).

---

## 4. Requisitos Técnicos (Como será construído)

### 4.1. Stack Tecnológica
*   **Frontend:** Next.js 16.1 (App Router, Server Components).
*   **Backend/Banco:** Supabase (PostgreSQL).
*   **Autenticação:** Supabase Auth (Email/Senha + Google/Discord).
*   **Estilização:** Tailwind CSS + Shadcn/UI (Tema Dark Mode padrão "Gamer/Code").

### 4.2. Integração Banco Inter (Desafio Técnico)
A API do Banco Inter exige autenticação via **mTLS** (Mutual TLS).
*   **Requisito de Segurança:** O frontend (navegador) *não pode* armazenar o certificado `.crt` e a chave privada `.key`.
*   **Solução:** Criar um microserviço ou Edge Function no Supabase que atua como proxy. O Next.js chama essa função -> A função (que tem acesso seguro aos certificados) chama o Banco Inter -> Retorna o Pix Copy/Paste para o frontend.

### 4.3. Modelo de Dados (Schema Simplificado)
*   `profiles`: (id, email, cpf_cnpj, role).
*   `products`: (id, title, price, compatibility_json, file_path_secure).
*   `orders`: (id, user_id, status, payment_method, transaction_id_inter).
*   `licenses`: (id, order_id, license_key, bound_ip, last_check_date).
*   `audit_logs`: (id, user_id, action, ip_address, timestamp) - *Essencial para provas contra chargeback*.

---

## 5. Requisitos de UX/UI (Design System)
*   **Navegação Facetada:** Filtros laterais permitindo seleção múltipla (ex: Categoria: PvP + Emulador: rAthena).
*   **Feedback de Estado:** Não usar alertas nativos do navegador. Usar "Toasts" (notificações flutuantes) para sucesso de compra ou erro de login.
*   **Checkout sem Distração:** Remover cabeçalho e rodapé na página de pagamento para focar na conversão.

---

## 6. Critérios de Aceite para o MVP (O que define "Pronto")
1.  Usuário consegue criar conta e fazer login.
2.  Usuário consegue filtrar produtos por versão do emulador.
3.  Usuário gera um Pix via Banco Inter, paga, e o sistema reconhece o pagamento em menos de 1 minuto (Webhook).
4.  Após pagamento, o download é liberado automaticamente e a chave de licença é exibida.
5.  O administrador consegue ver logs de quem baixou o arquivo e qual IP foi usado.

---

## 7. Riscos e Mitigação
| Risco | Mitigação |
| :--- | :--- |
| **Certificado Inter expirar** | Criar alerta automático 30 dias antes do vencimento do certificado mTLS. |
| **Chargeback** | Armazenar logs de IP de download e aceite de termos. Usar descritor claro na fatura ("LOJA MODS RO" e não nome genérico). |
| **Pirataria (Vazamento)** | Vender binários (.dll) compilados em vez de código aberto sempre que possível. Implementar IP Lock no plugin. |