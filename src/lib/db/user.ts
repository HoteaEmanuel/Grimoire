import { prisma } from "@/lib/prisma";

export type DevUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

export async function getDevUser(): Promise<DevUser | null> {
  const email = process.env.SEED_USER_EMAIL;
  if (!email) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, image: true },
    });
    return user;
  } catch (err) {
    console.error("[getDevUser]", err);
    return null;
  }
}
