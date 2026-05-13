# Antigravity Runtime: Autonomous Local Execution Infrastructure (v6.0)

[![Operational Trust](https://img.shields.io/badge/Trust-Infrastructure--Grade-emerald)](docs/benchmarks.md)
[![Status](https://img.shields.io/badge/Status-Production--Hardened-success)]()
[![Governance](https://img.shields.io/badge/Governance-Watchdog--Enabled-amber)]()
[![Replay](https://img.shields.io/badge/Debug-Time--Travel--Replay-blue)]()

Antigravity Runtime is a production-grade, local-first **Autonomous Execution Platform**. It is engineered for teams that require **absolute operational trust**, **deterministic orchestration**, and **governed self-healing**.

Unlike generic AI assistants, Antigravity Runtime is an **Execution Operating System**. It doesn't just generate code—it governs its entire lifecycle, validates its integrity with cryptographic attestation, repairs its failures autonomously, and audits every micro-step via the **Replay Engine**.

---

## 🏛️ Core Architectural Pillars

### 1. Deterministic Orchestration (The Kernel)
The Antigravity Kernel maintains absolute authority over all execution cycles. Every task is orchestrated through a 7-step autonomous loop (Scaffold → Bootstrap → Provision → Pre-Flight → Judge → Self-Heal → Delivery), ensuring a predictable path from intent to verified artifact.

### 2. Time-Travel Replay (The Replay Engine)
Experience absolute observability. Every orchestration task generates a "Flight Log" with sub-millisecond telemetry fidelity. The **Replay Engine** allows you to scrub through execution timelines, audit autonomous decisions, and inspect confidence evolution in real-time.

### 3. Infrastructure Governance (Watchdog Sentinel)
Execution is never "unbounded." Our centralized **ProcessWatchdog** enforces strict, policy-driven timeouts and manages tiered escalation (SIGTERM → SIGKILL), ensuring system stability and preventing resource leakage.

### 4. Autonomous Recovery (Failure Taxonomy)
When orchestration fails, the system doesn't guess. It classifies errors using a formal **Failure Taxonomy** and routes them to specialized repairers. Our **AST-Aware Patching** engine applies deterministic fixes to dependencies, syntax, and configurations.

### 5. Operational Confidence Scoring
Trust is earned, not assumed. The **Confidence Engine** quantifies execution reliability based on validation grounding, repair frequency, and environment attestation. Only high-confidence builds (Score > 85) are permitted for delivery.

---

## 🔄 The 7-Step Autonomous Loop

Antigravity Runtime orchestrates work through a bulletproof lifecycle:

1.  **SCAFFOLD**: Template-driven initialization of the execution context.
2.  **BOOTSTRAP**: Sandbox creation with **SHA-256 Cryptographic Attestation**.
3.  **PROVISION**: Atomic dependency injection and AST-aware feature patching.
4.  **PRE-FLIGHT**: Multi-layer static analysis (Ruff, Syntax) *prior* to execution.
5.  **JUDGE**: Multi-vector validation of outputs, artifacts, and exit codes.
6.  **SELF-HEAL**: Taxonomy-driven autonomous repair cycles.
7.  **DELIVERY**: High-confidence artifact synchronization to remote infra.

---

## 🛠️ Technology Stack

- **Kernel Core**: Python 3.10+ (FastAPI, Pydantic V2, Asyncio)
- **Governance**: Psutil-backed **ProcessWatchdog**
- **Static Analysis**: Ruff, LibCST (AST-Aware Patching)
- **Desktop HUD**: Tauri, React, Vanilla CSS (High-Performance Replay UX)
- **Local AI**: Ollama-integrated Intent Extraction (Qwen2.5-Coder)

---

## 🚀 Getting Started

### 1. Prerequisites
- [Ollama](https://ollama.ai/) (Running locally)
- [Python 3.10+](https://www.python.org/)
- [Node.js](https://nodejs.org/)

### 2. Launch the Platform
```bash
# Start the Backend Kernel
$env:PYTHONPATH = "."; python runtime/api/server.py

# Launch the Desktop HUD
cd apps/desktop
npm install && npm run dev
```

### 3. Run the Flagship Showcase
Experience the Failure → Repair → Success cycle in high-fidelity:
```bash
# Engineering Audit Mode
python scripts/golden_workflow.py

# Paced Demo Mode (Optimized for UI Replay)
python scripts/demo_mode.py
```

---

## 📈 Operational Benchmarks
We prioritize empirical data over marketing hype. Our latest benchmarks show:
- **Recovery Success Rate**: 100% for missing dependencies and linter violations.
- **Orchestration Latency**: ~1.1s average overhead for the entire 7-step loop.
- **Governance Accuracy**: 100% timeout enforcement with zero process leaks.

*View full benchmarks in [docs/benchmarks.md](docs/benchmarks.md).*

---

## 📜 License
Antigravity Runtime is licensed under the [MIT License](LICENSE). Built for the era of Autonomous Infrastructure. 🚀
