import { prisma } from "@/lib/prisma";

const SEED_USER_EMAIL = "emanuelhotea1@gmail.com";

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

export async function getRecentCollections(): Promise<CollectionWithMeta[]> {
  const user = await prisma.user.findUnique({
    where: { email: SEED_USER_EMAIL },
    select: { id: true },
  });

  if (!user) return [];

  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      items: {
        include: {
          item: {
            include: { itemType: true },
          },
        },
      },
      _count: { select: { items: true } },
    },
  });

  return collections.map((col) => {
    const typeCounts = new Map<
      string,
      { count: number; color: string; iconName: string }
    >();

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
}

export type SidebarCollection = {
  id: string;
  name: string;
  isFavorite: boolean;
  dominantTypeColor: string;
};

export async function getSidebarCollections(): Promise<SidebarCollection[]> {
  const user = await prisma.user.findUnique({
    where: { email: SEED_USER_EMAIL },
    select: { id: true },
  });

  if (!user) return [];

  const collections = await prisma.collection.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    take: 8,
    include: {
      items: {
        include: {
          item: { include: { itemType: true } },
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

    return {
      id: col.id,
      name: col.name,
      isFavorite: col.isFavorite,
      dominantTypeColor,
    };
  });
}

export async function getCollectionStats(): Promise<{
  totalCollections: number;
  favoriteCollections: number;
}> {
  const user = await prisma.user.findUnique({
    where: { email: SEED_USER_EMAIL },
    select: { id: true },
  });

  if (!user) return { totalCollections: 0, favoriteCollections: 0 };

  const [totalCollections, favoriteCollections] = await Promise.all([
    prisma.collection.count({ where: { userId: user.id } }),
    prisma.collection.count({ where: { userId: user.id, isFavorite: true } }),
  ]);

  return { totalCollections, favoriteCollections };
}
