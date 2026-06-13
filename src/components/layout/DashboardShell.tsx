"use client";

import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { SidebarContent } from "./SidebarContent";
import type { SidebarItemType } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";

interface DashboardShellProps {
  children: React.ReactNode;
  sidebarItemTypes: SidebarItemType[];
  sidebarCollections: SidebarCollection[];
}

export function DashboardShell({ children, sidebarItemTypes, sidebarCollections }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background">
      <Header onMenuClick={() => setMobileOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
          itemTypes={sidebarItemTypes}
          collections={sidebarCollections}
        />

        {/* Mobile sidebar via Sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            showCloseButton={false}
            className="gap-0 p-0 w-64 bg-sidebar border-sidebar-border flex flex-col"
          >
            <div className="flex items-center h-13 shrink-0 border-b border-sidebar-border px-4">
              <span className="text-sm font-bold tracking-wide text-primary">
                GRIMOIRE
              </span>
            </div>
            <SidebarContent
              onClose={() => setMobileOpen(false)}
              itemTypes={sidebarItemTypes}
              collections={sidebarCollections}
            />
          </SheetContent>
        </Sheet>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
