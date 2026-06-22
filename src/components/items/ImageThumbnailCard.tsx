"use client";

import Image from "next/image";
import { Pin, ImageOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FavoriteStar } from "@/components/shared/FavoriteStar";
import { formatDate } from "@/lib/utils";
import { useToggleOverridesStore } from "@/lib/stores/toggle-overrides-store";

interface ImageThumbnailCardProps {
  id: string;
  title: string;
  fileUrl: string | null;
  isPinned?: boolean;
  isFavorite?: boolean;
  createdAt: Date;
  onClick?: (id: string) => void;
  compact?: boolean;
}

export function ImageThumbnailCard({
  id,
  title,
  fileUrl,
  isPinned,
  isFavorite,
  createdAt,
  onClick,
  compact = false,
}: ImageThumbnailCardProps) {
  const pinOverride = useToggleOverridesStore((s) => s.overrides[`item-pin:${id}`]);
  const pinned = pinOverride ?? isPinned ?? false;

  return (
    <Card
      className="group overflow-hidden cursor-pointer border-white/8 bg-[oklch(0.17_0.022_55)] p-0 transition-all duration-300 hover:border-white/15 hover:shadow-lg"
      onClick={() => onClick?.(id)}
    >
      <div
        className={`relative overflow-hidden bg-[oklch(0.13_0.016_50)] ${compact ? "h-28" : "aspect-video"}`}
      >
        {fileUrl ? (
          <Image
            src={fileUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
            <ImageOff size={32} />
          </div>
        )}

        {(pinned || isFavorite) && (
          <div className="absolute top-2 right-2 flex items-center gap-1">
            {isFavorite && (
              <div className="bg-black/50 rounded p-1">
                <FavoriteStar filled size={10} />
              </div>
            )}
            {pinned && (
              <div className="bg-black/50 rounded p-1">
                <Pin size={10} className="text-[#ec4899]" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <p className="text-sm font-medium leading-snug truncate group-hover:text-primary transition-colors duration-200">
          {title}
        </p>
        <span className="text-[11px] text-muted-foreground/60 shrink-0">
          {formatDate(createdAt)}
        </span>
      </div>
    </Card>
  );
}
