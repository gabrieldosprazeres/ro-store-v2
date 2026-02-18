# Code Review: Sprint 2 — Autenticação

## Status: ⚠️ Aprovado com ressalvas

**Data:** 2026-02-18
**Revisor:** Code Reviewer Agent

## Objetivo do Sprint
Usuário pode criar conta, fazer login (e-mail + Discord), e sair com segurança.
Stories cobertas: US-001, US-002, US-003, US-004

## Critério de Saída
- [x] `signIn` com credenciais corretas autentica e redireciona para `/` ou URL de retorno
- [x] `signIn` com credenciais incorretas retorna erro sem expor qual campo está errado
- [x] `signUp` com e-mail duplicado retorna erro legível (sem revelar existência)
- [x] `signOut` limpa sessão e redireciona para `/`
- [x] `customer_login` registrado em `audit_logs` após login (e-mail e Discord)
- [x] `auth.getUser()` usado em todo server-side — nunca `getSession()`
- [x] Clicar "Entrar com Discord" redireciona para autorização
- [x] Após autorizar, retorna à loja autenticado
- [x] Cancelar autorização retorna à tela de login sem erro excessivo (`missing_code` → /auth/login?error=missing_code)
- [x] `customer_login` com `method: discord` no callback

## Tasks Validadas
| Task | Status | Observação |
|------|--------|------------|
| 2.1: Schemas de validação | ✅ OK | Zod com refine, types inferidos, sem `any` |
| 2.2: Telas de Login e Cadastro | ✅ OK | Páginas estáticas + Client Components com Suspense |
| 2.3: Server Actions de auth | ⚠️ Ressalva | Sem try-catch no Supabase SDK — ver Warning #2 |
| 2.4: Discord OAuth | ⚠️ Ressalva | OAuthButton sem try-finally — ver Warning #1 |
| 2.5: Proteção de rotas e header | ✅ OK | proxy.ts + site-header.tsx corretos |

## Pontos Positivos
- Excelente prevenção de user enumeration: `signIn`, `signUp` e `resetPassword` retornam mensagens genéricas sem revelar existência de conta.
- Open redirect no callback prevenido via `${origin}${safeNext}` — força o domínio da aplicação.
- Arquitetura Next.js 16 com `cacheComponents` dominada: auth pages 100% estáticas com `useSearchParams()` dentro de `<Suspense>`.
- `auth.getUser()` usado consistentemente em todos os contextos server-side.
- Double submit prevenido em todos os formulários com `disabled={loading}`.

---

## Compliance

### Design & UI
- [x] Tokens Void Purple respeitados (text-primary, text-muted-foreground, bg-background, border-border)
- [x] Nenhuma cor hardcoded fora dos tokens
- [x] Mobile-first: `w-full max-w-sm`, botões com `w-full`
- [x] UI em pt-BR
- [x] Loading states nos botões (spinner + disabled)
- [x] Success state no RegisterForm (MailCheck + mensagem de confirmação)
- [x] Success state no ForgotPasswordForm
- [x] Acessibilidade: `<Button>` semântico, inputs com `autoComplete`, Form shadcn/ui (label via Radix)
- [x] `aria-hidden="true"` no SVG do Discord

### Arquitetura
- [x] Estrutura de pastas conforme docs: `lib/validators/`, `lib/actions/`, `components/auth/`
- [x] Server/Client Components corretos
- [x] `'use server'` em `auth-actions.ts`
- [x] Route Handler para `/auth/callback`
- [x] Todas as pages exportam `metadata`
- [x] Código em inglês

### Banco de Dados
- Sprint 2 não cria tabelas. Insert em `audit_logs` presente.
- Task 1.3 (migration) ainda pendente — fora do escopo desta sprint.

### Padrões Globais
- [x] shadcn/ui, Tailwind, react-hook-form + zod, sonner, lucide-react
- [x] Sem `console.log` esquecido
- [x] Sem código morto ou TODOs

---

## Qualidade de Código

### Code Smells
- [x] Funções dentro do limite (onSubmit ~8 linhas de lógica)
- [x] Sem God Components
- [x] Duplicação aceitável entre forms (diferentes o suficiente para não abstrair)

