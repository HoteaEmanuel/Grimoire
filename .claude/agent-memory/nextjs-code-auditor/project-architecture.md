---
name: project-architecture
description: Grimoire codebase architectural decisions and confirmed-correct conventions — updated after auth implementation (June 2026)
metadata:
  type: project
---

Grimoire is a Next.js 16 App Router app (React 19, TypeScript strict, Tailwind v4, Prisma 6 + Neon, NextAuth v5, Resend email). Auth is now fully implemented.

**Auth pattern (split config):**
- `src/auth.config.ts` — edge-compatible, no Prisma; GitHub + Credentials placeholder (`authorize: () => null`)
- `src/auth.ts` — full config with PrismaAdapter, bcrypt Credentials, JWT/session callbacks
- `src/proxy.ts` — named export `proxy` (not default `middleware`); protects `/dashboard/*`, blocks unverified credentials users, redirects to `/verify-email`
- JWT callback: stores `emailVerified` and GitHub avatar (`profile.avatar_url`) in token
- `allowDangerousEmailAccountLinking: true` on GitHub provider — intentional for linking OAuth to seeded user

**DB layer:** All queries in `src/lib/db/items.ts` and `src/lib/db/collections.ts`. Accept `userId` param (from real session now, not seed email). Use `select` to avoid large fields. Try/catch with graceful empty returns on all 7 functions.

**Indexes confirmed present:** `Item(userId)`, `Item(userId, lastUsedAt)`, `Item(userId, isPinned)`, `Collection(userId)`, `Collection(userId, updatedAt)`, `ItemCollection(collectionId)`.

**No `any` types** in src/. One `as unknown as` in `prisma.ts` (standard globalThis pattern — correct).

**Confirmed correct conventions:**
- Tailwind CSS v4 with `@theme` in globals.css — no tailwind.config.ts (correct)
- `prisma migrate dev` only (no `db push` — spec forbids it)
- `force-dynamic` on dashboard layout and page (correct for auth session)
- `Promise.all` used on dashboard page and layout for parallel fetches (correct)
- `shadcn/ui` components in `src/components/ui/` (correct location)
- `resend-verification` always returns 200 to avoid user enumeration (correct security pattern)
- `verify-email` uses Prisma `$transaction` to atomically update + delete token (correct)
- `ICON_MAP` now extracted to `src/lib/item-types.ts` (deduplication done)
- `SidebarUserFooter` marked `'use client'` (correct)
- `DashboardShell` is server component; `DesktopSidebarController` + `MobileSheetController` are client (correct split)

**Issues to watch in future audits:**
- No rate limiting on auth API routes (`/api/auth/register`, `/api/auth/resend-verification`) — spam/DoS vector
- `auth()` is called in both `dashboard/layout.tsx` AND `dashboard/page.tsx` — two JWT decodes per full page load
- `resend-verification` route accepts raw email string, no Zod validation
- `verify-email` GET route has no try/catch around Prisma calls
- `getDevUser()` in `src/lib/db/user.ts` appears unused now that real auth is wired
- Naive pluralization: `type.name + "s"` in SidebarContent line 65 would produce "Linkss" — but item types are "Snippet", "Prompt", "Note", "Command", "Link", "File", "Image" so "Links" actually becomes "Links" + "s" = "Linkss" — confirmed bug
