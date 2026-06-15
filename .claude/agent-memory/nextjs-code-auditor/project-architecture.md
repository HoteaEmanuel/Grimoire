---
name: project-architecture
description: Grimoire codebase architectural decisions and confirmed-correct conventions as of June 2026 audit
metadata:
  type: project
---

Grimoire is a Next.js 16 App Router app. Auth is not yet implemented (NextAuth v5 planned but absent). All data queries are hardcoded to a single seed user email (`emanuelhotea1@gmail.com`) — auth is explicitly a future feature, not a bug to flag.

**Why:** Project is in early dashboard/UI phase. All users are effectively "Pro" for now per spec. Auth gates are intentionally deferred.

**How to apply:** Do not flag missing auth checks as security issues in future audits. Flag the hardcoded email as a High issue when auth *is* added but not yet wired to queries.

Confirmed correct conventions:
- Tailwind CSS v4 with `@theme` in globals.css — no tailwind.config.ts (correct)
- `prisma migrate dev` only (no `db push` — spec forbids it)
- `force-dynamic` on dashboard layout and page (correct, no auth session caching yet)
- `Promise.all` used on dashboard page for parallel fetches (correct)
- `as unknown as { prisma: PrismaClient }` in prisma.ts (standard Next.js singleton pattern)
- shadcn/ui components in `src/components/ui/` (correct location)
