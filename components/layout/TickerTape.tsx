"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface TickerItem {
  symbol: string;
  shortName?: string;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
}

export function TickerTape() {
  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api
      .get("/stock/trending")
      .then((res) => setTickers(res.data.tickers || []))
      .catch(() => {});
  }, []);

  if (tickers.length === 0) return null;

  // Duplicate the array for seamless infinite scroll
  const items = [...tickers, ...tickers];

  return (
    <div className="w-full bg-terminal-50 border-b border-white/5 overflow-hidden py-2">
      <div
        ref={scrollRef}
        className="flex gap-6 animate-ticker whitespace-nowrap"
        style={{ animation: `scroll ${tickers.length * 3}s linear infinite` }}
      >
        {items.map((t, i) => {
          const isPositive = (t.regularMarketChangePercent ?? 0) >= 0;
          return (
            <Link
              key={`${t.symbol}-${i}`}
              href={`/stock/${t.symbol}`}
              className="flex items-center gap-2 shrink-0 hover:opacity-80 transition-opacity"
            >
              <span className="font-mono text-xs font-semibold text-slate-300">{t.symbol}</span>
              {t.regularMarketPrice != null && (
                <span className="font-mono text-xs text-slate-400">
                  ₹{t.regularMarketPrice.toFixed(2)}
                </span>
              )}
              {t.regularMarketChangePercent != null && (
                <span
                  className={cn(
                    "flex items-center gap-0.5 text-xs font-mono font-semibold",
                    isPositive ? "text-bull" : "text-bear"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {isPositive ? "+" : ""}
                  {t.regularMarketChangePercent.toFixed(2)}%
                </span>
              )}
              <span className="text-white/10 text-xs">|</span>
            </Link>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
