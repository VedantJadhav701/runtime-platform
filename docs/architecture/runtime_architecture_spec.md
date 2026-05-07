# Runtime Architecture Specification v5.5 (Collaborative Infrastructure Edition)

## 1. The GitProvider Interface
The system must manage Git repositories within the sandboxed environment to enable delivery.

### Atomic Operations:
- `Init`: Creating a local repository for every new scaffold.
- `Commit`: Capturing the validated state with structured, machine-generated commit messages.
- `Push`: Delivering the state to a remote URL (GitHub/GitLab).

## 2. The Delivery Gate
Code delivery is a **Privileged Operation**. The system only pushes if:
1. **Confidence Score > 80%**: Ensuring the code is validated and clean.
2. **Attestation Passed**: Ensuring the environment is uncorrupted.
3. **Watchdog Active**: Ensuring the Git process does not hang on authentication.

## 3. Collaboration Telemetry
Push events are broadcasted with the remote URL and commit hash, allowing the UI to provide a direct link to the delivered code.

## 4. Auth Governance
The GitProvider leverages the host system's existing Git credentials (SSH/GCM), ensuring it never handles raw tokens or passwords directly.
