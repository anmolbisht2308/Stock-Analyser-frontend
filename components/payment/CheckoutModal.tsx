"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { X, Zap, ShieldCheck, Check, Loader2, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CheckoutModalProps {
  plan: "pro" | "institutional";
  billingCycle: "monthly" | "annual";
  planLabel: string;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function CheckoutModal({ plan, billingCycle, planLabel, amount, onClose, onSuccess }: CheckoutModalProps) {
  const { user } = useAuthStore();
  const [error, setError] = useState("");

  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/payments/create-order", { plan, billingCycle });
      return data;
    },
    onSuccess: (orderData) => {
      launchRazorpay(orderData);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error?.message || "Failed to create order. Please try again.");
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const { data } = await api.post("/payments/verify", payload);
      return data;
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: () => {
      setError("Payment verification failed. If money was deducted, please contact support.");
    },
  });

  const launchRazorpay = (orderData: any) => {
    if (!window.Razorpay) {
      setError("Razorpay SDK not loaded. Please refresh the page.");
      return;
    }

    const options = {
      key:      orderData.keyId,
      amount:   orderData.amount,
      currency: orderData.currency,
      name:     "StockAI",
      description: orderData.planLabel,
      order_id: orderData.orderId,
      prefill: {
        email: user?.email || "",
      },
      // ── Dark terminal theme ──────────────────────────────
      theme: {
        color: "#F59E0B",  // gold
        backdrop_color: "rgba(5, 5, 5, 0.85)",
      },
      modal: {
        backdropclose: false,
        animation: true,
      },
      // ── Callbacks ────────────────────────────────────────
      handler: (response: any) => {
        verifyMutation.mutate({
          razorpay_order_id:   response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature:  response.razorpay_signature,
        });
      },
      ondismiss: () => {
        if (!verifyMutation.isPending) {
          setError("");
          createOrderMutation.reset();
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (resp: any) => {
      setError(`Payment failed: ${resp.error?.description || "Unknown error"}`);
    });
    rzp.open();
  };

  const isPending = createOrderMutation.isPending || verifyMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={!isPending ? onClose : undefined} />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl p-6 shadow-2xl overflow-hidden">
        {/* Gold top line */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

        {/* Close */}
        {!isPending && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Icon */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            {plan === "institutional"
              ? <ShieldCheck className="w-5 h-5 text-amber-500" />
              : <Zap className="w-5 h-5 text-amber-500" />}
          </div>
          <div>
            <h3 className="font-mono font-bold text-slate-100 text-base">Upgrade to {plan === "pro" ? "Pro" : "Institutional"}</h3>
            <p className="text-xs text-slate-500 font-mono">{planLabel}</p>
          </div>
        </div>

        {/* Price display */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-4 mb-5">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-mono font-bold text-amber-500">
              ₹{(amount / 100).toLocaleString("en-IN")}
            </span>
            <span className="text-xs font-mono text-slate-400">
              {billingCycle === "annual" ? "per year" : "per month"}
            </span>
          </div>
          {billingCycle === "annual" && (
            <div className="mt-1.5 inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              <Check className="w-3 h-3" />
              Save 33% vs monthly
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs font-mono text-red-200">{error}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => { setError(""); createOrderMutation.mutate(); }}
          disabled={isPending}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-mono font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {createOrderMutation.isPending ? "Creating order..." : "Verifying payment..."}
            </>
          ) : (
            "Pay Securely with Razorpay"
          )}
        </button>

        <p className="mt-3 text-center text-xs font-mono text-slate-600">
          🔒 Secured by Razorpay · 256-bit SSL
        </p>
      </div>
    </div>
  );
}
