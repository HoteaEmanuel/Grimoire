"use client";

import { Search, Plus, BookMarked, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
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
          placeholder="Search commands, snippets, links from your grimoire..."
          className="pl-9 h-8 text-sm bg-muted/40 border-border/60"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 h-8 text-xs border-border/60 text-muted-foreground hover:text-foreground"
        >
          <BookMarked className="size-3.5" />
          New Collection
        </Button>
        <Button
          size="sm"
          className="gap-1.5 h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-3.5" />
          New Item
        </Button>
      </div>
    </header>
  );
}
