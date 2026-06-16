import { describe, it, expect, vi } from "vitest"
import { getIP, rateLimitResponse, checkRateLimit } from "@/lib/rate-limit"
import type { Ratelimit } from "@upstash/ratelimit"

describe("getIP", () => {
  it("returns the first IP from x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    })
    expect(getIP(req)).toBe("1.2.3.4")
  })

  it("trims whitespace from the IP", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "  9.9.9.9  , 1.1.1.1" },
    })
    expect(getIP(req)).toBe("9.9.9.9")
  })

  it("falls back to 127.0.0.1 when header is missing", () => {
    const req = new Request("http://localhost")
    expect(getIP(req)).toBe("127.0.0.1")
  })
})

describe("rateLimitResponse", () => {
  it("returns a 429 response", async () => {
    const res = rateLimitResponse(60)
    expect(res.status).toBe(429)
  })

  it("sets the Retry-After header", () => {
    const res = rateLimitResponse(90)
    expect(res.headers.get("Retry-After")).toBe("90")
  })

  it("generates a plural minute message", async () => {
    const res = rateLimitResponse(120)
    const body = await res.json()
    expect(body.error).toContain("2 minutes")
  })

  it("generates a singular minute message", async () => {
    const res = rateLimitResponse(59)
    const body = await res.json()
    expect(body.error).toContain("1 minute")
    expect(body.error).not.toContain("minutes")
  })

  it("uses a custom message when provided", async () => {
    const res = rateLimitResponse(60, "Custom error")
    const body = await res.json()
    expect(body.error).toBe("Custom error")
  })
})

describe("checkRateLimit", () => {
  it("returns success and retryAfter when the limiter allows the request", async () => {
    const mockLimiter = {
      limit: vi.fn().mockResolvedValue({ success: true, reset: Date.now() + 60_000 }),
    } as unknown as Ratelimit

    const result = await checkRateLimit(mockLimiter, "test-key")
    expect(result.success).toBe(true)
    expect(result.retryAfter).toBeGreaterThanOrEqual(1)
  })

  it("returns success: false when the limiter blocks the request", async () => {
    const mockLimiter = {
      limit: vi.fn().mockResolvedValue({ success: false, reset: Date.now() + 30_000 }),
    } as unknown as Ratelimit

    const result = await checkRateLimit(mockLimiter, "test-key")
    expect(result.success).toBe(false)
  })

  it("fails open (success: true) when the limiter throws", async () => {
    const mockLimiter = {
      limit: vi.fn().mockRejectedValue(new Error("Upstash unavailable")),
    } as unknown as Ratelimit

    const result = await checkRateLimit(mockLimiter, "test-key")
    expect(result.success).toBe(true)
    expect(result.retryAfter).toBe(0)
  })
})
