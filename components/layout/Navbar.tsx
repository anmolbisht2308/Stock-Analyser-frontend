"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Star, BarChart2 } from "lucide-react";
import { SearchBar } from "./SearchBar";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/screener", label: "Screener", icon: LayoutGrid },
  { href: "/watchlist", label: "Watchlist", icon: Star },
];

export function Navbar() {
  const pathname = usePathname();

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
      </div>
    </header>
  );
}
