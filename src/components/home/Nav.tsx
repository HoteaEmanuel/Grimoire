"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
];

export function Nav({ variant = "marketing" }: { variant?: "marketing" | "minimal" }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 backdrop-blur-md transition-colors duration-300",
        scrolled
          ? "bg-background/92 border-b border-border"
          : "bg-background/40 border-b border-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center gap-4 sm:gap-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex size-8.5 items-center justify-center rounded-md border-[1.5px] border-ember bg-card text-ember shadow-[0_0_12px_-2px_var(--ember)]">
            <BookOpen className="size-4" />
          </span>
          <span className="font-display font-semibold text-lg tracking-wide">
            Grimoire
          </span>
        </Link>

        {variant === "marketing" && (
          <>
            <nav className="hidden md:flex gap-6 text-sm text-muted-foreground">
              {NAV_LINKS.map((link) => (
                <Link key={link.href} href={link.href} className="hover:text-ember transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <Button variant="ghost" nativeButton={false} render={<Link href="/sign-in" />}>
                Sign In
              </Button>
              <Button nativeButton={false} render={<Link href="/register" />}>
                <span className="hidden sm:inline">Get Started Free</span>
                <span className="sm:hidden">Get Started</span>
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
