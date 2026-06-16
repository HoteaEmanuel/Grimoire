import { vi } from "vitest";

// Mock Next.js server internals that can't run outside the Next.js runtime
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({ get: vi.fn(), set: vi.fn(), delete: vi.fn() })),
  headers: vi.fn(() => ({ get: vi.fn() })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// Mock Prisma — individual tests override specific methods via vi.mocked()
const prismaMock = {
  user: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  item: { findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn(), groupBy: vi.fn() },
  itemType: { findUnique: vi.fn(), findMany: vi.fn() },
  collection: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
  tag: { findMany: vi.fn(), upsert: vi.fn(), delete: vi.fn() },
  verificationToken: { create: vi.fn(), findUnique: vi.fn(), delete: vi.fn() },
  $transaction: vi.fn((fn: unknown) => (typeof fn === "function" ? fn({}) : Promise.resolve())),
};

vi.mock("@/lib/prisma", () => ({
  default: prismaMock,
  prisma: prismaMock,
}));

// Mock next-auth — tests control session via vi.mocked(auth).mockResolvedValue(...)
vi.mock("@/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));
