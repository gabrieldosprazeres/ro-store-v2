# Design System: ro-store-v2
**Direção:** Void Purple — Dark mode, violeta primário, ciano accent
**Data:** 2026-02-18

---

## 1. Paleta de Cores

### Decisão
Público: admins de servidor RO, 18–35 anos, vivem no Discord e GitHub. Dark mode profundo com primário violeta (familiar), accent ciano elétrico (tech), bordas angulares (não arredondadas).

### Tokens de Cor

| Token | Valor HSL | Hex | Uso |
|-------|-----------|-----|-----|
| background | hsl(222, 47%, 6%) | #090d18 | Fundo da página |
| card | hsl(222, 47%, 8%) | #0d1221 | Cards, painéis |
| border | hsl(217, 33%, 17%) | #1e2d4a | Bordas de card e input |
| input | hsl(217, 33%, 17%) | #1e2d4a | Fundo de input |
| primary | hsl(262, 83%, 58%) | #7c3aed | Botão primário, links, focus ring |
| primary-foreground | hsl(0, 0%, 100%) | #ffffff | Texto sobre primário |
| accent | hsl(185, 100%, 45%) | #00d4e0 | Badge "Nova versão", preço, destaque |
| accent-foreground | hsl(222, 47%, 6%) | #090d18 | Texto sobre accent |
| foreground | hsl(210, 40%, 96%) | #f0f4fb | Texto principal |
| muted | hsl(217, 33%, 17%) | #1e2d4a | Fundo de elementos secundários |
| muted-foreground | hsl(215, 20%, 65%) | #8fa3bf | Texto auxiliar, placeholder |
| destructive | hsl(0, 84%, 60%) | #f04040 | Erro, deletar, revogar |
| destructive-foreground | hsl(0, 0%, 100%) | #ffffff | Texto sobre destrutivo |
| success | hsl(142, 71%, 45%) | #22c55e | Status pago, sucesso |
| warning | hsl(38, 92%, 50%) | #f59e0b | Alerta, boleto pendente |
| ring | hsl(262, 83%, 58%) | #7c3aed | Focus ring (= primary) |

---

## 2. Código Pronto para Aplicar

### tailwind.config.ts — seção `theme.extend`

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        border:  "hsl(var(--border))",
        input:   "hsl(var(--input))",
        ring:    "hsl(var(--ring))",
        // Semântica
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        xs:    ["0.75rem",  { lineHeight: "1rem" }],
        sm:    ["0.875rem", { lineHeight: "1.25rem" }],
        base:  ["1rem",     { lineHeight: "1.5rem" }],
        lg:    ["1.125rem", { lineHeight: "1.75rem" }],
        xl:    ["1.25rem",  { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem",   { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem",  { lineHeight: "2.5rem" }],
        "5xl": ["3rem",     { lineHeight: "1" }],
      },
      fontWeight: {
        normal:   "400",
        medium:   "500",
        semibold: "600",
        bold:     "700",
      },
      borderRadius: {
        sm:   "calc(var(--radius) - 4px)",  // 2px — quase reto
        md:   "calc(var(--radius) - 2px)",  // 4px
        lg:   "var(--radius)",              // 6px — padrão
        xl:   "calc(var(--radius) + 4px)",  // 10px — apenas elementos grandes
        full: "9999px",                     // apenas badges e avatars
      },
      boxShadow: {
        sm:   "0 1px 2px 0 rgb(0 0 0 / 0.3)",
        md:   "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)",
        lg:   "0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.3)",
        xl:   "0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.3)",
        "2xl":"0 25px 50px -12px rgb(0 0 0 / 0.5)",
        // Glow — usar em elementos de destaque (primário, accent)
        "glow-primary": "0 0 20px hsl(262 83% 58% / 0.35)",
        "glow-accent":  "0 0 20px hsl(185 100% 45% / 0.35)",
      },
      transitionDuration: {
        fast:   "100ms",
        base:   "150ms",
        slow:   "300ms",
        slower: "500ms",
      },
      transitionTimingFunction: {
        "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
        "spring":      "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
    },
  },
} satisfies Config;
```

---

### src/app/globals.css — CSS Variables

```css
/* ---- Font loading (self-hosted — recomendado para produção) ---- */
/* npm install @fontsource/inter @fontsource/jetbrains-mono       */
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/inter/700.css';
@import '@fontsource/jetbrains-mono/400.css';
@import '@fontsource/jetbrains-mono/500.css';

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* O projeto usa dark mode como padrão — :root já é dark */
  :root {
    --background:           222 47% 6%;
    --foreground:           210 40% 96%;

    --card:                 222 47% 8%;
    --card-foreground:      210 40% 96%;

    --primary:              262 83% 58%;
    --primary-foreground:   0 0% 100%;

    --secondary:            217 33% 17%;
    --secondary-foreground: 210 40% 96%;

    --accent:               185 100% 45%;
    --accent-foreground:    222 47% 6%;

    --destructive:          0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    --muted:                217 33% 17%;
    --muted-foreground:     215 20% 65%;

    --border:               217 33% 17%;
    --input:                217 33% 17%;
    --ring:                 262 83% 58%;

    --radius:               0.375rem; /* 6px — bordas moderadas, não arredondadas */

    --success:              142 71% 45%;
    --warning:              38 92% 50%;
    --info:                 217 91% 60%;
  }

  /* Light mode disponível mas não é o padrão do produto */
  .light {
    --background:           0 0% 100%;
    --foreground:           222 47% 11%;
    --card:                 0 0% 100%;
    --card-foreground:      222 47% 11%;
    --primary:              262 83% 48%;
    --primary-foreground:   0 0% 100%;
    --secondary:            210 40% 96%;
    --secondary-foreground: 222 47% 11%;
    --accent:               185 100% 38%;
    --accent-foreground:    0 0% 100%;
    --destructive:          0 84% 55%;
    --destructive-foreground: 0 0% 100%;
    --muted:                210 40% 96%;
    --muted-foreground:     215 16% 47%;
    --border:               214 32% 91%;
    --input:                214 32% 91%;
    --ring:                 262 83% 48%;
  }

  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
  }

  /* JetBrains Mono — usar apenas para: License Keys, hashes, paths, valores técnicos */
  .font-mono {
    font-family: "JetBrains Mono", monospace;
  }
}

