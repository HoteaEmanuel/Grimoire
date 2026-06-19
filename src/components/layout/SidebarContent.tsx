"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import type { SidebarItemType } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";
import { ICON_MAP } from "@/lib/item-types";
import { useToggleOverridesStore } from "@/lib/stores/toggle-overrides-store";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarCollectionItem } from "./SidebarCollectionItem";
import { SidebarSection } from "./SidebarSection";
import { SidebarCollapsibleSection } from "./SidebarCollapsibleSection";
import { SidebarUserFooter } from "./SidebarUserFooter";

interface SidebarContentProps {
  sidebarCollapsed?: boolean;
  onClose?: () => void;
  itemTypes: SidebarItemType[];
  collections: SidebarCollection[];
  user: { name: string; email: string; image?: string | null } | null;
}

function CollectionSubLabel({
  label,
  sidebarCollapsed,
}: {
  label: string;
  sidebarCollapsed: boolean;
}) {
  if (sidebarCollapsed) return null;
  return (
    <p className="px-2 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/80 first:pt-0">
      {label}
    </p>
  );
}

export function SidebarContent({
  sidebarCollapsed = false,
  onClose,
  itemTypes,
  collections,
  user,
}: SidebarContentProps) {
  const pathname = usePathname();
  const overrides = useToggleOverridesStore((s) => s.overrides);

  const isCollectionFavorite = (col: SidebarCollection) =>
    overrides[`collection:${col.id}`] ?? col.isFavorite;

  const favoriteCollections = collections.filter(isCollectionFavorite);
  const recentCollections = collections
    .filter((c) => !isCollectionFavorite(c))
    .slice(0, 4);

  return (
    <>
      <nav className="flex-1 overflow-y-auto py-3 space-y-4">
        <SidebarSection title="Items" collapsed={sidebarCollapsed}>
          {itemTypes.map((type) => {
            const Icon = ICON_MAP[type.icon];
            if (!Icon) return null;
            return (
              <SidebarNavItem
                key={type.id}
                href={`/items/${type.slug}`}
                icon={Icon}
                iconColor={type.color}
                label={type.name + "s"}
                count={type.count}
                collapsed={sidebarCollapsed}
                active={pathname === `/items/${type.slug}`}
                isPro={type.slug === "files" || type.slug === "images"}
                onClick={onClose}
              />
            );
          })}
        </SidebarSection>

        <Separator className="bg-sidebar-border" />

        <SidebarCollapsibleSection
          title="Collections"
          sidebarCollapsed={sidebarCollapsed}
          defaultOpen
        >
          {favoriteCollections.length > 0 && (
            <>
              <CollectionSubLabel
                label="Favorites"
                sidebarCollapsed={sidebarCollapsed}
              />
              {favoriteCollections.map((col) => (
                <SidebarCollectionItem
                  key={col.id}
                  href={`/collections/${col.id}`}
                  name={col.name}
                  color={col.dominantTypeColor}
                  isFavorite
                  collapsed={sidebarCollapsed}
                  onClick={onClose}
                />
              ))}
            </>
          )}

          {recentCollections.length > 0 && (
            <>
              <CollectionSubLabel
                label="Recent"
                sidebarCollapsed={sidebarCollapsed}
              />
              {recentCollections.map((col) => (
                <SidebarCollectionItem
                  key={col.id}
                  href={`/collections/${col.id}`}
                  name={col.name}
                  color={col.dominantTypeColor}
                  isFavorite={false}
                  collapsed={sidebarCollapsed}
                  onClick={onClose}
                />
              ))}
            </>
          )}

          {favoriteCollections.length === 0 &&
            recentCollections.length === 0 &&
            !sidebarCollapsed && (
              <p className="px-2 py-1 text-[11px] text-muted-foreground/50">
                No collections yet.
              </p>
            )}

          {!sidebarCollapsed && (
            <Link
              href="/collections"
              onClick={onClose}
              className="block px-2 pt-1 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              View all collections →
            </Link>
          )}
        </SidebarCollapsibleSection>
      </nav>

      <SidebarUserFooter
        name={user?.name ?? ""}
        email={user?.email ?? ""}
        image={user?.image ?? null}
        collapsed={sidebarCollapsed}
      />
    </>
  );
}
