import { cn } from "@/lib/utils";

interface RatingBadgeProps {
  rating: string; // "STRONG BUY" | "BUY" | "HOLD" | "SELL" | "STRONG SELL"
  className?: string;
}

export function AnalystRatingBadge({ rating, className }: RatingBadgeProps) {
  const normalized = rating.toUpperCase();
  
  let colors = "bg-white/10 text-slate-300 border-white/20";
  let glow = "";

  if (normalized.includes("STRONG BUY")) {
    colors = "bg-bull/20 text-bull border-bull/50";
    glow = "shadow-[0_0_12px_rgba(0,212,170,0.3)]";
  } else if (normalized.includes("BUY")) {
    colors = "bg-bull/10 text-bull border-bull/30";
  } else if (normalized.includes("HOLD")) {
    colors = "bg-gold/10 text-gold border-gold/30";
  } else if (normalized.includes("STRONG SELL")) {
    colors = "bg-bear/20 text-bear border-bear/50";
    glow = "shadow-[0_0_12px_rgba(255,71,87,0.3)]";
  } else if (normalized.includes("SELL")) {
    colors = "bg-bear/10 text-bear border-bear/30";
  }

  return (
    <div className={cn("px-3 py-1 rounded-full text-xs font-bold font-mono border tracking-wide", colors, glow, className)}>
      {normalized}
    </div>
  );
}
