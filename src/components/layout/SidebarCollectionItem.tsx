"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarCollectionItemProps {
  href: string;
  name: string;
  color: string;
  isFavorite?: boolean;
  collapsed: boolean;
  onClick?: () => void;
}

export function SidebarCollectionItem({
  href,
  name,
  color,
  isFavorite,
  collapsed,
  onClick,
}: SidebarCollectionItemProps) {
  const item = (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "w-full text-sm font-normal text-sidebar-foreground/85",
        "hover:text-sidebar-foreground hover:bg-white/8",
        collapsed
          ? "h-9 w-9 justify-center px-0"
          : "justify-start gap-2.5 h-8 px-2",
      )}
    >
      <span
        className="size-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      {!collapsed && (
        <>
          <span className="truncate flex-1">{name}</span>
          {isFavorite && (
            <Star className="size-3 shrink-0 text-muted-foreground/50" />
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
        <TooltipContent side="right">{name}</TooltipContent>
      </Tooltip>
    );
  }

  return item;
}
