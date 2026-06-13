"use client";

import { useState } from "react";
import { WandSparkles } from "lucide-react";

const SPARKLES = [
  { id: 1, top: "0%",  left: "55%", size: 5, delay: "0ms",   anim: "sparkle-1 0.65s ease-out forwards" },
  { id: 2, top: "15%", left: "75%", size: 4, delay: "40ms",  anim: "sparkle-2 0.70s ease-out forwards" },
  { id: 3, top: "5%",  left: "40%", size: 6, delay: "80ms",  anim: "sparkle-3 0.60s ease-out forwards" },
  { id: 4, top: "25%", left: "70%", size: 4, delay: "20ms",  anim: "sparkle-4 0.75s ease-out forwards" },
  { id: 5, top: "20%", left: "30%", size: 3, delay: "60ms",  anim: "sparkle-5 0.55s ease-out forwards" },
];

export function AnimatedWand() {
  const [hovered, setHovered] = useState(false);
  const [burst, setBurst] = useState(0);

  function handleEnter() {
    setHovered(true);
    setBurst((b) => b + 1);
  }

  return (
    <div
      className="relative inline-flex cursor-default select-none"
      onMouseEnter={handleEnter}
      onMouseLeave={() => setHovered(false)}
    >
      <WandSparkles
        size={22}
        className="text-primary drop-shadow-[0_0_6px_var(--color-primary)]"
        style={{
          animation: hovered
            ? "wand-wiggle 0.55s ease-in-out"
            : undefined,
          transformOrigin: "bottom left",
        }}
      />

      {SPARKLES.map((s) => (
        <span
          key={`${burst}-${s.id}`}
          className="absolute rounded-full pointer-events-none"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            background: "var(--color-primary)",
            boxShadow: "0 0 4px 1px var(--color-primary)",
            animation: burst > 0 ? s.anim : undefined,
            animationDelay: s.delay,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
