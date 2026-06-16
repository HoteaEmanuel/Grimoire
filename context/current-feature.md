## Current Feature

## Status

## Goals

## Notes

## History

- **Auth Setup - 2026-06-16** — Installed `next-auth@beta` and `@auth/prisma-adapter`. Split config pattern: `src/auth.config.ts` (edge-compatible, GitHub provider only) and `src/auth.ts` (full config with PrismaAdapter + JWT strategy + session callback to expose `user.id`). Created `src/proxy.ts` with named `export const proxy` per Next.js 16 convention — protects `/dashboard/*` by redirecting unauthenticated users to sign-in. Created `src/app/api/auth/[...nextauth]/route.ts` handler and `src/types/next-auth.d.ts` to augment Session with `user.id`. Added `allowDangerousEmailAccountLinking: true` to link GitHub OAuth to existing seeded user.


- **Initial setup - 2026-06-13** — Initial Next.js 15 + Tailwind CSS v4 project setup. Initialized git repository, connected to remote, and pushed to `main`.

- **Dashboard Phase 1 - 2026-06-13** — shadcn/ui initialization, `/dashboard` route, dark warm-brown theme, top bar with search + New Item + New Collection buttons, sidebar and main area placeholders.

- **Dashboard Phase 2 - 2026-06-13** — Collapsible sidebar with desktop collapse toggle and mobile Sheet drawer. Item types list with per-type item counts. Collapsible Collections section with Favorites and Recent sub-groups. User avatar footer. Extracted `Header`, `Sidebar`, `SidebarContent`, `SidebarCollapsibleSection`, `SidebarNavItem`, `SidebarCollectionItem`, `SidebarSection`, `SidebarUserFooter` components. Installed shadcn tooltip, avatar, separator, sheet, and collapsible.

- **Dashboard Phase 3 - 2026-06-13** — Main content area with 4 stats cards, Recent Collections, Pinned Items, and 10 Recent Items sections. Grimoire design tokens (arcane, ember, parchment, rune), gradient card styles, `tome-card` utility, `--shadow-tome`/`--shadow-glow`. Font swap to Inter + Cinzel + JetBrains Mono. Animated wand with sparkle burst on hover. Installed shadcn card and badge.

- **Seed Data - 2026-06-13** — Rewrote `prisma/seed.ts` with bcrypt password, idempotent strategy, system item types, collections, and items per spec.

- **Dashboard Collections - 2026-06-13** — Replaced mock collection data with real Neon DB queries via Prisma. Created `src/lib/db/collections.ts` with `getRecentCollections` and `getCollectionStats`. Dashboard page is now async and fetches live data. Collection cards show border color from dominant item type and small icons for all types present. Stats cards for Collections and Favorite Collections now show real counts.

- **Dashboard Items - 2026-06-13** — Replaced mock item data with real Neon DB queries. Created `src/lib/db/items.ts` with `getPinnedItems`, `getRecentItems`, and `getItemStats`. Dashboard page now fetches all data in parallel. Stats cards for Total Items and Favorite Items show real counts. Pinned and Recent Items sections render from DB. Removed all mock-data usage from the dashboard page.

- **Stats & Sidebar Real Data - 2026-06-13** — Replaced all mock data in sidebar with real DB queries. Added `getSidebarItemTypes` (with per-type item counts, custom order) to `items.ts` and `getSidebarCollections` (favorites + recent with dominant type color) to `collections.ts`. Sidebar data is fetched server-side in `DashboardLayout` and threaded as props through `DashboardShell` → `Sidebar` / `SidebarContent`. Added "View all collections →" link. Removed mock-data dependency from `SidebarContent`.

- **Pro Sidebar Badge - 2026-06-15** — Added a PRO badge (shadcn `Badge`) to the Files and Images item types in the sidebar. Badge uses the project's arcane purple tokens (subtle tinted background, matching border, bold uppercase text). Added `isPro?: boolean` prop to `SidebarNavItem`; `SidebarContent` passes it based on slug. Badge hides automatically when sidebar is collapsed.

- **Code Quality & Performance Fixes - 2026-06-15** — Addressed all issues from code scanner audit. Added Prisma migration `add_query_indexes` with indexes on `Item(userId)`, `Item(userId, lastUsedAt)`, `Item(userId, isPinned)`, `Collection(userId)`, `Collection(userId, updatedAt)`, `ItemCollection(collectionId)`. Moved hardcoded email to `SEED_USER_EMAIL` env var; created `src/lib/db/user.ts` with `getDevUser()`. All DB functions now accept `userId` as a parameter — layout and page each resolve userId once. Added try/catch with graceful empty returns to all 7 DB functions. Used targeted `select` to exclude large item fields from collection includes. Extracted shared `ICON_MAP` to `src/lib/item-types.ts` (removed duplication from `SidebarContent` and `CollectionCard`). Removed silent `isFavorite` prop from `CollectionCard`. Converted `DashboardShell` to a server component by extracting `DesktopSidebarController` and `MobileSheetController` client components. Added `'use client'` to `SidebarUserFooter`. Removed dead `:root` CSS block. Updated seed to use `createMany` for tags. Added shadcn `Skeleton`; created `StatsCardSkeleton`, `CollectionCardSkeleton`, `ItemCardSkeleton`; added `dashboard/loading.tsx` and `dashboard/error.tsx` error boundary with retry button.
