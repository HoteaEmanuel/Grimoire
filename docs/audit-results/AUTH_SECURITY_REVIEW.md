# Auth Security Review
**Last audited:** 2026-06-16
**Auditor:** auth-auditor agent
**Scope:** Authentication flows — password hashing, token security, email verification, password reset, profile mutations, proxy middleware

---

## 🟠 HIGH

### H1 — `allowDangerousEmailAccountLinking: true` in BOTH config files enables account takeover
**Files:** `src/auth.ts` (line 40), `src/auth.config.ts` (line 16)

This flag instructs NextAuth to automatically merge a GitHub OAuth sign-in into an existing credentials account if the email address matches — with no ownership proof required. The attack path is:

1. Attacker knows a victim's registered email address.
2. Attacker creates a GitHub account with that same email.
3. Attacker signs into Grimoire with GitHub → NextAuth links the GitHub account to the victim's credentials account automatically.
4. Attacker now has full access to the victim's account.

The flag exists in **both** `auth.config.ts` (used by the edge middleware/proxy) and `auth.ts` (used by the full NextAuth config). Removing it from `auth.config.ts` but not `auth.ts` (or vice versa) would not fully close the hole.

**Fix:** Remove `allowDangerousEmailAccountLinking: true` from both files. Handle the "same email on two providers" case by redirecting to a merge-confirmation UI or by showing an error instructing the user to sign in with their original method first.

```ts
// auth.ts and auth.config.ts — remove the option entirely
GitHub()  // default: no dangerous linking
```

---

### H2 — No rate limiting on brute-forceable auth endpoints
**Files:** `src/app/api/auth/reset-password/route.ts`, `src/app/api/profile/change-password/route.ts`, `src/auth.ts` (Credentials `authorize`)

None of the following endpoints implement any form of rate limiting or account lockout:

- `POST /api/auth/reset-password` — accepts arbitrary password guesses against a token; 64 hex chars = 2^256 space, so brute force of the token itself is infeasible, but the endpoint is still an unbounded POST target.
- `POST /api/profile/change-password` — an attacker with a valid session (e.g., on a shared computer) can make unlimited `currentPassword` guesses.
- The Credentials `authorize` callback in `auth.ts` — unlimited sign-in attempts with any password.

The project already lists Upstash Redis in the stack for "rate limiting" (`context/project-overview.md`) but it is not wired up anywhere yet.

**Fix:** Add Upstash `@upstash/ratelimit` middleware (or a simple in-memory / IP-based limiter for MVP) on at minimum: sign-in, forgot-password, reset-password, and change-password. Example:

```ts
// Reject after 5 attempts per IP per 15 minutes
const ratelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "15m") })
const { success } = await ratelimit.limit(ip)
if (!success) return NextResponse.json({ error: "Too many attempts" }, { status: 429 })
```

---

## 🟡 MEDIUM

### M1 — Registration creates a user before sending the verification email — account is orphaned on email failure
**File:** `src/app/api/auth/register/route.ts` (lines 28–45)

The flow is:
1. `prisma.user.create(...)` — user row committed to DB
2. `prisma.verificationToken.create(...)` — token committed
3. `sendVerificationEmail(...)` — Resend API call (can throw)

If step 3 throws (Resend outage, misconfigured `RESEND_API_KEY`, network error), the user exists in the database but never receives a verification email. They cannot sign in (proxy blocks unverified users), cannot re-trigger verification because `POST /api/auth/resend-verification` silently succeeds without emailing (the `sendVerificationEmail` call inside it can also fail silently — the outer catch returns `{ error: "Internal server error" }` only after the token was already replaced).

Additionally, the registration endpoint returns HTTP 201 (success), so the client assumes the email was sent when it was not.

**Fix:** Wrap steps 1–3 in a try/catch that either rolls back user creation on email failure, or separates the concerns clearly: attempt to send email first, only persist user if it succeeds, or handle failure by surfacing a "we couldn't send the email — try resending" state instead of returning 201.

---

### M2 — `verify-email` redirects an expired/invalid token to `/sign-in?error=token-expired` instead of the verification page
**File:** `src/app/api/auth/verify-email/route.ts` (lines 21–24)

When a token is expired or the email parameter doesn't match, users are redirected to `/sign-in?error=token-expired`. This means they land on the sign-in page where they will be immediately redirected back to `/verify-email` (by the proxy) before they can act on the error message. The `AuthToast` toast will display briefly before the redirect fires, but the user experience is poor and the recovery path (resend verification) is on the `/verify-email` page, not `/sign-in`.

