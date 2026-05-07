# Antigravity: Autonomous Local Execution Platform (v5.5)

[![Autonomous Infrastructure](https://img.shields.io/badge/Architecture-v5.5-blueviolet)](docs/architecture/runtime_architecture_spec.md)
[![Status](https://img.shields.io/badge/Status-Production--Hardened-success)]()
[![Governance](https://img.shields.io/badge/Governance-Watchdog--Enabled-amber)]()
[![Replay](https://img.shields.io/badge/Debug-Time--Travel--Replay-blue)]()

Antigravity is a production-grade, local-first AI execution runtime. It is engineered for developers and infrastructure teams who require **deterministic orchestration**, **autonomous self-healing**, and **absolute operational trust**.

Unlike generic AI coding assistants, Antigravity is an **Execution Operating System**. It doesn't just generate code—it governs its entire lifecycle, validates its integrity, repairs its failures, and audits its execution with millisecond precision.

---

## 🏛️ Core Architectural Pillars

### 1. Execution Governance (Watchdog Sentinel)
The Antigravity Kernel maintains absolute authority over all sandboxed processes. Every execution cycle is monitored by the **ProcessWatchdog**, which enforces strict timeout policies and manages tiered escalation (SIGTERM → SIGKILL) to prevent hanging code from compromising the host system.

### 2. Time-Travel Debugging (Execution Replay)
Our flagship differentiator. Every orchestration task is captured in a permanent "Flight Log." Using the **ReplayEngine**, users can reconstruct and play back the entire execution timeline—inspecting every node state, terminal output, and autonomous repair decision as if they were traveling through time.

### 3. Environment Attestation (Integrity Guard)
Every sandbox is cryptographically signed upon creation. The **AttestationEngine** performs SHA-256 integrity checks before and after every execution, ensuring that the runtime environment remains pristine and has not been corrupted by side effects or manual tampering.

### 4. Deterministic Self-Healing (Failure Taxonomy)
Antigravity doesn't "guess" how to fix errors. It classifies failures into a formal **Failure Taxonomy** (Dependency, Syntax, Lint, Runtime). The **RepairRegistry** then routes these signals to specialized repairers—like our **AST-Aware Patcher**—to apply deterministic, syntax-aware fixes.

### 5. Operational Confidence Engine
Every task is quantified. The **ConfidenceEngine** calculates a real-time trust score (0-100) based on validation depth, repair frequency, and process stability. Only high-confidence builds reach the **DELIVERY** phase.

---

## 🔄 The 7-Step Autonomous Loop

Antigravity orchestrates work through a bulletproof infrastructure lifecycle:

1.  **SCAFFOLD**: Template-driven project architecture initialization.
2.  **BOOTSTRAP**: Sandbox creation with **Cryptographic Attestation**.
3.  **PROVISION**: Atomic dependency injection and AST-aware feature patching.
4.  **PRE-FLIGHT**: Layered static analysis (Ruff, Syntax) *before* runtime execution.
5.  **JUDGE**: Multi-vector validation of outputs, artifacts, and exit codes.
6.  **SELF-HEAL**: Taxonomy-driven autonomous repair cycles.
7.  **DELIVERY**: Automated Git synchronization for high-confidence artifacts.

---

## 🛠️ Technology Stack

- **Kernel Core**: Python 3.10+ (FastAPI, Pydantic V2, Asyncio)
- **Local Intelligence**: Ollama (Qwen2.5-Coder, Mistral, Llama 3)
- **Static Analysis**: Ruff, LibCST (AST-Aware Patching)
- **System Governance**: Psutil (Process Management & Watchdogs)
- **Desktop HUD**: Tauri, React, Tailwind CSS, Lucide Icons
- **Telemetry**: Real-time WebSocket-driven Execution HUD

---

## 🚀 Getting Started

### 1. Prerequisites
- [Ollama](https://ollama.ai/) (Running locally)
- [Python 3.10+](https://www.python.org/)
- [Node.js & Bun](https://bun.sh/) (For the Desktop UI)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/VedantJadhav701/runtime-platform.git

# Install dependencies
pip install -r requirements.txt
bun install
```

### 3. Launch the Platform
```bash
# Start the Backend Kernel
$env:PYTHONPATH = "."; python runtime/api/server.py

# Start the Desktop HUD
cd apps/desktop
bun run dev
```

---

## ✨ The Golden Workflow
Experience the full power of the platform with our obsessively polished demo script:
```bash
python scripts/golden_workflow.py
```
*Watch as the system extracts intent, bootstraps a sandbox, triggers an intentional fault, repairs itself using static analysis, and generates a flight log—all in under 20 seconds.*

---

## 📜 License
Antigravity is licensed under the [MIT License](LICENSE). Built for the era of Autonomous Infrastructure by **Senior Runtime Implementation Engineers**. 🚀
