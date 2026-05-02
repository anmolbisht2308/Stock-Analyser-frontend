import { Newspaper, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface NewsItem {
  headline: string;
  source: string;
  publishedAt: string;
}

interface SentimentData {
  overall: "VERY POSITIVE" | "POSITIVE" | "NEUTRAL" | "NEGATIVE" | "VERY NEGATIVE";
  sentimentScore: number;
  catalysts: string[];
  risks: string[];
}

export function NewsSentiment({ news, sentiment }: { news: NewsItem[]; sentiment: SentimentData }) {
  if (!sentiment) return null;

  const getSentimentColor = (s: string) => {
    if (s.includes("POSITIVE")) return "text-bull border-bull/30 bg-bull/10";
    if (s.includes("NEGATIVE")) return "text-bear border-bear/30 bg-bear/10";
    return "text-slate-400 border-slate-600/30 bg-white/5";
  };

  const scoreProgress = ((sentiment.sentimentScore + 100) / 200) * 100; // Map -100..100 to 0..100

  return (
    <div className="bg-terminal-100 border border-white/5 rounded-xl p-5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-slate-400" />
          News Sentiment
        </h3>
        <div className={cn("px-2.5 py-1 rounded-md text-xs font-bold border tracking-wide", getSentimentColor(sentiment.overall))}>
          {sentiment.overall}
        </div>
      </div>

      {/* Score Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-slate-500 mb-2 font-mono">
          <span>-100 (Bear)</span>
          <span className="text-slate-300 font-bold text-sm">Score: {Math.round(sentiment.sentimentScore)}</span>
          <span>+100 (Bull)</span>
        </div>
        <div className="h-2 w-full bg-white/10 rounded-full relative">
          <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/20 z-10" />
          <div 
            className={cn("h-full rounded-full transition-all duration-1000 absolute left-0", sentiment.sentimentScore > 0 ? "bg-bull" : sentiment.sentimentScore < 0 ? "bg-bear" : "bg-slate-500")}
            style={{ width: `${scoreProgress}%` }}
          />
        </div>
      </div>

      <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
        <Newspaper className="w-4 h-4 text-slate-500" />
        Recent Headlines
      </h4>
      <div className="space-y-3">
        {news?.slice(0, 5).map((item, i) => (
          <div key={i} className="flex flex-col gap-1.5 p-3 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/[0.04] transition-colors">
            <h5 className="text-sm text-slate-200 font-medium leading-snug">{item.headline}</h5>
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span className="font-mono text-[10px] uppercase tracking-wider">{item.source}</span>
              <span>{formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}</span>
            </div>
          </div>
        ))}
        {(!news || news.length === 0) && <p className="text-xs text-slate-500">No recent news found.</p>}
      </div>
    </div>
  );
}
