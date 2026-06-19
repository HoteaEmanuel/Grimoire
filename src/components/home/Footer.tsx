import Link from "next/link";
import { BookOpen } from "lucide-react";

const FOOTER_COLS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border px-8 pt-12 pb-8">
      <div className="max-w-7xl mx-auto flex flex-wrap justify-between gap-8 mb-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex size-8.5 items-center justify-center rounded-md border-[1.5px] border-ember bg-card text-ember shadow-[0_0_12px_-2px_var(--ember)]">
            <BookOpen className="size-4" />
          </span>
          <span className="font-display font-semibold text-lg tracking-wide">
            Grimoire
          </span>
        </Link>

        <div className="flex gap-12 flex-wrap">
          {FOOTER_COLS.map((col) => (
            <div key={col.heading} className="flex flex-col gap-2.5">
              <h4 className="font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground mb-1">
                {col.heading}
              </h4>
              {col.links.map((link) =>
                link.href === "#" ? (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-ember transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-ember transition-colors"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto text-sm text-muted-foreground">
        © {year} Grimoire. All spells reserved.
      </div>
    </footer>
  );
}
