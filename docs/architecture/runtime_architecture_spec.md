# Runtime Architecture Specification v5.4 (Resilient Orchestration Edition)

## 1. State Checkpointing
The kernel must persist its internal state after every significant progress milestone to enable recovery.

### Checkpoint Trigger:
A `checkpoint.json` is updated in the session directory whenever:
- A `Lifecycle Transition` occurs.
- An `ExecutionNode` moves to the `COMPLETED` state.

## 2. Session Resumption Logic
On boot, the kernel performs a **Recovery Scan**:
1. **Identify**: Find folders in `.runtime/sessions/` containing a `checkpoint.json` but no `report.json`.
2. **Re-Attest**: Run `EnvironmentAttestation` on the resumed sandbox.
3. **Restore**: Deserialize the `ExecutionGraph` and set the kernel state to the last checkpointed phase.
4. **Continue**: Resume the autonomous loop from the first `IDLE` or `REPAIRABLE` node.

## 3. Resilience Constraints
- **One-Time Resume**: A session can only be resumed once. If it crashes again during the resumed run, it is moved to quarantine.
- **Integrity Lock**: If attestation fails on resume, the session is abandoned.

## 4. Recovery Telemetry
Resumed tasks are flagged with a `RECOVERY_TRUE` metadata tag, allowing the UI to highlight the "Resurrected" portion of the timeline.
