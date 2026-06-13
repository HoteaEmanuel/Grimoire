"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Code,
  Sparkles,
  StickyNote,
  Terminal,
  Link as LinkIcon,
  File,
  Image,
  type LucideIcon,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { SidebarItemType } from "@/lib/db/items";
import type { SidebarCollection } from "@/lib/db/collections";
import { SidebarNavItem } from "./SidebarNavItem";
import { SidebarCollectionItem } from "./SidebarCollectionItem";
import { SidebarSection } from "./SidebarSection";
import { SidebarCollapsibleSection } from "./SidebarCollapsibleSection";
import { SidebarUserFooter } from "./SidebarUserFooter";

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  StickyNote,
  Terminal,
  Link: LinkIcon,
  File,
  Image,
};

interface SidebarContentProps {
  sidebarCollapsed?: boolean;
  onClose?: () => void;
  itemTypes: SidebarItemType[];
  collections: SidebarCollection[];
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
}: SidebarContentProps) {
  const pathname = usePathname();

  const favoriteCollections = collections.filter((c) => c.isFavorite);
  const recentCollections = collections.filter((c) => !c.isFavorite).slice(0, 4);

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
                href={`/dashboard/items/${type.slug}`}
                icon={Icon}
                iconColor={type.color}
                label={type.name + "s"}
                count={type.count}
                collapsed={sidebarCollapsed}
                active={pathname === `/dashboard/items/${type.slug}`}
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
                  href={`/dashboard/collections/${col.id}`}
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
                  href={`/dashboard/collections/${col.id}`}
                  name={col.name}
                  color={col.dominantTypeColor}
                  isFavorite={false}
                  collapsed={sidebarCollapsed}
                  onClick={onClose}
                />
              ))}
            </>
          )}

          {favoriteCollections.length === 0 && recentCollections.length === 0 && !sidebarCollapsed && (
            <p className="px-2 py-1 text-[11px] text-muted-foreground/50">
              No collections yet.
            </p>
          )}

          {!sidebarCollapsed && (
            <Link
              href="/dashboard/collections"
              onClick={onClose}
              className="block px-2 pt-1 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            >
              View all collections →
            </Link>
          )}
        </SidebarCollapsibleSection>
      </nav>

      <SidebarUserFooter
        name="Emanuel Hotea"
        email="emanuelhotea1@gmail.com"
        image={null}
        collapsed={sidebarCollapsed}
      />
    </>
  );
}
