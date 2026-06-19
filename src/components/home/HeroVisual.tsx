"use client";

import { useEffect, useRef } from "react";
import {
  ArrowRight,
  AppWindow,
  Bookmark,
  Code2,
  FileText,
  GitBranch,
  MessageSquare,
  NotebookPen,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import { SYSTEM_ITEM_TYPES } from "@/lib/item-types";

const CHAOS_ICONS: { icon: LucideIcon; label: string }[] = [
  { icon: NotebookPen, label: "Notion" },
  { icon: GitBranch, label: "GitHub" },
  { icon: MessageSquare, label: "Slack" },
  { icon: Code2, label: "VS Code" },
  { icon: AppWindow, label: "Tabs" },
  { icon: Terminal, label: "Terminal" },
  { icon: FileText, label: "notes.txt" },
  { icon: Bookmark, label: "Bookmarks" },
];

const NAV_RAIL_TYPES = SYSTEM_ITEM_TYPES.filter(
  (type) => type.contentKind !== "FILE"
);
const LOCKED_TYPES = SYSTEM_ITEM_TYPES.filter(
  (type) => type.contentKind === "FILE"
);

const GRIMOIRE_ENTRIES = [
  { name: "React Patterns", spells: 24, color: "#3b82f6" },
  { name: "Prompt Library", spells: 41, color: "#8b5cf6" },
  { name: "Context Tomes", spells: 9, color: "#f97316" },
  { name: "Inspiration Vault", spells: 56, color: "#10b981" },
];

interface IconState {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  rotPhase: number;
  scalePhase: number;
  speed: number;
}

const REPEL_RADIUS = 70;
const REPEL_FORCE = 1.8;

export function HeroVisual() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const iconEls = Array.from(
      container.querySelectorAll<HTMLDivElement>("[data-chaos-icon]")
    );
    const bounds = { w: 0, h: 0 };
    const mouse = { x: -9999, y: -9999, active: false };

    const state: IconState[] = iconEls.map((el) => ({
      el,
      x: Math.random() * 240,
      y: Math.random() * 180,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      w: 56,
      h: 70,
      rotPhase: Math.random() * Math.PI * 2,
      scalePhase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.4,
    }));

    function measure() {
      bounds.w = container!.clientWidth;
      bounds.h = container!.clientHeight;
    }
    measure();
    window.addEventListener("resize", measure);

    function handleMouseMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function handleMouseLeave() {
      mouse.active = false;
    }
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    let t = 0;
    let frameId: number;
    function tick() {
      t += 0.02;
      for (const s of state) {
        if (mouse.active) {
          const cx = s.x + s.w / 2;
          const cy = s.y + s.h / 2;
          const dx = cx - mouse.x;
          const dy = cy - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < REPEL_RADIUS) {
            const force = ((REPEL_RADIUS - dist) / REPEL_RADIUS) * REPEL_FORCE;
            s.vx += (dx / dist) * force;
            s.vy += (dy / dist) * force;
          }
        }

        s.vx *= 0.96;
        s.vy *= 0.96;
        s.x += s.vx * s.speed;
        s.y += s.vy * s.speed;

        const maxX = Math.max(bounds.w - s.w, 0);
        const maxY = Math.max(bounds.h - s.h, 0);
        if (s.x < 0) {
          s.x = 0;
          s.vx = Math.abs(s.vx);
        }
        if (s.x > maxX) {
          s.x = maxX;
          s.vx = -Math.abs(s.vx);
        }
        if (s.y < 0) {
          s.y = 0;
          s.vy = Math.abs(s.vy);
        }
        if (s.y > maxY) {
          s.y = maxY;
          s.vy = -Math.abs(s.vy);
        }

        const rot = Math.sin(t + s.rotPhase) * 8;
        const scale = 1 + Math.sin(t * 1.3 + s.scalePhase) * 0.08;
        s.el.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${rot}deg) scale(${scale})`;
      }
      frameId = requestAnimationFrame(tick);
    }
    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", measure);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6">
      {/* Chaos box */}
      <div className="tome-card rounded-2xl p-4 h-[340px]">
        <span className="block text-center font-mono text-xs text-muted-foreground mb-3">
          Your knowledge today...
        </span>
        <div ref={containerRef} className="relative w-full h-[280px] overflow-hidden">
          {CHAOS_ICONS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              data-chaos-icon
              className="absolute flex flex-col items-center gap-0.5 w-14 text-muted-foreground will-change-transform"
            >
              <span className="grimoire-chaos-icon flex items-center justify-center size-9">
                <Icon className="size-5" />
              </span>
              <small className="text-[0.6rem] opacity-70">{label}</small>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex flex-col items-center gap-4">
        <span className="flex text-ember opacity-85 md:rotate-0 rotate-90">
          <ArrowRight className="size-14" />
        </span>
      </div>

      {/* Dashboard preview — open grimoire */}
      <div className="grimoire-cover relative rounded-[1.1rem] p-4">
        <span className="block text-center font-mono text-xs text-muted-foreground mb-3">
          ...with Grimoire
        </span>
        <div className="relative flex flex-col sm:flex-row min-h-[300px] rounded-[0.6rem] shadow-[0_10px_30px_-12px_oklch(0_0_0_/_0.6)]">
          <div className="grimoire-page-spine absolute inset-x-0 sm:inset-y-0 sm:left-1/2 sm:inset-x-auto top-1/2 sm:top-0 h-5 sm:h-auto w-auto sm:w-7 -translate-y-1/2 sm:-translate-x-1/2 sm:translate-y-0 z-10 pointer-events-none" />

          <div className="grimoire-cover-flap sm:flex w-6.5 shrink-0 rounded-l-md" />
          {/* <div className="grimoire-page-edge  sm:block w-2 shrink-0" /> */}

          <div className="grimoire-page flex-1 min-w-0 p-4 rounded-t-md sm:rounded-none">
            <p className="text-[0.66rem] leading-relaxed">
              Your spellbook holds <strong className="font-bold">179 incantations</strong>
              <br />
              across <strong className="font-bold">6 grimoires</strong>
            </p>
            <div className="h-px bg-black/20 my-2.5" />
            <ul className="flex flex-col gap-1.5 text-[0.65rem]">
              {NAV_RAIL_TYPES.map((type, i) => (
                <li
                  key={type.slug}
                  className={`flex items-center gap-1.5 ${i === 0 ? "font-bold" : "opacity-85"}`}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ background: type.color }}
                  />
                  {type.name}s
                </li>
              ))}
              {LOCKED_TYPES.map((type) => (
                <li key={type.slug} className="flex items-center gap-1.5 opacity-55">
                  {type.name}s <em className="not-italic text-[0.5rem] ml-auto text-arcane">PRO</em>
                </li>
              ))}
            </ul>
          </div>

          <div className="grimoire-page flex-1 min-w-0 p-4 rounded-b-md sm:rounded-none">
            <span className="block font-display text-[0.72rem] uppercase tracking-wide mb-2.5 opacity-90">
              Grimoires
            </span>
            <ul className="flex flex-col gap-2">
              {GRIMOIRE_ENTRIES.map((entry) => (
                <li
                  key={entry.name}
                  className="flex items-center gap-1.5 text-[0.68rem] pb-1.5 border-b border-dashed border-black/20"
                >
                  <span
                    className="size-1.5 rounded-full shrink-0"
                    style={{ background: entry.color, boxShadow: `0 0 5px ${entry.color}` }}
                  />
                  <span className="font-semibold">{entry.name}</span>
                  <span className="ml-auto font-mono text-[0.6rem] opacity-60">
                    {entry.spells} spells
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* <div className="grimoire-page-edge hidden sm:block w-2 shrink-0" /> */}
          <div className="grimoire-cover-flap hidden sm:flex w-6.5 shrink-0 rounded-r-md" />
        </div>
      </div>
    </div>
  );
}
