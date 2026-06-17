"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import { useItemDrawerStore } from "@/lib/stores/item-drawer-store";
import { useUpdateItem, useDeleteItem } from "@/lib/mutations/items";
import {
  Star,
  Pin,
  Copy,
  Pencil,
  Trash2,
  X,
  Calendar,
  Globe,
  FolderOpen,
  Tag,
  Check,
} from "lucide-react";
import { Drawer, DrawerContent, DrawerClose } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
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
import { formatDate, formatFileSize, copyToClipboard } from "@/lib/utils";
import { CodeEditor } from "@/components/ui/code-editor";
import type { ItemDetail } from "@/lib/db/items";

const TEXT_TYPES = new Set(["snippets", "prompts", "commands", "notes"]);
const CODE_TYPES = new Set(["snippets", "commands"]);
const TAG_RE = /^[a-z0-9_-]+$/;

const LANGUAGES = [
  "bash",
  "c",
  "cpp",
  "css",
  "dart",
  "dockerfile",
  "go",
  "graphql",
  "html",
  "java",
  "javascript",
  "json",
  "kotlin",
  "lua",
  "markdown",
  "php",
  "powershell",
  "python",
  "ruby",
  "rust",
  "scala",
  "sql",
  "swift",
  "toml",
  "typescript",
  "xml",
  "yaml",
];

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

type EditState = {
  title: string;
  description: string;
  content: string;
  url: string;
  language: string;
  tags: string;
};

function toEditState(item: ItemDetail): EditState {
  return {
    title: item.title,
    description: item.description ?? "",
    content: item.content ?? "",
    url: item.url ?? "",
    language: item.language ?? "",
    tags: item.tags.join(", "),
  };
}

