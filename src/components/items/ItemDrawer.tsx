"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useItemDrawerStore } from "@/lib/stores/item-drawer-store";
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
} from "lucide-react";
import { Drawer, DrawerContent, DrawerClose } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatFileSize, copyToClipboard } from "@/lib/utils";
import type { ItemDetail } from "@/lib/db/items";

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

export function ItemDrawer() {
  const { selectedId, open, closeDrawer } = useItemDrawerStore();
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchItem = useCallback(async (id: string) => {
    setLoading(true);
    setItem(null);
    try {
      const { data } = await axios.get<ItemDetail>(`/api/items/${id}`);
      setItem(data);
    } catch {
      // silently fail — drawer will stay empty
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && selectedId) {
      fetchItem(selectedId);
    }
  }, [open, selectedId, fetchItem]);

  const handleCopy = async () => {
    if (!item) return;
    const text = item.content ?? item.url ?? item.fileUrl ?? item.title;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <Drawer open={open} onOpenChange={(v) => !v && closeDrawer()} direction="right">
      <DrawerContent className="w-full sm:max-w-lg! fixed right-0 inset-y-0 rounded-l-xl border-l border-border bg-card flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-border shrink-0">
          {loading || !item ? (
            <div className="flex items-center gap-3 flex-1">
              <Skeleton className="h-5 w-16 rounded" />
              <Skeleton className="h-6 w-40 rounded" />
            </div>
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
            <button className="shrink-0 p-1.5 rounded-md hover:bg-white/8 text-muted-foreground hover:text-foreground transition-colors">
              <X size={15} />
            </button>
          </DrawerClose>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading || !item ? (
            <DrawerSkeleton />
          ) : (
            <div className="space-y-6">
              {item.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              )}

              {item.content && (
                <div className="rounded-lg bg-background/60 border border-border p-4">
                  <pre className="text-xs font-mono text-foreground/80 whitespace-pre-wrap break-all line-clamp-12">
                    {item.content}
                  </pre>
                </div>
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
        <div className="shrink-0 border-t border-border px-6 py-4 flex items-center gap-1">
          <ActionButton
            title="Favorite"
            disabled={!item}
            active={item?.isFavorite}
            activeColor="#f59e0b"
          >
            <Star size={15} fill={item?.isFavorite ? "#f59e0b" : "none"} />
          </ActionButton>
          <ActionButton title="Pin" disabled={!item} active={item?.isPinned} activeColor="#94a3b8">
            <Pin size={15} fill={item?.isPinned ? "#94a3b8" : "none"} />
          </ActionButton>
          <ActionButton title={copied ? "Copied!" : "Copy"} disabled={!item} onClick={handleCopy}>
            <Copy size={15} />
          </ActionButton>
          <ActionButton title="Edit" disabled={!item}>
            <Pencil size={15} />
          </ActionButton>
          <div className="ml-auto">
            <ActionButton title="Delete" disabled={!item} destructive>
              <Trash2 size={15} />
            </ActionButton>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

interface ActionButtonProps {
  title: string;
  disabled?: boolean;
  active?: boolean;
  activeColor?: string;
  destructive?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

function ActionButton({
  title,
  disabled,
  active,
  activeColor,
  destructive,
  onClick,
  children,
}: ActionButtonProps) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={[
        "p-2 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed",
        destructive
          ? "text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
          : "text-muted-foreground hover:bg-white/8 hover:text-foreground",
      ].join(" ")}
      style={active && activeColor ? { color: activeColor } : undefined}
    >
      {children}
    </button>
  );
}
