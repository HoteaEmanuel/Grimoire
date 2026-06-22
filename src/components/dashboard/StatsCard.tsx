import { type LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
}

export function StatsCard({ label, value, icon: Icon, iconColor }: StatsCardProps) {
  return (
    <div
      className="tome-card group relative overflow-hidden rounded-lg cursor-default transition-all duration-300 hover:scale-[1.02]"
      style={{
        background: `linear-gradient(135deg, ${iconColor}14 0%, oklch(0.17 0.022 55) 50%, oklch(0.14 0.016 50) 100%)`,
      }}
    >
      {/* hover outer glow */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
        style={{ boxShadow: `0 0 28px 2px ${iconColor}40` }}
      />

      <div className="p-4 sm:p-5 flex items-center gap-3 sm:gap-5">
        <div
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: `linear-gradient(135deg, ${iconColor}25, ${iconColor}0d)`,
            boxShadow: `0 0 12px -2px ${iconColor}50`,
          }}
        >
          <Icon size={20} className="sm:size-5.5" style={{ color: iconColor }} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl sm:text-3xl font-bold leading-none tracking-tight" style={{ color: iconColor }}>
            {value}
          </p>
          <p className="text-sm sm:text-md text-muted-foreground mt-1.5 font-medium wrap-break-word">{label}</p>
        </div>
      </div>
    </div>
  );
}
