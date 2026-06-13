"use client";

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
import { mockItemTypes, mockCollections, mockItems, mockUser } from "@/lib/mock-data";
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
}: SidebarContentProps) {
  const pathname = usePathname();

  const itemCountByType = mockItemTypes.reduce<Record<string, number>>((acc, type) => {
    acc[type.id] = mockItems.filter((item) => item.itemTypeId === type.id).length;
    return acc;
  }, {});

  const favoriteCollections = mockCollections.filter((c) => c.isFavorite);
  const recentCollections = [...mockCollections]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  return (
    <>
      <nav className="flex-1 overflow-y-auto py-3 space-y-4">
        <SidebarSection title="Items" collapsed={sidebarCollapsed}>
          {mockItemTypes.map((type) => {
            const Icon = ICON_MAP[type.icon];
            if (!Icon) return null;
            return (
              <SidebarNavItem
                key={type.id}
                href={`/dashboard/items/${type.slug}`}
                icon={Icon}
                iconColor={type.color}
                label={type.name+'s'}
                count={itemCountByType[type.id]}
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
              isFavorite={col.isFavorite}
              collapsed={sidebarCollapsed}
              onClick={onClose}
            />
          ))}
        </SidebarCollapsibleSection>
      </nav>

      <SidebarUserFooter
        name={mockUser.name}
        email={mockUser.email}
        image={mockUser.image}
        collapsed={sidebarCollapsed}
      />
    </>
  );
}
