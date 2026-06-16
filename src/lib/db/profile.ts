import { prisma } from "@/lib/prisma";

export type ItemTypeBreakdown = {
  typeName: string;
  typeColor: string;
  typeIcon: string;
  count: number;
};

export type ProfileData = {
  totalItems: number;
  totalCollections: number;
  itemsByType: ItemTypeBreakdown[];
  hasPassword: boolean;
  createdAt: Date;
};

export async function getProfileData(userId: string): Promise<ProfileData | null> {
  try {
    const [user, totalItems, totalCollections, grouped] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { password: true, createdAt: true },
      }),
      prisma.item.count({ where: { userId } }),
      prisma.collection.count({ where: { userId } }),
      prisma.item.groupBy({ by: ["itemTypeId"], where: { userId }, _count: true }),
    ]);

    if (!user) return null;

    const typeIds = grouped.map((g) => g.itemTypeId);
    const types = await prisma.itemType.findMany({
      where: { id: { in: typeIds } },
      select: { id: true, name: true, color: true, icon: true },
    });

    const typeMap = new Map(types.map((t) => [t.id, t]));

    const itemsByType: ItemTypeBreakdown[] = grouped
      .map((g) => {
        const type = typeMap.get(g.itemTypeId);
        if (!type) return null;
        return { typeName: type.name, typeColor: type.color, typeIcon: type.icon, count: g._count };
      })
      .filter((x): x is ItemTypeBreakdown => x !== null)
      .sort((a, b) => b.count - a.count);

    return {
      totalItems,
      totalCollections,
      itemsByType,
      hasPassword: !!user.password,
      createdAt: user.createdAt,
    };
  } catch (err) {
    console.error("[getProfileData]", err);
    return null;
  }
}
