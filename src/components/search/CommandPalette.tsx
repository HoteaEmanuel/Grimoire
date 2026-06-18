"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { defaultFilter } from "cmdk";
import { Folder } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { useCommandPaletteStore } from "@/lib/stores/command-palette-store";
import { useItemDrawerStore } from "@/lib/stores/item-drawer-store";
import { ICON_MAP } from "@/lib/item-types";
import type { SearchIndexItem } from "@/lib/db/items";
import type { SearchIndexCollection } from "@/lib/db/collections";

interface CommandPaletteProps {
  items: SearchIndexItem[];
  collections: SearchIndexCollection[];
}

// Raise the bar above cmdk's default (any nonzero score matches) so scattered,
// low-confidence fuzzy hits don't clutter results — only reasonably close matches show.
const STRICT_MATCH_THRESHOLD = 0.3;

function strictFilter(value: string, search: string, keywords?: string[]) {
  const score = defaultFilter(value, search, keywords);
  return score < STRICT_MATCH_THRESHOLD ? 0 : score;
}

export function CommandPalette({ items, collections }: CommandPaletteProps) {
  const open = useCommandPaletteStore((state) => state.open);
  const setOpen = useCommandPaletteStore((state) => state.setOpen);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        useCommandPaletteStore.getState().toggle();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  function selectItem(id: string) {
    setOpen(false);
    useItemDrawerStore.getState().openDrawer(id);
  }

  function selectCollection(id: string) {
    setOpen(false);
    router.push(`/collections/${id}`);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} className="sm:max-w-2xl">
      <Command filter={strictFilter}>
        <CommandInput placeholder="Search items and collections..." />
        <CommandList className="max-h-112">
          <CommandEmpty>No results found.</CommandEmpty>
          {items.length > 0 && (
            <CommandGroup heading="Items">
              {items.map((item) => {
                const Icon = ICON_MAP[item.typeIconName];
                return (
                  <CommandItem
                    key={item.id}
                    value={item.title}
                    keywords={item.preview ? [item.preview] : undefined}
                    onSelect={() => selectItem(item.id)}
                  >
                    {Icon && <Icon className="size-4" style={{ color: item.typeColor }} />}
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate">{item.title}</span>
                      {item.preview && (
                        <span className="truncate text-xs text-muted-foreground">
                          {item.preview}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
          {collections.length > 0 && (
            <CommandGroup heading="Collections">
              {collections.map((collection) => (
                <CommandItem
                  key={collection.id}
                  value={collection.name}
                  onSelect={() => selectCollection(collection.id)}
                >
                  <Folder className="size-4 text-muted-foreground" />
                  <span className="truncate">{collection.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {collection.itemCount} {collection.itemCount === 1 ? "item" : "items"}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
