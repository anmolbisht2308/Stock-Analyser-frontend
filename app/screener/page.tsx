"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  LayoutGrid, SlidersHorizontal, TrendingUp, TrendingDown,
  Minus, ArrowUpDown, ChevronLeft, ChevronRight, Star, AlertCircle
} from "lucide-react";
import { api } from "@/lib/api";
import { useWatchlistStore } from "@/lib/store/useWatchlistStore";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useRouter } from "next/navigation";

// ── Types ───────────────────────────────────────────────────────────────
interface ScreenerResult {
  ticker: string;
  companyName: string;
  sector: string;
  exchange: string;
  currentPrice: number;
  overallScore: number;
  analystRating: string;
  ratingReason: string;
  trend: string;
  valuationStatus: string;
  targetPrices: { conservative: number; base: number; optimistic: number; timeHorizon: string };
  createdAt: string;
}

interface ScreenerResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  results: ScreenerResult[];
}

// ── Helpers ──────────────────────────────────────────────────────────────
const RATINGS = ["STRONG BUY", "BUY", "HOLD", "SELL", "STRONG SELL"];
const TRENDS   = ["STRONG UPTREND", "UPTREND", "SIDEWAYS", "DOWNTREND", "STRONG DOWNTREND"];

const ratingColor: Record<string, string> = {
  "STRONG BUY":  "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "BUY":         "bg-green-500/15  text-green-400  border-green-500/30",
  "HOLD":        "bg-amber-500/15  text-amber-400  border-amber-500/30",
  "SELL":        "bg-orange-500/15 text-orange-400 border-orange-500/30",
  "STRONG SELL": "bg-red-500/15    text-red-400    border-red-500/30",
};

const trendIcon = (trend: string) => {
  if (trend?.includes("UP"))   return <TrendingUp  className="w-3.5 h-3.5 text-emerald-400" />;
  if (trend?.includes("DOWN")) return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-slate-400" />;
};

const scoreColor = (s: number) =>
  s >= 70 ? "text-emerald-400" : s >= 50 ? "text-amber-400" : "text-red-400";

