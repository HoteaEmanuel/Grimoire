## Current Feature

**Seed Data**

## Status

Completed

## Goals

- Rewrite `prisma/seed.ts` to follow `context/features/seed-spec.md`
- Hash user password with bcryptjs (12 rounds)
- Seed system item types, collections, and items per spec
- Make seed fully idempotent (reset user data before recreating)

## Notes

- Full reset strategy: delete all items/collections/tags for the seed user, then recreate
- User upsert + system item types upsert are safe across re-runs
- Seed is dev-only — never runs in production

## Goals

- Install Prisma 7 with the new `prisma-client` generator and required `output` field
- Connect to Neon serverless PostgreSQL via `@prisma/adapter-pg` + `pg`
- Create full schema from the data models in `project-overview.md` (User, Account, Session, VerificationToken, ItemType, Item, Collection, ItemCollection, Tag, TagsOnItems)
- Configure `prisma.config.ts` for CLI tooling (migrations, generate)
- Create `src/lib/prisma.ts` singleton with driver adapter
- Create initial migration (`prisma migrate dev`)

## Notes

- Always create migrations (`prisma migrate dev`) — never `prisma db push`
- Dev branch uses `DATABASE_URL` from `.env`; production uses a separate Neon branch
- Prisma 7 requires driver adapter passed to `PrismaClient` constructor (not via config)
- `prisma.config.ts` handles CLI tooling; `src/lib/prisma.ts` handles runtime queries
- Generated client output: `src/generated/prisma`

## History

- **Initial setup - 2026-06-13** — Initial Next.js 15 + Tailwind CSS v4 project setup. Initialized git repository, connected to remote, and pushed to `main`.
- **Dashboard Phase 1 - 2026-06-13** — shadcn/ui initialization, `/dashboard` route, dark warm-brown theme, top bar with search + New Item + New Collection buttons, sidebar and main area placeholders.
- **Dashboard Phase 2 - 2026-06-13** — Collapsible sidebar with desktop collapse toggle and mobile Sheet drawer. Item types list with per-type item counts. Collapsible Collections section with Favorites and Recent sub-groups. User avatar footer. Extracted `Header`, `Sidebar`, `SidebarContent`, `SidebarCollapsibleSection`, `SidebarNavItem`, `SidebarCollectionItem`, `SidebarSection`, `SidebarUserFooter` components. Installed shadcn tooltip, avatar, separator, sheet, and collapsible.
- **Dashboard Phase 3 - 2026-06-13** — Main content area with 4 stats cards, Recent Collections, Pinned Items, and 10 Recent Items sections. Grimoire design tokens (arcane, ember, parchment, rune), gradient card styles, `tome-card` utility, `--shadow-tome`/`--shadow-glow`. Font swap to Inter + Cinzel + JetBrains Mono. Animated wand with sparkle burst on hover. Installed shadcn card and badge.
