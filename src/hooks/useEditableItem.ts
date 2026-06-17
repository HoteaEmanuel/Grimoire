import { useState } from "react";
import { toEditState, type EditState } from "@/components/items/item-drawer-types";
import type { ItemDetail } from "@/lib/db/items";

export function useEditableItem(item: ItemDetail | null) {
  const [editing, setEditing] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  // Derived state: reset edit mode when a different item is loaded
  const [prevItemId, setPrevItemId] = useState<string | undefined>(item?.id);
  if (item?.id !== prevItemId) {
    setPrevItemId(item?.id);
    setEditing(false);
    setEditState(null);
  }

  function startEdit() {
    if (!item) return;
    setEditState(toEditState(item));
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setEditState(null);
  }

  function onFieldChange(key: keyof Omit<EditState, "tags">, value: string) {
    setEditState((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  function onTagsChange(tags: string[]) {
    setEditState((prev) => (prev ? { ...prev, tags } : prev));
  }

  return { editing, editState, startEdit, cancelEdit, onFieldChange, onTagsChange };
}
