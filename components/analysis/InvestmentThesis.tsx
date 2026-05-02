import { Target, AlertTriangle, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface InvestmentThesisProps {
  thesis: string;
  catalysts: string[];
  risks: string[];
  timeHorizon: string;
  entryStrategy: string;
  exitStrategy: string;
}

export function InvestmentThesis({ thesis, catalysts, risks, timeHorizon, entryStrategy, exitStrategy }: InvestmentThesisProps) {
  if (!thesis) return null;

  return (
    <div className="bg-terminal-100 border border-white/5 rounded-xl p-6 lg:p-8 relative overflow-hidden">
      {/* Decorative left border */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold via-bull to-bear opacity-50" />
      
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-gold" />
          AI Investment Thesis
        </h2>
        <p className="text-slate-300 leading-relaxed text-base">
          {thesis}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-bull flex items-center gap-2 mb-3">
            <Target className="w-4 h-4" />
            Catalysts for Growth
          </h3>
          <ul className="space-y-2">
            {catalysts.map((c, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-bull mt-0.5">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-bear flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" />
            Major Risks
          </h3>
          <ul className="space-y-2">
            {risks.map((r, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-bear mt-0.5">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white/5 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4 border border-white/5">
        <div>
          <p className="text-xs text-slate-500 mb-1">Suggested Time Horizon</p>
          <p className="font-mono text-sm font-semibold text-slate-200">{timeHorizon}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Entry Strategy</p>
          <p className="text-sm text-slate-300">{entryStrategy}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Exit Strategy</p>
          <p className="text-sm text-slate-300">{exitStrategy}</p>
        </div>
      </div>
    </div>
  );
}
