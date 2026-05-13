"use client";

import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";

interface ExecutionGraphProps {
  className?: string;
  compact?: boolean;
}

interface GraphNode {
  id: string;
  label: string;
  status: "pending" | "active" | "completed" | "error" | "repair";
  cx: number;
  cy: number;
}

interface GraphEdge {
  from: string;
  to: string;
}

const nodes: GraphNode[] = [
  { id: "intent", label: "INTENT", cx: 60, cy: 150, status: "completed" },
  { id: "scaffold", label: "SCAFFOLD", cx: 180, cy: 100, status: "completed" },
  { id: "bootstrap", label: "BOOTSTRAP", cx: 180, cy: 200, status: "completed" },
  { id: "provision", label: "PROVISION", cx: 330, cy: 150, status: "completed" },
  { id: "preflight", label: "PRE-FLIGHT", cx: 470, cy: 100, status: "completed" },
  { id: "judge", label: "JUDGE", cx: 470, cy: 200, status: "active" },
  { id: "repair", label: "REPAIR", cx: 600, cy: 250, status: "pending" },
  { id: "replay", label: "REPLAY", cx: 600, cy: 100, status: "pending" },
  { id: "delivery", label: "DELIVERY", cx: 730, cy: 150, status: "pending" },
];

const edges: GraphEdge[] = [
  { from: "intent", to: "scaffold" },
  { from: "intent", to: "bootstrap" },
  { from: "scaffold", to: "provision" },
  { from: "bootstrap", to: "provision" },
  { from: "provision", to: "preflight" },
  { from: "provision", to: "judge" },
  { from: "preflight", to: "replay" },
  { from: "judge", to: "repair" },
  { from: "judge", to: "replay" },
  { from: "repair", to: "judge" },
  { from: "replay", to: "delivery" },
];

const statusColors = {
  pending: { fill: "#0e0e14", stroke: "#1a1a24", text: "#64748b", glow: "none" },
  active: { fill: "#0c1929", stroke: "#3b82f6", text: "#3b82f6", glow: "url(#glow-blue)" },
  completed: { fill: "#0c1f17", stroke: "#10b981", text: "#10b981", glow: "none" },
  error: { fill: "#1f0c0c", stroke: "#ef4444", text: "#ef4444", glow: "url(#glow-red)" },
  repair: { fill: "#1f180c", stroke: "#f59e0b", text: "#f59e0b", glow: "url(#glow-amber)" },
};

