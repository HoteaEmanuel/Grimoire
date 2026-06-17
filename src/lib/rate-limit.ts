import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

function makeRatelimit(requests: number, window: string) {
  return new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    }),
    limiter: Ratelimit.slidingWindow(requests, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
    analytics: false,
    prefix: "grimoire:rl",
  })
}

export const loginLimiter = makeRatelimit(5, "15 m")
export const registerLimiter = makeRatelimit(3, "1 h")
export const forgotPasswordLimiter = makeRatelimit(5, "1 h")
export const resetPasswordLimiter = makeRatelimit(5, "15 m")
export const resendVerificationLimiter = makeRatelimit(5, "15 m")
export const changePasswordLimiter = makeRatelimit(5, "15 m")
export const uploadLimiter = makeRatelimit(20, "1 h")

export function getIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  return forwarded?.split(",")[0]?.trim() ?? "127.0.0.1"
}

export async function checkRateLimit(
  limiter: Ratelimit,
  key: string,
): Promise<{ success: boolean; retryAfter: number }> {
  try {
    const { success, reset } = await limiter.limit(key)
    const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
    return { success, retryAfter }
  } catch {
    // Fail open — allow request if Upstash is unavailable
    return { success: true, retryAfter: 0 }
  }
}

export function rateLimitResponse(retryAfter: number, message?: string) {
  const minutes = Math.ceil(retryAfter / 60)
  const body = {
    error: message ?? `Too many attempts. Please try again in ${minutes} minute${minutes !== 1 ? "s" : ""}.`,
  }
  return new Response(JSON.stringify(body), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(retryAfter),
    },
  })
}
