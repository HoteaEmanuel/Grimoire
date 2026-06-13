import Link from "next/link"
import {
  Code,
  Sparkles,
  StickyNote,
  Terminal,
  Link as LinkIcon,
  File,
  Image,
  Layers,
  type LucideIcon,
} from "lucide-react"
import type { CollectionTypeIcon } from "@/lib/db/collections"

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  StickyNote,
  Terminal,
  Link: LinkIcon,
  File,
  Image,
}

interface CollectionCardProps {
  id: string
  name: string
  description?: string | null
  itemCount: number
  dominantTypeColor: string
  isFavorite: boolean
  typeIcons?: CollectionTypeIcon[]
}

export function CollectionCard({
  id,
  name,
  description,
  itemCount,
  dominantTypeColor,
  typeIcons = [],
}: CollectionCardProps) {
  return (
    <Link href={`/dashboard/collections/${id}`}>
      <div
        className="tome-card group relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 hover:scale-[1.01] h-full"
        style={{
          background: `linear-gradient(135deg, ${dominantTypeColor}16 0%, oklch(0.17 0.022 55) 55%, oklch(0.14 0.016 50) 100%)`,
          borderTop: `2px solid ${dominantTypeColor}80`,
        }}
      >
        {/* hover glow */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
          style={{ boxShadow: `inset 0 0 40px 0px ${dominantTypeColor}12, 0 0 18px -6px ${dominantTypeColor}45` }}
        />

        <div className="p-4">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center mb-3"
            style={{
              background: `linear-gradient(135deg, ${dominantTypeColor}28, ${dominantTypeColor}0d)`,
              boxShadow: `0 0 10px -2px ${dominantTypeColor}40`,
            }}
          >
            <Layers size={14} style={{ color: dominantTypeColor }} />
          </div>
          <p className="text-lg font-semibold leading-tight group-hover:text-primary transition-colors duration-200">
            {name}
          </p>
          {description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <p className="text-xs text-muted-foreground/60 font-medium">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
            {typeIcons.length > 0 && (
              <div className="flex items-center gap-1">
                {typeIcons.map(({ iconName, color }) => {
                  const Icon = ICON_MAP[iconName]
                  if (!Icon) return null
                  return (
                    <span
                      key={iconName}
                      className="w-5 h-5 rounded flex items-center justify-center"
                      style={{ background: `${color}18` }}
                    >
                      <Icon size={11} style={{ color }} />
                    </span>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
