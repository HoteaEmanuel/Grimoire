"use client";

import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Header } from "./Header";
import { SidebarContent } from "./SidebarContent";
import type { SidebarItemType } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";

interface MobileSheetControllerProps {
  itemTypes: SidebarItemType[];
  collections: SidebarCollection[];
  user: { name: string; email: string; image?: string | null } | null;
  userIsPro: boolean;
}

export function MobileSheetController({
  itemTypes,
  collections,
  user,
  userIsPro,
}: MobileSheetControllerProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <Header onMenuClick={() => setMobileOpen(true)} userIsPro={userIsPro} />
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="gap-0 p-0 w-64 bg-sidebar border-sidebar-border flex flex-col"
        >
          <div className="flex items-center h-13 shrink-0 border-b border-sidebar-border px-4">
            <span className="text-sm font-bold tracking-wide text-primary">GRIMOIRE</span>
          </div>
          <SidebarContent
            onClose={() => setMobileOpen(false)}
            itemTypes={itemTypes}
            collections={collections}
            user={user}
            userIsPro={userIsPro}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
