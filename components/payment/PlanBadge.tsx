"use client";

import { Crown, Zap, ShieldCheck } from "lucide-react";

const PLAN_META: Record<string, { label: string; color: string; icon: typeof Zap; bg: string; border: string }> = {
  free:          { label: "FREE",  color: "text-slate-400", icon: Zap,         bg: "bg-slate-500/10",  border: "border-slate-500/20" },
  pro:           { label: "PRO",   color: "text-amber-400", icon: Crown,        bg: "bg-amber-500/10",  border: "border-amber-500/30" },
  institutional: { label: "INST",  color: "text-purple-400", icon: ShieldCheck, bg: "bg-purple-500/10", border: "border-purple-500/30" },
};

export function PlanBadge({ plan }: { plan?: string }) {
  const meta = PLAN_META[plan ?? "free"] ?? PLAN_META.free;
  const Icon = meta.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-bold border ${meta.bg} ${meta.border} ${meta.color}`}>
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  );
}
