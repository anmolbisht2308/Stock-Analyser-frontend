"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { User, Mail, Shield, Key, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProfileData {
  id: string;
  email: string;
  plan: "free" | "pro" | "institutional";
  planExpiresAt: string | null;
  analysisCountToday: number;
  analysisCountResetAt: string;
  createdAt: string;
  watchlistCount: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showEmailSection, setShowEmailSection] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const { data: profile, isLoading } = useQuery<ProfileData>({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get("/profile");
      return data;
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (profile) {
      setEmail(profile.email);
    }
  }, [profile]);

  const updateEmailMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch("/profile", { email });
      return data;
    },
    onSuccess: () => {
      setSuccessMessage("Email updated successfully");
      setShowEmailSection(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (error: { response?: { data?: { error?: { message?: string } } } }) => {
      setErrorMessage(error?.response?.data?.error?.message || "Failed to update email");
      setTimeout(() => setErrorMessage(""), 5000);
    },
  });

  const updatePasswordMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.patch("/profile", { currentPassword, newPassword });
      return data;
    },
    onSuccess: () => {
      setSuccessMessage("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setShowPasswordSection(false);
      setTimeout(() => setSuccessMessage(""), 3000);
    },
    onError: (error: { response?: { data?: { error?: { message?: string } } } }) => {
      setErrorMessage(error?.response?.data?.error?.message || "Failed to update password");
      setTimeout(() => setErrorMessage(""), 5000);
    },
  });

  const handleLogout = async () => {
    try {
      const { refreshToken } = useAuthStore.getState();
      if (refreshToken) await api.post("/auth/logout", { refreshToken });
    } catch { /* silent */ } finally {
      logout();
      router.push("/");
    }
  };

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-amber-500 font-mono animate-pulse">Loading profile...</div>
      </div>
    );
  }

  const planLabels: Record<string, string> = { free: "Free", pro: "Pro", institutional: "Institutional" };
  const planColors: Record<string, string> = {
    free: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    pro: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    institutional: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  return (
    <div className="min-h-screen bg-[#050505] p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="p-2 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] hover:border-amber-500/50 transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-mono font-bold text-gray-100 tracking-tight">Profile</h1>
            <p className="text-gray-500 font-mono text-sm">Manage your account settings</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            <span className="text-sm font-mono text-green-200">{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span className="text-sm font-mono text-red-200">{errorMessage}</span>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50" />

          <div className="p-6 space-y-6">
            {/* Avatar & Basic Info */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <User className="w-8 h-8 text-amber-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg font-mono font-semibold text-gray-100">{profile?.email}</span>
                  <span className={cn("px-2 py-0.5 rounded-full text-xs font-mono border", planColors[profile?.plan ?? "free"])}>
                    {planLabels[profile?.plan ?? "free"]}
                  </span>
                </div>
                <p className="text-sm font-mono text-gray-500">Member since {new Date(profile?.createdAt ?? "").toLocaleDateString()}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard label="Analyses Today" value={String(profile?.analysisCountToday ?? 0)} />
              <StatCard label="Watchlist" value={String(profile?.watchlistCount ?? 0)} />
              <StatCard label="Plan" value={planLabels[profile?.plan ?? "free"]} />
              <StatCard
                label="Resets"
                value={profile?.analysisCountResetAt ? new Date(profile.analysisCountResetAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "--"}
              />
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="mt-6 space-y-4">
          {/* Email Section */}
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl overflow-hidden">
            <button
              onClick={() => { setShowEmailSection(!showEmailSection); setShowPasswordSection(false); }}
              className="w-full flex items-center justify-between p-4 hover:bg-[#111] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="font-mono text-sm text-gray-200">Email Address</span>
              </div>
              <span className="text-xs font-mono text-gray-500">{showEmailSection ? "Close" : "Edit"}</span>
            </button>

            {showEmailSection && (
              <div className="px-4 pb-4 border-t border-[#1A1A1A] pt-4">
                <form
                  onSubmit={(e) => { e.preventDefault(); updateEmailMutation.mutate(); }}
                  className="flex items-end gap-3"
                >
                  <div className="flex-1">
                    <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block mb-1">New Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#111] border border-[#222] rounded-lg py-2 px-3 text-gray-200 font-mono text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors placeholder-gray-700"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updateEmailMutation.isPending || email === profile?.email}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateEmailMutation.isPending ? "Updating..." : "Update"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Password Section */}
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl overflow-hidden">
            <button
              onClick={() => { setShowPasswordSection(!showPasswordSection); setShowEmailSection(false); }}
              className="w-full flex items-center justify-between p-4 hover:bg-[#111] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-gray-400" />
                <span className="font-mono text-sm text-gray-200">Change Password</span>
              </div>
              <span className="text-xs font-mono text-gray-500">{showPasswordSection ? "Close" : "Edit"}</span>
            </button>

            {showPasswordSection && (
              <div className="px-4 pb-4 border-t border-[#1A1A1A] pt-4">
                <form
                  onSubmit={(e) => { e.preventDefault(); updatePasswordMutation.mutate(); }}
                  className="space-y-3"
                >
                  <div>
                    <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[#111] border border-[#222] rounded-lg py-2 px-3 text-gray-200 font-mono text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors placeholder-gray-700"
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-mono text-gray-400 uppercase tracking-wider block mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-[#111] border border-[#222] rounded-lg py-2 px-3 text-gray-200 font-mono text-sm focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-colors placeholder-gray-700"
                      placeholder="Min 8 characters"
                      minLength={8}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={updatePasswordMutation.isPending || !currentPassword || !newPassword}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Plan Info */}
          <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <span className="font-mono text-sm text-gray-200">Current Plan: {planLabels[profile?.plan ?? "free"]}</span>
                {profile?.planExpiresAt && (
                  <p className="text-xs font-mono text-gray-500 mt-1">
                    Expires: {new Date(profile.planExpiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[#0A0A0A] border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <span className="font-mono text-sm text-red-400">Danger Zone</span>
                  <p className="text-xs font-mono text-gray-500 mt-0.5">Sign out of your account</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-sm rounded-lg border border-red-500/20 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-lg p-3">
      <p className="text-xs font-mono text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-mono font-bold text-amber-500 mt-1">{value}</p>
    </div>
  );
}
