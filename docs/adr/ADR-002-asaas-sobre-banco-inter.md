# ADR-002: Asaas como gateway de pagamento (em vez de Banco Inter)

## Status: Accepted

## Contexto
O PRD original especificava o Banco Inter como gateway de pagamento via API com autenticação mTLS (Mutual TLS), exigindo certificado `.crt` e chave privada `.key` no servidor. Durante o planejamento com o PO, o desenvolvedor optou por substituir pelo Asaas.

## Decisão
Usar **Asaas** como gateway de pagamento. A API do Asaas é REST padrão com autenticação por API Key e suporta Pix, Boleto e Cartão de Crédito — os três métodos exigidos pelo PRD.

## Alternativas descartadas
- **Banco Inter (mTLS):** Requer certificado cliente armazenado de forma segura no servidor, proxy intermediário para o Next.js não expor o certificado, e lógica de renovação 30 dias antes do vencimento. Alta complexidade técnica e risco operacional.
- **Stripe:** Não tem suporte nativo a Pix — dependeria de integração via `payment_intent` customizado. Melhor UX para cartão, mas insuficiente para o público-alvo brasileiro.
- **MercadoPago:** Suporta Pix, mas a API é mais complexa e as taxas são menos competitivas para volumes iniciais.

## Consequências
- (+) Integração via REST padrão — sem certificado mTLS, sem proxy intermediário
- (+) Elimina o maior risco técnico identificado no Security Review
- (+) Suporte nativo a Pix (QR Code dinâmico + webhook), Boleto registrado e Cartão
- (+) Sandbox disponível para desenvolvimento sem transações reais
- (-) Taxa por transação do Asaas (avaliar quando o volume crescer)
- (-) Dependência de fornecedor nacional — contingência se o Asaas tiver indisponibilidade
