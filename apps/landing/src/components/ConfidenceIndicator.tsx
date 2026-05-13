"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ConfidenceIndicatorProps {
  value: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
}

export function ConfidenceIndicator({
  value,
  label = "Confidence",
  size = "md",
  animated = true,
  className,
}: ConfidenceIndicatorProps) {
  const motionValue = useMotionValue(0);
  const displayValue = useTransform(motionValue, (v) => Math.round(v));

  useEffect(() => {
    if (animated) {
      const controls = animate(motionValue, value, {
        duration: 2,
        ease: [0.23, 1, 0.32, 1],
      });
      return controls.stop;
    } else {
      motionValue.set(value);
    }
  }, [value, animated, motionValue]);

  const getColor = (v: number) => {
    if (v >= 90) return { bar: "bg-runtime-green", text: "text-runtime-green", glow: "shadow-[0_0_12px_rgba(16,185,129,0.3)]" };
    if (v >= 70) return { bar: "bg-runtime-blue", text: "text-runtime-blue", glow: "shadow-[0_0_12px_rgba(59,130,246,0.3)]" };
    if (v >= 40) return { bar: "bg-runtime-amber", text: "text-runtime-amber", glow: "shadow-[0_0_12px_rgba(245,158,11,0.3)]" };
    return { bar: "bg-runtime-red", text: "text-runtime-red", glow: "shadow-[0_0_12px_rgba(239,68,68,0.3)]" };
  };

  const colors = getColor(value);
  const sizeConfig = {
    sm: { height: "h-1", width: "w-full max-w-[140px]", text: "text-[9px]", valueText: "text-sm" },
    md: { height: "h-1.5", width: "w-full max-w-[200px]", text: "text-[10px]", valueText: "text-lg" },
    lg: { height: "h-2", width: "w-full max-w-[260px]", text: "text-[11px]", valueText: "text-2xl" },
  };

  const config = sizeConfig[size];

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "font-mono font-bold uppercase tracking-widest text-runtime-muted",
            config.text
          )}
        >
          {label}
        </span>
        <motion.span
          className={cn("font-mono font-black tabular-nums", colors.text, config.valueText)}
        >
          <motion.span>{displayValue}</motion.span>%
        </motion.span>
      </div>
      <div
        className={cn(
          "relative rounded-full bg-runtime-border/50 overflow-hidden",
          config.height,
          config.width
        )}
      >
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 2, ease: [0.23, 1, 0.32, 1] }}
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            colors.bar,
            colors.glow
          )}
        />
      </div>
    </div>
  );
}
