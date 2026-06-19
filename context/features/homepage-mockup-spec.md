# Grimoire Homepage Mockup Spec

Create a marketing homepage for **Grimoire** — a fast, searchable, AI-enhanced knowledge hub for developers. One grimoire holding all your spells: snippets, prompts, commands, links, notes, and files, centralized.

**Output:** `prototypes/homepage/` with `index.html`, `styles.css`, `script.js`

**Naming:** Use "Grimoire" consistently everywhere (logo, copy, dashboard-preview label). Do not use "DevStash."

**Reference screenshots:** `context/design/image.png`, `image1.png`, `image2.png` — these show the actual in-app fantasy-RPG vocabulary and styling. Match this tone, not a generic dark-SaaS look.

---

## In-World Vocabulary (use throughout — this is load-bearing for the vibe)

Per the reference screenshots, the app speaks in full magic terminology, not generic SaaS copy:

| Generic term      | Grimoire term                          |
| ------------------ | --------------------------------------- |
| Item                | Spell / Incantation                     |
| Collection          | Grimoire                                |
| Search              | "Ask the oracle..."                     |
| Create new item     | "Cast new spell"                        |
| User / Pro tier     | "Archmage" (e.g. badge: "PRO · ARCHMAGE") |
| Welcome banner      | "Welcome back, Archmage"                |
| Recently used       | "Recently invoked"                      |

