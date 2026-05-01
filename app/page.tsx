import { SearchBar } from "@/components/layout/SearchBar";
import { TrendingUp, Zap, ShieldCheck, BarChart2 } from "lucide-react";
import Link from "next/link";

const FEATURED_TICKERS = [
  "RELIANCE.NS", "HDFCBANK.NS", "INFY.NS", "TCS.NS",
  "BAJFINANCE.NS", "WIPRO.NS", "ICICIBANK.NS", "SBIN.NS",
];

const FEATURES = [
  {
    icon: TrendingUp,
    title: "Multibagger Predictions",
    desc: "AI-powered 2x, 3x, 4x probability scores for every stock over 1-3 years.",
    color: "text-bull",
    glow: "shadow-[0_0_20px_rgba(0,212,170,0.15)]",
  },
  {
    icon: Zap,
    title: "17 Technical Indicators",
    desc: "RSI, MACD, Bollinger Bands, Ichimoku, Fibonacci and 12 more—all in one view.",
    color: "text-chart-blue",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",
  },
  {
    icon: BarChart2,
    title: "Fundamental Analysis",
    desc: "Deep-dive P/E, P/B, ROE, margins, and financial health scores from Yahoo Finance.",
    color: "text-gold",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
  },
  {
    icon: ShieldCheck,
    title: "Risk Assessment",
    desc: "AI-generated risk factors, catalyst analysis and institutional-grade investment thesis.",
    color: "text-chart-purple",
    glow: "shadow-[0_0_20px_rgba(139,92,246,0.15)]",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col items-center">
      {/* ─── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative w-full flex flex-col items-center text-center px-4 pt-20 pb-16 overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-bull/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-full px-4 py-1.5 text-gold text-xs font-mono font-semibold mb-8">
            <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
            Powered by Groq LLaMA 3.3 70B
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-100 leading-tight tracking-tight mb-6">
            Find Your Next{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-bull">
              Multibagger
            </span>
            <br /> with AI
          </h1>

          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Institutional-grade stock analysis for Indian &amp; global markets.
            17 technical indicators, fundamental scores, and AI-generated
            investment thesis in seconds.
          </p>

          {/* Search */}
          <div className="max-w-lg mx-auto mb-6">
            <SearchBar className="w-full" />
          </div>

          {/* Featured tickers */}
          <div className="flex flex-wrap justify-center gap-2 text-sm">
            <span className="text-slate-500 font-mono">Try:</span>
            {FEATURED_TICKERS.map((ticker) => (
              <Link
                key={ticker}
                href={`/stock/${ticker}`}
                className="font-mono text-slate-400 hover:text-gold transition-colors px-2 py-1 rounded-md hover:bg-gold/10 border border-transparent hover:border-gold/20"
              >
                {ticker}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURE CARDS ───────────────────────────────────────────────── */}
      <section className="w-full max-w-screen-xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc, color, glow }) => (
            <div
              key={title}
              className={`bg-terminal-100 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group ${glow} hover:scale-[1.02]`}
            >
              <div className={`${color} mb-4 group-hover:scale-110 transition-transform inline-block`}>
                <Icon className="w-8 h-8" />
              </div>
              <h3 className="text-slate-100 font-semibold text-base mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────────── */}
      <section className="w-full max-w-screen-xl mx-auto px-4 pb-24 text-center">
        <div className="bg-gradient-to-br from-terminal-100 to-terminal-50 border border-gold/20 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            Ready to analyse a stock?
          </h2>
          <p className="text-slate-400 mb-8">
            Search any NSE, BSE, NYSE, or NASDAQ ticker and get a full AI report instantly.
          </p>
          <Link
            href="/screener"
            className="inline-flex items-center gap-2 bg-gold text-terminal font-semibold px-6 py-3 rounded-xl hover:bg-gold-dark transition-colors"
          >
            <TrendingUp className="w-4 h-4" />
            Open Screener
          </Link>
        </div>
      </section>
    </div>
  );
}
