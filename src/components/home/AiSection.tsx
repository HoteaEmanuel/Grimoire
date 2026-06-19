import { CheckCircle2 } from "lucide-react";
import { FadeInSection } from "@/components/shared/FadeInSection";

const AI_CHECKLIST = [
  "Auto-tag suggestions on save",
  "One-line AI summaries for long items",
  "Explain this code, in plain English",
  "Prompt optimizer for clarity & effectiveness",
];

export function AiSection() {
  return (
    <section className="max-w-7xl mx-auto px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <FadeInSection>
        <span className="inline-block font-mono text-xs uppercase tracking-[0.08em] font-semibold text-ember bg-[color-mix(in_oklch,var(--ember)_12%,transparent)] border border-[color-mix(in_oklch,var(--ember)_35%,transparent)] rounded-md px-2.5 py-1 mb-4">
          Pro Feature
        </span>
        <h2 className="font-display font-semibold uppercase tracking-wide text-2xl sm:text-3xl mb-3">
          Let AI Tend Your Grimoire
        </h2>
        <p className="text-muted-foreground mb-6">
          Upgrade to an Archmage and let AI organize, summarize, and explain every
          spell you cast.
        </p>
        <ul className="flex flex-col gap-3">
          {AI_CHECKLIST.map((item) => (
            <li key={item} className="flex items-center gap-2.5 text-sm sm:text-base">
              <CheckCircle2 className="size-4.5 text-rune shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </FadeInSection>

      <FadeInSection>
        <div className="rounded-2xl border border-border shadow-[var(--shadow-tome)] overflow-hidden bg-[oklch(0.10_0.015_55)]">
          <div className="flex items-center gap-1.5 px-3.5 py-2.5 border-b border-border">
            <span className="size-2.5 rounded-full bg-red-400" />
            <span className="size-2.5 rounded-full bg-amber-400" />
            <span className="size-2.5 rounded-full bg-emerald-400" />
            <span className="ml-auto font-mono text-xs text-muted-foreground">
              typescript
            </span>
          </div>
          <pre className="font-mono text-[0.78rem] leading-relaxed px-4.5 py-4 text-[oklch(0.85_0.02_70)] overflow-x-auto">
            <code>
              <span className="text-arcane">export function</span>{" "}
              <span className="text-ember">useDebounce</span>
              {"<T>(value: T, delay = "}
              <span className="text-rune">300</span>
              {") {\n  "}
              <span className="text-arcane">const</span>
              {" [debounced, setDebounced] = useState(value);\n  useEffect(() => {\n    "}
              <span className="text-arcane">const</span>
              {" id = setTimeout(() => setDebounced(value), delay);\n    "}
              <span className="text-arcane">return</span>
              {" () => clearTimeout(id);\n  }, [value, delay]);\n  "}
              <span className="text-arcane">return</span>
              {" debounced;\n}"}
            </code>
          </pre>
          <div className="flex items-center gap-2 flex-wrap px-4.5 py-3 border-t border-border">
            <span className="text-[0.68rem] text-muted-foreground mr-1">
              AI Generated Tags
            </span>
            {["#react", "#hooks", "#performance"].map((tag) => (
              <span
                key={tag}
                className="font-mono text-[0.68rem] bg-arcane/20 text-arcane rounded px-2 py-0.5"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </FadeInSection>
    </section>
  );
}
