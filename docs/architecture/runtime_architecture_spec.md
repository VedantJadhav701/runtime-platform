# Runtime Architecture Specification v5.1 (Execution Governance Edition)

## 1. The Kernel Watchdog Architecture
We assume that execution can hang, deadlock, or enter infinite loops. The **ProcessWatchdog** is the kernel's mechanism for enforcing temporal containment.

### Escalation Tiers:
1. **Tier 1 (Warning)**: Telemetry alert at 80% of timeout limit.
2. **Tier 2 (Termination)**: Graceful `SIGTERM` sent to the process.
3. **Tier 3 (Elimination)**: Forced `SIGKILL` if process persists > 5s after Tier 2.
4. **Tier 4 (Classification)**: The failure is mapped to `TIMEOUT_FAILURE` in the **Failure Taxonomy**.

## 2. Timeout Policy Registry (`/policies`)
All execution limits are centralized in `timeouts.json`. 
- **Dependency Install**: 180s
- **Static Analysis**: 20s
- **Startup Validation**: 30s
- **Intent Extraction**: 15s

## 3. Liveness Heartbeats
For long-running executions (e.g., tests or migrations), the sandbox must emit a heartbeat. If the heartbeat is lost for `N` seconds, the Watchdog triggers a **Pre-emptive Escalation**.

## 4. Resource Governance (Future)
The Watchdog will eventually monitor CPU and Memory usage, triggering Tier 2 termination if thresholds are exceeded.
