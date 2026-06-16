---
name: audit-findings-june2026
description: Issues found in the second full audit (June 2026) — post-auth implementation
metadata:
  type: project
---

All prior issues from first audit (hardcoded emails, missing indexes, missing try/catch, duplicate ICON_MAP, DashboardShell client split) have been resolved.

**Issues found in second audit (post-auth, June 2026):**

**HIGH:**
- No rate limiting on `/api/auth/register` or `/api/auth/resend-verification` — registration spam / email bombing vector. Fix: add IP-based rate limiting (Upstash Redis / middleware).
- `allowDangerousEmailAccountLinking: true` on GitHub provider — if attacker registers an unverified email account that matches a victim's GitHub email, then victim signs in with GitHub, the accounts link. Currently partially mitigated because credentials users must verify email before dashboard access, but the attack window between registration and verification is real.
- `/api/auth/verify-email` GET route has no try/catch — a Prisma error during the transaction will return an unhandled 500 with a stack trace instead of a redirect to the error page.
- `/api/auth/resend-verification` accepts `email` with no Zod validation — no max length, no format check (only `typeof email !== "string"` check).

**MEDIUM:**
- `auth()` called in both `dashboard/layout.tsx` and `dashboard/page.tsx` — two JWT decode operations per full page load. Pass userId or session as a prop from layout to page, or use a shared `getCachedSession()` helper.
- `SidebarContent.tsx` line 65: `type.name + "s"` naive pluralization — "Link" becomes "Links" then adds another "s" = "Linkss". Seed type names: Snippet→Snippets, Prompt→Prompts, Note→Notes, Command→Commands, Link→**Linkss** (bug), File→Files, Image→Images.
- `src/lib/db/user.ts` `getDevUser()` appears to be dead code — dashboard layout/page now use real `auth()` session. Should be deleted or clearly marked as dev-only utility.

**LOW:**
- `SignInForm.tsx` `handleResend()`: the cooldown timer starts even if the API call fails (interval is set before the try/catch resolves). Actually the cooldown is only set inside the `try` block before the `finally` (line 69 sets router.push then line 70 sets cooldown). But if `router.push` throws, cooldown still won't be set. Minor edge case.
- `verify-email/route.ts`: base URL resolution (`AUTH_URL ?? NEXTAUTH_URL ?? localhost`) is duplicated in both `email.ts` and `verify-email/route.ts`. Should be a shared constant in `src/lib/constants.ts`.
