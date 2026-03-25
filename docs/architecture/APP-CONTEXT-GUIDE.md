# App Context Guide

> **Owner**: Tech Lead (tech context) + UX Designer (visual theme)
> **Purpose**: Explains the technical and visual differences between the 3 app contexts. Must be read before starting any UX/UI work to ensure the correct component system, tokens, and theme are used.
> **When to read**: Before `/write-ux-overview`, `/write-ux-spec`, or `/write-frontend-spec`.

---

## Context Detection

To determine which app context applies to your work:

1. Check `02-technical-spec.md` Section 1 (System Architecture) — it specifies the target app
2. Check the module's route prefix:
   - `/cart`, `/catalog`, `/product`, `/search`, `/checkout`, `/my-order` → **buyer-platform**
   - `/(auth)/products`, `/(auth)/organizations`, `/(auth)/merchant-list` → **seller-platform**
   - `/sp/*`, `/admin/sp/*` → **startup-partner-platform**
3. Check `docs/modules/[module]/MODULE-UX-OVERVIEW.md` — it states the app context

---

## buyer-platform

### Technical Context

| Aspect | Detail |
|--------|--------|
| **UI Library** | Ant Design v5.25.1 with custom wrappers in `src/components/` |
| **CSS Framework** | Tailwind CSS v3.4.17 |
| **Design Tokens** | Hardcoded values in `tailwind.config.js` (no token layer) |
| **Icons** | Remix Icon v4.6.0 (`ri-*` classes) |
| **Typography** | Custom `Typography` component wrapping Ant Design Typography |
| **State Management** | Zustand (global store) + TanStack React Query |
| **Routing** | Next.js App Router (no route groups for auth) |
| **Component Registry** | `docs/architecture/registries/buyer-components.md` |
| **Component Rules** | `docs/ai/rules/developer/02-components.md` (partial) |

### Visual Theme Direction

```
Modern e-commerce marketplace, light and airy, clean white background with
vibrant green accents for primary actions, product-focused minimal layout,
large product image cards with soft rounded corners and gentle floating shadows,
top navigation bar with prominent search, spacious product grids,
Thai-language friendly with warm inviting tone, mobile-first,
inspired by modern Shopee/Lazada but cleaner and less cluttered.
```

| Dimension | Direction |
|-----------|-----------|
| **Visual Style** | Modern marketplace, product-focused, minimal |
| **Color Mood** | Light mode, white background, vibrant green accents |
| **Layout Feel** | Spacious product grids, card-based, gentle shadows |
| **Shape Language** | Soft rounded corners, organic card shapes |
| **Typography Feel** | Warm, friendly, Thai-first |
| **Animation Feel** | Subtle transitions, smooth carousel scrolling |
| **Overall Vibe** | Clean, inviting, product-centric |
| **Inspiration** | Shopee/Lazada but cleaner, less cluttered |

> **CRITICAL**: Visual Theme describes mood & feeling ONLY. Pull actual values (colors, px, radius) from the component registry and tailwind.config.js — NEVER hardcode from this description.

---

## seller-platform

### Technical Context

| Aspect | Detail |
|--------|--------|
| **UI Library** | Ant Design v5.25.1 with custom wrappers in `src/components/` |
| **CSS Framework** | Tailwind CSS v3.4.0 |
| **Design Tokens** | Hardcoded values in `tailwind.config.ts` (no token layer) |
| **Icons** | Remix Icon v4.8.0 (`ri-*` classes) |
| **Typography** | Custom `Typography` component wrapping Ant Design Typography |
| **State Management** | Zustand (persisted) + TanStack React Query |
| **Routing** | Next.js App Router with `(auth)` route group for protected pages |
| **Auth Guard** | `useAuth` hook, redirects to `/login` if no `auth-session` cookie |
| **Component Registry** | `docs/architecture/registries/seller-components.md` |
| **Component Rules** | `docs/ai/rules/developer/02-components.md` (primary target) |

### Visual Theme Direction

```
Professional SaaS seller dashboard, clean and business-like, light mode with
neutral gray tones and green accent for primary actions, sidebar navigation
with merchant context switcher, organized data tables with subtle borders,
floating metric cards with gentle shadows, data visualization charts,
form-heavy pages with clear feedback states, compact but breathable spacing,
Thai-first formal tone, desktop-first with responsive tablet support.
```

| Dimension | Direction |
|-----------|-----------|
| **Visual Style** | Professional SaaS dashboard, business-like |
| **Color Mood** | Light mode, neutral grays, green primary accent |
| **Layout Feel** | Compact but breathable, sidebar + content, data-dense |
| **Shape Language** | Subtle borders, organized tables, metric cards |
| **Typography Feel** | Formal, compact, Thai-first |
| **Animation Feel** | Minimal, functional transitions only |
| **Overall Vibe** | Professional, organized, efficient |
| **Inspiration** | Shopee Seller Center, Lazada Seller Center |

