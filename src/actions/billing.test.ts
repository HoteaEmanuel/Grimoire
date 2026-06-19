import { describe, it, expect, vi, beforeEach } from "vitest";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createCheckoutSession, createBillingPortalSession } from "./billing";

vi.mock("@/lib/stripe", () => ({
  stripe: {
    customers: { create: vi.fn() },
    checkout: { sessions: { create: vi.fn() } },
    billingPortal: { sessions: { create: vi.fn() } },
  },
}));

import { stripe } from "@/lib/stripe";

const mockSession = { user: { id: "user-1" } };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createCheckoutSession", () => {
  it("returns Unauthorized when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await createCheckoutSession("monthly");

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("creates a Stripe customer when one doesn't exist yet", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      stripeCustomerId: null,
      email: "user@example.com",
    } as never);
    vi.mocked(stripe.customers.create).mockResolvedValue({ id: "cus_new" } as never);
    vi.mocked(prisma.user.update).mockResolvedValue({} as never);
    vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({
      url: "https://checkout.stripe.com/session",
    } as never);

    const result = await createCheckoutSession("monthly");

    expect(stripe.customers.create).toHaveBeenCalledWith({
      email: "user@example.com",
      metadata: { userId: "user-1" },
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { stripeCustomerId: "cus_new" },
    });
    expect(result).toEqual({ success: true, data: { url: "https://checkout.stripe.com/session" } });
  });

  it("reuses an existing Stripe customer", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      stripeCustomerId: "cus_existing",
      email: "user@example.com",
    } as never);
    vi.mocked(stripe.checkout.sessions.create).mockResolvedValue({
      url: "https://checkout.stripe.com/session",
    } as never);

    const result = await createCheckoutSession("yearly");

    expect(stripe.customers.create).not.toHaveBeenCalled();
    expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_existing", client_reference_id: "user-1" }),
    );
    expect(result.success).toBe(true);
  });
});

describe("createBillingPortalSession", () => {
  it("returns Unauthorized when no session", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const result = await createBillingPortalSession();

    expect(result).toEqual({ success: false, error: "Unauthorized" });
  });

  it("errors when the user has no Stripe customer yet", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ stripeCustomerId: null } as never);

    const result = await createBillingPortalSession();

    expect(result).toEqual({ success: false, error: "No billing account found" });
    expect(stripe.billingPortal.sessions.create).not.toHaveBeenCalled();
  });

  it("creates a billing portal session for an existing customer", async () => {
    vi.mocked(auth).mockResolvedValue(mockSession as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ stripeCustomerId: "cus_existing" } as never);
    vi.mocked(stripe.billingPortal.sessions.create).mockResolvedValue({
      url: "https://billing.stripe.com/portal",
    } as never);

    const result = await createBillingPortalSession();

    expect(stripe.billingPortal.sessions.create).toHaveBeenCalledWith(
      expect.objectContaining({ customer: "cus_existing" }),
    );
    expect(result).toEqual({ success: true, data: { url: "https://billing.stripe.com/portal" } });
  });
});
