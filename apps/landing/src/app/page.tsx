"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  Activity, Cpu, ChevronRight, History, Terminal,
  Shield, Lock, GitBranch, BarChart3, Play, RefreshCcw, Zap
} from "lucide-react";
import { ExecutionGraph } from "@/components/ExecutionGraph";
import { TelemetryPulse } from "@/components/TelemetryPulse";
import { ConfidenceIndicator } from "@/components/ConfidenceIndicator";
import { RepairHUD } from "@/components/RepairHUD";
import { ReplayTimeline } from "@/components/ReplayTimeline";
import { BenchmarkCard } from "@/components/BenchmarkCard";
import { DeliverySequence } from "@/components/DeliverySequence";
import { ValidationState } from "@/components/ValidationState";
import { cn } from "@/lib/utils";
import { useRef } from "react";

/* ═══════════════════════════════════════════════════
   SECTION: Lifecycle Data
   ═══════════════════════════════════════════════════ */

const lifecycleStages = [
  { num: "01", title: "Intent", desc: "AI intent extraction & TaskSpec compilation from natural language.", color: "text-runtime-muted-light", border: "border-runtime-border" },
  { num: "02", title: "Planning", desc: "Execution DAG construction with dependency resolution.", color: "text-runtime-blue", border: "border-runtime-blue/20" },
  { num: "03", title: "Sandbox", desc: "Isolated environment instantiation with cryptographic attestation.", color: "text-runtime-blue", border: "border-runtime-blue/20" },
  { num: "04", title: "Validation", desc: "Continuous behavioral validation & observability checks.", color: "text-runtime-green", border: "border-runtime-green/20" },
  { num: "05", title: "Repair", desc: "Formal failure taxonomy routing to specialized repairers.", color: "text-runtime-amber", border: "border-runtime-amber/20" },
  { num: "06", title: "Replay", desc: "Full execution trace preservation with sub-ms telemetry.", color: "text-runtime-blue", border: "border-runtime-blue/20" },
  { num: "07", title: "Delivery", desc: "High-confidence deployment with git-provider integration.", color: "text-runtime-green", border: "border-runtime-green/20" },
];

