# Stripe Integration — Phase 1: Core Infrastructure

## Overview

Lay the foundation for Stripe subscriptions before wiring up any checkout flow or webhooks: the Stripe client, env vars, session/JWT `isPro` sync, and the free-tier usage-limits module. This phase is testable entirely with `npm run test` — it does not require the Stripe CLI, a webhook endpoint, or a live Checkout session.

Reference: `docs/stripe-integration-plan.md` (full research + plan), §4.1–4.2 and the implementation order's steps 1–4 + 7 (limits module only, not the action wiring — that's Phase 2 since it depends on `session.user.isPro` existing first... actually limits-module + its unit tests fit here since they don't depend on webhooks; the *wiring into* `createItem`/`createCollection` also happens here since it only needs `session.user.isPro`, not checkout/webhooks).

## Requirements

- Fix the `.env.example` secret leak (unrelated prerequisite, do first)
- Install `stripe` SDK, add `src/lib/stripe.ts` singleton client
- Add new Stripe env vars across `.env`, `.env.example`, `.env.production`
- Expose `isPro` on the NextAuth session via the DB-sync JWT pattern
- Create `src/lib/limits.ts` with free-tier constants and wire enforcement into `createItem`/`createCollection`
- Gate file/image item creation server-side (action + upload route) behind `isPro`

## Out of Scope (Phase 2)

- Stripe Dashboard product/price/webhook setup
- `/api/webhooks/stripe` route
- `createCheckoutSession`/`createBillingPortalSession` actions
- `BillingCard` UI and `/settings` integration
- `CreateItemModal`/`SidebarContent` Pro-badge UI updates

## Security Cleanup (do first)

- `.env.example` currently has real, filled-in Stripe test keys (`sk_test_...`, `pk_test_...`, both price IDs) instead of placeholders — revert to blank `KEY=` values matching the existing pattern for `STRIPE_WEBHOOK_SECRET=`
- Rotate the affected test keys in the Stripe Dashboard since they've been sitting in a committed file

## Implementation

### 1. Stripe client

- `npm install stripe`
- `src/lib/stripe.ts` — singleton, throws if `STRIPE_SECRET_KEY` is unset, mirrors the `src/lib/prisma.ts` singleton pattern

### 2. Environment variables

Add to `.env`, `.env.example`, `.env.production` (blank placeholders in the example/production files):

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ID_MONTHLY=
STRIPE_PRICE_ID_YEARLY=
```

Drop the non-public `STRIPE_PUBLISHABLE_KEY` — only `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is needed (server never needs the publishable key; Checkout/Billing Portal only need `STRIPE_SECRET_KEY`).

### 3. Session/JWT `isPro` sync

- `src/types/next-auth.d.ts` — add `isPro: boolean` to the augmented `Session["user"]` and `JWT` interfaces
- `src/auth.ts` — in the `jwt` callback, after the existing `token.id`/`token.picture` logic, re-query `isPro` from the DB on every call:

```typescript
if (token.id) {
  const dbUser = await prisma.user.findUnique({
    where: { id: token.id as string },
    select: { isPro: true },
  })
  token.isPro = dbUser?.isPro ?? false
}
```

- Mirror into the `session` callback: `if (token.isPro !== undefined) session.user.isPro = token.isPro as boolean`
- This is what lets a Stripe webhook (Phase 2) update `User.isPro` in the DB and have it reach the JWT-strategy session without a client-side `update()` call — see `docs/stripe-integration-plan.md` §1 "NextAuth session/JWT handling" for the full rationale
- Cost: one extra indexed `findUnique` per JWT validation — acceptable at current scale

### 4. Free-tier limits module

- `src/lib/limits.ts`:

```typescript
export const FREE_ITEM_LIMIT = 50;
export const FREE_COLLECTION_LIMIT = 3;
```

- Wire into `src/actions/items.ts` `createItem` — after the auth check, before file-type validation:
  - If `!session.user.isPro` and `typeSlug` is `"files"` or `"images"` → reject with `"Files and images are a Pro feature"`
  - If `!session.user.isPro` and `prisma.item.count({ where: { userId } }) >= FREE_ITEM_LIMIT` → reject with `` `Free plan is limited to ${FREE_ITEM_LIMIT} items` ``
- Wire into `src/actions/collections.ts` `createCollection` — equivalent check against `FREE_COLLECTION_LIMIT`
- Wire into `src/app/api/upload/route.ts` — after the existing auth check, reject with `403` if `!session.user.isPro` (defense in depth alongside the action-level item-type check)

## Testing

- Unit tests for `src/lib/limits.ts` consumers:
  - `createItem`: under-limit succeeds, at-limit rejects (free user), at-limit succeeds (Pro user), file/image type rejects for free user, file/image type succeeds for Pro user
  - `createCollection`: under-limit succeeds, at-limit rejects (free user), at-limit succeeds (Pro user)
- `npm run test` passes
- `npm run build` passes
- Manual smoke test: a free-tier seeded user hits the 51st item / 4th collection and gets the correct error toast (no Stripe checkout needed to test this — just seed/create items up to the limit)
- Confirm `.env.example` no longer contains real key material before committing

## Notes

- This phase intentionally stops short of anything requiring the Stripe CLI or a live webhook — `session.user.isPro` will only ever be `true` in this phase via direct DB edits (e.g. Prisma Studio or a one-off script) since there's no checkout flow yet to set it organically. That's expected for testing the gating logic in isolation.
- Phase 2 builds directly on the `isPro`-aware session this phase establishes.
