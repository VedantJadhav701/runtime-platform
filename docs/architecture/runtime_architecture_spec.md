# Runtime Architecture Specification v5.3 (Environment Attestation Edition)

## 1. Sandbox Integrity Hashing
To prevent silent execution failures caused by environment decay, the platform implements **Attestation Hashing**.

### Hash Inputs:
- **Dependency Map**: The output of `pip freeze`.
- **Interpreter Metadata**: The timestamp and size of the `python` binary.
- **Critical Binaries**: Checksums of `ruff`, `pyright`, and other governance tools.

## 2. Pre-Execution Attestation
Before any `execute_command` call, the `VenvProvider` performs an **Integrity Check**:
1. **Recalculate**: Generate a fresh hash of the current sandbox.
2. **Compare**: Match against the `.integrity` file created during bootstrap.
3. **Validate**: If hashes mismatch, raise an `ENVIRONMENT_CORRUPTION` error.

## 3. Corruption Recovery Strategy
When attestation fails:
1. **Quarantine**: The corrupted sandbox is immediately moved to the quarantine zone.
2. **Re-Bootstrap**: The kernel triggers a fresh `BOOTSTRAP` phase to rebuild the environment from the `TaskSpec`.

## 4. Attestation Telemetry
Every successful attestation is broadcasted as a `CONFIDENCE_EVENT`, increasing the **Operational Trust** score of the current graph.
