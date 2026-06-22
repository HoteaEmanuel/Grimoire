"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeInSection } from "@/components/shared/FadeInSection";
import { cn } from "@/lib/utils";

const FREE_FEATURES = [
  "50 items",
  "3 collections",
  "All spell types except files & images",
  "Basic search",
];

const PRO_FEATURES = [
  "Unlimited items & collections",
  "Files & image uploads",
  "AI auto-tagging, summaries & explain",
  "AI prompt optimizer",
  "Export (JSON / ZIP)",
  "Priority support",
];

export function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const proPrice = isYearly ? "$6" : "$8";
  const proPeriod = isYearly ? "/mo, billed yearly" : "/mo";

  return (
    <section id="pricing" className="max-w-7xl mx-auto px-8 py-24">
      <FadeInSection className="text-center max-w-xl mx-auto mb-10">
        <span className="inline-block font-mono text-xs tracking-[0.12em] uppercase text-ember mb-3">
          Pricing
        </span>
        <h2 className="font-display font-semibold uppercase tracking-wide text-2xl sm:text-3xl mb-3">
          Choose Your Path
        </h2>
        <p className="text-muted-foreground">
          Start free. Ascend to Archmage whenever you&apos;re ready.
        </p>
      </FadeInSection>

      <FadeInSection className="flex items-center justify-center gap-3.5 mb-12">
        <span className={cn("text-sm text-muted-foreground", !isYearly && "text-foreground font-semibold")}>
          Monthly
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={isYearly}
          aria-label="Toggle yearly pricing"
          onClick={() => setIsYearly((prev) => !prev)}
          className={cn(
            "w-11 h-6 shrink-0 rounded-full border border-border bg-white/10 relative cursor-pointer transition-colors",
            isYearly && "bg-ember/20"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 size-[18px] rounded-full transition-transform duration-200",
              isYearly && "translate-x-5"
            )}
            style={{ background: "var(--gradient-gold)" }}
          />
        </button>
        <span className={cn("text-sm text-muted-foreground", isYearly && "text-foreground font-semibold")}>
          Yearly <em className="not-italic text-rune text-xs ml-1">save 25%</em>
        </span>
      </FadeInSection>

      <FadeInSection className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        <div className="tome-card rounded-2xl p-8 relative">
          <h3 className="text-xl font-semibold mb-4">Free</h3>
          <p className="flex items-baseline gap-1 mb-6">
            <span className="font-display text-4xl">$0</span>
            <span className="text-muted-foreground text-sm">/forever</span>
          </p>
          <ul className="flex flex-col gap-2.5 mb-7">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="size-4 text-rune shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <Button
            variant="outline"
            className="w-full justify-center"
            nativeButton={false}
            render={<Link href="/register" />}
          >
            Start for Free
          </Button>
        </div>

        <div className="tome-card rounded-2xl p-8 relative border-ember shadow-[var(--shadow-glow),var(--shadow-tome)]">
          <span
            className="absolute -top-3 right-6 text-[oklch(0.16_0.02_55)] text-[0.65rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
            style={{ background: "var(--gradient-gold)" }}
          >
            Most Popular
          </span>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            Pro
            <span className="font-mono text-[0.6rem] font-bold tracking-wide bg-ember/15 text-ember border border-ember/40 rounded px-1.5 py-0.5">
              PRO · ARCHMAGE
            </span>
          </h3>
          <p className="flex items-baseline gap-1 mb-6">
            <span className="font-display text-4xl">{proPrice}</span>
            <span className="text-muted-foreground text-sm">{proPeriod}</span>
          </p>
          <ul className="flex flex-col gap-2.5 mb-7">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="size-4 text-rune shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
          <Button className="w-full justify-center" nativeButton={false} render={<Link href="/register" />}>
            Become an Archmage
          </Button>
        </div>
      </FadeInSection>
    </section>
  );
}
