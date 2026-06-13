"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface SidebarCollapsibleSectionProps {
  title: string;
  /** Whether the parent sidebar is in icon-only (collapsed) mode. */
  sidebarCollapsed: boolean;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function SidebarCollapsibleSection({
  title,
  sidebarCollapsed,
  defaultOpen = true,
  children,
}: SidebarCollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Collapsible open={sidebarCollapsed ? true : open} onOpenChange={setOpen}>
      {/* Trigger is hidden in icon-only mode — section stays open */}
      {!sidebarCollapsed && (
        <CollapsibleTrigger
          className={cn(
            "flex w-full items-center justify-between px-3 py-4",
            "text-[10px] font-semibold uppercase tracking-widest",
            "text-muted-foreground/90 hover:text-muted-foreground transition-colors",
          )}
        >
          {title}
          <ChevronDown
            className={cn(
              "size-3 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </CollapsibleTrigger>
      )}

      <CollapsibleContent>
        <div
          className={
            sidebarCollapsed
              ? "flex flex-col items-center gap-0.5 px-1"
              : "space-y-0.5 px-2"
          }
        >
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
