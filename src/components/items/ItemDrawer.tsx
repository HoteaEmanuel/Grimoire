"use client";

import { useRouter } from "next/navigation";
import { useItemDrawerStore } from "@/lib/stores/item-drawer-store";
import { useUpdateItem, useDeleteItem } from "@/lib/mutations/items";
import { toggleItemFavorite, toggleItemPin } from "@/actions/items";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useFetchItem } from "@/hooks/useFetchItem";
import { useEditableItem } from "@/hooks/useEditableItem";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { Star, Pin, Copy, Pencil, Trash2, X, Check } from "lucide-react";
import { Drawer, DrawerContent, DrawerClose } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { ItemDrawerViewBody } from "./ItemDrawerViewBody";
import { ItemDrawerEditBody } from "./ItemDrawerEditBody";

function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-3">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
        <Skeleton className="h-4 w-1/2 rounded" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-14 rounded" />
        <Skeleton className="h-5 w-14 rounded" />
        <Skeleton className="h-5 w-14 rounded" />
      </div>
    </div>
  );
}

interface ItemDrawerProps {
  userIsPro: boolean;
}

export function ItemDrawer({ userIsPro }: ItemDrawerProps) {
  const { selectedId, open, closeDrawer } = useItemDrawerStore();
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [drawerContentEl, setDrawerContentEl] = useState<HTMLDivElement | null>(null);

  const { item, setItem, loading } = useFetchItem(selectedId, open, closeDrawer);
  const { editing, editState, startEdit, cancelEdit, onFieldChange, onTagsChange, onCollectionIdsChange } = useEditableItem(item);
  const { copied, copy } = useCopyToClipboard();
  const { value: isFavorite, toggle: toggleFavorite } = useOptimisticToggle(
    item ? `item:${item.id}` : undefined,
    item?.isFavorite ?? false,
    (next) => toggleItemFavorite(item!.id, next),
  );
  const { value: isPinned, toggle: togglePin } = useOptimisticToggle(
    item ? `item-pin:${item.id}` : undefined,
    item?.isPinned ?? false,
    (next) => toggleItemPin(item!.id, next),
    (next) => (next ? "Item pinned" : "Item unpinned"),
  );

  const updateMutation = useUpdateItem((updated) => {
    setItem(updated ?? null);
    cancelEdit();
    router.refresh();
  });

  const deleteMutation = useDeleteItem(() => {
    closeDrawer();
    router.refresh();
  });

  function handleCopy() {
    if (!item) return;
    copy(item.content ?? item.url ?? item.fileUrl ?? item.title);
  }

  function handleSave() {
    if (!item || !editState) return;
    updateMutation.mutate({
      id: item.id,
      data: {
        title: editState.title,
        description: editState.description || null,
        content: editState.content || null,
        url: editState.url || null,
        language: editState.language || null,
        tags: editState.tags,
        collectionIds: editState.collectionIds,
      },
    });
  }

  return (
    <>
      <Drawer open={open} onOpenChange={(v) => !v && closeDrawer()} direction="right">
        <DrawerContent
          ref={setDrawerContentEl}
          className="w-full sm:max-w-lg! fixed right-0 inset-y-0 rounded-l-xl border-l border-border bg-card flex flex-col overflow-hidden outline-none"
          onPointerDownOutside={(e) => {
            if ((e.target as HTMLElement)?.closest('[data-slot="popover-content"]')) {
              e.preventDefault();
            }
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-border shrink-0">
            {loading || !item ? (
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-6 w-40 rounded" />
              </div>
            ) : editing && editState ? (
              <Input
                className="text-base font-semibold flex-1 min-w-0 h-auto py-1"
                value={editState.title}
                onChange={(e) => onFieldChange("title", e.target.value)}
                placeholder="Title"
                autoFocus
              />
            ) : (
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Badge
                  className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0 h-5 rounded border-0 shrink-0"
                  style={{ backgroundColor: `${item.typeColor}22`, color: item.typeColor }}
                >
                  {item.typeName}
                </Badge>
                <h2 className="text-base font-semibold leading-snug truncate">{item.title}</h2>
              </div>
            )}
            <DrawerClose asChild>
              <Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground">
                <X size={15} />
              </Button>
            </DrawerClose>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {loading || !item ? (
              <DrawerSkeleton />
            ) : editing && editState ? (
              <ItemDrawerEditBody
                item={item}
                editState={editState}
                onFieldChange={onFieldChange}
                onTagsChange={onTagsChange}
                onCollectionIdsChange={onCollectionIdsChange}
                collectionSelectContainer={drawerContentEl}
                userIsPro={userIsPro}
              />
            ) : (
              <ItemDrawerViewBody item={item} userIsPro={userIsPro} />
            )}
          </div>

          {/* Action bar */}
          {editing ? (
            <div className="shrink-0 border-t border-border px-6 py-4 flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={updateMutation.isPending || !editState?.title.trim()}
              >
                <Check />
                {updateMutation.isPending ? "Saving…" : "Save"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelEdit}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="shrink-0 border-t border-border px-6 py-4 flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                title="Favorite"
                disabled={!item}
                onClick={toggleFavorite}
                style={isFavorite ? { color: "#f59e0b" } : undefined}
              >
                <Star size={15} fill={isFavorite ? "#f59e0b" : "none"} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                title="Pin"
                disabled={!item}
                onClick={togglePin}
                style={isPinned ? { color: "#94a3b8" } : undefined}
              >
                <Pin size={15} fill={isPinned ? "#94a3b8" : "none"} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                title={copied ? "Copied!" : "Copy"}
                disabled={!item}
                onClick={handleCopy}
                style={copied ? { color: "#22c55e" } : undefined}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                title="Edit"
                disabled={!item}
                onClick={startEdit}
              >
                <Pencil size={15} />
              </Button>
              <Button
                variant="destructive"
                size="icon-sm"
                title="Delete"
                disabled={!item}
                className="ml-auto"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 size={15} />
              </Button>
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete item?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-foreground">{item?.title}</strong> will be permanently
              deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setDeleteDialogOpen(false);
                if (item) deleteMutation.mutate(item.id);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
