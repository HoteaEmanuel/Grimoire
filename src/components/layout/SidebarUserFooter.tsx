"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarUserFooterProps {
  name: string;
  email: string;
  image?: string | null;
  collapsed: boolean;
}

export function SidebarUserFooter({
  name,
  email,
  image,
  collapsed,
}: SidebarUserFooterProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const avatarEl = (
    <Avatar className="size-8 shrink-0">
      <AvatarImage src={image ?? undefined} alt={name} />
      <AvatarFallback className="text-xs font-semibold bg-primary/20 text-primary">
        {initials}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <div
      className={cn(
        "shrink-0 border-t border-sidebar-border p-3",
        collapsed ? "flex justify-center" : "flex items-center",
      )}
    >
      <DropdownMenu>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <DropdownMenuTrigger
                  render={
                    <button className="block rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  }
                />
              }
            >
              {avatarEl}
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="font-medium">{name}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <DropdownMenuTrigger
            render={
              <button className="flex items-center gap-3 min-w-0 w-full text-left rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            }
          >
            {avatarEl}
            <div className="min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
          </DropdownMenuTrigger>
        )}

        <DropdownMenuContent side="top" align={collapsed ? "center" : "start"} className="w-52">
          <DropdownMenuItem render={<Link href="/profile" />}>
            <User className="size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/settings" />}>
            <Settings className="size-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
          >
            <LogOut className="size-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
