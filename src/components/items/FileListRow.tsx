"use client";

import { FileIcon, defaultStyles } from "react-file-icon";
import { Download, Pin, Star } from "lucide-react";
import { formatDate, formatFileSize } from "@/lib/utils";
import { useToggleOverridesStore } from "@/lib/stores/toggle-overrides-store";

function getExt(fileName: string | null): string {
  if (!fileName) return "";
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function getDownloadHref(fileUrl: string): string {
  try {
    return `/api/download/${new URL(fileUrl).pathname.slice(1)}`;
  } catch {
    return "#";
  }
}

interface FileListRowProps {
  id: string;
  title: string;
  fileName: string | null;
  fileSize: number | null;
  fileUrl: string | null;
  isPinned?: boolean;
  isFavorite?: boolean;
  createdAt: Date;
  onClick?: (id: string) => void;
}

export function FileListRow({
  id,
  title,
  fileName,
  fileSize,
  fileUrl,
  isPinned,
  isFavorite,
  createdAt,
  onClick,
}: FileListRowProps) {
  const ext = getExt(fileName);
  const extLabel = ext.toUpperCase() || null;
  const iconStyle = defaultStyles[ext as keyof typeof defaultStyles] ?? {};
  const pinOverride = useToggleOverridesStore((s) => s.overrides[`item-pin:${id}`]);
  const pinned = pinOverride ?? isPinned ?? false;

  return (
    <div
      className="group flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer border border-transparent hover:border-white/8 hover:bg-[oklch(0.17_0.022_55)] transition-all duration-150"
      onClick={() => onClick?.(id)}
    >
      {/* File type icon */}
      <div className="shrink-0 w-6">
        <FileIcon extension={ext} {...iconStyle} />
      </div>

      {/* Name + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate group-hover:text-primary transition-colors duration-150">
            {title}
          </span>
          {isFavorite && <Star size={11} className="shrink-0 fill-amber-500 text-amber-500" />}
          {pinned && <Pin size={11} className="shrink-0 text-muted-foreground/50" />}
          {extLabel && (
            <span className="shrink-0 text-[10px] font-mono font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-white/6 text-muted-foreground/60">
              {extLabel}
            </span>
          )}
        </div>

        {/* Mobile-stacked meta (hidden on sm+ where columns show) */}
        <div className="flex sm:hidden items-center gap-3 mt-0.5 text-xs text-muted-foreground/60">
          {fileSize != null && <span>{formatFileSize(fileSize)}</span>}
          <span>{formatDate(createdAt)}</span>
        </div>
      </div>

      {/* Desktop-only size + date columns */}
      <div className="hidden sm:flex items-center gap-6 shrink-0 text-xs text-muted-foreground/60">
        {fileSize != null && (
          <span className="w-16 text-right">{formatFileSize(fileSize)}</span>
        )}
        <span className="w-24 text-right">{formatDate(createdAt)}</span>
      </div>

      {/* Download button */}
      {fileUrl && (
        <a
          href={getDownloadHref(fileUrl)}
          download
          className="shrink-0 p-2 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/8 text-muted-foreground hover:text-foreground transition-all duration-150"
          onClick={(e) => e.stopPropagation()}
          aria-label="Download file"
        >
          <Download size={15} />
        </a>
      )}
    </div>
  );
}
