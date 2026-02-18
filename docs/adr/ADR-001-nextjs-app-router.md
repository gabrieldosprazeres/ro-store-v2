# ADR-001: Next.js 16 com App Router

## Status: Accepted

## Contexto
O projeto precisa de um framework frontend para uma loja com catálogo público (SEO importante), área autenticada (cliente + admin) e integração com APIs externas (Asaas, Resend). A stack de Next.js já estava definida no PRD.

## Decisão
Usar **Next.js 16 com App Router e Server Components** como padrão. Server Components para todas as páginas que buscam dados. Client Components apenas para interação (formulários, realtime, charts).

## Alternativas descartadas
- **Vite + React (SPA):** Não tem Server Components nativos — SEO do catálogo dependeria de SSR manual ou solução extra. O projeto já está nos padrões do workspace que usa Next.js para este tipo de produto.
- **Pages Router (Next.js legado):** App Router é o padrão oficial desde Next.js 13. Pages Router não tem Server Components nem Server Actions nativos.

## Consequências
- (+) SEO do catálogo funciona nativamente (Server Components renderizam no servidor)
- (+) Dados sensíveis (Asaas key, Service Role Key) nunca expostos no bundle
- (+) Server Actions simplificam mutations sem precisar de endpoints `/api` para cada operação
- (-) Curva de aprendizado do modelo mental Server vs Client Components
- (-) Alguns padrões de React tradicional (Context nos layouts) precisam de adaptação
