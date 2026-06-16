import type { Session } from "next-auth"
import type { JWT } from "next-auth/jwt"

export function applyEmailVerified(session: Session, token: JWT): void {
  session.user.emailVerified = (token.emailVerified as Date | null) ?? null
}
