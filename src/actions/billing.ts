"use server";

import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth-helpers";

const PLAN_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY!,
} as const;

type BillingResult = { success: true; data: { url: string } } | { success: false; error: string };

export async function createCheckoutSession(plan: "monthly" | "yearly"): Promise<BillingResult> {
  const auth = await requireUserId();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { stripeCustomerId: true, email: true },
  });
  if (!user) {
    return { success: false, error: "User not found" };
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: auth.userId },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: auth.userId },
      data: { stripeCustomerId: customerId },
    });
  }

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: PLAN_PRICE_IDS[plan], quantity: 1 }],
    client_reference_id: auth.userId,
    success_url: `${baseUrl}/settings?checkout=success`,
    cancel_url: `${baseUrl}/settings?checkout=cancelled`,
  });

  if (!checkoutSession.url) {
    return { success: false, error: "Failed to create checkout session" };
  }

  return { success: true, data: { url: checkoutSession.url } };
}

export async function createBillingPortalSession(): Promise<BillingResult> {
  const auth = await requireUserId();
  if (!auth.ok) {
    return { success: false, error: auth.error };
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { stripeCustomerId: true },
  });
  if (!user?.stripeCustomerId) {
    return { success: false, error: "No billing account found" };
  }

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${baseUrl}/settings`,
  });

  return { success: true, data: { url: portalSession.url } };
}
