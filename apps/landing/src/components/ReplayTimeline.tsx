"use client";

import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";

interface ReplayTimelineProps {
  className?: string;
}

interface TimelineEvent {
  id: string;
  time: string;
  label: string;
  type: "scaffold" | "bootstrap" | "provision" | "preflight" | "judge" | "repair" | "delivery";
  detail: string;
  stdout?: string;
  confidence: number;
}

const events: TimelineEvent[] = [
  { id: "1", time: "T+0.000s", label: "Intent Received", type: "scaffold", detail: "TaskSpec compiled from user prompt", stdout: '> agrt run "Build FastAPI service with auth"', confidence: 0 },
  { id: "2", time: "T+0.142s", label: "Sandbox Created", type: "bootstrap", detail: "Isolated venv instantiated at /tmp/agrt_sandbox_7a3f", stdout: "Creating virtual environment... done", confidence: 15 },
  { id: "3", time: "T+1.893s", label: "Dependencies Provisioned", type: "provision", detail: "12 packages installed, 0 conflicts", stdout: "pip install fastapi uvicorn pydantic... ✓", confidence: 35 },
  { id: "4", time: "T+2.104s", label: "Environment Attested", type: "preflight", detail: "SHA256: a7f3c2...9e1b — VERIFIED", stdout: "Pre-flight checks: 4/4 passed", confidence: 50 },
  { id: "5", time: "T+8.442s", label: "Validation Failed", type: "judge", detail: "ModuleNotFoundError: 'jose'", stdout: "pytest -x tests/ ... FAILED (1 error)", confidence: 32 },
  { id: "6", time: "T+8.671s", label: "Repair Executed", type: "repair", detail: "DependencyRepairer → pip install python-jose", stdout: "Repair strategy: DEPENDENCY_MISSING → install", confidence: 68 },
  { id: "7", time: "T+12.033s", label: "Delivery Complete", type: "delivery", detail: "git commit -m 'feat: FastAPI auth service'", stdout: "All 7 tests passed. Confidence: 0.97", confidence: 97 },
];

const typeColors: Record<string, string> = {
  scaffold: "border-runtime-muted/30 text-runtime-muted",
  bootstrap: "border-runtime-blue/30 text-runtime-blue",
  provision: "border-runtime-blue/30 text-runtime-blue",
  preflight: "border-runtime-green/30 text-runtime-green",
  judge: "border-runtime-red/30 text-runtime-red",
  repair: "border-runtime-amber/30 text-runtime-amber",
  delivery: "border-runtime-green/30 text-runtime-green",
};

const typeDotColors: Record<string, string> = {
  scaffold: "bg-runtime-muted",
  bootstrap: "bg-runtime-blue",
  provision: "bg-runtime-blue",
  preflight: "bg-runtime-green",
  judge: "bg-runtime-red",
  repair: "bg-runtime-amber",
  delivery: "bg-runtime-green",
};

export function ReplayTimeline({ className }: ReplayTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [activeEvent, setActiveEvent] = useState<string | null>(null);
  const [scrubberPosition, setScrubberPosition] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let frame: number;
    let start: number;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / 8000, 1);
      setScrubberPosition(progress * 100);

      const eventIndex = Math.min(
        Math.floor(progress * events.length),
        events.length - 1
      );
      setActiveEvent(events[eventIndex].id);

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      } else {
        // Loop
        setTimeout(() => {
          start = 0;
          setScrubberPosition(0);
          frame = requestAnimationFrame(step);
        }, 3000);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [isInView]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Scrubber bar */}
      <div className="relative h-1.5 rounded-full bg-runtime-border/50 mb-8 overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-runtime-blue to-runtime-green"
          style={{ width: `${scrubberPosition}%` }}
        />
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          style={{ left: `${scrubberPosition}%` }}
        />
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        {events.map((event, i) => {
          const isActive = activeEvent === event.id;
          const isPast =
            activeEvent !== null &&
            events.findIndex((e) => e.id === activeEvent) >= i;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -12 }}
              animate={
                isInView
                  ? { opacity: isPast ? 1 : 0.3, x: 0 }
                  : { opacity: 0, x: -12 }
              }
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className={cn(
                "relative flex items-start gap-4 p-3 rounded-xl border transition-all duration-300 cursor-pointer",
                isActive
                  ? cn("bg-runtime-card/80 backdrop-blur-sm", typeColors[event.type])
                  : "border-transparent hover:bg-runtime-card/30"
              )}
              onClick={() => setActiveEvent(event.id)}
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    isPast ? typeDotColors[event.type] : "bg-runtime-border",
                    isActive && "scale-150 ring-2 ring-offset-1 ring-offset-runtime-bg",
                    isActive && event.type === "judge" && "ring-runtime-red/30",
                    isActive && event.type === "repair" && "ring-runtime-amber/30",
                    isActive && event.type === "delivery" && "ring-runtime-green/30",
                    isActive && !["judge", "repair", "delivery"].includes(event.type) && "ring-runtime-blue/30"
                  )}
                />
                {i < events.length - 1 && (
                  <div className={cn("w-px h-4", isPast ? "bg-runtime-border-active" : "bg-runtime-border/30")} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-[9px] font-bold tracking-widest text-runtime-muted tabular-nums">
                    {event.time}
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[10px] font-bold tracking-wide",
                      isPast ? "text-runtime-white" : "text-runtime-muted"
                    )}
                  >
                    {event.label}
                  </span>
                </div>

                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-2 space-y-2"
                  >
                    <p className="text-[10px] text-runtime-muted font-medium">
                      {event.detail}
                    </p>
                    {event.stdout && (
                      <div className="px-3 py-2 rounded-lg bg-black/40 border border-runtime-border/30 font-mono text-[9px] text-runtime-muted-light">
                        $ {event.stdout}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono font-bold tracking-widest text-runtime-muted uppercase">
                        Confidence
                      </span>
                      <div className="flex-1 h-1 rounded-full bg-runtime-border/30 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-runtime-blue transition-all duration-500"
                          style={{ width: `${event.confidence}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-mono font-bold text-runtime-blue tabular-nums">
                        {event.confidence}%
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
