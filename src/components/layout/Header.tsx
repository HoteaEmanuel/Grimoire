"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, Plus, BookMarked, Menu, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreateItemModal } from "@/components/items/CreateItemModal";
import { CreateCollectionModal } from "@/components/collections/CreateCollectionModal";
import { CREATE_TYPE_SLUGS, type CreateItemInput } from "@/lib/schemas/items";
import { useCommandPaletteStore } from "@/lib/stores/command-palette-store";

const TYPE_SLUG_SET = new Set<string>(CREATE_TYPE_SLUGS);

function defaultTypeFromPath(pathname: string): CreateItemInput["typeSlug"] {
  const segment = pathname.split("/").pop() ?? "";
  return TYPE_SLUG_SET.has(segment)
    ? (segment as CreateItemInput["typeSlug"])
    : "snippets";
}

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const defaultTypeSlug = defaultTypeFromPath(pathname);

  return (
    <>
      <header className="h-13 shrink-0 border-b border-border bg-background/80 backdrop-blur-sm flex items-center gap-3 px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden size-7 text-muted-foreground hover:text-foreground"
        >
          <Menu className="size-4" />
        </Button>

        <span className="text-sm font-bold tracking-wide text-primary mr-1">
          GRIMOIRE
        </span>

        <div className="flex-1 max-w-lg relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search your grimoire... (⌘K)"
            readOnly
            onClick={() => useCommandPaletteStore.getState().setOpen(true)}
            className="pl-9 h-8 text-sm bg-muted/40 border-border/60 cursor-pointer"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/favorites")}
            className="size-8 text-muted-foreground hover:text-foreground"
            aria-label="Favorites"
          >
            <Star className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 h-8 text-xs border-border/60 text-muted-foreground hover:text-foreground"
            onClick={() => setCreateCollectionOpen(true)}
          >
            <BookMarked className="size-3.5" />
            New Collection
          </Button>
          <Button
            size="sm"
            className="gap-1.5 h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-3.5" />
            New Item
          </Button>
        </div>
      </header>

      <CreateItemModal open={createOpen} onOpenChange={setCreateOpen} defaultTypeSlug={defaultTypeSlug} />
      <CreateCollectionModal open={createCollectionOpen} onOpenChange={setCreateCollectionOpen} />
    </>
  );
}
