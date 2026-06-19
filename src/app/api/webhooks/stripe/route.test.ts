import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: { constructEvent: vi.fn() },
  },
}));

import { stripe } from "@/lib/stripe";

beforeEach(() => {
  vi.clearAllMocks();
});

function makeRequest(body: string, headers: Record<string, string> = {}) {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers,
    body,
  });
}

describe("POST /api/webhooks/stripe", () => {
  it("returns 400 when the stripe-signature header is missing", async () => {
    const res = await POST(makeRequest("{}"));

    expect(res.status).toBe(400);
    expect(stripe.webhooks.constructEvent).not.toHaveBeenCalled();
  });

  it("returns 400 when signature verification fails", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockImplementation(() => {
      throw new Error("invalid signature");
    });

    const res = await POST(makeRequest("{}", { "stripe-signature": "bad-sig" }));

    expect(res.status).toBe(400);
  });

  it("returns 200 for an unhandled event type", async () => {
    vi.mocked(stripe.webhooks.constructEvent).mockReturnValue({
      type: "customer.created",
      data: { object: {} },
    } as never);

    const res = await POST(makeRequest("{}", { "stripe-signature": "good-sig" }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json).toEqual({ received: true });
  });
});
