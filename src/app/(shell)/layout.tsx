export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { AuthToast } from "@/components/auth/AuthToast";
import { ItemDrawer } from "@/components/items/ItemDrawer";
import { CommandPalette } from "@/components/search/CommandPalette";
import { EditorPreferencesHydrator } from "@/components/shared/EditorPreferencesHydrator";
import { getSession } from "@/lib/session";
import { getSidebarItemTypes, getSearchIndexItems } from "@/lib/db/items";
import { getSidebarCollections, getSearchIndexCollections } from "@/lib/db/collections";
import { getEditorPreferences } from "@/lib/db/editor-preferences";

export default async function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const userId = session?.user?.id ?? "";

  const [itemTypes, collections, searchItems, searchCollections, editorPreferences] =
    await Promise.all([
      getSidebarItemTypes(userId),
      getSidebarCollections(userId),
      getSearchIndexItems(userId),
      getSearchIndexCollections(userId),
      getEditorPreferences(userId),
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
      userIsPro={session?.user?.isPro ?? false}
    >
      <Suspense>
        <AuthToast />
      </Suspense>
      {children}
      <ItemDrawer />
      <CommandPalette items={searchItems} collections={searchCollections} />
      <EditorPreferencesHydrator preferences={editorPreferences} />
    </DashboardShell>
  );
}
