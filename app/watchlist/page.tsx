"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, TrendingUp, TrendingDown, Trash2, LogIn, Loader2 } from "lucide-react";
import { useWatchlistStore } from "@/lib/store/useWatchlistStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface WatchlistItem {
  symbol: string;
  addedAt: string;
  quote: {
    price: number;
    change: number;
    changePercent: number;
    name: string;
  } | null;
}

export default function WatchlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { removeTicker } = useWatchlistStore();

  const { data, isLoading, refetch } = useQuery<{ watchlist: WatchlistItem[] }>({
    queryKey: ["watchlist-live"],
    queryFn: async () => {
      const { data } = await api.get("/watchlist");
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const items = data?.watchlist ?? [];

  const handleRemove = async (symbol: string) => {
    await removeTicker(symbol);
    refetch();
  };

  // Not logged in state
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4">
        <div className="w-20 h-20 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
          <Star className="w-10 h-10 text-gold" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Your Watchlist</h1>
          <p className="text-slate-400 font-mono text-sm max-w-sm">
            Track your favourite stocks in one place. Login to save your watchlist across sessions.
          </p>
        </div>
        <Link
          href="/login"
          className="flex items-center gap-2 px-5 py-2.5 bg-gold text-black font-mono font-bold rounded-lg hover:bg-amber-400 transition-colors"
        >
          <LogIn className="w-4 h-4" />
          Login to Continue
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Star className="w-6 h-6 text-gold fill-gold" />
            Watchlist
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-1">
            {isLoading ? "Loading..." : `${items.length} stocks tracked`}
          </p>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-terminal-100 rounded-xl animate-pulse border border-white/5" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <Star className="w-12 h-12 text-slate-700" />
          <p className="text-slate-400 font-mono text-sm max-w-xs">
            Your watchlist is empty. Search for a stock and click the ☆ star to start tracking it.
          </p>
          <Link href="/" className="text-gold hover:underline text-sm font-mono">
            Discover stocks →
          </Link>
        </div>
      )}

      {/* Watchlist grid */}
      {!isLoading && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => {
            const isUp = (item.quote?.change ?? 0) >= 0;
            return (
              <div
                key={item.symbol}
                className="group bg-terminal-100 border border-white/5 rounded-xl p-5 hover:border-gold/20 transition-all relative overflow-hidden"
              >
                {/* Decorative gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                {/* Header row */}
                <div className="flex items-start justify-between mb-3">
                  <Link href={`/stock/${item.symbol}`}>
                    <span className="font-mono font-bold text-slate-100 text-lg hover:text-gold transition-colors">
                      {item.symbol}
                    </span>
                  </Link>
                  <button
                    onClick={() => handleRemove(item.symbol)}
                    title="Remove from Watchlist"
                    className="p-1 rounded text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Company name */}
                {item.quote?.name && (
                  <p className="text-xs text-slate-500 truncate mb-3">{item.quote.name}</p>
                )}

                {/* Price */}
                {item.quote ? (
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-mono font-bold text-slate-100">
                      ₹{item.quote.price.toFixed(2)}
                    </span>
                    <div className={`flex items-center gap-1 text-sm font-mono font-semibold ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                      {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      {isUp ? "+" : ""}{item.quote.changePercent.toFixed(2)}%
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-600 text-xs font-mono">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading quote…
                  </div>
                )}

                {/* Footer link */}
                <Link
                  href={`/stock/${item.symbol}`}
                  className="mt-3 flex items-center gap-1.5 text-xs font-mono text-slate-500 hover:text-gold transition-colors"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  View full analysis →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
