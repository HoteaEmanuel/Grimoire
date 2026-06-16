import crypto from "crypto"

export const RESET_PREFIX = "reset:"

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}
