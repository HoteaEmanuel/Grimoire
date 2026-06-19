"use server";

import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const PLAN_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
  yearly: process.env.STRIPE_PRICE_ID_YEARLY!,
} as const;

type BillingResult = { success: true; data: { url: string } } | { success: false; error: string };

export async function createCheckoutSession(plan: "monthly" | "yearly"): Promise<BillingResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true, email: true },
  });
  if (!user) {
    return { success: false, error: "User not found" };
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: PLAN_PRICE_IDS[plan], quantity: 1 }],
    client_reference_id: session.user.id,
    success_url: `${baseUrl}/settings?checkout=success`,
    cancel_url: `${baseUrl}/settings?checkout=cancelled`,
  });

  if (!checkoutSession.url) {
    return { success: false, error: "Failed to create checkout session" };
  }

  return { success: true, data: { url: checkoutSession.url } };
}

export async function createBillingPortalSession(): Promise<BillingResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
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
