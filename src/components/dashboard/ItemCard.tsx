"use client";

import { Pin, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FavoriteStar } from "@/components/shared/FavoriteStar";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useOptimisticToggle } from "@/hooks/useOptimisticToggle";
import { useToggleOverridesStore } from "@/lib/stores/toggle-overrides-store";
import { toggleItemFavorite } from "@/actions/items";

interface ItemCardProps {
  id?: string;
  title: string;
  description?: string | null;
  typeName: string;
  typeColor: string;
  tags: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
  language?: string | null;
  content?: string | null;
  url?: string | null;
  onClick?: (id: string) => void;
}

export function ItemCard({
  id,
  title,
  description,
  typeName,
  typeColor,
  tags,
  isPinned,
  isFavorite,
  language,
  content,
  url,
  onClick,
}: ItemCardProps) {
  const { copied, copy } = useCopyToClipboard();
  const copyValue = content ?? url ?? title;
  const { value: favorite, toggle: toggleFavorite } = useOptimisticToggle(
    id ? `item:${id}` : undefined,
    isFavorite ?? false,
    (next) => toggleItemFavorite(id!, next),
  );
  const pinOverride = useToggleOverridesStore((s) =>
    id ? s.overrides[`item-pin:${id}`] : undefined,
  );
  const pinned = pinOverride ?? isPinned ?? false;

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    copy(copyValue);
  }

  function handleToggleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    toggleFavorite();
  }

  return (
    <div
      className="tome-card group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.01]"
      onClick={id && onClick ? () => onClick(id) : undefined}
      style={{
        background: `linear-gradient(135deg, ${typeColor}18 0%, oklch(0.17 0.022 55) 55%, oklch(0.14 0.016 50) 100%)`,
      }}
    >
      {/* left accent bar with gradient */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.75 rounded-l-lg"
        style={{ background: `linear-gradient(to bottom, ${typeColor}, ${typeColor}30)` }}
      />

      {/* inset glow on hover */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
        style={{ boxShadow: `inset 0 0 48px 0px ${typeColor}14, 0 0 20px -6px ${typeColor}50` }}
      />

      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge
                className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0 h-4 rounded border-0"
                style={{ backgroundColor: `${typeColor}22`, color: typeColor }}
              >
                {typeName}
              </Badge>
              {language && (
                <span className="text-[10px] text-muted-foreground/60">{language}</span>
              )}
            </div>
            <p className="text-lg font-semibold leading-snug truncate group-hover:text-primary transition-colors duration-200">
              {title}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
            {id && (
              <button
                onClick={handleToggleFavorite}
                aria-label={favorite ? "Unfavorite" : "Favorite"}
                className={`transition-opacity ${favorite ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              >
                <FavoriteStar filled={favorite} size={12} emptyClassName="text-muted-foreground" />
              </button>
            )}
            {pinned && <Pin size={12} style={{ color: typeColor }} />}
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/5"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground/50">+{tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* copy button — bottom-right corner */}
      <button
        className="absolute bottom-3 right-3 z-10 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all duration-150"
        onClick={handleCopy}
        aria-label="Copy"
      >
        {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
      </button>
    </div>
  );
}
