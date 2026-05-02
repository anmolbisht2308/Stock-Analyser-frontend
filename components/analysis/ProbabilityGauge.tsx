"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProbabilityGaugeProps {
  percentage: number; // 0-100
  size?: number;
  strokeWidth?: number;
  colorClass?: string;
  className?: string;
}

export function ProbabilityGauge({ 
  percentage, 
  size = 48, 
  strokeWidth = 4, 
  colorClass = "text-gold", 
  className 
}: ProbabilityGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-white/10"
        />
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
          transition={{ duration: 1.2, ease: "easeOut" }}
          className={colorClass}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono font-bold text-xs">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}
