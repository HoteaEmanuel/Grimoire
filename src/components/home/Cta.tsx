import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeInSection } from "@/components/shared/FadeInSection";

export function Cta() {
  return (
    <FadeInSection className="max-w-2xl mx-auto px-8 py-24 sm:pb-32 text-center">
      <span className="inline-flex size-13 items-center justify-center rounded-xl bg-card border-[1.5px] border-ember text-ember shadow-[var(--shadow-glow)] mb-6">
        <BookOpen className="size-6" />
      </span>
      <h2 className="font-display font-semibold uppercase tracking-wide text-2xl sm:text-3xl mb-3">
        Ready to Organize Your Knowledge?
      </h2>
      <p className="text-muted-foreground mb-8">
        Every spell you&apos;ve ever needed, one grimoire away.
      </p>
      <Button size="lg" nativeButton={false} render={<Link href="/register" />}>
        Get Started Free
      </Button>
    </FadeInSection>
  );
}
