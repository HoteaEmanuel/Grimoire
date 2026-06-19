import Link from "next/link";
import { WandSparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeInSection } from "@/components/shared/FadeInSection";
import { HeroVisual } from "@/components/home/HeroVisual";

export function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-8 pt-36 pb-24">
      <FadeInSection className="text-center max-w-3xl mx-auto mb-16">
        <span className="inline-block font-mono text-xs tracking-[0.12em] uppercase text-ember mb-3">
          One grimoire. Every spell.
        </span>
        <h1 className="font-display font-semibold uppercase tracking-wide text-4xl sm:text-5xl lg:text-6xl leading-tight mb-5 bg-[linear-gradient(135deg,var(--ember)_0%,var(--arcane)_100%)] bg-clip-text text-transparent">
          Tame the Chaos.
          <br />
          Bind Your Knowledge.
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto mb-8">
          Snippets scattered across Notion. Prompts buried in chat history. Commands
          lost in your shell history. Grimoire centralizes every spell you cast —
          searchable, tagged, and instantly summoned.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
            Get Started Free
          </Button>
          <Button
            size="lg"
            variant="secondary"
            nativeButton={false}
            render={<Link href="/register" />}
          >
            <WandSparkles data-icon="inline-start" />
            Cast Your First Spell
          </Button>
        </div>
      </FadeInSection>

      <FadeInSection>
        <HeroVisual />
      </FadeInSection>
    </section>
  );
}
