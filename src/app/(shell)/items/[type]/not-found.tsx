import Link from "next/link";
import { BookX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ItemTypeNotFound() {
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
          Unknown Item Type
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          This type doesn't exist in your grimoire. Check the URL or head back to explore what you have.
        </p>
      </div>

      <Link
        href="/dashboard"
        className={cn(buttonVariants({ variant: "outline" }), "border-white/10 hover:bg-white/5")}
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
