"use client";

import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";

interface DeliverySequenceProps {
  className?: string;
}

const steps = [
  { id: 1, label: "Validation Complete", icon: "✓", color: "text-runtime-green", bg: "bg-runtime-green" },
  { id: 2, label: "Tests Passed", icon: "✓", color: "text-runtime-green", bg: "bg-runtime-green" },
  { id: 3, label: "Git Staged", icon: "◈", color: "text-runtime-blue", bg: "bg-runtime-blue" },
  { id: 4, label: "Committed", icon: "◈", color: "text-runtime-blue", bg: "bg-runtime-blue" },
  { id: 5, label: "Replay Preserved", icon: "◈", color: "text-runtime-blue", bg: "bg-runtime-blue" },
  { id: 6, label: "Delivered", icon: "★", color: "text-white", bg: "bg-white" },
];

export function DeliverySequence({ className }: DeliverySequenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const timers: NodeJS.Timeout[] = [];
    steps.forEach((_, i) => {
      const timer = setTimeout(() => setActiveStep(i + 1), (i + 1) * 600);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, i) => (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={
                activeStep >= step.id
                  ? { scale: 1, opacity: 1 }
                  : { scale: 0.8, opacity: 0.3 }
              }
              transition={{
                duration: 0.5,
                delay: i * 0.1,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="flex flex-col items-center gap-2 shrink-0"
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-lg border flex items-center justify-center text-xs font-bold transition-all duration-500",
                  activeStep >= step.id
                    ? cn(step.color, "border-current/30 bg-current/10")
                    : "text-runtime-muted border-runtime-border bg-runtime-card"
                )}
              >
                {activeStep >= step.id ? step.icon : "○"}
              </div>
              <span
                className={cn(
                  "text-[8px] font-mono font-bold tracking-widest uppercase text-center transition-colors duration-500 max-w-[80px]",
                  activeStep >= step.id ? step.color : "text-runtime-muted/50"
                )}
              >
                {step.label}
              </span>
            </motion.div>

            {i < steps.length - 1 && (
              <div className="flex-1 mx-2 h-px relative overflow-hidden">
                <div className="absolute inset-0 bg-runtime-border/30" />
                <motion.div
                  initial={{ width: "0%" }}
                  animate={
                    activeStep > step.id ? { width: "100%" } : { width: "0%" }
                  }
                  transition={{
                    duration: 0.4,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  className={cn("absolute inset-y-0 left-0", step.bg, "opacity-60")}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
