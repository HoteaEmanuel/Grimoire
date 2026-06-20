"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  useCreateCheckoutSession,
  useCreateBillingPortalSession,
} from "@/lib/mutations/billing";

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

interface UpgradePricingProps {
  isPro: boolean;
}

export function UpgradePricing({ isPro }: UpgradePricingProps) {
  const [isYearly, setIsYearly] = useState(false);
  const checkout = useCreateCheckoutSession();
  const portal = useCreateBillingPortalSession();

  const proPrice = isYearly ? "$6" : "$8";
  const proPeriod = isYearly ? "/mo, billed yearly" : "/mo";

  if (isPro) {
    return (
      <div className="tome-card rounded-2xl p-8 max-w-md mx-auto text-center space-y-4">
        <Badge className="h-5 px-2 text-[10px] font-bold tracking-wider rounded-sm border bg-[oklch(0.62_0.18_290/0.15)] text-[oklch(0.75_0.16_290)] border-[oklch(0.62_0.18_290/0.35)]">
          PRO
        </Badge>
        <p className="text-sm text-muted-foreground">
          You&apos;re already an Archmage. Manage your subscription anytime.
        </p>
        <Button onClick={() => portal.mutate()} disabled={portal.isPending}>
          {portal.isPending && <Loader2 className="size-4 animate-spin" />}
          Manage billing
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-center gap-3.5 mb-12">
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
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
          <Button variant="ghost" className="w-full justify-center" disabled>
            Your Current Plan
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
          <Button
            className="w-full justify-center"
            onClick={() => checkout.mutate(isYearly ? "yearly" : "monthly")}
            disabled={checkout.isPending}
          >
            {checkout.isPending && <Loader2 className="size-4 animate-spin" />}
            Become an Archmage
          </Button>
        </div>
      </div>
    </div>
  );
}
