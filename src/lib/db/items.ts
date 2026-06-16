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

export type ItemFull = {
  id: string;
  title: string;
  description: string | null;
  contentKind: "TEXT" | "URL" | "FILE";
  content: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  lastUsedAt: Date | null;
  createdAt: Date;
  typeId: string;
  typeName: string;
  typeSlug: string;
  typeColor: string;
  typeIconName: string;
  tags: string[];
};

export async function getItemsByType(userId: string, typeSlug: string): Promise<ItemFull[]> {
  try {
    const items = await prisma.item.findMany({
      where: { userId, itemType: { slug: typeSlug } },
      orderBy: [{ isPinned: "desc" }, { lastUsedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        description: true,
        contentKind: true,
        content: true,
        url: true,
        fileUrl: true,
        fileName: true,
        fileSize: true,
        language: true,
        isFavorite: true,
        isPinned: true,
        lastUsedAt: true,
        createdAt: true,
        itemType: { select: { id: true, name: true, slug: true, color: true, icon: true } },
        tags: { select: { tag: { select: { name: true } } } },
      },
    });

    return items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      contentKind: item.contentKind,
      content: item.content,
      url: item.url,
      fileUrl: item.fileUrl,
      fileName: item.fileName,
      fileSize: item.fileSize,
      language: item.language,
      isFavorite: item.isFavorite,
      isPinned: item.isPinned,
      lastUsedAt: item.lastUsedAt,
      createdAt: item.createdAt,
      typeId: item.itemType.id,
      typeName: item.itemType.name,
      typeSlug: item.itemType.slug,
      typeColor: item.itemType.color,
      typeIconName: item.itemType.icon,
      tags: item.tags.map((t) => t.tag.name),
    }));
  } catch (err) {
    console.error("[getItemsByType]", err);
    return [];
  }
}

export type ItemDetail = {
  id: string;
  title: string;
  description: string | null;
  contentKind: "TEXT" | "URL" | "FILE";
  content: string | null;
  url: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  language: string | null;
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: Date | null;
  typeName: string;
  typeSlug: string;
  typeColor: string;
  typeIconName: string;
  tags: string[];
  collections: { id: string; name: string }[];
};

export async function getItemById(userId: string, itemId: string): Promise<ItemDetail | null> {
  try {
    const item = await prisma.item.findFirst({
      where: { id: itemId, userId },
      select: {
        id: true,
        title: true,
        description: true,
        contentKind: true,
        content: true,
        url: true,
        fileUrl: true,
        fileName: true,
        fileSize: true,
        language: true,
        isFavorite: true,
        isPinned: true,
        createdAt: true,
        updatedAt: true,
        lastUsedAt: true,
        itemType: { select: { name: true, slug: true, color: true, icon: true } },
        tags: { select: { tag: { select: { name: true } } } },
        collections: { select: { collection: { select: { id: true, name: true } } } },
      },
    });

    if (!item) return null;

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      contentKind: item.contentKind,
      content: item.content,
      url: item.url,
      fileUrl: item.fileUrl,
      fileName: item.fileName,
      fileSize: item.fileSize,
      language: item.language,
      isFavorite: item.isFavorite,
      isPinned: item.isPinned,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      lastUsedAt: item.lastUsedAt,
      typeName: item.itemType.name,
      typeSlug: item.itemType.slug,
      typeColor: item.itemType.color,
      typeIconName: item.itemType.icon,
      tags: item.tags.map((t) => t.tag.name),
      collections: item.collections.map((c) => ({ id: c.collection.id, name: c.collection.name })),
    };
  } catch (err) {
    console.error("[getItemById]", err);
    return null;
  }
}

export async function getItemCardsByType(userId: string, typeSlug: string): Promise<ItemWithMeta[]> {
  try {
    const items = await prisma.item.findMany({
      where: { userId, itemType: { slug: typeSlug } },
      orderBy: [{ isPinned: "desc" }, { lastUsedAt: "desc" }, { createdAt: "desc" }],
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
    console.error("[getItemCardsByType]", err);
    return [];
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
