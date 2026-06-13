import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

  const avatar = (
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
        collapsed ? "flex justify-center" : "flex items-center gap-3",
      )}
    >
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger render={<span className="block rounded-full" />}>
            {avatar}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="font-medium">{name}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <>
          {avatar}
          <div className="min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {name}
            </p>
            <p className="text-xs text-muted-foreground truncate">{email}</p>
          </div>
        </>
      )}
    </div>
  );
}
