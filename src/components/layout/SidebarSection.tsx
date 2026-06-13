import { type LucideIcon } from "lucide-react";

interface SidebarSectionProps {
  title: string;
  icon?: LucideIcon;
  collapsed: boolean;
  children: React.ReactNode;
}

export function SidebarSection({
  title,
  icon: Icon,
  collapsed,
  children,
}: SidebarSectionProps) {
  return (
    <section>
      {collapsed ? (
        Icon && (
          <div className="flex justify-center pb-1">
            <Icon className="size-3 text-muted-foreground/40" />
          </div>
        )
      ) : (
        <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/90">
          {title}
        </p>
      )}
      <div
        className={
          collapsed
            ? "flex flex-col items-center gap-0.5 px-1"
            : "space-y-0.5 px-2"
        }
      >
        {children}
      </div>
    </section>
  );
}
