import Link from "next/link";
import { BookX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CollectionNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, oklch(0.72 0.15 60 / 0.18), oklch(0.72 0.15 60 / 0.05))",
          boxShadow: "0 0 32px -4px oklch(0.72 0.15 60 / 0.35)",
        }}
      >
        <BookX size={28} className="text-primary" />
      </div>

      <div className="space-y-1">
        <p className="text-xs font-mono text-muted-foreground tracking-widest uppercase mb-2">
          404
        </p>
        <h2
          className="text-2xl font-bold tracking-wide"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Collection Not Found
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          This collection doesn&apos;t exist or you don&apos;t have access to it.
        </p>
      </div>

      <Link
        href="/collections"
        className={cn(buttonVariants({ variant: "outline" }), "border-white/10 hover:bg-white/5")}
      >
        Back to Collections
      </Link>
    </div>
  );
}