/* ═══════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════ */

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);

  return (
    <div className="bg-runtime-bg text-white selection:bg-runtime-blue/30 selection:text-white">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* ─── NAV ─── */}
      <nav className="fixed top-0 w-full z-50 border-b border-runtime-border/40 bg-runtime-bg/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-runtime-blue/10 border border-runtime-blue/20 flex items-center justify-center">
              <Cpu className="w-3.5 h-3.5 text-runtime-blue" />
            </div>
            <span className="font-black tracking-tighter text-xs sm:text-sm">
              ANTIGRAVITY <span className="text-runtime-muted font-medium text-[10px] sm:text-xs hidden sm:inline">RUNTIME</span>
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-8 text-[9px] font-bold uppercase tracking-[0.2em] text-runtime-muted">
            <a href="#lifecycle" className="hover:text-white transition-colors duration-300">Lifecycle</a>
            <a href="#recovery" className="hover:text-white transition-colors duration-300">Recovery</a>
            <a href="#replay" className="hover:text-white transition-colors duration-300">Replay</a>
            <a href="#benchmarks" className="hover:text-white transition-colors duration-300">Benchmarks</a>
          </div>
          <button className="flex items-center gap-1.5 sm:gap-2 bg-white text-black text-[10px] font-mono font-bold tracking-tight px-3 sm:px-4 py-2 rounded-lg hover:bg-runtime-blue hover:text-white transition-all duration-300">
            <Terminal className="w-3 h-3" /> pip install agrt
          </button>
        </div>
      </nav>

      {/* ─── SECTION 1: HERO ─── */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-12 px-4 sm:px-6 overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-runtime-blue/[0.03] rounded-full blur-[150px]" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-runtime-green/[0.02] rounded-full blur-[120px]" />
        </div>

        <div className="max-w-5xl w-full z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-runtime-blue/[0.08] border border-runtime-blue/15 text-runtime-blue text-[9px] font-mono font-bold uppercase tracking-[0.2em] mb-8"
          >
            <Activity className="w-3 h-3 animate-pulse" />
            agrt 0.1.0 — Production Ready
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-[-0.04em] leading-[0.92] mb-6 sm:mb-8"
          >
            Autonomous Local{" "}
            <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-runtime-blue via-runtime-blue to-runtime-green">
              Execution Platform
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-runtime-muted max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium px-2 sm:px-0"
          >
            Deterministic orchestration.
            <span className="text-runtime-muted-light"> Replayable execution. </span>
            Self-healing infrastructure.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <button className="group w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-2.5 bg-white text-black rounded-xl hover:bg-runtime-blue hover:text-white transition-all duration-300 shadow-[0_8px_32px_rgba(255,255,255,0.08)]">
              <Terminal className="w-4 h-4 shrink-0" />
              <div className="flex flex-col items-start text-left leading-tight font-mono">
                <span className="text-xs font-bold tracking-tight">pip install agrt</span>
                <span className="text-[8px] font-sans font-extrabold uppercase tracking-widest text-black/60 group-hover:text-white/80 mt-0.5">agrt 0.1.0</span>
              </div>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
            </button>
            <a href="#replay" className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 bg-runtime-card border border-runtime-border font-bold uppercase tracking-[0.15em] text-[10px] rounded-xl hover:border-runtime-blue/30 hover:bg-runtime-card-hover transition-all duration-300 text-runtime-muted-light">
              <Play className="w-3.5 h-3.5" /> View Replay Engine
            </a>
          </motion.div>
        </div>

        {/* Hero Graph */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="max-w-5xl w-full mt-10 sm:mt-16 z-10"
        >
          <ExecutionGraph />
        </motion.div>
      </section>

      {/* ─── Divider ─── */}
      <div className="section-divider" />

      {/* ─── SECTION 2: EXECUTION LIFECYCLE ─── */}
      <section id="lifecycle" className="py-16 sm:py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left: Text */}
            <div>
              <SectionBadge>Execution Lifecycle</SectionBadge>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] leading-[1.05] mb-6">
                Seven-stage{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-runtime-blue to-runtime-green">
                  autonomous loop.
                </span>
              </h2>
              <p className="text-runtime-muted text-sm sm:text-base leading-relaxed mb-8 sm:mb-12 max-w-lg font-medium">
                Every execution traverses a governed DAG — from intent extraction to verified delivery. Each stage emits telemetry, validates state, and preserves replay evidence.
              </p>
              <div className="space-y-3 sm:space-y-6">
                {lifecycleStages.map((stage, i) => (
                  <LifecycleStep key={stage.num} {...stage} index={i} />
                ))}
              </div>
            </div>

            {/* Right: Visual */}
            <div className="lg:sticky lg:top-24">
              <div className="relative rounded-2xl border border-runtime-border bg-runtime-card/30 overflow-hidden">
                <div className="absolute inset-0 bg-dot-grid opacity-30" />
                {/* Terminal mockup */}
                <div className="relative p-3 sm:p-6">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-runtime-border/50">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-runtime-red/50" />
                      <div className="w-2 h-2 rounded-full bg-runtime-amber/50" />
                      <div className="w-2 h-2 rounded-full bg-runtime-green/50" />
                    </div>
                    <span className="text-[9px] font-mono font-bold tracking-widest text-runtime-muted/50 uppercase ml-2">
                      kernel_orchestrator_v6
                    </span>
                    <div className="ml-auto">
                      <TelemetryPulse bars={4} color="blue" className="scale-75 opacity-60" />
                    </div>
                  </div>
                  <div className="space-y-1.5 font-mono text-[8px] sm:text-[10px] leading-relaxed overflow-x-auto">
                    <TermLine color="green" delay={0.3}>[BOOT] Runtime initialized — PID 42891</TermLine>
                    <TermLine color="blue" delay={0.5}>[INTENT] TaskSpec compiled from user prompt</TermLine>
                    <TermLine color="blue" delay={0.7}>[SCAFFOLD] DAG constructed — 7 nodes, 11 edges</TermLine>
                    <TermLine color="green" delay={0.9}>[BOOTSTRAP] Sandbox created at /tmp/agrt_7a3f</TermLine>
                    <TermLine color="blue" delay={1.1}>[PROVISION] Installing 12 dependencies...</TermLine>
                    <TermLine color="green" delay={1.3}>[ATTEST] SHA256: a7f3c2e...9e1b ✓ VERIFIED</TermLine>
                    <TermLine color="amber" delay={1.5}>[JUDGE] Validation cycle 1 — running tests...</TermLine>
                    <TermLine color="green" delay={1.7}>[JUDGE] 7/7 assertions passed</TermLine>
                    <TermLine color="blue" delay={1.9}>[REPLAY] Trace persisted — 847 events captured</TermLine>
                    <TermLine color="green" delay={2.1}>[DELIVERY] git commit → "feat: auth service"</TermLine>
                  </div>
                  <div className="mt-4 pt-3 border-t border-runtime-border/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <ConfidenceIndicator value={97} size="sm" label="Confidence" />
                    <ValidationState />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ─── SECTION 3: FAILURE & RECOVERY ─── */}
      <section id="recovery" className="py-16 sm:py-28 md:py-36">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <SectionBadge color="amber">Autonomous Recovery</SectionBadge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] leading-[1.05] mb-6">
              Failure is{" "}
              <span className="text-runtime-red italic">deterministic.</span>
              <br />
              Recovery is{" "}
              <span className="text-runtime-green italic">governed.</span>
            </h2>
            <p className="text-runtime-muted text-base leading-relaxed max-w-xl mx-auto font-medium">
              When orchestration fails, the kernel routes failures through a formal taxonomy to specialized repairers. No guessing — just engineering.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 items-start">
            {/* Repair HUD */}
            <div className="lg:col-span-3">
              <RepairHUD />
            </div>

            {/* Repair Metrics */}
            <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
              <RepairMetric label="Failure Detection" value="<200ms" color="red" desc="Time to classify and route failure" />
              <RepairMetric label="Repair Routing" value="Taxonomy-Led" color="amber" desc="Formal classification drives repair strategy" />
              <RepairMetric label="Recovery Success" value="100%" color="green" desc="All governed failures recovered autonomously" />
              <RepairMetric label="Governance Model" value="Watchdog-First" color="blue" desc="5s SIGTERM → SIGKILL escalation policy" />
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ─── SECTION 4: REPLAY ENGINE ─── */}
      <section id="replay" className="py-16 sm:py-28 md:py-36">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <SectionBadge color="blue">Replay Engine</SectionBadge>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] leading-[1.05] mb-6">
                Every decision.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-runtime-blue to-runtime-green">
                  Inspectable.
                </span>
              </h2>
              <p className="text-runtime-muted text-base leading-relaxed mb-8 max-w-lg font-medium">
                Forensic-grade execution replay. Scrub through every step, inspect stdout/stderr, trace confidence evolution, and audit every repair decision.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <ReplayFeature icon={<History className="w-4 h-4" />} label="Time-Travel Scrubbing" />
                <ReplayFeature icon={<Terminal className="w-4 h-4" />} label="stdout/stderr Capture" />
                <ReplayFeature icon={<BarChart3 className="w-4 h-4" />} label="Confidence History" />
                <ReplayFeature icon={<GitBranch className="w-4 h-4" />} label="Node Inspection" />
              </div>
            </div>
            <div>
              <div className="rounded-2xl border border-runtime-border bg-runtime-card/30 p-4 sm:p-6 overflow-hidden">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-runtime-border/50">
                  <Play className="w-3 h-3 text-runtime-blue" />
                  <span className="text-[9px] font-mono font-bold tracking-widest text-runtime-muted uppercase">
                    replay_viewer / execution_trace
                  </span>
                </div>
                <ReplayTimeline />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ─── SECTION 5: BENCHMARKS ─── */}
      <section id="benchmarks" className="py-16 sm:py-28 md:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <SectionBadge color="green">Operational Evidence</SectionBadge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] leading-[1.05] mb-6">
              Infrastructure metrics.{" "}
              <span className="text-runtime-muted">Not marketing.</span>
            </h2>
            <p className="text-runtime-muted text-base leading-relaxed max-w-xl mx-auto font-medium">
              Empirical data from production execution runs. Every number is measured, not claimed.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <BenchmarkCard label="Repair Success Rate" value={100} unit="%" description="All taxonomy-classified failures resolved autonomously without human intervention." color="green" delay={0} />
            <BenchmarkCard label="Orchestration Latency" value={12} unit="ms" description="Median time from intent receipt to DAG construction and sandbox initialization." color="blue" delay={0.1} />
            <BenchmarkCard label="Replay Consistency" value={99.7} unit="%" description="Execution traces reproduce identical state when replayed from checkpoint." color="blue" delay={0.2} />
            <BenchmarkCard label="Timeout Recovery" value={98} unit="%" description="Watchdog-governed processes recovered within 5s SIGTERM escalation window." color="amber" delay={0.3} />
            <BenchmarkCard label="Attestation Integrity" value={100} unit="%" description="SHA-256 environment hashes verified before every execution cycle." color="green" delay={0.4} />
            <BenchmarkCard label="Watchdog Enforcement" value={99.9} unit="%" description="Process governance policies enforced with zero orphan process leaks." color="green" delay={0.5} />
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ─── SECTION 6: DELIVERY ─── */}
      <section className="py-16 sm:py-28 md:py-36">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <SectionBadge color="green">Delivery Complete</SectionBadge>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[-0.03em] leading-[1.05] mb-6">
            Execution verified.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-runtime-blue to-runtime-green">
              Replay preserved.
            </span>
            <br />
            Delivery complete.
          </h2>

          <div className="max-w-2xl mx-auto my-8 sm:my-12 overflow-x-auto">
            <DeliverySequence />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-12">
            <button className="group flex items-center gap-2.5 px-10 py-4 bg-white text-black font-black uppercase tracking-[0.15em] text-xs rounded-xl hover:bg-runtime-blue hover:text-white transition-all duration-300 shadow-[0_12px_40px_rgba(255,255,255,0.1)]">
              <Terminal className="w-4 h-4" />
              agrt run
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-runtime-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-runtime-blue/10 border border-runtime-blue/20 flex items-center justify-center">
                <Cpu className="w-3 h-3 text-runtime-blue" />
              </div>
              <span className="font-black tracking-tighter text-sm">ANTIGRAVITY</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[7px] sm:text-[8px] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-runtime-muted">
              <span>© 2026 Antigravity</span>
              <span>Operational Trust</span>
              <span>Telemetry Fidelity</span>
              <span>Deterministic Replay</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════ */

