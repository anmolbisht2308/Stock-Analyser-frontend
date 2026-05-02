"use client";

import { X, Zap, Lock } from "lucide-react";
import Link from "next/link";

interface UpgradeModalProps {
  reason: "quota" | "plan";
  currentPlan?: string;
  limit?: number;
  used?: number;
  onClose: () => void;
}

export function UpgradeModal({ reason, currentPlan = "free", limit, used, onClose }: UpgradeModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center gap-5 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            {reason === "quota" ? (
              <Zap className="w-8 h-8 text-amber-500" />
            ) : (
              <Lock className="w-8 h-8 text-amber-500" />
            )}
          </div>

          {reason === "quota" ? (
            <>
              <div>
                <h3 className="text-xl font-bold text-slate-100 mb-2 font-mono">Daily Limit Reached</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  You've used <span className="text-amber-400 font-semibold">{used}/{limit}</span> analyses today on the <span className="uppercase font-semibold">{currentPlan}</span> plan.
                  Upgrade to unlock more.
                </p>
              </div>

              <div className="w-full bg-[#111] rounded-xl p-4 text-left border border-[#222]">
                <div className="flex justify-between text-xs font-mono text-slate-500 mb-2">
                  <span>Analyses used today</span>
                  <span className="text-amber-400">{used} / {limit}</span>
                </div>
                <div className="w-full h-2 bg-[#222] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((used ?? 0) / (limit ?? 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <h3 className="text-xl font-bold text-slate-100 mb-2 font-mono">Upgrade Required</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                This feature requires a higher plan. Upgrade to unlock full access.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Link
              href="/pricing"
              onClick={onClose}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold py-2.5 px-4 rounded-xl text-center text-sm transition-colors"
            >
              View Plans
            </Link>
            <button
              onClick={onClose}
              className="flex-1 border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 font-mono text-sm py-2.5 px-4 rounded-xl transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
