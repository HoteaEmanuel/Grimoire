import { Code, FolderHeart, Search, Sparkles, Terminal, File } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { SYSTEM_ITEM_TYPES } from "@/lib/item-types";
import { FadeInSection } from "@/components/shared/FadeInSection";

const SNIPPET_COLOR = SYSTEM_ITEM_TYPES.find((t) => t.slug === "snippets")!.color;
const PROMPT_COLOR = SYSTEM_ITEM_TYPES.find((t) => t.slug === "prompts")!.color;
const COMMAND_COLOR = SYSTEM_ITEM_TYPES.find((t) => t.slug === "commands")!.color;
const FILE_COLOR = SYSTEM_ITEM_TYPES.find((t) => t.slug === "files")!.color;

const FEATURES: { icon: LucideIcon; title: string; description: string; accent: string }[] = [
  {
    icon: Code,
    title: "Code Snippets",
    description: "Syntax-highlighted, language-tagged, one click from your clipboard.",
    accent: SNIPPET_COLOR,
  },
  {
    icon: Sparkles,
    title: "AI Prompts",
    description: "Your best prompts, versioned and ready to summon on demand.",
    accent: PROMPT_COLOR,
  },
  {
    icon: Search,
    title: "Instant Search",
    description: "Full-text search across titles, content, and tags — ⌘K and you're there.",
    accent: "#f59e0b",
  },
  {
    icon: Terminal,
    title: "Commands",
    description: "Every shell incantation you've ever needed twice, saved once.",
    accent: COMMAND_COLOR,
  },
  {
    icon: File,
    title: "Files & Docs",
    description: "Context files and reference docs, uploaded and instantly retrievable.",
    accent: FILE_COLOR,
  },
  {
    icon: FolderHeart,
    title: "Collections",
    description: "Group any spell type into grimoires — by project, by stack, by mood.",
    accent: "#10b981",
  },
];

export function Features() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-8 py-24">
      <FadeInSection className="text-center max-w-xl mx-auto mb-12">
        <span className="inline-block font-mono text-xs tracking-[0.12em] uppercase text-ember mb-3">
          Capabilities
        </span>
        <h2 className="font-display font-semibold uppercase tracking-wide text-2xl sm:text-3xl mb-3">
          Every Spell, One Spellbook
        </h2>
        <p className="text-muted-foreground">
          Six kinds of knowledge, one searchable home.
        </p>
      </FadeInSection>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map(({ icon: Icon, title, description, accent }) => (
          <FadeInSection key={title}>
            <div
              className="tome-card rounded-2xl p-7 border-t-[3px] transition-transform duration-200 hover:-translate-y-1 h-full"
              style={{ borderTopColor: accent }}
            >
              <span
                className="inline-flex size-10.5 items-center justify-center rounded-md mb-4"
                style={{
                  background: `color-mix(in oklch, ${accent} 18%, transparent)`,
                  color: accent,
                }}
              >
                <Icon className="size-5" />
              </span>
              <h3 className="text-base font-semibold mb-1.5">{title}</h3>
              <p className="text-muted-foreground text-sm">{description}</p>
            </div>
          </FadeInSection>
        ))}
      </div>
    </section>
  );
}