function SectionBadge({ children, color = "blue" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    blue: "bg-runtime-blue/[0.08] border-runtime-blue/15 text-runtime-blue",
    green: "bg-runtime-green/[0.08] border-runtime-green/15 text-runtime-green",
    amber: "bg-runtime-amber/[0.08] border-runtime-amber/15 text-runtime-amber",
    red: "bg-runtime-red/[0.08] border-runtime-red/15 text-runtime-red",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-[0.25em] mb-6", colors[color])}
    >
      {children}
    </motion.div>
  );
}

function LifecycleStep({ num, title, desc, color, border, index }: { num: string; title: string; desc: string; color: string; border: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className={cn("flex gap-5 group p-4 rounded-xl border border-transparent hover:border-runtime-border/50 hover:bg-runtime-card/30 transition-all duration-300")}
    >
      <span className={cn("text-lg font-black font-mono tabular-nums shrink-0 opacity-30 group-hover:opacity-70 transition-opacity", color)}>
        {num}
      </span>
      <div>
        <h4 className="text-sm font-black tracking-tight uppercase mb-1">{title}</h4>
        <p className="text-xs text-runtime-muted font-medium leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

function TermLine({ children, color, delay = 0 }: { children: React.ReactNode; color: string; delay?: number }) {
  const colorMap: Record<string, string> = {
    green: "text-runtime-green",
    blue: "text-runtime-blue",
    amber: "text-runtime-amber",
    red: "text-runtime-red",
    muted: "text-runtime-muted",
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: delay + 0.5 }}
      className={cn("font-mono", colorMap[color] || "text-runtime-muted")}
    >
      {children}
    </motion.div>
  );
}