// ── Component ─────────────────────────────────────────────────────────────
export default function ScreenerPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { isWatched, addTicker, removeTicker } = useWatchlistStore();

  // Filters
  const [minScore, setMinScore] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [rating,   setRating]   = useState("");
  const [sector,   setSector]   = useState("");
  const [exchange, setExchange] = useState("");
  const [sort,     setSort]     = useState("overallScore");
  const [order,    setOrder]    = useState("desc");
  const [page,     setPage]     = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const buildParams = useCallback(() => {
    const p: Record<string, string> = { sort, order, page: String(page), limit: "20" };
    if (minScore) p.minScore = minScore;
    if (maxScore) p.maxScore = maxScore;
    if (rating)   p.rating   = rating;
    if (sector)   p.sector   = sector;
    if (exchange) p.exchange  = exchange;
    return new URLSearchParams(p).toString();
  }, [minScore, maxScore, rating, sector, exchange, sort, order, page]);

  const { data, isLoading, isError } = useQuery<ScreenerResponse>({
    queryKey: ["screener", minScore, maxScore, rating, sector, exchange, sort, order, page],
    queryFn: async () => {
      const { data } = await api.get(`/screener?${buildParams()}`);
      return data;
    },
    staleTime: 60_000,
  });

  const resetFilters = () => {
    setMinScore(""); setMaxScore(""); setRating("");
    setSector(""); setExchange(""); setPage(1);
  };

  const toggleSort = (field: string) => {
    if (sort === field) setOrder(o => o === "desc" ? "asc" : "desc");
    else { setSort(field); setOrder("desc"); }
    setPage(1);
  };

  const toggleWatchlist = (e: React.MouseEvent, ticker: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { router.push("/login"); return; }
    isWatched(ticker) ? removeTicker(ticker) : addTicker(ticker);
  };

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-gold" />
            AI Stock Screener
          </h1>
          <p className="text-slate-400 font-mono text-sm mt-1">
            {data ? `${data.total} stocks ranked by Groq AI analysis` : "Filter and rank stocks by AI score"}
          </p>
        </div>

        <button
          onClick={() => setFiltersOpen(o => !o)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:border-gold/30 hover:text-gold transition-colors text-sm font-mono"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {filtersOpen ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      {/* Filters Panel */}
      {filtersOpen && (
        <div className="bg-terminal-100 border border-white/10 rounded-xl p-5 mb-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Min Score</label>
            <input
              type="number" min="0" max="100" value={minScore}
              onChange={e => { setMinScore(e.target.value); setPage(1); }}
              placeholder="0"
              className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Max Score</label>
            <input
              type="number" min="0" max="100" value={maxScore}
              onChange={e => { setMaxScore(e.target.value); setPage(1); }}
              placeholder="100"
              className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Rating</label>
            <select
              value={rating}
              onChange={e => { setRating(e.target.value); setPage(1); }}
              className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-gold/50 transition-colors"
            >
              <option value="">All</option>
              {RATINGS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Sector</label>
            <input
              type="text" value={sector}
              onChange={e => { setSector(e.target.value); setPage(1); }}
              placeholder="e.g. Technology"
              className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">Exchange</label>
            <input
              type="text" value={exchange}
              onChange={e => { setExchange(e.target.value); setPage(1); }}
              placeholder="e.g. NSI"
              className="w-full bg-[#111] border border-[#222] rounded-lg px-3 py-2 text-slate-200 font-mono text-sm focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>
          <div className="space-y-1 flex flex-col justify-end">
            <button
              onClick={resetFilters}
              className="w-full py-2 rounded-lg border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20 transition-colors font-mono text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-terminal-100 border border-white/5 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-x-4 px-4 py-3 border-b border-white/5 text-xs font-mono text-slate-500 uppercase tracking-wider">
          <span>Company</span>
          <button onClick={() => toggleSort("overallScore")} className="flex items-center gap-1 hover:text-gold transition-colors">
            Score <ArrowUpDown className="w-3 h-3" />
          </button>
          <span className="hidden md:block">Rating</span>
          <span className="hidden lg:block">Trend</span>
          <span className="hidden lg:block">Valuation</span>
          <span className="hidden xl:block">Base Target</span>
          <span></span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="divide-y divide-white/5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-x-4 px-4 py-4 animate-pulse">
                <div className="space-y-1.5">
                  <div className="h-3.5 bg-white/5 rounded w-24" />
                  <div className="h-3 bg-white/5 rounded w-16" />
                </div>
                <div className="h-6 bg-white/5 rounded w-10" />
                <div className="hidden md:block h-6 bg-white/5 rounded w-20" />
                <div className="hidden lg:block h-5 bg-white/5 rounded w-20" />
                <div className="hidden lg:block h-5 bg-white/5 rounded w-20" />
                <div className="hidden xl:block h-5 bg-white/5 rounded w-16" />
                <div className="h-7 bg-white/5 rounded w-7" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <AlertCircle className="w-10 h-10 text-red-500/50" />
            <p className="text-slate-400 font-mono text-sm">No analysis data yet. Search for stocks to generate AI analysis.</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && data?.results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <LayoutGrid className="w-10 h-10 text-slate-700" />
            <p className="text-slate-400 font-mono text-sm">No stocks match your filters.</p>
            <button onClick={resetFilters} className="text-gold hover:underline text-xs font-mono">Reset filters</button>
          </div>
        )}

        {/* Results */}
        {!isLoading && data && data.results.length > 0 && (
          <div className="divide-y divide-white/5">
            {data.results.map((stock) => (
              <Link
                key={stock.ticker}
                href={`/stock/${stock.ticker}`}
                className="grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] gap-x-4 px-4 py-3.5 items-center hover:bg-white/[0.03] transition-colors group"
              >
                {/* Company */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-100 text-sm group-hover:text-gold transition-colors">
                      {stock.ticker}
                    </span>
                    <span className="text-xs text-slate-500 font-mono hidden sm:block">
                      {stock.exchange}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate max-w-[200px]">
                    {stock.companyName}
                  </p>
                </div>

                {/* Score */}
                <div className={`font-mono font-bold text-lg w-12 text-right ${scoreColor(stock.overallScore)}`}>
                  {stock.overallScore}
                </div>

                {/* Rating */}
                <div className="hidden md:block">
                  <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${ratingColor[stock.analystRating] ?? "bg-slate-800 text-slate-400 border-slate-700"}`}>
                    {stock.analystRating}
                  </span>
                </div>

                {/* Trend */}
                <div className="hidden lg:flex items-center gap-1.5 text-xs font-mono text-slate-400 w-32">
                  {trendIcon(stock.trend)}
                  <span className="truncate">{stock.trend ?? "—"}</span>
                </div>

                {/* Valuation */}
                <div className="hidden lg:block text-xs font-mono text-slate-400 w-28">
                  {stock.valuationStatus ?? "—"}
                </div>

                {/* Base Target */}
                <div className="hidden xl:block text-sm font-mono text-slate-300 w-20 text-right">
                  {stock.targetPrices?.base ? `₹${stock.targetPrices.base.toFixed(0)}` : "—"}
                </div>

                {/* Watchlist Star */}
                <button
                  onClick={(e) => toggleWatchlist(e, stock.ticker)}
                  title={isWatched(stock.ticker) ? "Remove from Watchlist" : "Add to Watchlist"}
                  className={`p-1.5 rounded-lg transition-all ${
                    isWatched(stock.ticker)
                      ? "text-gold bg-gold/10"
                      : "text-slate-600 hover:text-gold hover:bg-gold/10 opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <Star className={`w-4 h-4 ${isWatched(stock.ticker) ? "fill-gold" : ""}`} />
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs font-mono text-slate-500">
            Page {data.page} of {data.totalPages} · {data.total} total
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-slate-100 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(Math.min(5, data.totalPages))].map((_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-mono transition-colors ${
                    page === p
                      ? "bg-gold text-black font-bold"
                      : "border border-white/10 text-slate-400 hover:text-slate-100 hover:border-white/20"
                  }`}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="p-2 rounded-lg border border-white/10 text-slate-400 hover:text-slate-100 hover:border-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