/* ---- Z-index scale — nunca usar valores fora desta escala ---- */
/*
  z-0   → conteúdo estático (cards, seções)
  z-10  → tooltips inline, posicionamento relativo
  z-20  → header/navbar sticky
  z-30  → dropdown, popover, select
  z-40  → modal/dialog backdrop
  z-50  → modal, dialog, drawer, sheet
  z-[60]→ toast (sonner — sempre acima de tudo)
*/
```

---

## 3. Tipografia

| Uso | Fonte | Tamanho | Peso | Classe Tailwind |
|-----|-------|---------|------|-----------------|
| H1 — hero/título principal | Inter | 3rem (5xl) | Bold 700 | `text-5xl font-bold` |
| H1 mobile | Inter | 2.25rem (4xl) | Bold 700 | `text-4xl font-bold` |
| H2 — seção | Inter | 1.875rem (3xl) | Bold 700 | `text-3xl font-bold` |
| H3 — subtítulo | Inter | 1.5rem (2xl) | Semibold 600 | `text-2xl font-semibold` |
| H4 — card title | Inter | 1.25rem (xl) | Semibold 600 | `text-xl font-semibold` |
| Body padrão | Inter | 1rem (base) | Normal 400 | `text-base` |
| Body destaque | Inter | 1.125rem (lg) | Medium 500 | `text-lg font-medium` |
| Label / botão | Inter | 0.875rem (sm) | Medium 500 | `text-sm font-medium` |
| Caption / meta | Inter | 0.75rem (xs) | Normal 400 | `text-xs text-muted-foreground` |
| License Key | JetBrains Mono | 0.875rem (sm) | Normal 400 | `font-mono text-sm text-accent` |
| Preço | Inter | 1.5rem (2xl) | Bold 700 | `text-2xl font-bold text-accent` |
| Preço pequeno | Inter | 1.25rem (xl) | Semibold 600 | `text-xl font-semibold` |

---

## 4. Ícones

**Biblioteca:** `lucide-react` — única biblioteca de ícones do projeto.

```
Tamanhos padrão:
  16px → ícone dentro de texto, badge, chip, inline em tabela
  20px → ícone de ação inline (input suffix/prefix, botão ghost sm)
  24px → ícone de botão padrão, nav item, card header (DEFAULT)
  32px → ícone de estado (empty state pequeno)
  48px → ícone de tela vazia (empty state grande), erro de página