**Fix:** Redirect expired verification tokens to `/verify-email?error=token-expired&email=<email>` so the user lands on a page with a "Resend verification email" button.

---

### M3 — Plaintext tokens in the database — a DB read is sufficient to take over any account
**Files:** `src/app/api/auth/register/route.ts` (line 38), `src/app/api/auth/resend-verification/route.ts` (line 38), `src/app/api/auth/forgot-password/route.ts` (line 38)

All three flows store the raw `crypto.randomBytes(32).toString("hex")` token directly in the `VerificationToken.token` column. If an attacker gains read access to the database (via SQL injection elsewhere, a Neon misconfiguration, or a compromised backup), they can:

- Enumerate all active password-reset tokens and immediately reset any user's password.
- Enumerate all active email-verification tokens and verify any account.

Tokens have a 15-minute window, but in a breach scenario that window is irrelevant — the attacker reads and uses them immediately.

**Fix:** Hash tokens before storage using `crypto.createHash("sha256").update(token).digest("hex")`. Keep the raw token in the email link only. On verification, hash the incoming token and compare to the stored hash.

```ts
const rawToken = crypto.randomBytes(32).toString("hex")
const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex")
// Store hashedToken in DB; send rawToken in email
```

---

### M4 — `reset-password` deletes the token only on a valid flow — expired token deletion is a best-effort no-op
**File:** `src/app/api/auth/reset-password/route.ts` (lines 33–38)

When the token is expired or the email doesn't match, the code calls `prisma.verificationToken.deleteMany({ where: { token } })` before returning the 400 error. This is a good intent (prevent replay), but it is outside a transaction and runs on an already-failed path. If `deleteMany` throws (e.g., a transient DB error), the expired token remains in the database. While expired tokens cannot be used (expiry is checked), this is an inconsistency worth noting.

More significantly: the same `RESET_PREFIX` constant is defined independently in **two separate files** (`forgot-password/route.ts` line 9 and `reset-password/route.ts` line 12). If one is changed and the other is not, reset tokens will permanently fail to validate with no error message explaining why.

**Fix:** Extract `RESET_PREFIX` to a shared constant in `src/lib/auth-constants.ts` and import it in both files.

```ts
// src/lib/auth-constants.ts
export const RESET_TOKEN_PREFIX = "reset:"
```

---

## 🟢 LOW / INFORMATIONAL

### L1 — `deleteMany` instead of `deleteOne` for token cleanup in `resend-verification` and `forgot-password` could delete tokens in bulk on identifier collision
**Files:** `src/app/api/auth/resend-verification/route.ts` (line 36), `src/app/api/auth/forgot-password/route.ts` (lines 34–36)

Both use `deleteMany({ where: { identifier: email } })` before issuing a new token. Since `VerificationToken.identifier` is not unique on its own (only the composite `[identifier, token]` is unique per schema), this is the correct approach to replace all old tokens. This is intentional and correct, but it is worth noting that if the reset prefix and the plain email identifier ever collide (they cannot with the current namespace design), a forgot-password request could delete email-verification tokens for the same address. The namespace separation (`reset:{email}` vs `{email}`) prevents this. No action required — just noted for awareness.

---

### L2 — No password complexity requirement beyond minimum length
**File:** `src/lib/schemas/auth.ts` (lines 12, 37)

Both `registerSchema` and `changePasswordSchema` enforce only `min(8)`. There is no requirement for mixed case, numbers, or symbols. This is a product decision (not a bug), but passwords like `aaaaaaaa` are accepted. Consider adding a regex check or `zxcvbn`-style strength requirement.

---

### L3 — `auth.ts` returns the full `user` object from Credentials `authorize` — includes all DB fields
**File:** `src/auth.ts` (lines 53–59)

The `prisma.user.findUnique({ where: { email } })` call returns all columns on the `User` model, including `password` (hashed), `stripeCustomerId`, `stripeSubscriptionId`, and `isPro`. The full object is then returned from `authorize` and passed to the `jwt` callback. NextAuth only picks specific fields (`id`, `name`, `email`, `image`) for the JWT, so the sensitive fields are not serialized to the cookie. However, the raw DB row (with hashed password) flows through NextAuth's internals.

**Fix (optional hardening):** Use a targeted `select` in the Prisma query to avoid fetching sensitive fields that are never needed:

```ts
const user = await prisma.user.findUnique({
  where: { email },
  select: { id: true, name: true, email: true, image: true, password: true, emailVerified: true }
})
```

---

## ✅ Passed Checks

