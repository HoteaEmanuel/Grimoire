# Homepage Spec

## Overview

Replace the placeholder `src/app/page.tsx` with the real marketing homepage, built from the static mockup in `prototypes/homepage/` (`index.html`, `styles.css`, `script.js`). Port the structure, copy, and visual design into Next.js using Tailwind CSS v4 + shadcn/ui — no plain `<style>`/inline CSS, no raw `<a>` for in-app navigation.

This is a public, unauthenticated route — no `(shell)` layout, no sidebar/header from the app shell.

## Requirements

- Route: `src/app/page.tsx` (root `/`), replacing the current placeholder
- Component split: `src/components/home/` — one file per section (`Nav.tsx`, `Hero.tsx`, `HeroVisual.tsx`, `Features.tsx`, `AiSection.tsx`, `Pricing.tsx`, `Cta.tsx`, `Footer.tsx`), composed in `page.tsx`
- Server components by default. `'use client'` only where the mockup has real interactivity:
  - `Nav.tsx` — scroll-opacity effect (`window.scrollY` listener) and the search bar click target
  - `HeroVisual.tsx` — the chaos-icon drift/bounce/repel animation (`requestAnimationFrame`, mirrors `script.js`)
  - `Pricing.tsx` — monthly/yearly toggle state
  - A small shared `FadeInSection` client wrapper (IntersectionObserver) used by any section that needs scroll fade-in, instead of re-implementing the observer per component
- Use Tailwind utility classes + the project's existing design tokens (`--ember`, `--arcane`, `--parchment`, `--rune`, `--shadow-tome`, `--shadow-glow`, `tome-card`) already defined in `src/app/globals.css` — do not redefine them or hardcode the oklch values from the prototype's `styles.css`
- Reuse shadcn `Button` for all CTAs (map `btn btn-primary`/`btn-secondary`/`btn-ghost` variants to shadcn `variant`/`size` props) instead of porting the prototype's custom `.btn` classes
- Item-type accent colors must come from `SYSTEM_ITEM_TYPES` / `ICON_MAP` in `src/lib/item-types.ts` (already the source of truth) — do not hardcode the hex table again
- Icons via `lucide-react` imports (already a dependency), not the `unpkg` Lucide CDN script the prototype uses
- Fonts: confirm Cinzel is registered as a `next/font/google` variable in the root layout alongside the existing sans/mono fonts — add it if missing, rather than pulling in the prototype's Google Fonts `<link>` tags
- Keep it DRY: feature cards, pricing feature lists, and the dashboard-preview nav-rail/entries should each be driven by a small local array + `.map()`, not repeated JSX blocks (see prototype's repeated `<li>`/`<div class="feature-card">` patterns)

## Sections (port 1:1 from the prototype unless noted)

1. **Nav** — logo mark + "Grimoire" wordmark, `Features`/`Pricing` anchor links (`#features`/`#pricing`, same-page scroll), search bar (`Ask the oracle...` placeholder, ⌘K hint), Sign In / Get Started Free buttons
2. **Hero** — eyebrow, `Tame the Chaos. Bind Your Knowledge.` headline (ember→arcane gradient text), subcopy, primary + secondary CTA buttons
3. **Hero Visual** — three-part layout: chaos box (animated icons) → arrow (rotates 90° on mobile stack, per the prototype's responsive behavior) → dashboard preview "open grimoire" mockup (static, no live data — it's illustrative copy, not real DB content)
4. **Features** — 6 cards (Code Snippets, AI Prompts, Instant Search, Commands, Files & Docs, Collections), each with item-type accent color, icon, title, description
5. **AI Section** — Pro badge + checklist (left), code-mock card with syntax-tinted `<pre>` and "AI Generated Tags" demo (right)
6. **Pricing** — Free vs Pro cards per `project-overview.md` §9 ($0/50 items/3 collections vs $8mo·$72yr/unlimited+AI), monthly/yearly toggle, `PRO · ARCHMAGE` badge on the Pro card
7. **CTA banner** — closing call-to-action with icon, heading, button
8. **Footer** — logo mark, Product/Company/Legal link columns, copyright with current year (`new Date().getFullYear()`, computed server-side — no client effect needed like the prototype's `footerYear` script)

## Link Destinations

| Element | Prototype | Real target |
|---|---|---|
| Nav logo | `#` | `/` |
| Nav "Sign In" | `#` | `/sign-in` |
| Nav "Get Started Free" | `#` | `/register` |
| Nav search bar | readonly input | `onClick` → `router.push("/sign-in")` (no session to search yet) |
| Hero primary CTA "Get Started Free" | `#` | `/register` |
| Hero secondary CTA "Cast Your First Spell" | `#` | `/register` |
| Nav `Features` / `Pricing` | `#features`/`#pricing` | same — in-page anchors, keep as-is |
| Pricing "Start for Free" | `#` | `/register` |
| Pricing "Become an Archmage" | `#` | `/register` (checkout flow is a separate future feature — land on register for now) |
| CTA banner button | `#` | `/register` |
| Footer "Features"/"Pricing" | `#features`/`#pricing` | same |
| Footer "About"/"Blog"/"Privacy"/"Terms" | `#` | leave as `#` — pages don't exist yet, do not invent routes |

Use Next.js `Link` for every internal route (`/sign-in`, `/register`) and same-page `#anchor` links; plain `<a>` only where the spec above explicitly says to leave as `#` placeholders.

## Out of Scope

- Stripe checkout wiring on the Pricing CTA (just routes to `/register` for now)
- Live data in the dashboard-preview mockup — stays static/illustrative
- New legal/about/blog pages

## Reference

- `prototypes/homepage/index.html`, `styles.css`, `script.js` — source of truth for structure, copy, and animation behavior
- `context/features/homepage-mockup-spec.md` — original design brief (vocabulary, design tokens, animation specs)
- `src/lib/item-types.ts` — item-type colors/icons
- `src/app/globals.css` — existing design tokens to reuse
