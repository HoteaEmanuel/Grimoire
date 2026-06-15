import { prisma } from "@/lib/prisma";

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

export async function getPinnedItems(userId: string): Promise<ItemWithMeta[]> {
  try {
    const items = await prisma.item.findMany({
      where: { userId, isPinned: true },
      orderBy: { lastUsedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        isPinned: true,
        isFavorite: true,
        language: true,
        lastUsedAt: true,
        itemType: { select: { name: true, color: true, icon: true } },
        tags: { select: { tag: { select: { name: true } } } },
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
  } catch (err) {
    console.error("[getPinnedItems]", err);
    return [];
  }
}

export async function getRecentItems(userId: string, limit = 10): Promise<ItemWithMeta[]> {
  try {
    const items = await prisma.item.findMany({
      where: { userId },
      orderBy: { lastUsedAt: "desc" },
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        isPinned: true,
        isFavorite: true,
        language: true,
        lastUsedAt: true,
        itemType: { select: { name: true, color: true, icon: true } },
        tags: { select: { tag: { select: { name: true } } } },
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
  } catch (err) {
    console.error("[getRecentItems]", err);
    return [];
  }
}

export async function getItemStats(
  userId: string,
): Promise<{ totalItems: number; favoriteItems: number }> {
  try {
    const [totalItems, favoriteItems] = await Promise.all([
      prisma.item.count({ where: { userId } }),
      prisma.item.count({ where: { userId, isFavorite: true } }),
    ]);
    return { totalItems, favoriteItems };
  } catch (err) {
    console.error("[getItemStats]", err);
    return { totalItems: 0, favoriteItems: 0 };
  }
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

export async function getSidebarItemTypes(userId: string): Promise<SidebarItemType[]> {
  try {
    const [itemTypes, counts] = await Promise.all([
      prisma.itemType.findMany({
        where: { isSystem: true },
        select: { id: true, name: true, slug: true, icon: true, color: true },
      }),
      prisma.item.groupBy({ by: ["itemTypeId"], where: { userId }, _count: true }),
    ]);

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
  } catch (err) {
    console.error("[getSidebarItemTypes]", err);
    return [];
  }
}
