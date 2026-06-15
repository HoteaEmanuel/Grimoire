"use client";

import Link from "next/link";
import { type LucideIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  isPro?: boolean;
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
  isPro,
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
          <span className="ml-auto flex items-center gap-1.5">
            {isPro && (
              <Badge className="h-4 px-1.5 text-[9px] font-bold tracking-wider rounded-sm border bg-[oklch(0.62_0.18_290/0.15)] text-[oklch(0.75_0.16_290)] border-[oklch(0.62_0.18_290/0.35)]">
                PRO
              </Badge>
            )}
            {count !== undefined && count > 0 && (
              <span className="text-xs text-muted-foreground/90 tabular-nums">
                {count}
              </span>
            )}
          </span>
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
