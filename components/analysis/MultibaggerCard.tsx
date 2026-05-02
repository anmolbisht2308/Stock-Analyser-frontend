"use client";

import { Rocket, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultibaggerCardProps {
  title: string;
  data: {
    within1Y: number;
    within2Y: number;
    within3Y: number;
  };
  confidence?: "LOW" | "MEDIUM" | "HIGH";
  isMultibagger?: boolean;
}

export function MultibaggerCard({ title, data, confidence, isMultibagger }: MultibaggerCardProps) {
  let glow = "";
  let confidenceColor = "text-slate-400";
  
  if (confidence === "HIGH") {
    glow = "shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.25)] border-gold/20";
    confidenceColor = "text-gold";
  } else if (confidence === "MEDIUM") {
    glow = "shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_25px_rgba(59,130,246,0.25)] border-chart-blue/20";
    confidenceColor = "text-chart-blue";
  }

  const Icon = isMultibagger ? Rocket : Target;
  const iconColor = isMultibagger ? "text-bull" : "text-slate-300";

  return (
    <div className={cn("bg-terminal-100 border border-white/5 rounded-xl p-5 relative overflow-hidden transition-all duration-300", glow)}>
      <div className="flex items-center gap-3 mb-6">
        <div className={cn("p-2 bg-white/5 rounded-lg", iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-slate-100">{title}</h3>
      </div>

      <div className="space-y-4">
        <Row label="Within 1 Year" value={data.within1Y} />
        <Row label="Within 2 Years" value={data.within2Y} />
        <Row label="Within 3 Years" value={data.within3Y} />
      </div>

      {confidence && (
        <div className="absolute top-4 right-4 text-xs font-mono font-semibold bg-white/5 px-2 py-1 rounded">
          <span className={confidenceColor}>{confidence}</span> CONF
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  let color = "bg-slate-600";
  let textColor = "text-slate-400";
  if (value >= 70) { color = "bg-bull"; textColor = "text-bull"; }
  else if (value >= 40) { color = "bg-gold"; textColor = "text-gold"; }
  else if (value >= 15) { color = "bg-chart-blue"; textColor = "text-chart-blue"; }

  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="text-slate-400">{label}</span>
        <span className={cn("font-mono font-bold", textColor)}>{Math.round(value)}%</span>
      </div>
      <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", color)} 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
