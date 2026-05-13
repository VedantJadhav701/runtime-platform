"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface ValidationStateProps {
  className?: string;
  autoPlay?: boolean;
}

type Phase = "idle" | "scanning" | "validating" | "passed" | "failed" | "repairing" | "recovered";

const phaseConfig: Record<Phase, { label: string; color: string; icon: string; border: string }> = {
  idle: { label: "AWAITING VALIDATION", color: "text-runtime-muted", icon: "◯", border: "border-runtime-border" },
  scanning: { label: "SCANNING ENVIRONMENT", color: "text-runtime-blue", icon: "⟳", border: "border-runtime-blue/30" },
  validating: { label: "VALIDATING STATE", color: "text-runtime-blue", icon: "◈", border: "border-runtime-blue/30" },
  passed: { label: "VALIDATION PASSED", color: "text-runtime-green", icon: "✓", border: "border-runtime-green/30" },
  failed: { label: "VALIDATION FAILED", color: "text-runtime-red", icon: "✗", border: "border-runtime-red/30" },
  repairing: { label: "REPAIR ACTIVE", color: "text-runtime-amber", icon: "⟳", border: "border-runtime-amber/30" },
  recovered: { label: "STATE RECOVERED", color: "text-runtime-green", icon: "✓", border: "border-runtime-green/30" },
};

export function ValidationState({ className, autoPlay = true }: ValidationStateProps) {
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (!autoPlay) return;

    const sequence: { phase: Phase; delay: number }[] = [
      { phase: "scanning", delay: 1000 },
      { phase: "validating", delay: 2000 },
      { phase: "failed", delay: 3500 },
      { phase: "repairing", delay: 5000 },
      { phase: "recovered", delay: 7000 },
      { phase: "passed", delay: 8500 },
      { phase: "idle", delay: 11000 },
    ];

    const timers = sequence.map(({ phase: p, delay }) =>
      setTimeout(() => setPhase(p), delay)
    );

    const loop = setTimeout(() => {
      setPhase("idle");
    }, 12000);

    const restart = setInterval(() => {
      setPhase("idle");
      sequence.forEach(({ phase: p, delay }) => {
        setTimeout(() => setPhase(p), delay);
      });
    }, 12000);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(loop);
      clearInterval(restart);
    };
  }, [autoPlay]);

  const config = phaseConfig[phase];

  return (
    <div className={cn("relative", className)}>
      <motion.div
        layout
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl border bg-runtime-card/50 backdrop-blur-sm transition-colors duration-500",
          config.border
        )}
      >
        <motion.span
          key={phase}
          initial={{ rotate: 0 }}
          animate={
            phase === "scanning" || phase === "repairing"
              ? { rotate: 360 }
              : { rotate: 0 }
          }
          transition={
            phase === "scanning" || phase === "repairing"
              ? { duration: 1, repeat: Infinity, ease: "linear" }
              : { duration: 0.3 }
          }
          className={cn("text-sm", config.color)}
        >
          {config.icon}
        </motion.span>

        <AnimatePresence mode="wait">
          <motion.span
            key={phase}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "font-mono text-[10px] font-bold tracking-widest",
              config.color
            )}
          >
            {config.label}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
