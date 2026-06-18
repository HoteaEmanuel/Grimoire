export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AuthToast } from "@/components/auth/AuthToast";
import { ItemDrawer } from "@/components/items/ItemDrawer";
import { CommandPalette } from "@/components/search/CommandPalette";
import { getSession } from "@/lib/session";
import { getSidebarItemTypes, getSearchIndexItems } from "@/lib/db/items";
import { getSidebarCollections, getSearchIndexCollections } from "@/lib/db/collections";

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const userId = session?.user?.id ?? "";

  const [itemTypes, collections, searchItems, searchCollections] = await Promise.all([
    getSidebarItemTypes(userId),
    getSidebarCollections(userId),
    getSearchIndexItems(userId),
    getSearchIndexCollections(userId),
  ]);

  return (
    <DashboardShell
      sidebarItemTypes={itemTypes}
      sidebarCollections={collections}
      user={
        session?.user
          ? {
              name: session.user.name ?? "",
              email: session.user.email ?? "",
              image: session.user.image,
            }
          : null
      }
    >
      <Suspense>
        <AuthToast />
      </Suspense>
      {children}
      <ItemDrawer />
      <CommandPalette items={searchItems} collections={searchCollections} />
    </DashboardShell>
  );
}
