"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { TelemetryPulse } from "./TelemetryPulse";

interface RepairHUDProps {
  className?: string;
  active?: boolean;
}

interface LogEntry {
  time: string;
  level: "info" | "warn" | "error" | "success" | "repair";
  message: string;
}

const repairSequence: LogEntry[] = [
  { time: "00:00.012", level: "error", message: "[JUDGE] ValidationError: ModuleNotFoundError 'fastapi'" },
  { time: "00:00.015", level: "warn", message: "[TAXONOMY] Classifying → DEPENDENCY_MISSING" },
  { time: "00:00.018", level: "repair", message: "[ROUTE] Dispatching → DependencyRepairer" },
  { time: "00:00.234", level: "info", message: "[REPAIR] pip install fastapi==0.111.0 --quiet" },
  { time: "00:02.891", level: "info", message: "[REPAIR] Installing collected packages: fastapi, starlette, pydantic..." },
  { time: "00:04.102", level: "success", message: "[ATTEST] SHA256 re-hashed → Environment VERIFIED" },
  { time: "00:04.115", level: "success", message: "[JUDGE] Re-validation PASSED — confidence: 0.94 → 0.97" },
  { time: "00:04.118", level: "info", message: "[KERNEL] Resuming execution from checkpoint #4" },
];

const levelColors = {
  info: "text-runtime-muted-light",
  warn: "text-runtime-amber",
  error: "text-runtime-red",
  success: "text-runtime-green",
  repair: "text-runtime-blue",
};

export function RepairHUD({ className, active = true }: RepairHUDProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    if (!active) {
      setVisibleLines(0);
      return;
    }

    setVisibleLines(0);
    const intervals: NodeJS.Timeout[] = [];

    repairSequence.forEach((_, i) => {
      const timer = setTimeout(() => {
        setVisibleLines(i + 1);
      }, i * 400 + 200);
      intervals.push(timer);
    });

    const resetTimer = setTimeout(() => {
      setVisibleLines(0);
      // Restart after reset
      repairSequence.forEach((_, i) => {
        const t = setTimeout(() => setVisibleLines(i + 1), i * 400 + 600);
        intervals.push(t);
      });
    }, repairSequence.length * 400 + 4000);
    intervals.push(resetTimer);

    return () => intervals.forEach(clearTimeout);
  }, [active]);

  return (
    <div
      className={cn(
        "relative rounded-2xl border bg-black/60 backdrop-blur-md overflow-hidden font-mono",
        active ? "border-runtime-amber/30" : "border-runtime-border",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 border-b border-runtime-border/50 bg-runtime-card/30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-2 h-2 rounded-full bg-runtime-red/60" />
            <div className="w-2 h-2 rounded-full bg-runtime-amber/60" />
            <div className="w-2 h-2 rounded-full bg-runtime-green/60" />
          </div>
          <span className="text-[7px] sm:text-[9px] font-bold tracking-widest text-runtime-muted uppercase truncate">
            repair_hud / autonomous_recovery
          </span>
        </div>
        <TelemetryPulse bars={4} color={active ? "amber" : "blue"} className="scale-75 shrink-0" />
      </div>

      {/* Log Output */}
      <div className="p-3 sm:p-4 space-y-1 min-h-[180px] sm:min-h-[200px] max-h-[280px] overflow-hidden">
        <AnimatePresence>
          {repairSequence.slice(0, visibleLines).map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="flex gap-2 sm:gap-3 text-[8px] sm:text-[10px] leading-relaxed"
            >
              <span className="text-runtime-muted/50 tabular-nums shrink-0">
                {entry.time}
              </span>
              <span className={cn("break-all", levelColors[entry.level])}>
                {entry.message}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {visibleLines < repairSequence.length && active && (
          <div className="flex items-center gap-1 mt-2">
            <span className="w-1.5 h-3 bg-runtime-amber/80 cursor-blink" />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="px-3 sm:px-4 py-2 border-t border-runtime-border/50 bg-runtime-card/20 flex items-center justify-between">
        <span className="text-[8px] font-bold tracking-widest text-runtime-muted uppercase">
          {visibleLines >= repairSequence.length ? "recovery complete" : "repair in progress..."}
        </span>
        <span
          className={cn(
            "text-[8px] font-bold tracking-widest uppercase",
            visibleLines >= repairSequence.length ? "text-runtime-green" : "text-runtime-amber"
          )}
        >
          {visibleLines >= repairSequence.length ? "● HEALTHY" : "● REPAIRING"}
        </span>
      </div>
    </div>
  );
}
