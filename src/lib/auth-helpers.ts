import { z } from "zod";
import { auth } from "@/auth";

type RequireUserResult =
  | { ok: true; userId: string; isPro: boolean }
  | { ok: false; error: string };

export async function requireUserId(): Promise<RequireUserResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }
  return { ok: true, userId: session.user.id, isPro: session.user.isPro };
}

type ParseResult<T> = { ok: true; data: T } | { ok: false; error: string };

export function parseOrError<T>(schema: z.ZodType<T>, input: unknown): ParseResult<T> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  return { ok: true, data: parsed.data };
}