Use this vocabulary in hero copy, the dashboard-preview mockup, CTA buttons (as playful secondary copy — keep a plain, unambiguous primary CTA like "Get Started Free" so first-time visitors aren't confused), and the nav search placeholder.

---

## Design Language (must match the live app, not a generic dark SaaS look)

Pull tokens straight from `src/app/globals.css` and `src/lib/item-types.ts`, and match the visual tone of the reference screenshots.

**Core tokens — ember is the dominant brand accent, arcane is secondary:**

- `--ember: oklch(0.70 0.18 40)` — warm gold/amber — **primary accent**: logo mark border, active nav states, PRO badges, primary CTA buttons, glow effects
- `--arcane: oklch(0.62 0.18 290)` — purple — **secondary accent**: used sparingly, mainly as one of the item-type dot colors (Prompt) and minor gradient touches
- `--parchment: oklch(0.88 0.04 80)` — warm off-white — body text on dark, aged-paper highlight details
- `--rune: oklch(0.70 0.14 175)` — teal/green — tertiary accent, used like the other item-type dots
- `--shadow-tome`: soft layered card shadow
- `--shadow-glow`: warm ember glow — hero book aura, button hovers, active nav item
- `tome-card` utility class for card backgrounds/borders
- Background reads near-black/espresso (not a lighter slate-gray dark mode) — match the reference screenshots' very dark, warm-toned background

**Typography:**

- Display/headings: Cinzel (`--font-display`), **rendered in small-caps or all-caps** for major headings (hero headline, section titles, logo wordmark) — matches "WELCOME BACK, ARCHMAGE" / "PROMPT LIBRARY" styling in the reference
- Body: Inter (`--font-sans`)
- Code/mono accents: JetBrains Mono (`--font-mono`) — AI-section code editor mockup, pricing numbers, item counts ("41 spells")

**Logo mark:** Rounded-square dark badge with a gold (`--ember`) border containing an open-book glyph — reuse this exact mark (not just a text wordmark) in the nav and footer, matching the reference screenshots' sidebar logo.

**Item type accent colors — use these exact values (not invented ones):**

| Type    | Hex       |
| ------- | --------- |
| Snippet | `#3b82f6` |
| Prompt  | `#8b5cf6` |
| Note    | `#fde047` |
| Command | `#f97316` |
| Link    | `#10b981` |
| File    | `#6b7280` |
| Image   | `#ec4899` |

Used on: feature card top-border/icon accents, dashboard-preview mockup card borders and nav-rail dots, item-card icons inside the grimoire visual (see Hero below).

---

## Hero Section (Main Focus)

"Chaos to order" concept, anchored by a **grimoire (spellbook) visual** as the central "order" element — the book itself is the product metaphor, not just a dashboard screenshot.

### Chaos Container (Left)

Box labeled "Your knowledge today..." containing 8 floating icons representing where developers currently scatter their knowledge:

- Notion, GitHub, Slack, VS Code logos
- Browser tabs, Terminal, Text file, Bookmark icons

**Animate:**

- Float around randomly, bouncing off walls
- Subtle rotation and scale pulsing
- Move away from mouse cursor on hover

### The Grimoire (Center)

An illustrated/CSS-built **spellbook**: a closed or partially-open book (parchment-colored pages, `--ember`-glowing rune/sigil on the cover, soft `--shadow-glow` aura) that visually "absorbs" the chaos icons on one side and "emits" order on the other.

- Cover rendered in dark leather tones with an arcane sigil, gold-bordered like the logo mark — could reuse/adapt the existing wand+sparkle motif from the dashboard hover interaction
- Pages glow faintly (`--shadow-glow`, ember-dominant tint) — pulsing animation
- On scroll-into-view or hover, the book can "open" slightly (CSS 3D page-flip or simple scale/rotate) to reinforce the transform
- Small floating embers/sparkles drift upward from the book, echoing the dashboard's sparkle-burst micro-interaction
- Tagline directly under the book: "One Grimoire. Every Spell." or similar
- Keep the left-to-right reading order: chaos → grimoire → dashboard preview, so the book still functions as the transform/pivot point

### Dashboard Preview (Right)

Box labeled "...with Grimoire" showing a simplified dashboard mockup, written in-world rather than generic:

- A stat-line header like "Your spellbook holds 179 incantations across 6 grimoires" (mirrors the real welcome-back banner)
- Mini nav-rail teaser using real categories with their dot colors: Snippets, Prompts, Commands, Notes, Links, Files (PRO), Images (PRO)
- Grid of item/grimoire cards with colored top borders or dots (item-type hex values above), named evocatively ("React Patterns," "Prompt Library," "Context Tomes") with counts like "41 spells"
- Card backgrounds/shadows use `tome-card` / `--shadow-tome` styling, not flat generic dark cards

---

## Other Sections

1. **Navigation** — Fixed top nav, logo mark + "Grimoire" small-caps Cinzel wordmark, "Features"/"Pricing" links, search input with placeholder "Ask the oracle...", Sign In/Get Started buttons. Active/hover states use `--ember`. Gets more opaque (dark, warm-tinted) on scroll.

2. **Hero Text** — Above the visual: "Stop Losing Your Developer Knowledge" headline (Cinzel small-caps, gradient using `--ember`→`--arcane`), subheadline about scattered knowledge, CTA buttons — primary "Get Started Free" (clear, unambiguous), secondary "Cast Your First Spell" or similar in-world flavor text. Primary button glows (`--shadow-glow`) on hover.

3. **Features** — 6 cards in a grid: Code Snippets, AI Prompts, Instant Search, Commands, Files & Docs, Collections. Each card uses its item-type accent color (top border + icon tint) and `tome-card` styling.

4. **AI Section** — Two columns: left has "Pro Feature" badge (ember-gold tinted, matching the existing sidebar PRO badge style) and a checklist of AI capabilities (auto-tag suggestions, AI summary, explain this code, prompt optimizer — per `project-overview.md` §3F). Right shows a code editor mockup (JetBrains Mono, macOS window dots like the real `CodeEditor` component) with an "AI Generated Tags" demo.

5. **Pricing** — Free ($0, 50 items, 3 collections) vs Pro ($8/mo, unlimited + AI features), per `project-overview.md` §9. Pro card highlighted with a "PRO · ARCHMAGE" badge (matching the reference screenshot's tier-badge styling) using `--ember`/`--shadow-glow`. Monthly/yearly toggle for the $72/yr option.

6. **CTA** — "Ready to Organize Your Knowledge?" with button, optionally with a small closed-grimoire icon motif echoing the hero.

7. **Footer** — Logo mark + "Grimoire" wordmark, link columns, copyright with current year.

---

## Animations

- **Chaos icons**: JavaScript animation using `requestAnimationFrame`. Icons drift, bounce off walls, repel from mouse cursor.
- **Grimoire (center)**: CSS glow-pulse on the book aura; optional open/page-flip on scroll-into-view or hover; drifting ember/sparkle particles.
- **Scroll**: Elements fade in when scrolling into view.
- **Navbar**: Gets more opaque on scroll.

---

## Responsive

- Mobile: Stack the chaos/grimoire/dashboard vertically, single-column grids.
- Grimoire stays centered between the stacked sections (no rotation needed since it's not a directional arrow) — consider shrinking it rather than reorienting it.