Regras:
  • Botões icon-only → aria-label obrigatório
    <Button variant="ghost" size="icon" aria-label="Copiar licença">
      <Copy size={20} />
    </Button>

  • Ícones decorativos → aria-hidden="true"
    <CheckCircle size={16} aria-hidden="true" className="text-success" />

  • Nunca usar SVGs avulsos ou react-icons
```

---

## 5. Componentes (Atomic Design)

### Atoms — shadcn/ui padrão
```
Button        variants: default | secondary | ghost | outline | destructive | link
              sizes: default | sm | lg | icon
Input         com Label e mensagem de erro abaixo
Badge         variants: default | secondary | outline | destructive
              cores semânticas: success | warning | accent (Nova versão)
Separator     horizontal e vertical
Skeleton      para loading states
Avatar        para user menu
Checkbox      com Label
RadioGroup    + RadioGroupItem para seleção de pagamento
```

### Molecules — custom
```
PriceTag
  Badge accent com texto "R$ X,XX" em font-bold

StatusBadge
  Badge com ícone + texto, cor por status:
  "Pago"            → variant success  + CheckCircle
  "Pendente"        → variant warning  + Clock
  "Expirado"        → variant outline  + XCircle
  "Licença ativa"   → variant success  + ShieldCheck
  "Revogada"        → variant destructive + ShieldX

FormField (react-hook-form)
  Label + Input + mensagem de erro (text-destructive text-sm)
  Estado de erro: borda destructive + ícone AlertCircle

ProductCard
  Card com: imagem (aspect-video object-cover), título (text-lg font-semibold),
  badges de emulador e categoria, preço (text-accent font-bold), botão "Ver produto"

CompatibilityTable
  Table com 2 colunas (Label | Valor), fonte mono nos valores técnicos
  Linhas: Emulador, Tipo de instalação, Data do hexed, Requisitos

LicenseKeyField
  Input read-only + botão Copiar com feedback "Copiado! ✓"
  Fonte: font-mono text-accent

VersionBadge (nova versão)
  Badge accent com ícone ArrowUp: "Nova versão disponível"
```

### Organisms — custom
```
SiteHeader
  Logo à esquerda + Navigation links no centro (md+) + [Meus Pedidos] [Avatar/Login] à direita
  Mobile: Logo + [Avatar/☰]
  Sticky top, z-20, bg-background/95 backdrop-blur border-b

ProductGallery
  Carousel de imagens (aspect-video) + dots indicator
  YouTube embed embutido abaixo das imagens (aspect-video)

CheckoutForm
  Resumo do pedido + CPF/CNPJ + RadioGroup de pagamento + Checkbox termos + Botão pagar

PixPanel
  QR Code centralizado + countdown + Pix Copia e Cola + instrução

OrderCard
  Produto, data, status, LicenseKeyField, VersionBadge (se houver), botão Download

AdminSidebar
  Logo + NavLinks com ícones + Avatar/nome admin + botão Sair
  Desktop: sidebar fixa 240px
  Mobile: Sheet (shadcn) abrindo da esquerda

KPICard (Tremor — ver complementos)
  Título, valor, comparativo (↑↓ vs período anterior), ícone
```

### Templates (Layouts)
```
StoreLayout
  SiteHeader fixo no topo + <main> com padding + Footer simples
  Usado em: Catálogo, PDP, Meus Pedidos

AuthLayout
  Centralizado vertical + horizontal, sem header/footer
  Logo acima do card de formulário
  Usado em: Login, Cadastro

CheckoutLayout
  Logo centralizado no topo (sem nav) + <main> + sem footer
  Checkout sem distração — nenhum link que tire o usuário da página

