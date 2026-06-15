import { prisma } from "@/lib/prisma";

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

export async function getRecentCollections(userId: string): Promise<CollectionWithMeta[]> {
  try {
    const collections = await prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        name: true,
        description: true,
        isFavorite: true,
        createdAt: true,
        _count: { select: { items: true } },
        items: {
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
        if (existing) {
          existing.count++;
        } else {
          typeCounts.set(t.id, { count: 1, color: t.color, iconName: t.icon });
        }
      }

      let dominantTypeColor = "#6b7280";
      let maxCount = 0;
      for (const val of typeCounts.values()) {
        if (val.count > maxCount) {
          maxCount = val.count;
          dominantTypeColor = val.color;
        }
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
        dominantTypeColor,
        typeIcons,
        createdAt: col.createdAt,
      };
    });
  } catch (err) {
    console.error("[getRecentCollections]", err);
    return [];
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

    return collections.map((col) => {
      const typeCounts = new Map<string, { count: number; color: string }>();
      for (const ic of col.items) {
        const t = ic.item.itemType;
        const existing = typeCounts.get(t.id);
        if (existing) {
          existing.count++;
        } else {
          typeCounts.set(t.id, { count: 1, color: t.color });
        }
      }

      let dominantTypeColor = "#6b7280";
      let maxCount = 0;
      for (const val of typeCounts.values()) {
        if (val.count > maxCount) {
          maxCount = val.count;
          dominantTypeColor = val.color;
        }
      }

      return { id: col.id, name: col.name, isFavorite: col.isFavorite, dominantTypeColor };
    });
  } catch (err) {
    console.error("[getSidebarCollections]", err);
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
