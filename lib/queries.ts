// TanStack Query Hooks will go here



// Example placeholder hooks - we will implement the real ones in the next phase
export const stockKeys = {
  all: ["stocks"] as const,
  analysis: (ticker: string) => [...stockKeys.all, "analysis", ticker] as const,
  priceHistory: (ticker: string) => [...stockKeys.all, "priceHistory", ticker] as const,
  news: (ticker: string) => [...stockKeys.all, "news", ticker] as const,
};