- **bcrypt rounds:** Registration and password reset both use `bcrypt.hash(password, 12)`, exceeding the minimum of 10.
  - Files: `src/app/api/auth/register/route.ts` (line 25), `src/app/api/auth/reset-password/route.ts` (line 41), `src/app/api/profile/change-password/route.ts` (line 35)

- **Timing-safe password comparison:** All password verification uses `bcrypt.compare()`, which is internally timing-safe.
  - Files: `src/auth.ts` (line 56), `src/app/api/profile/change-password/route.ts` (line 30)

- **Token entropy:** All tokens are generated with `crypto.randomBytes(32).toString("hex")` — 256 bits of CSPRNG entropy.
  - Files: `src/app/api/auth/register/route.ts` (line 38), `src/app/api/auth/resend-verification/route.ts` (line 38), `src/app/api/auth/forgot-password/route.ts` (line 38)

- **Token expiry enforced server-side:** All token lookups check `record.expires < new Date()` at verification time, not just at creation.
  - Files: `src/app/api/auth/verify-email/route.ts` (line 21), `src/app/api/auth/reset-password/route.ts` (lines 29–33)

- **Single-use token deletion:** Both email verification and password reset delete the token atomically in a `$transaction` after successful use.
  - Files: `src/app/api/auth/verify-email/route.ts` (lines 26–34), `src/app/api/auth/reset-password/route.ts` (lines 43–51)

- **Token namespace separation:** Password reset tokens use the `reset:{email}` prefix as identifier; email verification tokens use bare `{email}`. These cannot be used interchangeably — both lookup routes validate `record.identifier === expected`.
  - Files: `src/app/api/auth/forgot-password/route.ts` (line 9), `src/app/api/auth/reset-password/route.ts` (line 12, 31)

- **OAuth-only accounts skipped in password reset:** `forgot-password` checks `!user?.password` and silently returns 200 for OAuth-only accounts, preventing enumeration.
  - File: `src/app/api/auth/forgot-password/route.ts` (lines 28–31)

- **Email enumeration prevention:** Both `forgot-password` and `resend-verification` always return HTTP 200 regardless of whether the email exists or is verified.
  - Files: `src/app/api/auth/forgot-password/route.ts` (lines 17–18), `src/app/api/auth/resend-verification/route.ts` (lines 20–21, 31–33)

- **Resend invalidates old tokens:** `resend-verification` deletes all existing tokens for the identifier before issuing a new one.
  - File: `src/app/api/auth/resend-verification/route.ts` (line 36)

- **Profile mutations use session-derived userId:** Both `change-password` and `delete-account` call `getSession()` (which calls `auth()` server-side) and use `session.user.id` for all DB queries — no user-supplied identity accepted.
  - Files: `src/app/api/profile/change-password/route.ts` (lines 8–11, 22, 36), `src/app/api/profile/delete-account/route.ts` (lines 6–11)

- **Current password required for change:** `change-password` verifies the existing password with `bcrypt.compare` before allowing an update.
  - File: `src/app/api/profile/change-password/route.ts` (lines 30–33)

- **Cascade deletes in schema:** `User` → `Account`, `Session`, `Item`, `Collection`, `Tag` all use `onDelete: Cascade`. Deleting a user fully cleans up all associated data.
  - File: `prisma/schema.prisma`

- **Zod validation on all auth routes:** All auth API routes use Zod schemas before processing input.
  - Files: `src/app/api/auth/register/route.ts`, `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/reset-password/route.ts`, `src/app/api/profile/change-password/route.ts`

- **No raw SQL / template strings:** All DB operations use Prisma's typed query builder — no injection risk.
  - Confirmed across all audited files.

- **Proxy guards both `/dashboard` and `/profile`:** The middleware blocks unauthenticated and unverified users from both routes.
  - File: `src/proxy.ts` (lines 11–26)

- **Password not returned to client:** No Prisma select in any auth route returns `password` to the HTTP response.
  - Confirmed across all audited files.

---

## Summary
- **Total issues:** 7 (Critical: 0, High: 2, Medium: 4, Low: 1)
- **Most impactful fix:** Remove `allowDangerousEmailAccountLinking: true` from both `auth.ts` and `auth.config.ts` — it enables a trivial account takeover for any user whose email address is known.
- **Overall posture:** The core cryptographic primitives (bcrypt, CSPRNG tokens, timing-safe comparisons) are correctly implemented; the main risks are an architectural account-linking bypass, absence of rate limiting on credential endpoints, and plaintext token storage that would enable mass account takeover if the database were ever read by an attacker.