### Nomes e Legibilidade
- [x] Todos os nomes auto-explicativos
- [x] Consistência entre forms e actions

### Complexidade
- [x] Max 3 níveis de indentação
- [x] Arquivos dentro do limite de 200 linhas
- [x] Responsabilidades únicas por componente

### Performance
- [x] Sem queries N+1
- [x] Loading states presentes

### React Patterns
- [x] Sem `useEffect` sem cleanup
- [x] Sem mutação direta de estado

### Acoplamento
- [x] Client Components usam `@/lib/supabase` (browser)
- [x] Server Actions usam `@/lib/supabase-server` (server)

---

## Segurança

- [x] Inputs validados server-side com Zod em todas as Server Actions
- [x] `SERVICE_ROLE_KEY` apenas em `supabase-server.ts`
- [x] User enumeration prevenida
- [x] Open redirect no callback prevenido via `${origin}${safeNext}`
- [x] `auth.getUser()` em todo server-side
- [x] CSRF protegido (Next.js Server Actions nativo)
- [ ] 🔴 Open redirect em `login-form.tsx` — `returnUrl` aceita URLs protocol-relative

---

## Regressão

Arquivos de Sprint 1 modificados:
- `proxy.ts` — Guards existentes intactos, novo redirect adicionado corretamente. ✅
- `site-header.tsx` — Form action corretamente migrado para Server Action. ✅

---

## Resumo de Problemas

### 🔴 Blockers (deve corrigir antes de avançar)

**1. Open redirect em `src/components/auth/login-form.tsx:38`**

`router.push(returnUrl ?? '/')` sem validar se `returnUrl` é uma URL protocol-relative (`//evil.com`).

Vetor de ataque: enviar link `https://ro-store.com/auth/login?next=//attacker.com` → usuário loga → redirecionado para domínio do atacante (phishing).

Fix:
```tsx
// Linha 38 (após useSearchParams)
const raw = searchParams.get('next')
const returnUrl = raw?.startsWith('/') && !raw.startsWith('//') ? raw : undefined
```

### 🟡 Warnings (deveria corrigir antes de avançar)

**1. `src/components/auth/oauth-button.tsx` — sem try-catch/finally em `signInWithOAuth`**

Se a chamada lançar exceção (erro de rede), `loading` fica `true` permanentemente e o botão fica inutilizável até o usuário recarregar a página.

Fix:
```tsx
async function handleDiscordSignIn() {
  setLoading(true)
  try {
    const supabase = createClient()
    // ...
    await supabase.auth.signInWithOAuth(...)
  } catch {
    setLoading(false)
  }
}
```

**2. `src/lib/actions/auth-actions.ts` — sem try-catch em nenhuma Server Action**

O SDK do Supabase raramente joga exceções, mas erros de rede ou indisponibilidade podem propagar como Server Action unhandled error. O resultado para o usuário seria uma tela de erro genérica do Next.js em vez de um toast amigável.

Fix: envolver cada action em try-catch:
```typescript
try {
  const { data, error } = await supabase.auth.signInWithPassword(...)
  if (error) return { success: false, error: 'E-mail ou senha incorretos' }
  // ...
} catch {
  return { success: false, error: 'Erro inesperado. Tente novamente.' }
}
```

### 🟢 Suggestions (pendência técnica — não bloqueiam)

1. **`auth-actions.ts`** — `as never` nas inserts de `audit_logs`. Funciona para o placeholder, mas `as { action: string; user_id: string; metadata: Record<string, unknown> }` seria mais legível.
2. **`update-password-form.tsx`** — Sem verificação de que o usuário está em fluxo de recovery. Navegação direta para `/auth/update-password` exibe o form mas falha no submit sem mensagem clara. Considerar estado de erro mais descritivo.
3. **`login-form.tsx`** — Considerar trim no email antes de submeter (`parsed.data.email.trim()`).

---

## Veredicto

**Code Review Sprint 2: 1 blocker + 2 warnings encontrados. Next.js agent deve corrigir antes de avançar para o QA.**