export function ExecutionGraph({ className, compact = false }: ExecutionGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-50px" });
  const [activeNodes, setActiveNodes] = useState<Set<string>>(new Set());
  const [nodeStatuses, setNodeStatuses] = useState<Map<string, GraphNode["status"]>>(new Map());

  // Animate nodes sequentially
  useEffect(() => {
    if (!isInView) return;

    const sequence = [
      { ids: ["intent"], delay: 200 },
      { ids: ["scaffold", "bootstrap"], delay: 600 },
      { ids: ["provision"], delay: 1100 },
      { ids: ["preflight", "judge"], delay: 1600 },
      { ids: ["repair", "replay"], delay: 2100 },
      { ids: ["delivery"], delay: 2600 },
    ];

    const timers: NodeJS.Timeout[] = [];

    sequence.forEach(({ ids, delay }) => {
      const timer = setTimeout(() => {
        setActiveNodes((prev) => {
          const next = new Set(prev);
          ids.forEach((id) => next.add(id));
          return next;
        });
      }, delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  const getNodeStatus = (node: GraphNode) => {
    if (!activeNodes.has(node.id)) return "pending";
    return nodeStatuses.get(node.id) || node.status;
  };

  const getEdgeOpacity = (edge: GraphEdge) => {
    return activeNodes.has(edge.from) && activeNodes.has(edge.to) ? 0.6 : 0.1;
  };

  const getNodeCoords = (id: string) => {
    const node = nodes.find((n) => n.id === id);
    return node ? { cx: node.cx, cy: node.cy } : { cx: 0, cy: 0 };
  };

  const viewBoxWidth = compact ? 800 : 800;
  const viewBoxHeight = compact ? 300 : 300;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden bg-runtime-card/30 rounded-2xl border border-runtime-border",
        className
      )}
    >
      {/* Dot grid background */}
      <div className="absolute inset-0 bg-dot-grid opacity-40" />

      {/* Scan line effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ y: "-100%" }}
          animate={isInView ? { y: "200%" } : { y: "-100%" }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
          className="w-full h-px bg-gradient-to-r from-transparent via-runtime-blue/30 to-transparent"
        />
      </div>

      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-auto"
        style={{ minHeight: compact ? "200px" : "280px" }}
      >
        <defs>
          <filter id="glow-blue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#3b82f6" floodOpacity="0.3" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-red" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#ef4444" floodOpacity="0.3" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-amber" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feFlood floodColor="#f59e0b" floodOpacity="0.3" />
            <feComposite in2="blur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => {
          const from = getNodeCoords(edge.from);
          const to = getNodeCoords(edge.to);
          const isRepairLoop = edge.from === "repair" && edge.to === "judge";

          return (
            <g key={`${edge.from}-${edge.to}`}>
              {isRepairLoop ? (
                <path
                  d={`M ${from.cx} ${from.cy} C ${from.cx + 40} ${from.cy + 50}, ${to.cx - 40} ${to.cy + 50}, ${to.cx} ${to.cy}`}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1"
                  opacity={getEdgeOpacity(edge)}
                  className="edge-flow-reverse"
                />
              ) : (
                <line
                  x1={from.cx}
                  y1={from.cy}
                  x2={to.cx}
                  y2={to.cy}
                  stroke="#1a1a24"
                  strokeWidth="1"
                  opacity={getEdgeOpacity(edge)}
                  className={activeNodes.has(edge.from) ? "edge-flow" : ""}
                />
              )}

              {/* Telemetry packet */}
              {activeNodes.has(edge.from) && activeNodes.has(edge.to) && !isRepairLoop && (
                <motion.circle
                  r="2"
                  fill={edge.to === "repair" ? "#f59e0b" : "#3b82f6"}
                  initial={{ opacity: 0 }}
                  animate={{
                    cx: [from.cx, to.cx],
                    cy: [from.cy, to.cy],
                    opacity: [0, 1, 1, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.3,
                    ease: "linear",
                  }}
                />
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const status = getNodeStatus(node);
          const colors = statusColors[status];
          const isVisible = activeNodes.has(node.id);

          return (
            <g key={node.id}>
              {/* Node background */}
              <motion.rect
                x={node.cx - 42}
                y={node.cy - 16}
                width="84"
                height="32"
                rx="8"
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth="1"
                filter={colors.glow}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0.2, scale: 0.9 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              />

              {/* Status indicator dot */}
              <motion.circle
                cx={node.cx - 30}
                cy={node.cy}
                r="2.5"
                fill={colors.stroke}
                initial={{ opacity: 0 }}
                animate={
                  isVisible
                    ? status === "active"
                      ? { opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }
                      : { opacity: 1 }
                    : { opacity: 0 }
                }
                transition={
                  status === "active"
                    ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.3 }
                }
              />

              {/* Node label */}
              <motion.text
                x={node.cx + 2}
                y={node.cy + 3.5}
                textAnchor="middle"
                fill={colors.text}
                fontSize="8"
                fontFamily="var(--font-mono), monospace"
                fontWeight="700"
                letterSpacing="0.1em"
                initial={{ opacity: 0 }}
                animate={isVisible ? { opacity: 1 } : { opacity: 0.2 }}
                transition={{ duration: 0.5 }}
              >
                {node.label}
              </motion.text>
            </g>
          );
        })}
      </svg>

      {/* Telemetry overlay */}
      <div className="absolute bottom-3 left-3 flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-runtime-card/80 border border-runtime-border/50 backdrop-blur-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-runtime-green animate-pulse" />
          <span className="font-mono text-[8px] font-bold tracking-widest text-runtime-green uppercase">
            Orchestrating
          </span>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        <span className="font-mono text-[8px] font-bold tracking-widest text-runtime-muted">
          NODES: {activeNodes.size}/{nodes.length}
        </span>
      </div>
    </div>
  );
}
