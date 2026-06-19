import { DesktopSidebarController } from "./DesktopSidebarController";
import { MobileSheetController } from "./MobileSheetController";
import type { SidebarItemType } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarItemTypes: SidebarItemType[];
  sidebarCollections: SidebarCollection[];
  user: { name: string; email: string; image?: string | null } | null;
  userIsPro: boolean;
}

export function DashboardShell({
  children,
  sidebarItemTypes,
  sidebarCollections,
  user,
  userIsPro,
}: DashboardShellProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      <MobileSheetController
        itemTypes={sidebarItemTypes}
        collections={sidebarCollections}
        user={user}
        userIsPro={userIsPro}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <DesktopSidebarController
          itemTypes={sidebarItemTypes}
          collections={sidebarCollections}
          user={user}
          userIsPro={userIsPro}
        />

        <main className="flex-1 min-h-0 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
