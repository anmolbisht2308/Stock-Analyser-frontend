"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function ScoreGauge({ score, size = 64, strokeWidth = 6, className }: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = "text-bear";
  if (score >= 40 && score < 70) colorClass = "text-gold";
  if (score >= 70) colorClass = "text-bull";

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-white/10"
        />
        {/* Animated progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={colorClass}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center flex-col">
        <span className={cn("font-mono font-bold leading-none", size >= 64 ? "text-xl" : "text-sm")}>
          {Math.round(score)}
        </span>
      </div>
    </div>
  );
}
