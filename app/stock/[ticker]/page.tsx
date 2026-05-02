"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { PriceFlash } from "@/components/shared/PriceFlash";
import { ScoreGauge } from "@/components/shared/ScoreGauge";
import { AnalystRatingBadge } from "@/components/analysis/AnalystRatingBadge";
import { MultibaggerCard } from "@/components/analysis/MultibaggerCard";
import { TechnicalSignals } from "@/components/analysis/TechnicalSignals";
import { FundamentalTable } from "@/components/analysis/FundamentalTable";
import { InvestmentThesis } from "@/components/analysis/InvestmentThesis";
import { NewsSentiment } from "@/components/analysis/NewsSentiment";
import { CandlestickChart } from "@/components/charts/CandlestickChart";
import { Loader2, Star } from "lucide-react";
import { useWatchlistStore } from "@/lib/store/useWatchlistStore";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function StockPage() {
  const params = useParams();
  const ticker = params.ticker as string;
  const router = useRouter();
  const { isWatched, addTicker, removeTicker } = useWatchlistStore();
  const { isAuthenticated } = useAuthStore();
  const watched = isWatched(ticker);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleWatchlistToggle = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (watched) {
      removeTicker(ticker);
    } else {
      addTicker(ticker);
    }
  };

  useEffect(() => {
    if (!ticker) return;
    setLoading(true);
    // Ideally this uses TanStack query, but keeping it simple for the layout first
    api.get(`/stock/${ticker}/analysis`)
      .then(res => setData(res.data))
      .catch(err => setError(err.response?.data?.error || "Failed to load stock data."))
      .finally(() => setLoading(false));
  }, [ticker]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-gold mb-6" />
        <p className="text-slate-400 font-mono animate-pulse">Running Groq AI Analysis for {ticker}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <p className="text-bear font-mono text-lg">{error}</p>
      </div>
    );
  }

  if (!data || !data.analysis) return null;

  const { analysis, raw } = data;
  const currentPrice = raw.quote.currentPrice;
  const { companyName, sector, industry, exchange } = raw.profile;
  const priceHistory = raw.ohlcv;

  // Format chart data
  const chartData = priceHistory.map((p: any) => ({
    time: p.date.split('T')[0],
    open: p.open,
    high: p.high,
    low: p.low,
    close: p.close
  }));

  const volumeData = priceHistory.map((p: any, i: number) => {
    const isUp = i === 0 ? true : p.close >= priceHistory[i-1].close;
    return {
      time: p.date.split('T')[0],
      value: p.volume,
      color: isUp ? "rgba(0, 212, 170, 0.5)" : "rgba(255, 71, 87, 0.5)"
    };
  });

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4 py-8 space-y-12">
      {/* SECTION 1: HERO */}
      <section className="flex flex-wrap items-start justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">{companyName}</h1>
            <span className="bg-gold/10 text-gold border border-gold/30 px-2 py-0.5 rounded text-sm font-mono font-bold tracking-wider">
              {ticker}
            </span>
            {/* Watchlist Star Button */}
            <button
              onClick={handleWatchlistToggle}
              title={watched ? "Remove from Watchlist" : "Add to Watchlist"}
              className={`p-1.5 rounded-lg transition-all ${
                watched
                  ? "text-gold bg-gold/10 hover:bg-gold/20"
                  : "text-slate-500 hover:text-gold hover:bg-gold/10"
              }`}
            >
              <Star className={`w-5 h-5 ${watched ? "fill-gold" : ""}`} />
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400 font-mono mb-4">
            <span>{exchange}</span>
            <span>•</span>
            <span>{sector}</span>
            <span>•</span>
            <span>{industry}</span>
          </div>
          <div className="flex items-baseline gap-4">
            <span className="text-4xl font-mono font-bold text-slate-100">
              <PriceFlash value={currentPrice} />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8 bg-terminal-100 border border-white/5 p-4 rounded-2xl shadow-lg">
          <div className="text-center">
            <p className="text-xs text-slate-500 font-mono mb-2 uppercase tracking-wider">Groq Score</p>
            <ScoreGauge score={analysis.overallScore} size={80} strokeWidth={6} />
          </div>
          <div className="w-px h-16 bg-white/10" />
          <div className="text-center flex flex-col items-center justify-center h-full">
            <p className="text-xs text-slate-500 font-mono mb-3 uppercase tracking-wider">Analyst Rating</p>
            <AnalystRatingBadge rating={analysis.analystRating} />
          </div>
        </div>
      </section>

      {/* SECTION 2: CHART */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-200">Price Action & Volume</h2>
          <div className="text-xs font-mono text-slate-500">Live 1D Interval</div>
        </div>
        <CandlestickChart data={chartData} volume={volumeData} />
      </section>

      {/* SECTION 3: MULTIBAGGER PREDICTIONS */}
      <section>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">AI Target Probabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MultibaggerCard 
            title="Multibagger 5x+" 
            data={{
              within1Y: analysis.multibaggerProbability.within1Year,
              within2Y: analysis.multibaggerProbability.within2Years,
              within3Y: analysis.multibaggerProbability.within3Years,
            }}
            confidence={analysis.multibaggerProbability.confidence}
            isMultibagger={true}
          />
          <MultibaggerCard title="2x Target" data={analysis.targetProbabilities.twoX} />
          <MultibaggerCard title="3x Target" data={analysis.targetProbabilities.threeX} />
          <MultibaggerCard title="4x Target" data={analysis.targetProbabilities.fourX} />
        </div>
      </section>

      {/* SECTION 6: THESIS */}
      <section>
        <InvestmentThesis 
          thesis={analysis.investmentThesis}
          catalysts={analysis.catalystsForGrowth}
          risks={analysis.majorRisks}
          timeHorizon={analysis.suggestedTimeHorizon}
          entryStrategy={analysis.entryStrategy}
          exitStrategy={analysis.exitStrategy}
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          {/* SECTION 5: FUNDAMENTALS */}
          <section>
             <h2 className="text-lg font-semibold text-slate-200 mb-4">Fundamental Analysis</h2>
             <FundamentalTable data={{ metrics: raw.fundamentals as any, health: analysis.fundamentalSummary }} />
          </section>

          {/* SECTION 4: TECHNICALS */}
          <section>
            <h2 className="text-lg font-semibold text-slate-200 mb-4">Technical Indicators (Groq Derived)</h2>
            <TechnicalSignals signals={analysis.technicalSummary.signals} />
          </section>
        </div>

        <div className="space-y-12">
           {/* SECTION 7: NEWS SENTIMENT */}
           <section>
             <NewsSentiment news={raw.news} sentiment={analysis.newsSentiment} />
           </section>
        </div>
      </div>
    </div>
  );
}
