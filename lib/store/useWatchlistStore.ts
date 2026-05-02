import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api } from "../api";

interface WatchlistState {
  tickers: string[];
  isLoading: boolean;
  fetchWatchlist: () => Promise<void>;
  addTicker: (ticker: string) => Promise<void>;
  removeTicker: (ticker: string) => Promise<void>;
  isWatched: (ticker: string) => boolean;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      tickers: [],
      isLoading: false,

      fetchWatchlist: async () => {
        try {
          set({ isLoading: true });
          const { data } = await api.get("/watchlist");
          // Backend returns: { watchlist: [{ symbol, addedAt, quote }] }
          const tickers = (data.watchlist ?? []).map((w: { symbol: string }) => w.symbol);
          set({ tickers });
        } catch {
          // If user is not logged in, silently fail
        } finally {
          set({ isLoading: false });
        }
      },

      addTicker: async (ticker: string) => {
        // Optimistic update
        set((state) => ({ tickers: [...state.tickers, ticker] }));
        try {
          // Backend expects { symbol } not { ticker }
          await api.post("/watchlist", { symbol: ticker });
        } catch {
          // Rollback on failure
          set((state) => ({ tickers: state.tickers.filter((t) => t !== ticker) }));
        }
      },

      removeTicker: async (ticker: string) => {
        // Optimistic update
        set((state) => ({ tickers: state.tickers.filter((t) => t !== ticker) }));
        try {
          await api.delete(`/watchlist/${ticker}`);
        } catch {
          // Rollback on failure
          set((state) => ({ tickers: [...state.tickers, ticker] }));
        }
      },

      isWatched: (ticker: string) => get().tickers.includes(ticker),
    }),
    {
      name: "stock-ai-watchlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
