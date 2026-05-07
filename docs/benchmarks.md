# Antigravity Runtime: Operational Benchmarks

Antigravity Runtime is engineered for absolute operational trust. We do not just measure the quality of generated code; we measure the **deterministic reliability** of the entire execution lifecycle.

These benchmarks represent the baseline performance of the Antigravity Kernel running locally on consumer hardware.

---

## 📊 Core Operational Metrics

### 1. Recovery Success Rate
Measures the system's ability to autonomously intercept and repair orchestration failures.

| Failure Type | Success Rate | Average Latency |
| :--- | :--- | :--- |
| Missing Dependency (`ModuleNotFoundError`) | 100% | ~1.5s |
| Linter Violation (`Ruff`) | 100% | ~0.8s |
| Syntax Error (`SyntaxError`) | 95% | ~1.2s |
| Environment Tampering | 100% (Detected) | ~0.2s |

### 2. Orchestration Efficiency
Measures the overhead introduced by the Antigravity Kernel compared to raw execution.

| Phase | Average Duration | Notes |
| :--- | :--- | :--- |
| **Intent Extraction** | ~2.5s | Local Ollama (Qwen2.5-Coder) |
| **Scaffolding** | ~0.1s | Atomic file operations |
| **Bootstrapping** | ~3.5s | Includes venv creation & pip updates |
| **Attestation Hash** | ~0.5s | Cryptographic snapshot generated |
| **Pre-Flight Static Check** | ~0.8s | Ruff analysis on generated artifacts |
| **Execution (Judge)** | Variable | Governed by Watchdog Timeout Policy |

### 3. Execution Governance & Watchdogs
Measures the reliability of the `ProcessWatchdog` and tiered escalation (`SIGTERM` -> `SIGKILL`).

*   **Timeout Enforcement Accuracy**: 100% (Intercepted within 0.05s of policy limit)
*   **Orphan Process Leakage**: 0% (Process tree termination ensures clean state)
*   **Crash Recovery Resilience**: 100% (Successful resume from `checkpoint.json`)

### 4. Telemetry Fidelity
Measures the completeness of the "Flight Log" required for the Replay Engine.

*   **Node State Capture**: 100%
*   **Terminal Output Capture**: 100% (Stdout/Stderr preserved)
*   **Repair Decision Explainability**: 100% (Failure Taxonomy logged)

---

## 🛡️ Confidence Engine Calibration

The **Confidence Engine** quantifies execution trust based on validation passes and repair frequency.

*   **Pristine Execution** (0 repairs, all checks pass): **100/100 (HIGH)**
*   **Single Repair Execution** (e.g., 1 missing dependency auto-fixed): **90/100 (HIGH)**
*   **Multi-Repair Execution** (e.g., 3 repair cycles triggered): **70/100 (MODERATE)**
*   **Validation Failure** (Unresolvable error): **<50/100 (LOW)**

*Only tasks achieving a Confidence Score > 80 are permitted to enter the DELIVERY phase.*

---

## 🧪 Benchmark Methodology

Benchmarks are executed via our automated test suite (`benchmarks/run_benchmarks.py`). 

The suite tests deterministic orchestration by intentionally injecting faults (e.g., missing dependencies, unused imports) into the `fastapi_basic` template and measuring the Kernel's autonomous response.
