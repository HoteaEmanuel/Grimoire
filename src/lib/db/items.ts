import { prisma } from "@/lib/prisma";

const SEED_USER_EMAIL = "emanuelhotea1@gmail.com";

export type ItemWithMeta = {
  id: string;
  title: string;
  description: string | null;
  typeName: string;
  typeColor: string;
  typeIconName: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  language: string | null;
  lastUsedAt: Date | null;
};

async function getUserId(): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { email: SEED_USER_EMAIL },
    select: { id: true },
  });
  return user?.id ?? null;
}

export async function getPinnedItems(): Promise<ItemWithMeta[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const items = await prisma.item.findMany({
    where: { userId, isPinned: true },
    orderBy: { lastUsedAt: "desc" },
    include: {
      itemType: true,
      tags: { include: { tag: true } },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    typeName: item.itemType.name,
    typeColor: item.itemType.color,
    typeIconName: item.itemType.icon,
    tags: item.tags.map((t) => t.tag.name),
    isPinned: item.isPinned,
    isFavorite: item.isFavorite,
    language: item.language,
    lastUsedAt: item.lastUsedAt,
  }));
}

export async function getRecentItems(limit = 10): Promise<ItemWithMeta[]> {
  const userId = await getUserId();
  if (!userId) return [];

  const items = await prisma.item.findMany({
    where: { userId },
    orderBy: { lastUsedAt: "desc" },
    take: limit,
    include: {
      itemType: true,
      tags: { include: { tag: true } },
    },
  });

  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    typeName: item.itemType.name,
    typeColor: item.itemType.color,
    typeIconName: item.itemType.icon,
    tags: item.tags.map((t) => t.tag.name),
    isPinned: item.isPinned,
    isFavorite: item.isFavorite,
    language: item.language,
    lastUsedAt: item.lastUsedAt,
  }));
}

export async function getItemStats(): Promise<{
  totalItems: number;
  favoriteItems: number;
}> {
  const userId = await getUserId();
  if (!userId) return { totalItems: 0, favoriteItems: 0 };

  const [totalItems, favoriteItems] = await Promise.all([
    prisma.item.count({ where: { userId } }),
    prisma.item.count({ where: { userId, isFavorite: true } }),
  ]);

  return { totalItems, favoriteItems };
}
