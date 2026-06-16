---
name: project-auth-patterns
description: Auth security patterns confirmed correct and issues found in Grimoire's NextAuth v5 auth system
metadata:
  type: project
---

Auth system uses NextAuth v5 (Auth.js) with JWT strategy, PrismaAdapter, and a split config pattern (auth.config.ts for edge, auth.ts for full config).

Token security: VerificationTokens are SHA-256 hashed before DB storage via hashToken() in src/lib/auth-constants.ts. Raw tokens go in emails; hashes go in DB. This is correctly implemented.

**Why:** Prior audit pass added this hashing to prevent DB-read token theft.

**How to apply:** Do not re-flag token hashing — it is working correctly.

## Confirmed Issues Found (June 2026 audit)

### CRITICAL
- `.env.production` contains live production secrets (DATABASE_URL, AUTH_SECRET, GitHub OAuth, Upstash Redis, Resend API key). File is gitignored but exists on disk. Credentials should be rotated immediately.
- Middleware not active: `src/proxy.ts` exports `proxy` and `config` as named exports but there is no `middleware.ts` file at project root or `src/`. The middleware-manifest.json confirms middleware is empty — ALL route protection is non-functional in production builds.

### HIGH
- `src/app/api/auth/register/route.ts` line 27: returns `{ error: "Email already in use" }` with 409 — explicit email enumeration.
- `src/app/api/profile/change-password/route.ts` and `delete-account/route.ts`: no try/catch — unhandled Prisma errors expose stack traces.
- `src/app/api/auth/verify-email/route.ts`: `email` query param used in Prisma `where` clause with no Zod/format validation.

### MEDIUM
- `src/app/api/profile/change-password/route.ts` and `delete-account/route.ts`: no rate limiting on authenticated mutation endpoints.
- `src/app/api/auth/verify-email/route.ts`: hashToken() called multiple times per request (minor inefficiency, not a security risk).
- Password minimum of 8 chars with no complexity requirements (low bar, but consistent with project spec).

### LOW
- `resend-verification` rate limit check is inside try block after body parse — an invalid JSON body short-circuits before rate limiting runs (though this is a minor bypass since invalid JSON returns 200 anyway).
