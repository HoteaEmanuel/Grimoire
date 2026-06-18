---
name: project-audit-patterns
description: Recurring patterns, confirmed conventions, and architectural facts discovered during the June 2026 Grimoire security/quality audit
metadata:
  type: project
---

Audit performed 2026-06-17 covering src/, prisma/, and root configs.

**Why:** First full audit after feature-complete auth, item CRUD, file uploads, and dashboard were built.

**How to apply:** Use as baseline for future incremental audits — don't re-flag confirmed-correct patterns.

## Confirmed correct patterns (do NOT re-flag)
- All DB query functions accept `userId` and filter by it — ownership is correctly enforced at the DB layer
- Prisma `select` clauses are used on all query functions — no unbounded `findMany` without field selection
- `hashToken` (SHA-256) applied to all VerificationToken values before storage — tokens safe at rest
- Rate limiting applied to all 5 auth endpoints via Upstash with fail-open behavior
- `deleteMany` with userId filter used in `deleteItem` action — double ownership check (findFirst + deleteMany)
- Monaco editor is dynamically imported with `ssr: false` — correct bundle split
- Middleware (proxy.ts) correctly gates /dashboard/* and /profile/* routes

## Real issues found

### CRITICAL
1. `delete-account` API route (`src/app/api/profile/delete-account/route.ts` line 11) — no try/catch around `prisma.user.delete`. An unhandled DB error throws a 500 with no error body and the account may be partially deleted.

### HIGH
2. Upload route creates a second S3Client instance — `src/app/api/upload/route.ts` lines 23-32 instantiates its own `r2` client with non-null assertions on env vars, duplicating the client in `src/lib/r2.ts`. Two separate client instances; if R2 env vars are absent at runtime, the route throws an uncaught error instead of returning a clean 500.

3. `fileUrl` construction in download route is trust-sensitive — `src/app/api/download/[...key]/route.ts` line 24 builds the DB lookup URL as `` `${process.env.R2_PUBLIC_URL}/${key}` ``. If `R2_PUBLIC_URL` is undefined (env not set), this becomes `"undefined/{userId}/..."` and the DB lookup silently returns null → 404, leaking no data but silently failing downloads for all users.

4. `getRecentCollections` fetches ALL items per collection with no limit — `src/lib/db/collections.ts` lines 32-40. A collection with 10 000 items loads all of them just to compute dominant type color. Should use `take: 50` on the nested `items` include.

5. `getProfileData` — two-round-trip query — `src/lib/db/profile.ts` lines 32-36. `groupBy` returns itemTypeIds, then a second `findMany` fetches the types. This is acceptable but could be a single aggregation query.

### MEDIUM
6. LANGUAGES array duplicated in `ItemDrawer.tsx` (lines 51-78) and `CreateItemModal.tsx` (lines 31-36) — identical 28-item array. Should be a shared constant in `src/lib/item-types.ts` or `src/lib/constants.ts`.

7. `updateItem` DB function (`src/lib/db/items.ts` line 285) — `tagsOnItems.deleteMany` scoped only by `itemId`, not `userId`. Since Prisma then does `item.update({ where: { id, userId } })` in the same transaction, the tag delete is safe, but a race between transactions could theoretically delete tags for an item that belonged to another user if item IDs collided (CUIDs make this extremely unlikely, but not technically impossible without the extra guard).

8. No `try/catch` in `delete-account` route (CRITICAL item 1 above, also a code quality concern).

9. `getRecentItems` default limit is 10 but `getRecentItems` is also used without a limit argument in `dashboard/page.tsx` line 27 — technically fine but the limit param reads misleadingly.

10. `ItemCard` is a client component (`'use client'`) solely because of the `useState` for the copy button — could be kept simpler; not a bug.

### LOW
11. `SidebarUserFooter` — `initials` computation does not guard against empty `name` (line 35 `name.split(" ").map(n => n[0])` — if name is "" the result is `[""]` giving one blank initial). Passed `name: session.user.name ?? ""` so empty string reaches the component.

12. `next.config.ts` `remotePatterns` uses wildcard `*.r2.dev` hostname — allows any subdomain of r2.dev, not just the project bucket. Should be restricted to the specific subdomain from `R2_PUBLIC_URL`.

13. Missing `DATABASE_URL` in schema.prisma datasource block (uses no `url = env(...)`) — relies on Prisma picking up env automatically. Works in practice but is non-standard and would fail if DATABASE_URL is renamed.
