"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, TrendingUp, Loader2 } from "lucide-react";
import { api } from "@/lib/api";
import { useDebounce } from "@/lib/hooks";

interface SearchResult {
  symbol: string;
  shortname?: string;
  longname?: string;
  exchange?: string;
  quoteType?: string;
}

export function SearchBar({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    api
      .get(`/stock/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => {
        setResults(res.data.results?.slice(0, 8) || []);
        setIsOpen(true);
      })
      .catch(() => setResults([]))
      .finally(() => setIsLoading(false));
  }, [debouncedQuery]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (ticker: string) => {
    setQuery("");
    setIsOpen(false);
    router.push(`/stock/${ticker}`);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className="flex items-center gap-2 bg-terminal-50 border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-gold/50 transition-colors">
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-slate-400 animate-spin shrink-0" />
        ) : (
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
        )}
        <input
          type="text"
          placeholder="Search stocks… e.g. HDFC, Reliance, AAPL"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent text-slate-100 placeholder:text-slate-500 text-sm outline-none w-full font-mono"
          aria-label="Search stocks"
          id="stock-search-input"
        />
        {query && (
          <button onClick={() => { setQuery(""); setIsOpen(false); }} aria-label="Clear search">
            <X className="w-4 h-4 text-slate-400 hover:text-slate-200" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-terminal-100 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
          {results.map((r) => (
            <button
              key={r.symbol}
              onClick={() => handleSelect(r.symbol)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
            >
              <TrendingUp className="w-4 h-4 text-gold shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-mono font-semibold text-slate-100 text-sm">{r.symbol}</span>
                <span className="ml-2 text-slate-400 text-xs truncate">{r.shortname || r.longname}</span>
              </div>
              {r.exchange && (
                <span className="text-xs text-slate-500 font-mono shrink-0">{r.exchange}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
