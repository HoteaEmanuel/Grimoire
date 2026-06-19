# Stripe Integration — Phase 2: Integration & UI

## Overview

Build the actual subscription flow on top of Phase 1's foundation: Stripe Dashboard setup, the webhook handler that flips `User.isPro`, checkout/billing-portal entry points, and the UI that surfaces Pro status and upgrade prompts. This phase requires the Stripe CLI (`stripe listen`, `stripe trigger`) for local webhook testing and cannot be fully verified by `npm run test` alone.

Reference: `docs/stripe-integration-plan.md` (full research + plan), §4.1 (webhook route, billing actions, BillingCard), §4.2 (UI files), §4.3 (Dashboard setup steps), implementation order steps 3, 5–6, 8.

## Prerequisite

Phase 1 complete: `src/lib/stripe.ts`, Stripe env vars, `session.user.isPro` wired through NextAuth, `src/lib/limits.ts` enforcement already in place.

## Requirements

- Stripe Dashboard setup: products/prices, webhook endpoint, Customer Portal config
- `/api/webhooks/stripe` route handling subscription lifecycle events
- `createCheckoutSession`/`createBillingPortalSession` server actions
- `BillingCard` settings UI for upgrading and managing a subscription
- Pro-aware UI: gated type buttons in `CreateItemModal`, accurate PRO badges in the sidebar

## Stripe Dashboard Setup

1. Test mode: create "Grimoire Pro" with two recurring prices — Monthly $8.00/mo, Yearly $72.00/yr. Copy both Price IDs into `STRIPE_PRICE_ID_MONTHLY`/`STRIPE_PRICE_ID_YEARLY`.
2. Developers → Webhooks → add endpoint `https://<domain>/api/webhooks/stripe` (local dev: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`). Subscribe to: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
3. Copy the signing secret into `STRIPE_WEBHOOK_SECRET` (local CLI secret and production dashboard secret are different values).
4. Customer Portal → Settings: enable; allow cancel + payment-method update; leave plan-switching disabled unless self-service monthly↔yearly is wanted.
5. Before going live: rotate test keys once more if any further leak risk occurred during Phase 1/2 development.

## Implementation

### 1. Webhook handler — `src/app/api/webhooks/stripe/route.ts`

- Verify `stripe-signature` header against `STRIPE_WEBHOOK_SECRET` via `stripe.webhooks.constructEvent`; `400` on missing header or failed verification
- `checkout.session.completed` → read `client_reference_id` (the user ID set at checkout creation), set `isPro: true` + store `stripeCustomerId`/`stripeSubscriptionId`
- `customer.subscription.deleted` → `updateMany` by `stripeSubscriptionId`, set `isPro: false`
- `customer.subscription.updated` → `updateMany` by `stripeSubscriptionId`, set `isPro` based on `status === "active" || "trialing"`
- `invoice.payment_failed` → log only; rely on the subsequent `customer.subscription.updated` (status `past_due`/`unpaid`) to actually flip `isPro`, giving Stripe's own grace-period/retry behavior room to work
- Catch handler errors, log with `console.error("[stripe-webhook] ...")`, return `500` so Stripe retries; otherwise `200 { received: true }`
- No Next.js body-parser config needed — App Router route handlers reading via `req.text()` already get the raw body required for signature verification

### 2. Billing server actions — `src/actions/billing.ts`

- `createCheckoutSession(plan: "monthly" | "yearly")`:
  - Auth check (existing `{ success, data|error }` pattern)
  - Create a Stripe Customer if `stripeCustomerId` is null, persist it immediately (avoids duplicate customers on retry)
  - `stripe.checkout.sessions.create({ mode: "subscription", customer, line_items: [{ price: <id>, quantity: 1 }], client_reference_id: session.user.id, success_url, cancel_url })`
  - Return `{ success: true, data: { url } }`
- `createBillingPortalSession()`:
  - Requires `stripeCustomerId` to already be set; error otherwise
  - `stripe.billingPortal.sessions.create({ customer, return_url })`

### 3. Settings UI — `src/components/settings/BillingCard.tsx`

- Client component added to `/settings` (`src/app/settings/page.tsx`), positioned between Editor preferences and Change password
- Free users: plan comparison (monthly/yearly) + "Upgrade" button → `createCheckoutSession` → `window.location.href = data.url`
- Pro users: "Manage billing" button → `createBillingPortalSession` → redirect; optionally show renewal info via `stripe.subscriptions.retrieve` (defer if not cheap)
- Extend `getProfileData` (`src/lib/db/profile.ts`) select to include `isPro`/`stripeCustomerId` if not already present

### 4. Pro-aware UI updates

- `src/components/items/CreateItemModal.tsx` — hide/disable File and Image type-picker buttons for non-Pro users (read `isPro` from `useSession()`), with a Pro badge + tooltip rather than silent hiding
- `src/components/layout/SidebarContent.tsx` — change the static `isPro={type.slug === "files" || type.slug === "images"}` to `isPro={(type.slug === "files" || type.slug === "images") && !session.user.isPro}` so the badge becomes an upgrade nudge for free users instead of a permanent label

## Testing

- Unit tests: `createCheckoutSession`/`createBillingPortalSession` auth checks and the missing-`stripeCustomerId` branch for the portal action
- Webhook signature rejection test: missing/invalid `stripe-signature` header → `400`
- Stripe CLI required from here on:
  - `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
  - `stripe trigger checkout.session.completed` → confirm `User.isPro` flips to `true` in Neon
  - `stripe trigger customer.subscription.deleted` → confirm `isPro` flips back to `false`
- Manual browser tests:
  - Complete checkout in Stripe test mode → after redirect + reload, sidebar PRO badges disappear and `BillingCard` shows "Manage billing"
  - Cancel via Customer Portal → next request reflects `isPro: false` (no manual session refresh needed, thanks to Phase 1's JWT DB-sync)
  - Free user sees File/Image type buttons disabled/hidden in `CreateItemModal`; attempting `/api/upload` directly still gets `403` (already covered by Phase 1, re-verify here against a real session)
- `npm run build` passes

## Notes

- This phase can't be meaningfully tested without `stripe listen` running locally — note that for whoever picks this up, since `npm run test` alone won't catch webhook wiring mistakes (e.g. wrong event-to-field mapping).
- `invoice.payment_failed` deliberately does not revoke `isPro` immediately — see webhook handler notes above for why; if grace-period behavior needs to be more explicit later, that's a follow-up, not part of this phase.
