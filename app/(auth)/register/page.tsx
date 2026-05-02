"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";
import { Terminal, Lock, Mail, AlertTriangle, ArrowRight, UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const registerMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/auth/register", { email, password });
      return data;
    },
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken);
      router.push("/");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    
    if (!email || !password || !confirmPassword) return;
    
    if (password !== confirmPassword) {
      setPasswordError("Passphrases do not match.");
      return;
    }
    
    if (password.length < 8) {
      setPasswordError("Passphrase must be at least 8 characters.");
      return;
    }

    registerMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
            <UserPlus className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-3xl font-mono text-gray-100 font-bold mb-2 tracking-tight">Create Identity</h1>
          <p className="text-gray-500 font-mono text-sm">Register to track and analyze the markets.</p>
        </div>

        {/* Card */}
        <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-6 shadow-2xl relative overflow-hidden">
          {/* Decorative Top Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />
          
          {(registerMutation.isError || passwordError) && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm font-mono text-red-200">
                {passwordError || (registerMutation.error as any)?.response?.data?.error?.message || "Registration failed. Verify input."}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-600" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] rounded-lg py-2.5 pl-10 pr-4 text-gray-200 font-mono text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors placeholder-gray-700"
                  placeholder="operator@stockai.net"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">Passphrase</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-600" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] rounded-lg py-2.5 pl-10 pr-4 text-gray-200 font-mono text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors placeholder-gray-700"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block">Confirm Passphrase</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-600" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] rounded-lg py-2.5 pl-10 pr-4 text-gray-200 font-mono text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors placeholder-gray-700"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending || !email || !password || !confirmPassword}
              className="w-full mt-6 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registerMutation.isPending ? "INITIALIZING..." : "INITIALIZE CONNECTION"}
              {!registerMutation.isPending && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 font-mono text-sm">
            Already verified?{" "}
            <Link href="/login" className="text-amber-500 hover:text-amber-400 hover:underline transition-colors">
              Access Terminal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
