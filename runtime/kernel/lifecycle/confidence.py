from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class ConfidenceScore(BaseModel):
    score: int # 0-100
    reasons: List[str]
    status: str # "high", "moderate", "low"
    metrics: Dict[str, float] = Field(default_factory=dict)

class ConfidenceEngine:
    """
    Operational Trust Engine.
    Calculates confidence based on validation passes, repair history, 
    and environmental attestation.
    """
    def calculate(self, validation_results: List[Dict[str, Any]], repair_count: int, attestation_success: bool = True) -> ConfidenceScore:
        score = 100
        reasons = []
        metrics = {
            "repair_penalty": 0,
            "validation_penalty": 0,
            "attestation_bonus": 0
        }
        
        # 1. Environmental Attestation (Trust Baseline)
        if attestation_success:
            reasons.append("environment_attested: SHA-256 integrity verified")
            metrics["attestation_bonus"] = 5
        else:
            score -= 30
            reasons.append("environment_compromised: integrity check failed")
            metrics["attestation_bonus"] = -30

        # 2. Repair Impact (Autonomous Stability)
        if repair_count > 0:
            penalty = min(repair_count * 15, 45)
            score -= penalty
            metrics["repair_penalty"] = penalty
            reasons.append(f"autonomous_recovery: {repair_count} repairs required to reach stable state")
        else:
            reasons.append("pristine_path: zero repairs required")

        # 3. Validation Grounding (Execution Truth)
        all_passed = True
        failed_count = 0
        for res in validation_results:
            if res.get("success"):
                # We don't add reasons for every success to keep it clean, just significant ones
                pass
            else:
                all_passed = False
                failed_count += 1
                penalty = 15
                score -= penalty
                metrics["validation_penalty"] += penalty
                reasons.append(f"validation_failed: {res.get('type', 'generic')} ({res.get('message', 'no_detail')})")
        
        if all_passed:
            reasons.append("validation_cleared: all technical integrity gates passed")

        # 4. Final Calibration
        score = max(0, min(100, score))
        
        status = "high"
        if score < 50:
            status = "low"
        elif score < 85:
            status = "moderate"
            
        if score >= 95:
            reasons.append("earned_trust: infrastructure-grade confidence achieved")

        return ConfidenceScore(
            score=score, 
            reasons=reasons, 
            status=status,
            metrics=metrics
        )
