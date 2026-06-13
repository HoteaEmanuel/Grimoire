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

export type SidebarItemType = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  count: number;
};

const ITEM_TYPE_ORDER = ["snippets", "prompts", "commands", "notes", "files", "images", "links"];

export async function getSidebarItemTypes(): Promise<SidebarItemType[]> {
  const userId = await getUserId();

  const itemTypes = await prisma.itemType.findMany({
    where: { isSystem: true },
  });

  const counts = userId
    ? await prisma.item.groupBy({ by: ["itemTypeId"], where: { userId }, _count: true })
    : [];

  const countMap = new Map(counts.map((c) => [c.itemTypeId, c._count]));

  return itemTypes
    .map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      icon: t.icon,
      color: t.color,
      count: countMap.get(t.id) ?? 0,
    }))
    .sort((a, b) => {
      const ai = ITEM_TYPE_ORDER.indexOf(a.slug);
      const bi = ITEM_TYPE_ORDER.indexOf(b.slug);
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
    });
}
