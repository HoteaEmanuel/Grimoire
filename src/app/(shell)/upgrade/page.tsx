export const dynamic = "force-dynamic";

import { getSession } from "@/lib/session";
import { UpgradePricing } from "@/components/billing/UpgradePricing";

export default async function UpgradePage() {
  const session = await getSession();
  const isPro = session?.user?.isPro ?? false;

  return (
    <div className="px-6 py-16">
      <div className="text-center max-w-xl mx-auto mb-10">
        <span className="inline-block font-mono text-xs tracking-[0.12em] uppercase text-ember mb-3">
          Upgrade
        </span>
        <h1 className="font-display font-semibold uppercase tracking-wide text-2xl sm:text-3xl mb-3">
          Choose Your Path
        </h1>
        <p className="text-muted-foreground">
          Unlock unlimited items, file uploads, and AI features by becoming an Archmage.
        </p>
      </div>

      <UpgradePricing isPro={isPro} />
    </div>
  );
}
