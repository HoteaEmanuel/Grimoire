"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarContent } from "./SidebarContent";
import { cn } from "@/lib/utils";
import type { SidebarItemType } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  itemTypes: SidebarItemType[];
  collections: SidebarCollection[];
  user: { name: string; email: string; image?: string | null } | null;
  userIsPro: boolean;
}

export function Sidebar({ collapsed, onToggleCollapse, itemTypes, collections, user, userIsPro }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-200",
        collapsed ? "w-14" : "w-64",
      )}
    >
      {/* Collapse toggle */}
      <div
        className={cn(
          "flex items-center h-13 shrink-0 border-b border-sidebar-border px-2",
          collapsed ? "justify-center" : "justify-end",
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleCollapse}
          className="size-7 text-muted-foreground hover:text-sidebar-foreground hover:bg-white/8"
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>

      <SidebarContent sidebarCollapsed={collapsed} itemTypes={itemTypes} collections={collections} user={user} userIsPro={userIsPro} />
    </aside>
  );
}
