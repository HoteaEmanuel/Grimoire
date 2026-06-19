import { prisma } from "@/lib/prisma";
import { COLLECTIONS_PER_PAGE, DASHBOARD_COLLECTIONS_LIMIT } from "@/lib/constants";

export type CollectionTypeIcon = {
  iconName: string;
  color: string;
};

export type CollectionWithMeta = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
  dominantTypeColor: string;
  typeIcons: CollectionTypeIcon[];
  createdAt: Date;
};

function computeDominantTypeColor(
  items: Array<{ item: { itemType: { id: string; color: string } } }>,
): string {
  const counts = new Map<string, { count: number; color: string }>();
  for (const ic of items) {
    const t = ic.item.itemType;
    const entry = counts.get(t.id);
    if (entry) entry.count++;
    else counts.set(t.id, { count: 1, color: t.color });
  }
  let dominantColor = "#6b7280";
  let max = 0;
  for (const val of counts.values()) {
    if (val.count > max) {
      max = val.count;
      dominantColor = val.color;
    }
  }
  return dominantColor;
}

export async function getRecentCollections(userId: string): Promise<CollectionWithMeta[]> {
  try {
    const collections = await prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: DASHBOARD_COLLECTIONS_LIMIT,
      select: {
        id: true,
        name: true,
        description: true,
        isFavorite: true,
        createdAt: true,
        _count: { select: { items: true } },
        items: {
          take: 50,
          select: {
            item: {
              select: {
                itemType: { select: { id: true, color: true, icon: true } },
              },
            },
          },
        },
      },
    });

    return collections.map((col) => {
      const typeCounts = new Map<string, { count: number; color: string; iconName: string }>();
      for (const ic of col.items) {
        const t = ic.item.itemType;
        const existing = typeCounts.get(t.id);
        if (existing) existing.count++;
        else typeCounts.set(t.id, { count: 1, color: t.color, iconName: t.icon });
      }

      const typeIcons = Array.from(typeCounts.values()).map((v) => ({
        iconName: v.iconName,
        color: v.color,
      }));

      return {
        id: col.id,
        name: col.name,
        description: col.description,
        isFavorite: col.isFavorite,
        itemCount: col._count.items,
        dominantTypeColor: computeDominantTypeColor(col.items),
        typeIcons,
        createdAt: col.createdAt,
      };
    });
  } catch (err) {
    console.error("[getRecentCollections]", err);
    return [];
  }
}

export type PaginatedCollections = {
  collections: CollectionWithMeta[];
  totalCount: number;
};

export async function getCollections(userId: string, page = 1): Promise<PaginatedCollections> {
  try {
    const where = { userId };
    const [collections, totalCount] = await Promise.all([
      prisma.collection.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip: (page - 1) * COLLECTIONS_PER_PAGE,
        take: COLLECTIONS_PER_PAGE,
        select: {
          id: true,
          name: true,
          description: true,
          isFavorite: true,
          createdAt: true,
          _count: { select: { items: true } },
          items: {
            take: 50,
            select: {
              item: {
                select: {
                  itemType: { select: { id: true, color: true, icon: true } },
                },
              },
            },
          },
        },
      }),
      prisma.collection.count({ where }),
    ]);

    const mapped = collections.map((col) => {
      const typeCounts = new Map<string, { count: number; color: string; iconName: string }>();
      for (const ic of col.items) {
        const t = ic.item.itemType;
        const existing = typeCounts.get(t.id);
        if (existing) existing.count++;
        else typeCounts.set(t.id, { count: 1, color: t.color, iconName: t.icon });
      }

      const typeIcons = Array.from(typeCounts.values()).map((v) => ({
        iconName: v.iconName,
        color: v.color,
      }));

      return {
        id: col.id,
        name: col.name,
        description: col.description,
        isFavorite: col.isFavorite,
        itemCount: col._count.items,
        dominantTypeColor: computeDominantTypeColor(col.items),
        typeIcons,
        createdAt: col.createdAt,
      };
    });

    return { collections: mapped, totalCount };
  } catch (err) {
    console.error("[getCollections]", err);
    return { collections: [], totalCount: 0 };
  }
}

