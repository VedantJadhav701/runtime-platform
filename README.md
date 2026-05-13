# Antigravity Runtime: Autonomous Local Execution Infrastructure (v0.1.0)

[![Website](https://img.shields.io/badge/Website-agrt.vercel.app-2563eb?style=flat&logo=vercel)](https://agrt.vercel.app/)
[![PyPI version](https://img.shields.io/badge/PyPI-agrt--0.1.0-amber?style=flat&logo=pypi)](https://pypi.org/project/agrt/)
[![GitHub Stars](https://img.shields.io/github/stars/VedantJadhav701/antigravity-runtime?style=social)](https://github.com/VedantJadhav701/antigravity-runtime)
[![Operational Trust](https://img.shields.io/badge/Trust-Infrastructure--Grade-emerald)](docs/benchmarks.md)
[![Status](https://img.shields.io/badge/Status-Production--Hardened-success)]()

> **🚀 Explore the live operational narrative & Time-Travel Replay showcase:** [**https://agrt.vercel.app/**](https://agrt.vercel.app/)
> 
> ⭐ **Love open-source autonomous systems?** Please support us by [**starring the repository on GitHub**](https://github.com/VedantJadhav701/antigravity-runtime) and joining our active contributor base!

Antigravity Runtime is an open-source, production-grade, local-first **Autonomous Execution Platform**. It is engineered for teams that require **absolute operational trust**, **deterministic orchestration**, and **governed self-healing**.

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

Antigravity Runtime is distributed as globally installable infrastructure software.

### 1. Installation
Install the runtime engine and CLI tools via `pip`:
```bash
pip install agrt
```

### 2. Verify Infrastructure
Ensure your local environment and required dependencies (like Ollama) are configured:
```bash
agrt doctor
```

### 3. CLI Ecosystem
The `agrt` CLI is the primary entry point for orchestrating autonomous workflows:
```bash
# Execute an autonomous template build
agrt run --template fastapi_basic --features uvicorn fastapi

# Validate the technical integrity of artifacts
agrt validate .

# List all autonomous execution sessions
agrt list

# Inspect a specific execution flight log
agrt inspect graph_1778195994

# View granular structured telemetry
agrt logs graph_1778195994

# Run operational performance benchmarks
agrt benchmark
```

### 4. SDK Integration
Integrate Antigravity Runtime directly into your infrastructure using the `agrt` Python SDK:
```python
from agrt import Runtime

# Initialize the Runtime Kernel
runtime = Runtime()

# Dispatch an autonomous task
report = runtime.run(
    task="Build FastAPI backend with JWT auth",
    template="fastapi_basic",
    features=["fastapi", "uvicorn"]
)

print(f"Task ID: {report.task_id} | Success: {report.success}")
```

### 5. Desktop Observability (Optional)
The optional React/Tauri Desktop HUD provides a graphical interface for Time-Travel Replay:
```bash
cd apps/desktop
npm install && npm run dev
```

---

## 📈 Operational Benchmarks
We prioritize empirical data over marketing hype. Our latest benchmarks show:
- **Recovery Success Rate**: 100% for missing dependencies and linter violations.
- **Orchestration Latency**: ~1.1s average overhead for the entire 7-step loop.
- **Governance Accuracy**: 100% timeout enforcement with zero process leaks.

*View full benchmarks in [docs/benchmarks.md](docs/benchmarks.md).*

---

## 🤝 Contributing & Governance

Antigravity Runtime thrives on community engineering. We welcome contributions across our kernel execution modules, AST parsers, and UI components.

- **[Contributing Guide](CONTRIBUTING.md)**: Review our local development prerequisites, styling criteria, and Conventional Commit pull request standards.
- **[Code of Conduct](CODE_OF_CONDUCT.md)**: We maintain a highly professional, inclusive, and safe environment. All community participants are expected to uphold our global standards.

---

## 📜 License
Antigravity Runtime is licensed under the [MIT License](LICENSE). Built for the era of Autonomous Infrastructure. 🚀
