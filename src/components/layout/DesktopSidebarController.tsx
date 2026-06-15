"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import type { SidebarItemType } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";

interface DesktopSidebarControllerProps {
  itemTypes: SidebarItemType[];
  collections: SidebarCollection[];
  user: { name: string; email: string; image?: string | null } | null;
}

export function DesktopSidebarController({
  itemTypes,
  collections,
  user,
}: DesktopSidebarControllerProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Sidebar
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed((prev) => !prev)}
      itemTypes={itemTypes}
      collections={collections}
      user={user}
    />
  );
}
