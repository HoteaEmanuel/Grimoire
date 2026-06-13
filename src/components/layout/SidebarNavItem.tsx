"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarNavItemProps {
  href: string;
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  count?: number;
  collapsed: boolean;
  active?: boolean;
  onClick?: () => void;
}

export function SidebarNavItem({
  href,
  icon: Icon,
  iconColor,
  label,
  count,
  collapsed,
  active,
  onClick,
}: SidebarNavItemProps) {
  const item = (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "w-full text-sm font-normal text-sidebar-foreground/90",
        "hover:text-sidebar-foreground hover:bg-white/10",
        active && "bg-white/10 text-sidebar-foreground font-medium",
        collapsed
          ? "h-9 w-9 justify-center px-0"
          : "justify-start gap-2.5 h-8 px-2",
      )}
    >
      <Icon
        className="size-4 shrink-0"
        style={iconColor ? { color: iconColor } : undefined}
      />
      {!collapsed && (
        <>
          <span>{label}</span>
          {count !== undefined && count > 0 && (
            <span className="ml-auto text-xs text-muted-foreground/90 tabular-nums">
              {count}
            </span>
          )}
        </>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger render={<span className="block" />}>
          {item}
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return item;
}
