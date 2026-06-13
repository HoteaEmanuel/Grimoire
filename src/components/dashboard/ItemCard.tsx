import { Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ItemCardProps {
  title: string;
  description?: string | null;
  typeName: string;
  typeColor: string;
  tags: string[];
  isPinned?: boolean;
  language?: string | null;
}

export function ItemCard({
  title,
  description,
  typeName,
  typeColor,
  tags,
  isPinned,
  language,
}: ItemCardProps) {
  return (
    <div
      className="tome-card group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.01]"
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
          {isPinned && (
            <Pin size={12} className="shrink-0 mt-0.5" style={{ color: typeColor }} />
          )}
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
    </div>
  );
}