AdminLayout
  AdminSidebar fixa (desktop) / Sheet (mobile) + <main> com padding
  Usado em: todas as rotas /admin/*
```

---

## 6. Estados de Componente

### Button
| Estado | Visual |
|--------|--------|
| Default | `bg-primary text-primary-foreground` |
| Hover | `bg-primary/90` + `transition-colors duration-150` |
| Active (pressed) | `scale-[0.98] transition-transform` |
| Focus-visible | `ring-2 ring-ring ring-offset-2 ring-offset-background` |
| Disabled | `opacity-50 cursor-not-allowed pointer-events-none` |
| Loading | `disabled` + `<Loader2 size={16} className="animate-spin mr-2" />` + texto "Aguarde..." |

### Input / FormField
| Estado | Visual |
|--------|--------|
| Default | `border-input bg-background` |
| Focus | `ring-2 ring-ring border-ring` |
| Erro | `border-destructive` + `<p className="text-destructive text-sm mt-1">{erro}</p>` + ícone `AlertCircle` |
| Disabled | `opacity-50 bg-muted cursor-not-allowed` |
| Read-only | `bg-muted/50 select-all` (LicenseKeyField) |

### ProductCard
| Estado | Visual |
|--------|--------|
| Default | `border-border bg-card` |
| Hover | `border-primary/50 shadow-glow-primary transition-all duration-150` |
| Loading | Skeleton: `w-full aspect-video` + `h-5 w-3/4` + `h-4 w-1/2` + `h-6 w-1/4` |

### Badge de Status
| Status | Variant | Ícone | Cor |
|--------|---------|-------|-----|
| Pago | — | CheckCircle 14px | `bg-success/20 text-success border-success/30` |
| Pendente | — | Clock 14px | `bg-warning/20 text-warning border-warning/30` |
| Expirado | — | XCircle 14px | `bg-muted text-muted-foreground` |
| Nova versão | — | ArrowUp 14px | `bg-accent/20 text-accent border-accent/30` |
| Revogada | — | ShieldX 14px | `bg-destructive/20 text-destructive border-destructive/30` |

---

## 7. Complementos shadcn/ui Aprovados

| Lib | Uso no projeto | Justificativa |
|-----|---------------|---------------|
| **Tremor** | KPI cards no `/admin` (receita, pedidos, downloads, clientes), BarChart de receita, DonutChart de status de pedidos | Dashboard data-heavy com múltiplos gráficos — Tremor já integra recharts e tem KPICard pronto |
| **TanStack Table** | Tabelas de Pedidos, Clientes, Licenças e Audit Logs no admin | Todas têm sort, filter, paginação e provavelmente ultrapassarão 50 linhas em uso real |
| **Vaul** | Drawer de filtros no Catálogo (mobile) | Bottom sheet para filtros facetados em mobile — shadcn Sheet não tem snap points nativos |

> **cmdk:** não necessário — sem command palette no MVP.

---

## 8. Escala de Espaçamento

Usar sempre múltiplos de 4px da escala Tailwind. Nunca valores arbitrários.

```
p-1  = 4px   → espaçamento mínimo (badge, chip interno)
p-2  = 8px   → padding de input pequeno
p-3  = 12px  → padding de botão sm
p-4  = 16px  → padding de card, botão padrão
p-6  = 24px  → padding interno de card grande
p-8  = 32px  → padding de seção
p-12 = 48px  → padding de seção grande (hero)
p-16 = 64px  → padding de página

gap-2 = 8px  → entre badges, chips
gap-4 = 16px → entre elementos de form
gap-6 = 24px → entre cards em grid
gap-8 = 32px → entre seções
```

---

## 9. Acessibilidade (WCAG 2.1 AA)

| Verificação | Implementação |
|-------------|--------------|
| Contraste texto normal | foreground (#f0f4fb) sobre background (#090d18) → ~14:1 ✅ |
| Contraste primary | #7c3aed sobre background → verificar com Colour Contrast Analyser antes de usar em texto |
| Contraste accent | #00d4e0 sobre background (#090d18) → ~8:1 ✅ |
| Focus states | `focus-visible:ring-2 ring-ring` em todos os elementos interativos — nunca `outline-none` sem substituto |
| Touch targets | mínimo 44×44px em mobile, 32×32px desktop — botões com `h-11` (44px) em mobile |
| Cor não é único indicador | Status badges sempre têm ícone + texto além da cor |
| Botões icon-only | `aria-label` obrigatório |
| Mensagens dinâmicas | Toasts do sonner com `aria-live="polite"` (já nativo) |
| Keyboard navigation | Tab ordem lógica, Esc fecha modais, Enter/Space ativa botões |

---

## Histórico de Versões

| Versão | Data | Mudança |
|--------|------|---------|
| 1.0 | 2026-02-18 | Versão inicial — Void Purple, radius 0.375rem |
