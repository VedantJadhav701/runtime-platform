"use client";

import { motion, useMotionValue, useTransform, animate, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface BenchmarkCardProps {
  label: string;
  value: number;
  unit: string;
  description: string;
  color?: "blue" | "green" | "amber" | "red";
  delay?: number;
  className?: string;
}

const colorStyles = {
  blue: {
    text: "text-runtime-blue",
    bar: "bg-runtime-blue",
    border: "border-runtime-blue/20",
    glow: "bg-runtime-blue/5",
  },
  green: {
    text: "text-runtime-green",
    bar: "bg-runtime-green",
    border: "border-runtime-green/20",
    glow: "bg-runtime-green/5",
  },
  amber: {
    text: "text-runtime-amber",
    bar: "bg-runtime-amber",
    border: "border-runtime-amber/20",
    glow: "bg-runtime-amber/5",
  },
  red: {
    text: "text-runtime-red",
    bar: "bg-runtime-red",
    border: "border-runtime-red/20",
    glow: "bg-runtime-red/5",
  },
};

export function BenchmarkCard({
  label,
  value,
  unit,
  description,
  color = "blue",
  delay = 0,
  className,
}: BenchmarkCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });
  const motionValue = useMotionValue(0);
  const displayValue = useTransform(motionValue, (v) => {
    if (unit === "%" || unit === "ms") return Math.round(v);
    return v.toFixed(1);
  });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;
    const controls = animate(motionValue, value, {
      duration: 2.5,
      delay: delay + 0.3,
      ease: [0.23, 1, 0.32, 1],
    });
    return controls.stop;
  }, [isInView, value, delay, motionValue]);

  const styles = colorStyles[color];

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "relative group p-6 rounded-2xl bg-runtime-card border border-runtime-border hover:border-runtime-border-active transition-all duration-500 overflow-hidden",
        className
      )}
    >
      {/* Background glow */}
      <div
        className={cn(
          "absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700",
          styles.glow
        )}
      />

      <div className="relative">
        {/* Label */}
        <div className="text-[9px] font-mono font-bold tracking-widest uppercase text-runtime-muted mb-4">
          {label}
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1 mb-3">
          <motion.span
            className={cn(
              "text-3xl font-black tabular-nums tracking-tight font-mono",
              styles.text
            )}
          >
            {displayValue}
          </motion.span>
          <span className={cn("text-sm font-bold", styles.text, "opacity-60")}>
            {unit}
          </span>
        </div>

        {/* Bar */}
        <div className="h-1 rounded-full bg-runtime-border/50 mb-4 overflow-hidden">
          <motion.div
            initial={{ width: "0%" }}
            whileInView={{ width: `${Math.min(value, 100)}%` }}
            viewport={{ once: true }}
            transition={{ duration: 2, delay: delay + 0.3, ease: [0.23, 1, 0.32, 1] }}
            className={cn("h-full rounded-full", styles.bar)}
          />
        </div>

        {/* Description */}
        <p className="text-[11px] text-runtime-muted leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
