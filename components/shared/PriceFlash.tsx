"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface PriceFlashProps {
  value: number;
  className?: string;
  format?: "price" | "percentage" | "raw";
}

export function PriceFlash({ value, className, format = "price" }: PriceFlashProps) {
  const [flashClass, setFlashClass] = useState<string>("");
  const prevValue = useRef<number>(value);

  useEffect(() => {
    if (value > prevValue.current) {
      setFlashClass("flash-green");
    } else if (value < prevValue.current) {
      setFlashClass("flash-red");
    }
    
    prevValue.current = value;
    
    const timer = setTimeout(() => {
      setFlashClass("");
    }, 400); // match animation duration in globals.css

    return () => clearTimeout(timer);
  }, [value]);

  let formattedValue = value.toString();
  if (format === "price") {
    formattedValue = `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (format === "percentage") {
    formattedValue = `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  }

  return (
    <span className={cn("transition-colors rounded px-1 -mx-1", flashClass, className)}>
      {formattedValue}
    </span>
  );
}
