"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RuntimeNodeProps {
  label: string;
  status: "pending" | "active" | "completed" | "error" | "repair";
  delay?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const statusStyles = {
  pending: "bg-runtime-card border-runtime-border text-runtime-muted opacity-50",
  active: "bg-runtime-blue/10 border-runtime-blue/50 text-runtime-blue glow-blue",
  completed: "bg-runtime-green/10 border-runtime-green/30 text-runtime-green",
  error: "bg-runtime-red/10 border-runtime-red/30 text-runtime-red glow-red",
  repair: "bg-runtime-amber/10 border-runtime-amber/30 text-runtime-amber glow-amber",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-[8px]",
  md: "px-4 py-2 text-[10px]",
  lg: "px-5 py-2.5 text-[11px]",
};

const statusIndicators = {
  pending: "bg-runtime-muted/30",
  active: "bg-runtime-blue animate-pulse",
  completed: "bg-runtime-green",
  error: "bg-runtime-red animate-pulse",
  repair: "bg-runtime-amber animate-pulse",
};

export function RuntimeNode({
  label,
  status,
  delay = 0,
  size = "md",
  className,
}: RuntimeNodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      className={cn(
        "relative flex items-center gap-2 rounded-lg border font-mono font-bold tracking-widest uppercase transition-all duration-700",
        statusStyles[status],
        sizeStyles[size],
        className
      )}
    >
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full shrink-0",
          statusIndicators[status]
        )}
      />
      {label}
    </motion.div>
  );
}
