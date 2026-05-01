import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/shared/QueryProvider";
import { Navbar } from "@/components/layout/Navbar";
import { TickerTape } from "@/components/layout/TickerTape";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "StockAI | AI-Powered Multibagger Prediction Platform",
  description:
    "AI-powered stock analysis and multibagger predictions for Indian and global markets powered by Groq LLaMA.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-terminal text-slate-100 min-h-screen flex flex-col`}
      >
        <QueryProvider>
          <Navbar />
          <TickerTape />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-white/5 py-6 text-center text-slate-500 text-xs font-mono">
            StockAI — AI analysis is not financial advice. Data via Yahoo Finance.
          </footer>
        </QueryProvider>
      </body>
    </html>
  );
}
