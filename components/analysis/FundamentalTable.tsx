"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, Activity } from "lucide-react";

interface FundamentalData {
  metrics: Record<string, number | null>;
  health: {
    valuationStatus: string;
    growthOutlook: string;
    financialHealth: string;
    fundamentalScore: number;
  };
}

export function FundamentalTable({ data }: { data: FundamentalData }) {
  if (!data || !data.metrics) return <div className="text-slate-500 text-sm">No fundamental data available.</div>;

  const formatMetric = (key: string, val: number | null) => {
    if (val === null || val === undefined) return "N/A";
    const k = key.toLowerCase();
    
    // Percentages
    if (k.includes("margin") || k.includes("growth") || k.includes("yield") || k.includes("roe") || k.includes("roa")) {
      return `${(val * 100).toFixed(2)}%`;
    }
    
    // Large absolute numbers (assuming base currency, e.g. INR or USD)
    if (k.includes("cap") || k.includes("value") || k.includes("revenue") || k.includes("flow")) {
      if (val > 1e12) return `${(val / 1e12).toFixed(2)}T`;
      if (val > 1e9) return `${(val / 1e9).toFixed(2)}B`;
      if (val > 1e6) return `${(val / 1e6).toFixed(2)}M`;
    }
    
    return val.toFixed(2);
  };

  const formatKey = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  // Status mapping
  const getStatusConfig = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("EXCELLENT") || s.includes("STRONG") || s.includes("UNDERVALUED")) return { icon: CheckCircle2, color: "text-bull" };
    if (s.includes("POOR") || s.includes("WEAK") || s.includes("NEGATIVE") || s.includes("OVERVALUED")) return { icon: XCircle, color: "text-bear" };
    return { icon: Activity, color: "text-gold" };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Metrics Table */}
      <div className="bg-terminal-100 border border-white/5 rounded-xl p-5">
        <h3 className="font-semibold text-slate-100 mb-4">Key Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          {Object.entries(data.metrics).map(([key, val]) => (
            <div key={key} className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-sm text-slate-400">{formatKey(key)}</span>
              <span className="font-mono text-sm text-slate-200">{formatMetric(key, val)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Health Summary */}
      <div className="bg-terminal-100 border border-white/5 rounded-xl p-5 flex flex-col gap-4">
        <h3 className="font-semibold text-slate-100 mb-2">Financial Health</h3>
        
        <HealthRow label="Valuation" value={data.health.valuationStatus} config={getStatusConfig(data.health.valuationStatus)} />
        <HealthRow label="Growth Outlook" value={data.health.growthOutlook} config={getStatusConfig(data.health.growthOutlook)} />
        <HealthRow label="Balance Sheet" value={data.health.financialHealth} config={getStatusConfig(data.health.financialHealth)} />
        
        <div className="mt-auto pt-4 border-t border-white/5">
          <div className="flex justify-between items-center">
            <span className="text-slate-400 font-medium">Fundamental Score</span>
            <span className={cn("text-2xl font-bold font-mono", getStatusConfig(data.health.fundamentalScore > 60 ? "STRONG" : data.health.fundamentalScore < 40 ? "WEAK" : "FAIR").color)}>
              {Math.round(data.health.fundamentalScore)}<span className="text-sm text-slate-500">/100</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function HealthRow({ label, value, config }: { label: string, value: string, config: any }) {
  const { icon: Icon, color } = config;
  return (
    <div className="flex justify-between items-center bg-white/[0.02] p-3 rounded-lg border border-white/5">
      <span className="text-slate-300 font-medium text-sm">{label}</span>
      <div className={cn("flex items-center gap-2 font-mono text-xs font-bold tracking-wide", color)}>
        {value.toUpperCase()}
        <Icon className="w-4 h-4" />
      </div>
    </div>
  );
}