function RepairMetric({ label, value, color, desc }: { label: string; value: string; color: string; desc: string }) {
  const colorMap: Record<string, { text: string; border: string; bg: string }> = {
    blue: { text: "text-runtime-blue", border: "border-runtime-blue/20", bg: "bg-runtime-blue/5" },
    green: { text: "text-runtime-green", border: "border-runtime-green/20", bg: "bg-runtime-green/5" },
    amber: { text: "text-runtime-amber", border: "border-runtime-amber/20", bg: "bg-runtime-amber/5" },
    red: { text: "text-runtime-red", border: "border-runtime-red/20", bg: "bg-runtime-red/5" },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={cn("p-5 rounded-xl border bg-runtime-card/50", c.border)}
    >
      <div className="text-[8px] font-mono font-bold tracking-widest text-runtime-muted uppercase mb-2">{label}</div>
      <div className={cn("text-xl font-black tracking-tight mb-1.5 font-mono", c.text)}>{value}</div>
      <div className="text-[10px] text-runtime-muted font-medium leading-relaxed">{desc}</div>
    </motion.div>
  );
}

function ReplayFeature({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-runtime-border/50 bg-runtime-card/30">
      <div className="text-runtime-blue shrink-0">{icon}</div>
      <span className="text-[10px] font-bold tracking-wide text-runtime-muted-light">{label}</span>
    </div>
  );
}
