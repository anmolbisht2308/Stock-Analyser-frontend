"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Check, Zap, Crown, ShieldCheck, Sparkles, Users } from "lucide-react";
import Script from "next/script";
import { api } from "@/lib/api";
import { CheckoutModal } from "@/components/payment/CheckoutModal";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";

interface PlanData {
  id: "pro" | "institutional";
  label: string;
  description: string;
  monthly: { amount: number; label: string };
  annual:  { amount: number; label: string };
  dailyLimit: number;
  features: string[];
}

const FREE_FEATURES = [
  "3 AI analyses per day",
  "Top 10 screener results",
  "Basic price charts",
  "Stock search",
  "News feed",
];

const PLAN_ICONS: Record<string, typeof Zap> = {
  free: Zap,
  pro: Crown,
  institutional: ShieldCheck,
};

const PLAN_COLORS: Record<string, { accent: string; border: string; glow: string; badge: string }> = {
  free: {
    accent: "text-slate-400",
    border: "border-white/10",
    glow:   "",
    badge:  "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
  pro: {
    accent: "text-amber-400",
    border: "border-amber-500/30",
    glow:   "shadow-[0_0_30px_rgba(245,158,11,0.12)]",
    badge:  "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  institutional: {
    accent: "text-purple-400",
    border: "border-purple-500/30",
    glow:   "shadow-[0_0_30px_rgba(139,92,246,0.12)]",
    badge:  "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
};

export default function PricingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [checkout, setCheckout] = useState<{
    plan: "pro" | "institutional";
    amount: number;
    label: string;
  } | null>(null);

  const { data, isLoading } = useQuery<{ plans: PlanData[] }>({
    queryKey: ["plans"],
    queryFn:  async () => { const { data } = await api.get("/payments/plans"); return data; },
    staleTime: Infinity,
  });

  const handleSelect = (plan: PlanData) => {
    if (!isAuthenticated) { router.push("/login"); return; }
    setCheckout({
      plan:   plan.id,
      amount: plan[billingCycle].amount,
      label:  plan[billingCycle].label,
    });
  };

  const handlePaymentSuccess = async () => {
    setCheckout(null);
    // Refresh user plan info
    await queryClient.invalidateQueries({ queryKey: ["my-plan"] });
    router.push("/?upgraded=1");
  };

  return (
    <>
      {/* Razorpay SDK */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="w-full max-w-screen-xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 text-amber-500 text-xs font-mono font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Powered by Groq LLaMA 3.3 70B
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-100 mb-4 tracking-tight">
            Unlock AI-Grade{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-emerald-400">
              Stock Intelligence
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Institutional-quality analysis for every investor. Cancel anytime.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 mt-8 bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-1">
            {(["monthly", "annual"] as const).map((cycle) => (
              <button
                key={cycle}
                onClick={() => setBillingCycle(cycle)}
                className={`px-5 py-2 rounded-lg text-sm font-mono font-medium transition-all ${
                  billingCycle === cycle
                    ? "bg-amber-500 text-black shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {cycle === "monthly" ? "Monthly" : "Annual"}
                {cycle === "annual" && (
                  <span className={`ml-1.5 text-xs ${billingCycle === "annual" ? "text-black/70" : "text-emerald-400"}`}>
                    −33%
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Free card */}
          <div className={`relative bg-[#0A0A0A] border rounded-2xl p-6 flex flex-col ${PLAN_COLORS.free.border}`}>
            <div className="mb-6">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border mb-4 ${PLAN_COLORS.free.badge}`}>
                <Zap className="w-3 h-3" />
                FREE
              </div>
              <h2 className="text-xl font-bold text-slate-100 mb-1">Free</h2>
              <p className="text-slate-500 text-sm">Get started — no card needed</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-mono font-bold text-slate-100">₹0</span>
              <span className="text-slate-500 text-sm ml-1">forever</span>
            </div>
            <ul className="space-y-2.5 flex-1 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-400">
                  <Check className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="w-full py-2.5 rounded-xl border border-white/10 text-slate-500 font-mono text-sm cursor-not-allowed"
            >
              {user?.plan === "free" || !user ? "Current Plan" : "Included"}
            </button>
          </div>

          {/* Dynamic plans from API */}
          {isLoading
            ? [1, 2].map((i) => (
                <div key={i} className="h-96 bg-[#0A0A0A] border border-white/5 rounded-2xl animate-pulse" />
              ))
            : data?.plans.map((plan) => {
                const colors = PLAN_COLORS[plan.id];
                const Icon   = PLAN_ICONS[plan.id] ?? Zap;
                const price  = plan[billingCycle].amount / 100;
                const isCurrentPlan = user?.plan === plan.id;

                return (
                  <div
                    key={plan.id}
                    className={`relative bg-[#0A0A0A] border rounded-2xl p-6 flex flex-col ${colors.border} ${colors.glow} ${plan.id === "pro" ? "ring-1 ring-amber-500/20" : ""}`}
                  >
                    {plan.id === "pro" && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-500 text-black text-xs font-mono font-bold px-3 py-1 rounded-full whitespace-nowrap">
                        Most Popular
                      </div>
                    )}

                    <div className="mb-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border mb-4 ${colors.badge}`}>
                        <Icon className="w-3 h-3" />
                        {plan.label.toUpperCase()}
                      </div>
                      <h2 className="text-xl font-bold text-slate-100 mb-1">{plan.label}</h2>
                      <p className="text-slate-500 text-sm">{plan.description}</p>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl font-mono font-bold ${colors.accent}`}>
                          ₹{price.toLocaleString("en-IN")}
                        </span>
                        <span className="text-slate-500 text-sm">
                          /{billingCycle === "annual" ? "year" : "month"}
                        </span>
                      </div>
                      {billingCycle === "annual" && (
                        <p className="text-xs text-emerald-400 font-mono mt-1">
                          Save ₹{((plan.monthly.amount * 12 - plan.annual.amount) / 100).toLocaleString("en-IN")} vs monthly
                        </p>
                      )}
                    </div>

                    <ul className="space-y-2.5 flex-1 mb-8">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${colors.accent}`} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSelect(plan)}
                      disabled={isCurrentPlan}
                      className={`w-full py-2.5 rounded-xl font-mono font-bold text-sm transition-all ${
                        isCurrentPlan
                          ? "border border-white/10 text-slate-500 cursor-not-allowed"
                          : plan.id === "pro"
                          ? "bg-amber-500 hover:bg-amber-400 text-black"
                          : "bg-purple-500 hover:bg-purple-400 text-white"
                      }`}
                    >
                      {isCurrentPlan ? "Current Plan" : `Get ${plan.label}`}
                    </button>
                  </div>
                );
              })}
        </div>

        {/* Feature comparison table */}
        <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden mb-12">
          <div className="grid grid-cols-4 gap-0">
            <div className="p-5 border-b border-r border-white/5">
              <p className="text-sm font-semibold text-slate-300">Feature</p>
            </div>
            {["Free", "Pro", "Institutional"].map((h, i) => (
              <div key={h} className={`p-5 text-center border-b border-white/5 ${i < 2 ? "border-r" : ""}`}>
                <p className={`text-sm font-mono font-bold ${i === 0 ? "text-slate-400" : i === 1 ? "text-amber-400" : "text-purple-400"}`}>{h}</p>
              </div>
            ))}
            {[
              ["AI Analyses / Day", "3", "50", "500"],
              ["Screener Access", "Top 10", "Full", "Full + API"],
              ["Watchlist Stocks", "—", "50", "Unlimited"],
              ["Target Probabilities", "✓", "✓", "✓"],
              ["Multibagger Scores", "✓", "✓", "✓"],
              ["Bulk Analysis", "—", "—", "✓"],
              ["API Key Access", "—", "—", "✓"],
            ].map(([feature, free, pro, inst]) => (
              [feature, free, pro, inst].map((val, j) => (
                <div
                  key={`${feature}-${j}`}
                  className={`p-4 text-sm border-b border-white/5 ${j < 3 ? "border-r" : ""} ${j === 0 ? "text-slate-400 font-medium" : "text-center font-mono"} ${val === "—" ? "text-slate-700" : val === "✓" ? "text-emerald-400" : "text-slate-300"}`}
                >
                  {val}
                </div>
              ))
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 text-sm text-slate-500 font-mono">
            <Users className="w-4 h-4" />
            Trusted by traders across NSE, BSE & global markets
          </div>
          <p className="text-xs text-slate-600 font-mono mt-2">
            AI analysis is not financial advice. Past performance is not indicative of future results.
          </p>
        </div>
      </div>

      {/* Checkout Modal */}
      {checkout && (
        <CheckoutModal
          plan={checkout.plan}
          billingCycle={billingCycle}
          planLabel={checkout.label}
          amount={checkout.amount}
          onClose={() => setCheckout(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}
