import { prisma } from "@/lib/prisma";

export type ItemWithMeta = {
  id: string;
  title: string;
  description: string | null;
  typeName: string;
  typeSlug: string;
  typeColor: string;
  typeIconName: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  language: string | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  content: string | null;
  url: string | null;
};

type RawItemCard = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  isPinned: boolean;
  isFavorite: boolean;
  language: string | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  itemType: { name: string; slug: string; color: string; icon: string };
  tags: Array<{ tag: { name: string } }>;
};

function mapItemCard(item: RawItemCard): ItemWithMeta {
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    typeName: item.itemType.name,
    typeSlug: item.itemType.slug,
    typeColor: item.itemType.color,
    typeIconName: item.itemType.icon,
    tags: item.tags.map((t) => t.tag.name),
    isPinned: item.isPinned,
    isFavorite: item.isFavorite,
    language: item.language,
    lastUsedAt: item.lastUsedAt,
    createdAt: item.createdAt,
    fileUrl: item.fileUrl,
    fileName: item.fileName,
    fileSize: item.fileSize,
    content: item.content,
    url: item.url,
  };
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

type RawItemDetail = {
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
  itemType: { name: string; slug: string; color: string; icon: string };
  tags: Array<{ tag: { name: string } }>;
  collections: Array<{ collection: { id: string; name: string } }>;
};

function mapItemDetail(item: RawItemDetail): ItemDetail {
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
}

const ITEM_CARD_SELECT = {
  id: true,
  title: true,
  description: true,
  content: true,
  url: true,
  isPinned: true,
  isFavorite: true,
  language: true,
  lastUsedAt: true,
  createdAt: true,
  fileUrl: true,
  fileName: true,
  fileSize: true,
  itemType: { select: { name: true, slug: true, color: true, icon: true } },
  tags: { select: { tag: { select: { name: true } } } },
} as const;

const ITEM_DETAIL_SELECT = {
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
} as const;

export async function getPinnedItems(userId: string): Promise<ItemWithMeta[]> {
  try {
    const items = await prisma.item.findMany({
      where: { userId, isPinned: true },
      orderBy: { lastUsedAt: "desc" },
      select: ITEM_CARD_SELECT,
    });
    return items.map(mapItemCard);
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
      select: ITEM_CARD_SELECT,
    });
    return items.map(mapItemCard);
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

export async function getItemById(userId: string, itemId: string): Promise<ItemDetail | null> {
  try {
    const item = await prisma.item.findFirst({
      where: { id: itemId, userId },
      select: ITEM_DETAIL_SELECT,
    });
    if (!item) return null;
    return mapItemDetail(item as RawItemDetail);
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
      select: ITEM_CARD_SELECT,
    });
    return items.map(mapItemCard);
  } catch (err) {
    console.error("[getItemCardsByType]", err);
    return [];
  }
}

export async function getItemCardsByCollection(
  userId: string,
  collectionId: string,
): Promise<ItemWithMeta[]> {
  try {
    const items = await prisma.item.findMany({
      where: { userId, collections: { some: { collectionId } } },
      orderBy: [{ isPinned: "desc" }, { lastUsedAt: "desc" }, { createdAt: "desc" }],
      select: ITEM_CARD_SELECT,
    });
    return items.map(mapItemCard);
  } catch (err) {
    console.error("[getItemCardsByCollection]", err);
    return [];
  }
}

export type UpdateItemData = {
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
  collectionIds: string[];
};

export async function updateItem(
  userId: string,
  itemId: string,
  data: UpdateItemData,
): Promise<ItemDetail | null> {
  try {
    const updated = await prisma.$transaction(async (tx) => {
      await tx.tagsOnItems.deleteMany({ where: { itemId, item: { userId } } });
      await tx.itemCollection.deleteMany({ where: { itemId, item: { userId } } });

      const ownedCollections = await tx.collection.findMany({
        where: { id: { in: data.collectionIds }, userId },
        select: { id: true },
      });

      return tx.item.update({
        where: { id: itemId, userId },
        data: {
          title: data.title,
          description: data.description,
          content: data.content,
          url: data.url,
          language: data.language,
          tags: {
            create: data.tags.map((name) => ({
              tag: {
                connectOrCreate: {
                  where: { name_userId: { name, userId } },
                  create: { name, userId },
                },
              },
            })),
          },
          collections: {
            create: ownedCollections.map((c) => ({ collection: { connect: { id: c.id } } })),
          },
        },
        select: ITEM_DETAIL_SELECT,
      });
    });

    return mapItemDetail(updated as RawItemDetail);
  } catch (err) {
    console.error("[updateItem]", err);
    return null;
  }
}

export type CreateItemData = {
  typeSlug: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string | null;
  language: string | null;
  tags: string[];
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  collectionIds?: string[];
};

const SLUG_TO_CONTENT_KIND: Record<string, "TEXT" | "URL" | "FILE"> = {
  snippets: "TEXT",
  prompts: "TEXT",
  notes: "TEXT",
  commands: "TEXT",
  links: "URL",
  files: "FILE",
  images: "FILE",
};

export async function createItem(userId: string, data: CreateItemData): Promise<ItemDetail | null> {
  try {
    const itemType = await prisma.itemType.findUnique({
      where: { slug: data.typeSlug },
      select: { id: true },
    });

    if (!itemType) return null;

    const contentKind = SLUG_TO_CONTENT_KIND[data.typeSlug] ?? "TEXT";

    const ownedCollections = data.collectionIds?.length
      ? await prisma.collection.findMany({
          where: { id: { in: data.collectionIds }, userId },
          select: { id: true },
        })
      : [];

    const created = await prisma.item.create({
      data: {
        userId,
        itemTypeId: itemType.id,
        contentKind,
        title: data.title,
        description: data.description,
        content: data.content,
        url: data.url,
        language: data.language,
        fileUrl: data.fileUrl ?? null,
        fileName: data.fileName ?? null,
        fileSize: data.fileSize ?? null,
        tags: {
          create: data.tags.map((name) => ({
            tag: {
              connectOrCreate: {
                where: { name_userId: { name, userId } },
                create: { name, userId },
              },
            },
          })),
        },
        collections: {
          create: ownedCollections.map((c) => ({ collection: { connect: { id: c.id } } })),
        },
      },
      select: ITEM_DETAIL_SELECT,
    });

    return mapItemDetail(created as RawItemDetail);
  } catch (err) {
    console.error("[createItem]", err);
    return null;
  }
}

export type SearchIndexItem = {
  id: string;
  title: string;
  preview: string | null;
  typeSlug: string;
  typeColor: string;
  typeIconName: string;
};

export async function getSearchIndexItems(userId: string): Promise<SearchIndexItem[]> {
  try {
    const items = await prisma.item.findMany({
      where: { userId },
      orderBy: { lastUsedAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        content: true,
        itemType: { select: { slug: true, color: true, icon: true } },
      },
    });

    return items.map((item) => ({
      id: item.id,
      title: item.title,
      preview: item.description ?? item.content ?? null,
      typeSlug: item.itemType.slug,
      typeColor: item.itemType.color,
      typeIconName: item.itemType.icon,
    }));
  } catch (err) {
    console.error("[getSearchIndexItems]", err);
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
