import {
  Code,
  Sparkles,
  StickyNote,
  Terminal,
  Link as LinkIcon,
  File,
  Image,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  StickyNote,
  Terminal,
  Link: LinkIcon,
  File,
  Image,
};

export const SYSTEM_ITEM_TYPES = [
  { name: "Snippet", slug: "snippets", icon: Code, color: "#3b82f6", contentKind: "TEXT" },
  { name: "Prompt", slug: "prompts", icon: Sparkles, color: "#8b5cf6", contentKind: "TEXT" },
  { name: "Note", slug: "notes", icon: StickyNote, color: "#fde047", contentKind: "TEXT" },
  { name: "Command", slug: "commands", icon: Terminal, color: "#f97316", contentKind: "TEXT" },
  { name: "Link", slug: "links", icon: LinkIcon, color: "#10b981", contentKind: "URL" },
  { name: "File", slug: "files", icon: File, color: "#6b7280", contentKind: "FILE", isPro: true },
  { name: "Image", slug: "images", icon: Image, color: "#ec4899", contentKind: "FILE", isPro: true },
] as const;
