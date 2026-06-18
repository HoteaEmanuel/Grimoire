"use client";

import { useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { useCollectionsList } from "@/lib/queries/collections";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface CollectionSelectProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  container?: HTMLElement | null;
}

export function CollectionSelect({ selectedIds, onChange, container }: CollectionSelectProps) {
  const { data: collections = [], isLoading } = useCollectionsList();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 200);

  function toggle(id: string) {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  }

  if (isLoading) {
    return <Skeleton className="h-8 w-full rounded-md" />;
  }

  const selectedCollections = collections.filter((c) => selectedIds.includes(c.id));
  const visibleCollections = collections.filter((c) =>
    c.name.toLowerCase().includes(debouncedSearch.trim().toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-1.5">
      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={collections.length === 0}
              className="h-8 w-full justify-between text-sm font-normal"
            >
              <span className="text-muted-foreground">
                {collections.length === 0
                  ? "No collections yet"
                  : selectedIds.length === 0
                    ? "Select collections"
                    : `${selectedIds.length} collection${selectedIds.length === 1 ? "" : "s"} selected`}
              </span>
              <ChevronsUpDown className="size-3.5 opacity-50" />
            </Button>
          }
        />
        <PopoverContent className="w-(--anchor-width) p-0" align="start" container={container}>
          <Command shouldFilter={false}>
            <CommandInput
              value={search}
              onValueChange={setSearch}
              placeholder="Search collections..."
            />
            <CommandList>
              <CommandEmpty>No collections found.</CommandEmpty>
              <CommandGroup>
                {visibleCollections.map((collection) => {
                  const checked = selectedIds.includes(collection.id);
                  return (
                    <CommandItem
                      key={collection.id}
                      value={collection.name}
                      onSelect={() => toggle(collection.id)}
                      data-checked={checked}
                    >
                      <Checkbox checked={checked} className="pointer-events-none" />
                      {collection.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedCollections.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedCollections.map((collection) => (
            <Badge
              key={collection.id}
              variant="secondary"
              className="text-xs gap-1 cursor-pointer hover:bg-destructive/20"
              onClick={() => toggle(collection.id)}
            >
              {collection.name} ×
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
