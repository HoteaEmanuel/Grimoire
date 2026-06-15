## Current Feature

**Pro Sidebar Badge**

## Status

In Progress

## Goals

- Add a PRO badge to the "Files" and "Images" item types in the sidebar only
- Use the shadcn `Badge` component for the badge
- Badge should be a small, subtle element with bold uppercase "PRO" text, positioned to the right of the item type name
- Use a distinct color (e.g. blue or red) that stands out without overpowering the label
- Badge must be responsive and look good at all screen sizes

## Notes

- Only "Files" and "Images" types get the badge — not Snippets, Prompts, Commands, Notes, or Links
- Badge component is already installed (used in Dashboard Phase 3)
- The `isPro` flag exists on `SYSTEM_ITEM_TYPES` in `src/lib/item-types.ts` — use this to conditionally render the badge

## History

- **Initial setup - 2026-06-13** — Initial Next.js 15 + Tailwind CSS v4 project setup. Initialized git repository, connected to remote, and pushed to `main`.
- **Dashboard Phase 1 - 2026-06-13** — shadcn/ui initialization, `/dashboard` route, dark warm-brown theme, top bar with search + New Item + New Collection buttons, sidebar and main area placeholders.
- **Dashboard Phase 2 - 2026-06-13** — Collapsible sidebar with desktop collapse toggle and mobile Sheet drawer. Item types list with per-type item counts. Collapsible Collections section with Favorites and Recent sub-groups. User avatar footer. Extracted `Header`, `Sidebar`, `SidebarContent`, `SidebarCollapsibleSection`, `SidebarNavItem`, `SidebarCollectionItem`, `SidebarSection`, `SidebarUserFooter` components. Installed shadcn tooltip, avatar, separator, sheet, and collapsible.
- **Dashboard Phase 3 - 2026-06-13** — Main content area with 4 stats cards, Recent Collections, Pinned Items, and 10 Recent Items sections. Grimoire design tokens (arcane, ember, parchment, rune), gradient card styles, `tome-card` utility, `--shadow-tome`/`--shadow-glow`. Font swap to Inter + Cinzel + JetBrains Mono. Animated wand with sparkle burst on hover. Installed shadcn card and badge.
- **Seed Data - 2026-06-13** — Rewrote `prisma/seed.ts` with bcrypt password, idempotent strategy, system item types, collections, and items per spec.
 - **Dashboard Collections - 2026-06-13** — Replaced mock collection data with real Neon DB queries via Prisma. Created `src/lib/db/collections.ts` with `getRecentCollections` and `getCollectionStats`. Dashboard page is now async and fetches live data. Collection cards show border color from dominant item type and small icons for all types present. Stats cards for Collections and Favorite Collections now show real counts.
- **Dashboard Items - 2026-06-13** — Replaced mock item data with real Neon DB queries. Created `src/lib/db/items.ts` with `getPinnedItems`, `getRecentItems`, and `getItemStats`. Dashboard page now fetches all data in parallel. Stats cards for Total Items and Favorite Items show real counts. Pinned and Recent Items sections render from DB. Removed all mock-data usage from the dashboard page.
- **Stats & Sidebar Real Data - 2026-06-13** — Replaced all mock data in sidebar with real DB queries. Added `getSidebarItemTypes` (with per-type item counts, custom order) to `items.ts` and `getSidebarCollections` (favorites + recent with dominant type color) to `collections.ts`. Sidebar data is fetched server-side in `DashboardLayout` and threaded as props through `DashboardShell` → `Sidebar` / `SidebarContent`. Added "View all collections →" link. Removed mock-data dependency from `SidebarContent`.
