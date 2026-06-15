---
name: audit-findings-june2026
description: Recurring anti-patterns and real issues found in June 2026 audit of Grimoire codebase
metadata:
  type: project
---

Key issues found in first full audit (June 2026):

**Critical:**
- Hardcoded real email address (`emanuelhotea1@gmail.com`) in production query files `src/lib/db/items.ts` and `src/lib/db/collections.ts` — used as the user identity stand-in before auth is wired up.
- Same email hardcoded in `src/components/layout/SidebarContent.tsx` (line 162) in the user footer.

**High:**
- No error handling (no try/catch) in any db query function in `src/lib/db/items.ts` or `src/lib/db/collections.ts`. Uncaught Prisma errors will bubble up as 500s with no user-friendly fallback.
- `getPinnedItems` and `getRecentItems` both call `getUserId()` separately, each making their own `prisma.user.findUnique` call. When called in parallel via `Promise.all` on dashboard page, this becomes 2 redundant user lookups per page load. Pattern also exists in collections.ts (3 separate user lookups).
- Missing database indexes on `Item.userId`, `Item.lastUsedAt`, `Collection.userId`, `Collection.updatedAt`, `ItemCollection.collectionId` — these are the columns most queried/sorted.

**Medium:**
- `getRecentCollections` and `getSidebarCollections` fetch ALL items inside each collection (deep nested include) just to compute dominant type color — this is an unbounded data load for large collections.
- Duplicate `ICON_MAP` defined in both `src/components/layout/SidebarContent.tsx` and `src/components/dashboard/CollectionCard.tsx` — should be extracted to a shared utility.
- `isFavorite` prop accepted but never used in `CollectionCard` component.
- `getSidebarItemTypes` fetches `prisma.itemType.findMany` without a `select` clause — pulls all columns when only id/name/slug/icon/color are needed.
- `DashboardShell` is a client component purely for `useState` — could be split so the shell layout is a server component and only the state-bearing interactivity is a small client component.

**Low:**
- `SidebarUserFooter` is not a `'use client'` component but is rendered inside `SidebarContent` which is. No bug, but clarifying the boundary would be cleaner.
- Dark/light CSS custom properties are fully duplicated between `:root` and `.dark` blocks in globals.css — since the app is dark-only with a fixed `.dark` class on `<html>`, `:root` values are never read.
- `CollectionCard` unused `Layers` import from lucide-react (used, actually — confirmed in render).
