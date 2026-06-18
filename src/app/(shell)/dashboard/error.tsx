"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("[dashboard]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, oklch(0.65 0.22 25 / 0.2), oklch(0.65 0.22 25 / 0.05))",
          boxShadow: "0 0 24px -4px oklch(0.65 0.22 25 / 0.4)",
        }}
      >
        <AlertTriangle size={28} className="text-destructive" />
      </div>

      <div className="space-y-1">
        <h2
          className="text-2xl font-bold tracking-wide"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          The dashboard failed to load. This is usually a temporary issue — try again.
        </p>
      </div>

      <Button
        onClick={reset}
        variant="outline"
        className="gap-2 border-white/10 hover:bg-white/5"
      >
        <RefreshCw size={14} />
        Try again
      </Button>
    </div>
  );
}
