"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface Signal {
  name: string;
  value: string;
  interpretation: "BULLISH" | "BEARISH" | "NEUTRAL";
}

export function TechnicalSignals({ signals }: { signals: Signal[] }) {
  if (!signals || signals.length === 0) return <div className="text-slate-500 text-sm p-4">No technical signals available.</div>;

  return (
    <div className="bg-terminal-100 border border-white/5 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-400 font-medium">
            <tr>
              <th className="px-6 py-4">Indicator</th>
              <th className="px-6 py-4">Value</th>
              <th className="px-6 py-4">Signal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {signals.map((sig, i) => {
              const isBull = sig.interpretation === "BULLISH";
              const isBear = sig.interpretation === "BEARISH";
              const Icon = isBull ? ArrowUpRight : isBear ? ArrowDownRight : Minus;
              const color = isBull ? "text-bull" : isBear ? "text-bear" : "text-slate-500";
              const bg = isBull ? "bg-bull/10" : isBear ? "bg-bear/10" : "bg-white/5";

              return (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3 font-medium text-slate-200">{sig.name}</td>
                  <td className="px-6 py-3 font-mono text-slate-400">{sig.value}</td>
                  <td className="px-6 py-3">
                    <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide", color, bg)}>
                      <Icon className="w-3.5 h-3.5" />
                      {sig.interpretation}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
