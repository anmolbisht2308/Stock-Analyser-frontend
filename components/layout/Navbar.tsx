"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Star, BarChart2, LogIn, LogOut, User } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { api } from "@/lib/api";

const navLinks = [
  { href: "/screener", label: "Screener", icon: LayoutGrid },
  { href: "/watchlist", label: "Watchlist", icon: Star },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout, refreshToken } = useAuthStore();

  const handleLogout = async () => {
    try {
      if (refreshToken) await api.post("/auth/logout", { refreshToken });
    } catch { /* silent */ } finally {
      logout();
      router.push("/");
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-terminal/80 backdrop-blur-md">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group" aria-label="Home">
          <div className="w-8 h-8 rounded-lg bg-gold flex items-center justify-center group-hover:shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-shadow">
            <BarChart2 className="w-5 h-5 text-terminal" />
          </div>
          <span className="hidden sm:block font-semibold text-slate-100 text-sm tracking-wide">
            Stock<span className="text-gold">AI</span>
          </span>
        </Link>

        {/* Global search bar — takes up available space */}
        <div className="flex-1 max-w-xl">
          <SearchBar />
        </div>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-white/10 text-slate-100"
                  : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth section */}
        <div className="shrink-0 flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/10">
                <User className="w-3.5 h-3.5" />
                <span className="max-w-[120px] truncate">{user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:block">Logout</span>
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gold/10 text-gold border border-gold/20 hover:bg-gold/20 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
