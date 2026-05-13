"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TelemetryPulseProps {
  className?: string;
  bars?: number;
  color?: "blue" | "green" | "amber" | "red";
  speed?: number;
}

const colorMap = {
  blue: "bg-runtime-blue",
  green: "bg-runtime-green",
  amber: "bg-runtime-amber",
  red: "bg-runtime-red",
};

export function TelemetryPulse({
  className,
  bars = 5,
  color = "blue",
  speed = 1,
}: TelemetryPulseProps) {
  return (
    <div className={cn("relative flex items-center gap-[3px]", className)}>
      {[...Array(bars)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ scaleY: 0.2, opacity: 0.2 }}
          animate={{
            scaleY: [0.2, 0.8 + Math.sin(i * 0.8) * 0.2, 0.2],
            opacity: [0.2, 0.9, 0.2],
          }}
          transition={{
            duration: 1.2 / speed,
            repeat: Infinity,
            delay: i * (0.08 / speed),
            ease: "easeInOut",
          }}
          className={cn(
            "w-[3px] h-4 rounded-full origin-center",
            colorMap[color]
          )}
        />
      ))}
    </div>
  );
}
