"use client";

import { useEffect, useRef } from "react";
import { createChart, ColorType, Time, CandlestickSeries, HistogramSeries } from "lightweight-charts";

interface CandlestickData {
  time: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
}

interface VolumeData {
  time: string;
  value: number;
  color: string;
}

export function CandlestickChart({ data, volume }: { data: CandlestickData[], volume: VolumeData[] }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data.length) return;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#94A3B8", // slate-400
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.03)" },
        horzLines: { color: "rgba(255, 255, 255, 0.03)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 480,
      timeScale: {
        timeVisible: true,
        borderColor: "rgba(255, 255, 255, 0.1)",
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        autoScale: true,
      },
      crosshair: {
        mode: 1, // Normal crosshair
        vertLine: { color: "rgba(255, 255, 255, 0.2)", labelBackgroundColor: "#111827" },
        horzLine: { color: "rgba(255, 255, 255, 0.2)", labelBackgroundColor: "#111827" },
      }
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00D4AA",
      downColor: "#FF4757",
      borderVisible: false,
      wickUpColor: "#00D4AA",
      wickDownColor: "#FF4757",
    });

    const formattedData = data.map(d => ({ ...d, time: d.time as Time }));
    candleSeries.setData(formattedData);

    // Add Volume Series as Overlay
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#26a69a",
      priceFormat: { type: "volume" },
      priceScaleId: "", // Overlay
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    const formattedVolume = volume.map(v => ({ ...v, time: v.time as Time }));
    volumeSeries.setData(formattedVolume);

    chart.timeScale().fitContent();
    chartRef.current = chart;

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, volume]);

  return (
    <div className="relative w-full h-[480px] bg-terminal rounded-xl border border-white/5 p-4 overflow-hidden">
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
