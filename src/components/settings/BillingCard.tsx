"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FREE_ITEM_LIMIT, FREE_COLLECTION_LIMIT } from "@/lib/limits";
import {
  useCreateCheckoutSession,
  useCreateBillingPortalSession,
} from "@/lib/mutations/billing";

const PRO_FEATURES = [
  "Unlimited items & collections",
  "File & image uploads",
  "AI auto-tagging, summaries & explain",
  "Export to JSON / ZIP",
];

interface BillingCardProps {
  isPro: boolean;
  totalItems: number;
  totalCollections: number;
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const atLimit = used >= limit;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("tabular-nums", atLimit ? "text-destructive" : "text-muted-foreground")}>
          {used} / {limit}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full", atLimit ? "bg-destructive" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function BillingCard({ isPro, totalItems, totalCollections }: BillingCardProps) {
  const [plan, setPlan] = useState<"monthly" | "yearly">("monthly");
  const checkout = useCreateCheckoutSession();
  const portal = useCreateBillingPortalSession();

  if (isPro) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge className="h-5 px-2 text-[10px] font-bold tracking-wider rounded-sm border bg-[oklch(0.62_0.18_290/0.15)] text-[oklch(0.75_0.16_290)] border-[oklch(0.62_0.18_290/0.35)]">
            PRO
          </Badge>
          <p className="text-sm text-muted-foreground">You&apos;re on the Grimoire Pro plan.</p>
        </div>
        <Button onClick={() => portal.mutate()} disabled={portal.isPending}>
          {portal.isPending && <Loader2 className="size-4 animate-spin" />}
          Manage billing
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="inline-flex items-center rounded-lg border border-border p-0.5 text-sm">
        <button
          type="button"
          onClick={() => setPlan("monthly")}
          className={cn(
            "rounded-md px-3 py-1 transition-colors",
            plan === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          Monthly · $8/mo
        </button>
        <button
          type="button"
          onClick={() => setPlan("yearly")}
          className={cn(
            "rounded-md px-3 py-1 transition-colors",
            plan === "yearly" ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          Yearly · $72/yr
        </button>
      </div>

      <div className="space-y-3 rounded-lg border border-border p-3">
        <UsageBar label="Items" used={totalItems} limit={FREE_ITEM_LIMIT} />
        <UsageBar label="Collections" used={totalCollections} limit={FREE_COLLECTION_LIMIT} />
      </div>

      <ul className="space-y-1.5">
        {PRO_FEATURES.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="size-3.5 text-primary shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <Button onClick={() => checkout.mutate(plan)} disabled={checkout.isPending} className="w-full">
        {checkout.isPending && <Loader2 className="size-4 animate-spin" />}
        Upgrade to Pro
      </Button>
    </div>
  );
}
