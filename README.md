# Antigravity: Local AI Execution Operating System (v5.5)

[![Autonomous Infrastructure](https://img.shields.io/badge/Architecture-v5.5-blueviolet)](docs/architecture/runtime_architecture_spec.md)
[![Status](https://img.shields.io/badge/Status-Production--Hardened-success)]()
[![Governance](https://img.shields.io/badge/Governance-Watchdog--Enabled-amber)]()

Antigravity is a production-grade, local-first AI execution runtime designed for developers who require deterministic orchestration, autonomous self-healing, and absolute operational trust.

Unlike generic "AI coding tools," Antigravity is an **Execution Operating System**. It does not just suggest code; it governs its entire lifecycle—from intent extraction to autonomous delivery.

---

## 🏛️ Core Architectural Pillars

### 1. Execution Governance (Watchdogs)
The kernel maintains absolute authority over all sandboxed processes. Using tiered escalation (SIGTERM → SIGKILL), the **ProcessWatchdog** ensures that no generated code can hang or deadlock the host system.

### 2. Environment Attestation (Integrity)
Every virtual environment is cryptographically signed. The **AttestationEngine** performs SHA-256 integrity checks before every execution to detect environment decay or manual tampering.

### 3. Resilient Orchestration (Crash Recovery)
The system is built for high availability. Through atomic **State Checkpointing**, Antigravity can survive system crashes and resume complex orchestration tasks from the exact micro-step where they were interrupted.

### 4. Runtime Hygiene (Quarantine)
Antigravity manages its own resource lifecycle. Instead of immediate deletion, failed or stale environments are moved to a **Quarantine Zone**, preserving evidence for post-mortem analysis and "Flight Log" auditing.

### 5. Collaborative Delivery (GitProvider)
The final proof of success is delivery. Once a generation achieves a **Confidence Score > 80%**, the system autonomously initializes a repository, commits the changes, and pushes to a remote remote.

---

## 🔄 The 6-Step Autonomous Loop

The Antigravity Kernel orchestrates every task through a deterministic graph lifecycle:

1.  **SCAFFOLD**: Template-driven project initialization.
2.  **BOOTSTRAP**: Isolated `venv` creation with **Integrity Attestation**.
3.  **PROVISION**: Atomic dependency injection and feature composition.
4.  **JUDGE**: Multi-vector validation (Exit Codes, Artifacts, AST, Ruff).
5.  **SELF-HEAL**: Autonomous repair loops for dependency and style violations.
6.  **DELIVERY**: Git commit and push of the validated state.

---

## 🛠️ Technology Stack

- **Kernel**: Python 3.10+ (FastAPI, Pydantic V2, Asyncio)
- **Intelligence**: Local LLMs (via Ollama: Qwen2.5-Coder, Mistral)
- **Governance**: Ruff (Static Analysis), Psutil (Process Management)
- **Desktop**: Tauri, React, Tailwind CSS, Lucide Icons
- **Telemetry**: WebSocket-driven real-time graph visualization

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

### 3. Launch the Runtime
```bash
# Start the Backend Kernel
python -m runtime.api.server

# Start the Desktop Dashboard
bun run dev
```

---

## 📜 License
Antigravity is licensed under the [MIT License](LICENSE). Built for the era of Autonomous Infrastructure.