import hashlib
import logging
from typing import Dict, Any

logger = logging.getLogger("runtime.environment.attestation")

class AttestationEngine:
    """
    Environment Attestation (v5.3).
    Provides cryptographic hashing of environment states to detect corruption or tampering.
    """
    
    @staticmethod
    def calculate_manifest_hash(package_manifest: str) -> str:
        """
        Generates a SHA-256 hash of the pip freeze output.
        """
        # Normalize manifest (strip whitespace and sort for deterministic hashing)
        lines = [line.strip() for line in package_manifest.splitlines() if line.strip()]
        normalized = "\n".join(sorted(lines))
        
        return hashlib.sha256(normalized.encode("utf-8")).hexdigest()

    @staticmethod
    def verify(manifest_hash: str, expected_hash: str) -> bool:
        """
        Compares the current hash against the stored integrity hash.
        """
        return manifest_hash == expected_hash