export async function getFavoriteCollections(userId: string): Promise<CollectionWithMeta[]> {
  try {
    const collections = await prisma.collection.findMany({
      where: { userId, isFavorite: true },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        isFavorite: true,
        createdAt: true,
        _count: { select: { items: true } },
        items: {
          take: 50,
          select: {
            item: {
              select: {
                itemType: { select: { id: true, color: true, icon: true } },
              },
            },
          },
        },
      },
    });

    return collections.map((col) => {
      const typeCounts = new Map<string, { count: number; color: string; iconName: string }>();
      for (const ic of col.items) {
        const t = ic.item.itemType;
        const existing = typeCounts.get(t.id);
        if (existing) existing.count++;
        else typeCounts.set(t.id, { count: 1, color: t.color, iconName: t.icon });
      }

      const typeIcons = Array.from(typeCounts.values()).map((v) => ({
        iconName: v.iconName,
        color: v.color,
      }));

      return {
        id: col.id,
        name: col.name,
        description: col.description,
        isFavorite: col.isFavorite,
        itemCount: col._count.items,
        dominantTypeColor: computeDominantTypeColor(col.items),
        typeIcons,
        createdAt: col.createdAt,
      };
    });
  } catch (err) {
    console.error("[getFavoriteCollections]", err);
    return [];
  }
}

export type CollectionDetail = {
  id: string;
  name: string;
  description: string | null;
  isFavorite: boolean;
  itemCount: number;
};

export async function getCollectionDetail(
  userId: string,
  collectionId: string,
): Promise<CollectionDetail | null> {
  try {
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId },
      select: {
        id: true,
        name: true,
        description: true,
        isFavorite: true,
        _count: { select: { items: true } },
      },
    });
    if (!collection) return null;
    return {
      id: collection.id,
      name: collection.name,
      description: collection.description,
      isFavorite: collection.isFavorite,
      itemCount: collection._count.items,
    };
  } catch (err) {
    console.error("[getCollectionDetail]", err);
    return null;
  }
}

export type SidebarCollection = {
  id: string;
  name: string;
  isFavorite: boolean;
  dominantTypeColor: string;
};

export async function getSidebarCollections(userId: string): Promise<SidebarCollection[]> {
  try {
    const collections = await prisma.collection.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        id: true,
        name: true,
        isFavorite: true,
        items: {
          take: 50,
          select: {
            item: {
              select: {
                itemType: { select: { id: true, color: true } },
              },
            },
          },
        },
      },
    });

    return collections.map((col) => ({
      id: col.id,
      name: col.name,
      isFavorite: col.isFavorite,
      dominantTypeColor: computeDominantTypeColor(col.items),
    }));
  } catch (err) {
    console.error("[getSidebarCollections]", err);
    return [];
  }
}

export async function createCollection(
  userId: string,
  data: { name: string; description: string | null },
): Promise<CollectionWithMeta | null> {
  try {
    const created = await prisma.collection.create({
      data: {
        userId,
        name: data.name,
        description: data.description,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isFavorite: true,
        createdAt: true,
      },
    });

    return {
      id: created.id,
      name: created.name,
      description: created.description,
      isFavorite: created.isFavorite,
      itemCount: 0,
      dominantTypeColor: "#6b7280",
      typeIcons: [],
      createdAt: created.createdAt,
    };
  } catch (err) {
    console.error("[createCollection]", err);
    return null;
  }
}

export async function updateCollection(
  userId: string,
  collectionId: string,
  data: { name: string; description: string | null },
): Promise<CollectionDetail | null> {
  try {
    const updated = await prisma.collection.updateMany({
      where: { id: collectionId, userId },
      data: { name: data.name, description: data.description },
    });
    if (updated.count === 0) return null;
    return getCollectionDetail(userId, collectionId);
  } catch (err) {
    console.error("[updateCollection]", err);
    return null;
  }
}

export async function deleteCollection(userId: string, collectionId: string): Promise<boolean> {
  try {
    const deleted = await prisma.collection.deleteMany({
      where: { id: collectionId, userId },
    });
    return deleted.count > 0;
  } catch (err) {
    console.error("[deleteCollection]", err);
    return false;
  }
}

export type SearchIndexCollection = {
  id: string;
  name: string;
  itemCount: number;
};

export async function getSearchIndexCollections(userId: string): Promise<SearchIndexCollection[]> {
  try {
    const collections = await prisma.collection.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true, _count: { select: { items: true } } },
    });

    return collections.map((col) => ({
      id: col.id,
      name: col.name,
      itemCount: col._count.items,
    }));
  } catch (err) {
    console.error("[getSearchIndexCollections]", err);
    return [];
  }
}

export type CollectionOption = {
  id: string;
  name: string;
};

export async function getUserCollections(userId: string): Promise<CollectionOption[]> {
  try {
    return await prisma.collection.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  } catch (err) {
    console.error("[getUserCollections]", err);
    return [];
  }
}

export async function getCollectionStats(
  userId: string,
): Promise<{ totalCollections: number; favoriteCollections: number }> {
  try {
    const [totalCollections, favoriteCollections] = await Promise.all([
      prisma.collection.count({ where: { userId } }),
      prisma.collection.count({ where: { userId, isFavorite: true } }),
    ]);
    return { totalCollections, favoriteCollections };
  } catch (err) {
    console.error("[getCollectionStats]", err);
    return { totalCollections: 0, favoriteCollections: 0 };
  }
}
