"use client";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ItemContentEditor } from "@/components/shared/ItemContentEditor";
import { TagInput } from "@/components/shared/TagInput";
import { TagSuggestions } from "@/components/shared/TagSuggestions";
import { GenerateDescriptionButton } from "@/components/shared/GenerateDescriptionButton";
import { PromptOptimizerButton } from "@/components/shared/PromptOptimizerButton";
import { CollectionSelect } from "@/components/shared/CollectionSelect";
import { SUPPORTED_LANGUAGES, CODE_TYPE_SLUGS, TEXT_TYPE_SLUGS } from "@/lib/item-types";
import type { ItemDetail } from "@/lib/db/items";
import type { EditState } from "./item-drawer-types";

interface ItemDrawerEditBodyProps {
  item: ItemDetail;
  editState: EditState;
  onFieldChange: (key: keyof Omit<EditState, "tags" | "collectionIds">, value: string) => void;
  onTagsChange: (tags: string[]) => void;
  onCollectionIdsChange: (collectionIds: string[]) => void;
  collectionSelectContainer?: HTMLElement | null;
  userIsPro: boolean;
}

export function ItemDrawerEditBody({
  item,
  editState,
  onFieldChange,
  onTagsChange,
  onCollectionIdsChange,
  collectionSelectContainer,
  userIsPro,
}: ItemDrawerEditBodyProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Description</label>
          <GenerateDescriptionButton
            title={editState.title}
            content={editState.content || undefined}
            url={editState.url || undefined}
            fileName={item.fileName || undefined}
            onGenerated={(summary) => onFieldChange("description", summary)}
            isPro={userIsPro}
          />
        </div>
        <Textarea
          value={editState.description}
          onChange={(e) => onFieldChange("description", e.target.value)}
          placeholder="Optional description"
        />
      </div>

      {TEXT_TYPE_SLUGS.has(item.typeSlug) && (
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Content</label>
          {item.typeSlug === "prompts" && (
            <PromptOptimizerButton
              title={editState.title}
              content={editState.content}
              onAccept={(optimized) => onFieldChange("content", optimized)}
              isPro={userIsPro}
            />
          )}
          <ItemContentEditor
            typeSlug={item.typeSlug}
            value={editState.content}
            mode="edit"
            onChange={(v) => onFieldChange("content", v)}
            language={editState.language || undefined}
            placeholder="Write markdown here…"
          />
        </div>
      )}

      {CODE_TYPE_SLUGS.has(item.typeSlug) && (
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">Language</label>
          <select
            value={editState.language}
            onChange={(e) => onFieldChange("language", e.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            <option value="">Select language</option>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang} value={lang} className="bg-popover">
                {lang}
              </option>
            ))}
          </select>
        </div>
      )}

      {item.typeSlug === "links" && (
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground uppercase tracking-wider">URL</label>
          <Input
            type="url"
            value={editState.url}
            onChange={(e) => onFieldChange("url", e.target.value)}
            placeholder="https://..."
          />
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground uppercase tracking-wider">Tags</label>
        <TagInput tags={editState.tags} onChange={onTagsChange} />
        <TagSuggestions
          title={editState.title}
          content={editState.content || undefined}
          existingTags={editState.tags}
          onAccept={(tag) => onTagsChange(editState.tags.includes(tag) ? editState.tags : [...editState.tags, tag])}
          isPro={userIsPro}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs text-muted-foreground uppercase tracking-wider">Collections</label>
        <CollectionSelect
          selectedIds={editState.collectionIds}
          onChange={onCollectionIdsChange}
          container={collectionSelectContainer}
        />
      </div>

      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="uppercase tracking-wider w-24 shrink-0">Type</span>
          <span>{item.typeName}</span>
        </div>
      </div>
    </div>
  );
}
