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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCreateItem } from "@/lib/mutations/items";
import { CodeEditor } from "@/components/ui/code-editor";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { SYSTEM_ITEM_TYPES } from "@/lib/item-types";
import { createItemSchema, type CreateItemInput } from "@/lib/schemas/items";

const CREATE_TYPES = SYSTEM_ITEM_TYPES.filter((t) => !("isPro" in t && t.isPro));
const TEXT_TYPE_SLUGS = new Set(["snippets", "prompts", "notes", "commands"]);
const CODE_TYPE_SLUGS = new Set(["snippets", "commands"]);
const MARKDOWN_TYPE_SLUGS = new Set(["prompts", "notes"]);
const TAG_RE = /^[a-z0-9_-]+$/;

const LANGUAGES = [
  "bash", "c", "cpp", "css", "dart", "dockerfile", "go", "graphql", "html",
  "java", "javascript", "json", "kotlin", "lua", "markdown", "php",
  "powershell", "python", "ruby", "rust", "scala", "sql", "swift", "toml",
  "typescript", "xml", "yaml",
];

interface CreateItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTypeSlug?: CreateItemInput["typeSlug"];
}

export function CreateItemModal({ open, onOpenChange, defaultTypeSlug = "snippets" }: CreateItemModalProps) {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tagError, setTagError] = useState("");

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
    defaultValues: { typeSlug: defaultTypeSlug, title: "", description: "", content: "", url: "", language: "" },
  });

  const typeSlug = useWatch({ control, name: "typeSlug", defaultValue: "snippets" });
  const contentValue = useWatch({ control, name: "content", defaultValue: "" });
  const languageValue = useWatch({ control, name: "language", defaultValue: "" });

  const createMutation = useCreateItem(() => {
    onOpenChange(false);
    router.refresh();
  });

  useEffect(() => {
    if (!open) return;
    reset({ typeSlug: defaultTypeSlug, title: "", description: "", content: "", url: "", language: "" });
  }, [open, defaultTypeSlug, reset]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setTags([]);
      setTagInput("");
      setTagError("");
    }
    onOpenChange(next);
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== "Enter" && e.key !== ",") return;
    e.preventDefault();
    const raw = tagInput.trim().toLowerCase();
    if (!raw) return;
    if (!TAG_RE.test(raw)) {
      setTagError("Tags can only contain lowercase letters, numbers, - and _");
      return;
    }
    if (!tags.includes(raw)) setTags((prev) => [...prev, raw]);
    setTagInput("");
    setTagError("");
  }

  function onSubmit(values: CreateItemInput) {
    createMutation.mutate({
      ...values,
      tags,
      description: values.description || null,
      content: TEXT_TYPE_SLUGS.has(values.typeSlug) ? values.content || null : null,
      url: values.typeSlug === "links" ? values.url?.trim() || null : null,
      language: CODE_TYPE_SLUGS.has(values.typeSlug) ? values.language || null : null,
    });
  }

  const isPending = isSubmitting || createMutation.isPending;

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
            {CREATE_TYPES.map((t) => {
              const Icon = t.icon;
              const selected = typeSlug === t.slug;
              return (
                <button
                  key={t.slug}
                  type="button"
                  {...register("typeSlug")}
                  onClick={() => reset({ ...getValues(), typeSlug: t.slug as CreateItemInput["typeSlug"], url: "", content: "", language: "" })}
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
              ) : (
                <Textarea
                  {...register("content")}
                  placeholder="Write your content here"
                  className="text-sm resize-none min-h-25 font-mono"
                />
              )}
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
                {LANGUAGES.map((lang) => (
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
            <Input
              value={tagInput}
              onChange={(e) => { setTagInput(e.target.value); setTagError(""); }}
              onKeyDown={handleTagKeyDown}
              placeholder="Type a tag and press Enter or comma"
              className="h-8 text-sm"
            />
            {tagError && (
              <p className="text-xs text-destructive">{tagError}</p>
            )}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs gap-1 cursor-pointer hover:bg-destructive/20"
                    onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                  >
                    {tag} ×
                  </Badge>
                ))}
              </div>
            )}
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
            <Button type="submit" size="sm" disabled={isPending || !!tagError}>
              {isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