export function ItemDrawer() {
  const { selectedId, open, closeDrawer } = useItemDrawerStore();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editState, setEditState] = useState<EditState | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const router = useRouter();

  const updateMutation = useUpdateItem((updated) => {
    setItem(updated ?? null);
    setEditing(false);
    setEditState(null);
    router.refresh();
  });

  const deleteMutation = useDeleteItem(() => {
    closeDrawer();
    router.refresh();
  });

  useEffect(() => {
    if (!open || !selectedId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setItem(null);
      setEditing(false);
      setEditState(null);
      try {
        const { data } = await axios.get<ItemDetail>(`/api/items/${selectedId}`);
        if (!cancelled) setItem(data);
      } catch {
        // silently fail — drawer will stay empty
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [open, selectedId]);

  const handleCopy = async () => {
    if (!item) return;
    const text = item.content ?? item.url ?? item.fileUrl ?? item.title;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } else {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleEditStart = () => {
    if (!item) return;
    setEditState(toEditState(item));
    setEditing(true);
  };

  const handleEditCancel = () => {
    setEditing(false);
    setEditState(null);
  };

  const handleSave = () => {
    if (!item || !editState) return;

    const tags = editState.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    updateMutation.mutate({
      id: item.id,
      data: {
        title: editState.title,
        description: editState.description || null,
        content: editState.content || null,
        url: editState.url || null,
        language: editState.language || null,
        tags,
      },
    });
  };

  const field = (key: keyof EditState, value: string) =>
    setEditState((prev) => (prev ? { ...prev, [key]: value } : prev));

  const hasInvalidTags = editState
    ? editState.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
        .some((t) => !TAG_RE.test(t))
    : false;

  return (
    <>
    <Drawer open={open} onOpenChange={(v) => !v && closeDrawer()} direction="right">
      <DrawerContent className="w-full sm:max-w-lg! fixed right-0 inset-y-0 rounded-l-xl border-l border-border bg-card flex flex-col overflow-hidden outline-none">
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
              onChange={(e) => field("title", e.target.value)}
              placeholder="Title"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Badge
                className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0 h-5 rounded border-0 shrink-0"
                style={{
                  backgroundColor: `${item.typeColor}22`,
                  color: item.typeColor,
                }}
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
            <div className="space-y-4">
              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Description</label>
                <Textarea
                  value={editState.description}
                  onChange={(e) => field("description", e.target.value)}
                  placeholder="Optional description"
                />
              </div>

              {/* Content — text types only */}
              {TEXT_TYPES.has(item.typeSlug) && (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Content</label>
                  {CODE_TYPES.has(item.typeSlug) ? (
                    <CodeEditor
                      value={editState.content}
                      onChange={(v) => field("content", v)}
                      language={editState.language || undefined}
                    />
                  ) : (
                    <Textarea
                      value={editState.content}
                      onChange={(e) => field("content", e.target.value)}
                      placeholder="Content"
                    />
                  )}
                </div>
              )}

              {/* Language — snippet/command only */}
              {CODE_TYPES.has(item.typeSlug) && (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Language</label>
                  <select
                    value={editState.language}
                    onChange={(e) => field("language", e.target.value)}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                  >
                    <option value="">Select language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang} className="bg-popover">
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* URL — link type only */}
              {item.typeSlug === "links" && (
                <div className="space-y-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">URL</label>
                  <Input
                    type="url"
                    value={editState.url}
                    onChange={(e) => field("url", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}

              {/* Tags */}
              {(() => {
                const parsed = editState.tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean);
                return (
                  <div className="space-y-1.5">
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">Tags</label>
                    <Input
                      aria-invalid={hasInvalidTags}
                      value={editState.tags}
                      onChange={(e) => field("tags", e.target.value)}
                      placeholder="react, hooks, typescript"
                    />
                    {parsed.length > 0 ? (
                      <>
                        <div className="flex flex-wrap gap-1">
                          {parsed.map((tag, i) => {
                            const valid = TAG_RE.test(tag);
                            return (
                              <span
                                key={i}
                                className={`text-[11px] px-2 py-0.5 rounded-full border ${
                                  valid
                                    ? "bg-white/5 border-white/8 text-muted-foreground"
                                    : "bg-destructive/10 border-destructive/40 text-destructive"
                                }`}
                              >
                                #{tag}
                              </span>
                            );
                          })}
                        </div>
                        {hasInvalidTags && (
                          <p className="text-[11px] text-destructive">
                            Tags may only contain lowercase letters, numbers, hyphens, and underscores.
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">
                        Comma-separated · lowercase, numbers, hyphens, underscores
                      </p>
                    )}
                  </div>
                );
              })()}

              {/* Non-editable info */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="uppercase tracking-wider w-24 shrink-0">Type</span>
                  <span>{item.typeName}</span>
                </div>
                {item.collections.length > 0 && (
                  <div className="flex items-start gap-3 text-xs text-muted-foreground">
                    <FolderOpen size={12} className="mt-0.5 shrink-0" />
                    <span>{item.collections.map((c) => c.name).join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {item.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              )}

              {item.content && (
                CODE_TYPES.has(item.typeSlug) ? (
                  <CodeEditor
                    value={item.content}
                    language={item.language ?? undefined}
                    readOnly
                  />
                ) : (
                  <div className="rounded-lg bg-background/60 border border-border p-4">
                    <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap break-all">
                      {item.content}
                    </pre>
                  </div>
                )
              )}

              {item.url && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe size={14} className="text-muted-foreground shrink-0" />
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate"
                  >
                    {item.url}
                  </a>
                </div>
              )}

              {item.fileName && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{item.fileName}</span>
                  {item.fileSize != null && (
                    <span className="ml-2">({formatFileSize(item.fileSize)})</span>
                  )}
                </div>
              )}

              <div className="space-y-3 text-sm">
                {item.language && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="text-xs uppercase tracking-wider w-24 shrink-0">Language</span>
                    <span className="font-mono text-foreground/80">{item.language}</span>
                  </div>
                )}

                {item.tags.length > 0 && (
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <Tag size={13} className="mt-0.5 shrink-0" />
                    <div className="flex flex-wrap gap-1.5">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-muted-foreground"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {item.collections.length > 0 && (
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <FolderOpen size={13} className="mt-0.5 shrink-0" />
                    <div className="flex flex-wrap gap-1.5">
                      {item.collections.map((col) => (
                        <span
                          key={col.id}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-muted-foreground"
                        >
                          {col.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-muted-foreground pt-1">
                  <Calendar size={13} className="shrink-0" />
                  <span className="text-xs">{formatDate(item.createdAt)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action bar */}
        {editing ? (
          <div className="shrink-0 border-t border-border px-6 py-4 flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending || !editState?.title.trim() || hasInvalidTags}
            >
              <Check />
              {updateMutation.isPending ? "Saving…" : "Save"}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleEditCancel} disabled={updateMutation.isPending}>
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
              style={item?.isFavorite ? { color: "#f59e0b" } : undefined}
            >
              <Star size={15} fill={item?.isFavorite ? "#f59e0b" : "none"} />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              title="Pin"
              disabled={!item}
              style={item?.isPinned ? { color: "#94a3b8" } : undefined}
            >
              <Pin size={15} fill={item?.isPinned ? "#94a3b8" : "none"} />
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
              onClick={handleEditStart}
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
