"use client";

import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagInput } from "@/components/shared/TagInput";
import { CollectionSelect } from "@/components/shared/CollectionSelect";
import { useCreateItem } from "@/lib/mutations/items";
import { CodeEditor } from "@/components/ui/code-editor";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { FileUpload } from "@/components/ui/file-upload";
import { SYSTEM_ITEM_TYPES, SUPPORTED_LANGUAGES } from "@/lib/item-types";
import { createItemSchema, type CreateItemInput } from "@/lib/schemas/items";

const ALL_CREATE_TYPES = SYSTEM_ITEM_TYPES;
const TEXT_TYPE_SLUGS = new Set(["snippets", "prompts", "notes", "commands"]);
const CODE_TYPE_SLUGS = new Set(["snippets", "commands"]);
const MARKDOWN_TYPE_SLUGS = new Set(["prompts", "notes"]);
const FILE_TYPE_SLUGS = new Set(["files", "images"]);

interface CreateItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTypeSlug?: CreateItemInput["typeSlug"];
}

export function CreateItemModal({ open, onOpenChange, defaultTypeSlug = "snippets" }: CreateItemModalProps) {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateItemInput>({
    resolver: zodResolver(createItemSchema),
    defaultValues: { typeSlug: defaultTypeSlug, title: "", description: "", content: "", url: "", language: "", tags: [], collectionIds: [] },
  });

  const typeSlug = useWatch({ control, name: "typeSlug", defaultValue: "snippets" });
  const collectionIds = useWatch({ control, name: "collectionIds", defaultValue: [] });
  const contentValue = useWatch({ control, name: "content", defaultValue: "" });
  const languageValue = useWatch({ control, name: "language", defaultValue: "" });
  const fileUrl = useWatch({ control, name: "fileUrl" });
  const fileName = useWatch({ control, name: "fileName" });
  const fileSize = useWatch({ control, name: "fileSize" });

  const createMutation = useCreateItem(() => {
    setTags([]);
    onOpenChange(false);
    router.refresh();
  });

  useEffect(() => {
    if (!open) return;
    reset({ typeSlug: defaultTypeSlug, title: "", description: "", content: "", url: "", language: "", tags: [], collectionIds: [], fileUrl: null, fileName: null, fileSize: null });
  }, [open, defaultTypeSlug, reset]);

  function handleOpenChange(next: boolean) {
    if (!next) setTags([]);
    onOpenChange(next);
  }

  function onSubmit(values: CreateItemInput) {
    createMutation.mutate({
      ...values,
      tags,
      description: values.description || undefined,
      content: TEXT_TYPE_SLUGS.has(values.typeSlug) ? values.content || undefined : undefined,
      url: values.typeSlug === "links" ? values.url?.trim() || undefined : undefined,
      language: CODE_TYPE_SLUGS.has(values.typeSlug) ? values.language || undefined : undefined,
      fileUrl: fileUrl ?? null,
      fileName: fileName ?? null,
      fileSize: fileSize ?? null,
    });
  }

  const isPending = isSubmitting || createMutation.isPending;
  const isFileType = FILE_TYPE_SLUGS.has(typeSlug);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-base tracking-wide">
            New Item
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Type selector */}
          <div className="flex gap-1.5 flex-wrap">
            {ALL_CREATE_TYPES.map((t) => {
              const Icon = t.icon;
              const selected = typeSlug === t.slug;
              return (
                <button
                  key={t.slug}
                  type="button"
                  {...register("typeSlug")}
                  onClick={() => {
                    reset({ ...getValues(), typeSlug: t.slug as CreateItemInput["typeSlug"], url: "", content: "", language: "", fileUrl: null, fileName: null, fileSize: null });
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                  style={
                    selected
                      ? { backgroundColor: t.color + "33", color: t.color, border: `1px solid ${t.color}66` }
                      : { backgroundColor: "transparent", color: "var(--muted-foreground)", border: "1px solid var(--border)" }
                  }
                >
                  <Icon className="size-3.5" />
                  {t.name}
                </button>
              );
            })}
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              {...register("title")}
              placeholder="Give your item a name"
              className="h-8 text-sm"
              autoFocus
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Description
            </label>
            <Input
              {...register("description")}
              placeholder="Optional short description"
              className="h-8 text-sm"
            />
          </div>

          {/* File upload — file/image types */}
          {isFileType && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                File <span className="text-destructive">*</span>
              </label>
              <FileUpload
                typeSlug={typeSlug as "files" | "images"}
                value={fileUrl ? { fileUrl, fileName: fileName ?? "", fileSize: fileSize ?? 0, key: "" } : null}
                onUpload={(result) => {
                  setValue("fileUrl", result.fileUrl);
                  setValue("fileName", result.fileName);
                  setValue("fileSize", result.fileSize);
                }}
                onClear={() => {
                  setValue("fileUrl", null);
                  setValue("fileName", null);
                  setValue("fileSize", null);
                }}
              />
              {errors.fileUrl && (
                <p className="text-xs text-destructive">{errors.fileUrl.message}</p>
              )}
            </div>
          )}

          {/* Content — text types */}
          {TEXT_TYPE_SLUGS.has(typeSlug) && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Content
              </label>
              {CODE_TYPE_SLUGS.has(typeSlug) ? (
                <CodeEditor
                  value={contentValue ?? ""}
                  onChange={(v) => setValue("content", v)}
                  language={languageValue || undefined}
                />
              ) : MARKDOWN_TYPE_SLUGS.has(typeSlug) ? (
                <MarkdownEditor
                  value={contentValue ?? ""}
                  onChange={(v) => setValue("content", v)}
                  placeholder="Write markdown here…"
                />
              ) : null}
            </div>
          )}

          {/* Language — code types */}
          {CODE_TYPE_SLUGS.has(typeSlug) && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                Language
              </label>
              <select
                {...register("language")}
                className="h-8 rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select language</option>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
          )}

          {/* URL — link type */}
          {typeSlug === "links" && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                URL <span className="text-destructive">*</span>
              </label>
              <Input
                {...register("url")}
                type="url"
                placeholder="https://..."
                className="h-8 text-sm"
              />
              {errors.url && (
                <p className="text-xs text-destructive">{errors.url.message}</p>
              )}
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Tags
            </label>
            <TagInput tags={tags} onChange={setTags} />
          </div>

          {/* Collections */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Collections
            </label>
            <CollectionSelect
              selectedIds={collectionIds ?? []}
              onChange={(ids) => setValue("collectionIds", ids)}
            />
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isPending}>
              {isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