> **CRITICAL**: Visual Theme describes mood & feeling ONLY. Pull actual values from the component registry and tailwind.config.ts.

---

## startup-partner-platform

### Technical Context

| Aspect | Detail |
|--------|--------|
| **UI Library** | **Custom Design System** (NO Ant Design for UI components) in `src/design-system/` |
| **CSS Framework** | Tailwind CSS v3.4.0 with 3-layer token system |
| **Design Tokens** | **3-layer architecture**: `primitives.ts` → `alias.ts` → component tokens in `tailwind.config.ts` |
| **Icons** | Custom icon system in `src/design-system/components/icons/` |
| **Typography** | Custom `Typography` component in design system |
| **Variant System** | CVA (class-variance-authority) v0.7.1 |
| **State Management** | Zustand + TanStack React Query |
| **Routing** | Next.js App Router (design-mocks are public, no auth) |
| **Storybook** | Available at `localhost:6006` — run `pnpm storybook` |
| **Figma Source** | "Allkons DS1" (file key: nvIkFt5uZvU9R7uGJginT2) |
| **Component Registry** | `docs/architecture/registries/startup-partner-components.md` |

### Token Architecture (3-Layer)

```
Layer 1: Primitives (src/design-system/tokens/primitives.ts)
├── Raw color values from Figma
├── 20+ color families (specialGreen, gray, red, orange, etc.)
└── Each family has 10+ stops (90→00 dark, p10→p95 light)
    ↓
Layer 2: Aliases (src/design-system/tokens/alias.ts)
├── Semantic tokens referencing Layer 1
├── Categories: brand, error, success, warning, info, text, background, border, neutral
└── Sub-tokens: default, hover, active, subtle, disabled, focus-ring
    ↓
Layer 3: Component (tailwind.config.ts + CVA variants)
├── Tailwind classes mapped to Layer 2 aliases
├── CVA variant definitions in component files
└── Ant Design theme overrides (for ConfigProvider only)
```

### Visual Theme Direction

```
High-fidelity modern SaaS partner portal, minimal and elegant, generous whitespace,
clean white background with soft neutral tones, green as primary action color,
soft rounded corners throughout, floating cards with very subtle shadows,
step-by-step wizard flows for applications, clean document upload areas,
vertical status timeline, balanced grid spacing, Thai typography with
professional yet approachable feel, fully mobile-responsive.
```

| Dimension | Direction |
|-----------|-----------|
| **Visual Style** | Modern SaaS, minimal, elegant |
| **Color Mood** | Clean white, soft neutrals, green primary accent |
| **Layout Feel** | Generous whitespace, balanced grid, floating cards |
| **Shape Language** | Soft rounded corners throughout, very subtle shadows |
| **Typography Feel** | Professional yet approachable, Thai-first |
| **Animation Feel** | Smooth, subtle, step-by-step wizard transitions |
| **Overall Vibe** | Clean, modern, professional |
| **Inspiration** | Modern SaaS onboarding portals (Stripe, Linear) |

> **CRITICAL**: Visual Theme describes mood & feeling ONLY. Pull actual values from `primitives.ts`, `alias.ts`, and `tailwind.config.ts`.

---

## CRITICAL Differences Between Contexts

| Aspect | buyer-platform | seller-platform | startup-partner-platform |
|--------|---------------|-----------------|--------------------------|
| **Component Import** | `@/components/Button` | `@/components/Button` | `@/design-system/components` |
| **Has Ant Design UI?** | Yes (wrapped) | Yes (wrapped) | **NO** (custom design system) |
| **Token System** | Hardcoded hex in Tailwind | Hardcoded hex in Tailwind | **3-layer** (primitives → alias → component) |
| **Button Prop** | `color` prop | `color` prop | `variant` prop (12 variants) |
| **Storybook** | No | No | **Yes** (localhost:6006) |
| **Icon System** | Remix Icon classes | Remix Icon classes | Custom icon components |
| **Navigation** | Top navbar | Sidebar + navbar | TBD |
| **Auth in Mocks** | Public (design-mocks/) | Public (design-mocks/) | Public (design-mocks/) |

> **WARNING for AI agents**: When switching between app contexts, you MUST read the correct component registry. Using seller-platform components in startup-partner-platform (or vice versa) will produce incorrect output.

---

## How to Update This Document

| Section | Who Updates | When |
|---------|-----------|------|
| Technical Context (per app) | Tech Lead | When tech stack changes |
| Visual Theme Direction | UX Designer | When visual direction is refined |
| Critical Differences table | Tech Lead | When significant divergence occurs |
| Token Architecture | UI Developer / Tech Lead | When token system is modified |
