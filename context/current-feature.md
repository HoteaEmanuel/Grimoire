## Current Feature

Code Quality & Performance Fixes (Code Scanner Audit)

## Status

Completed

## Goals

Address all issues found by the code scanner audit. Grouped by priority:

**Critical**
- Move hardcoded `emanuelhotea1@gmail.com` to `SEED_USER_EMAIL` env var; resolve user once per request, not per DB function; pass user info as props instead of hardcoding in JSX

**High**
- Add try/catch with graceful empty-returns to all DB query functions
- Resolve `userId` once per server component render (not once per DB call), eliminating 5+ redundant `SELECT id FROM User WHERE email = $1` round-trips per page load
- Add missing database indexes via Prisma migration: `Item(userId)`, `Item(userId, lastUsedAt)`, `Item(userId, isPinned)`, `Collection(userId)`, `Collection(userId, updatedAt)`, `ItemCollection(collectionId)`

**Medium**
- Use targeted `select` in nested collection includes to exclude `content` and other large item fields when computing dominant type color
- Extract shared `ICON_MAP` to `src/lib/item-types.ts` (currently duplicated in `SidebarContent.tsx` and `CollectionCard.tsx`)
- Remove silently-ignored `isFavorite` prop from `CollectionCard`
- Refactor `DashboardShell` from client component to server component by extracting `DesktopSidebarController` and `MobileSheetController` client components

**Low**
- Add `'use client'` to `SidebarUserFooter.tsx` (uses Radix Tooltip without the directive)
- Remove the dead `:root` CSS block in `globals.css` (`.dark` is always active; `:root` is never applied)
- Use `prisma.tag.createMany` in `seed.ts` instead of a sequential loop

## Notes

- DB function signatures change to accept `userId: string` as a parameter — call sites in layout.tsx and page.tsx resolve userId once via `getDevUser()` and pass it down
- When NextAuth is wired up, `getDevUser()` is replaced by `session.user.id` at the call sites — no changes needed inside the DB functions themselves
- `DashboardShell` becomes a server component; `MobileSheetController` renders `<Header>` in its own position in the flex column (Sheet portals to body anyway)

## History

- **Initial setup - 2026-06-13** — Initial Next.js 15 + Tailwind CSS v4 project setup. Initialized git repository, connected to remote, and pushed to `main`.

- **Dashboard Phase 1 - 2026-06-13** — shadcn/ui initialization, `/dashboard` route, dark warm-brown theme, top bar with search + New Item + New Collection buttons, sidebar and main area placeholders.

- **Dashboard Phase 2 - 2026-06-13** — Collapsible sidebar with desktop collapse toggle and mobile Sheet drawer. Item types list with per-type item counts. Collapsible Collections section with Favorites and Recent sub-groups. User avatar footer. Extracted `Header`, `Sidebar`, `SidebarContent`, `SidebarCollapsibleSection`, `SidebarNavItem`, `SidebarCollectionItem`, `SidebarSection`, `SidebarUserFooter` components. Installed shadcn tooltip, avatar, separator, sheet, and collapsible.

- **Dashboard Phase 3 - 2026-06-13** — Main content area with 4 stats cards, Recent Collections, Pinned Items, and 10 Recent Items sections. Grimoire design tokens (arcane, ember, parchment, rune), gradient card styles, `tome-card` utility, `--shadow-tome`/`--shadow-glow`. Font swap to Inter + Cinzel + JetBrains Mono. Animated wand with sparkle burst on hover. Installed shadcn card and badge.

- **Seed Data - 2026-06-13** — Rewrote `prisma/seed.ts` with bcrypt password, idempotent strategy, system item types, collections, and items per spec.

- **Dashboard Collections - 2026-06-13** — Replaced mock collection data with real Neon DB queries via Prisma. Created `src/lib/db/collections.ts` with `getRecentCollections` and `getCollectionStats`. Dashboard page is now async and fetches live data. Collection cards show border color from dominant item type and small icons for all types present. Stats cards for Collections and Favorite Collections now show real counts.

- **Dashboard Items - 2026-06-13** — Replaced mock item data with real Neon DB queries. Created `src/lib/db/items.ts` with `getPinnedItems`, `getRecentItems`, and `getItemStats`. Dashboard page now fetches all data in parallel. Stats cards for Total Items and Favorite Items show real counts. Pinned and Recent Items sections render from DB. Removed all mock-data usage from the dashboard page.

- **Stats & Sidebar Real Data - 2026-06-13** — Replaced all mock data in sidebar with real DB queries. Added `getSidebarItemTypes` (with per-type item counts, custom order) to `items.ts` and `getSidebarCollections` (favorites + recent with dominant type color) to `collections.ts`. Sidebar data is fetched server-side in `DashboardLayout` and threaded as props through `DashboardShell` → `Sidebar` / `SidebarContent`. Added "View all collections →" link. Removed mock-data dependency from `SidebarContent`.

- **Pro Sidebar Badge - 2026-06-15** — Added a PRO badge (shadcn `Badge`) to the Files and Images item types in the sidebar. Badge uses the project's arcane purple tokens (subtle tinted background, matching border, bold uppercase text). Added `isPro?: boolean` prop to `SidebarNavItem`; `SidebarContent` passes it based on slug. Badge hides automatically when sidebar is collapsed.

- **Code Quality & Performance Fixes - 2026-06-15** — Addressed all issues from code scanner audit. Added Prisma migration `add_query_indexes` with indexes on `Item(userId)`, `Item(userId, lastUsedAt)`, `Item(userId, isPinned)`, `Collection(userId)`, `Collection(userId, updatedAt)`, `ItemCollection(collectionId)`. Moved hardcoded email to `SEED_USER_EMAIL` env var; created `src/lib/db/user.ts` with `getDevUser()`. All DB functions now accept `userId` as a parameter — layout and page each resolve userId once. Added try/catch with graceful empty returns to all 7 DB functions. Used targeted `select` to exclude large item fields from collection includes. Extracted shared `ICON_MAP` to `src/lib/item-types.ts` (removed duplication from `SidebarContent` and `CollectionCard`). Removed silent `isFavorite` prop from `CollectionCard`. Converted `DashboardShell` to a server component by extracting `DesktopSidebarController` and `MobileSheetController` client components. Added `'use client'` to `SidebarUserFooter`. Removed dead `:root` CSS block. Updated seed to use `createMany` for tags.

- **Dashboard Loading Skeletons - 2026-06-15** — Added shadcn `Skeleton` component. Created `StatsCardSkeleton`, `CollectionCardSkeleton`, and `ItemCardSkeleton` components that mirror the exact layout of their real counterparts. Added `src/app/dashboard/loading.tsx` which Next.js serves automatically while the dashboard page fetches data — shows heading, 4 stat skeletons, 6 collection skeletons, and 9 item skeletons.
