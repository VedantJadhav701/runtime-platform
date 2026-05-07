import json
import os
import logging
from typing import Dict, Any

logger = logging.getLogger("runtime.kernel.watchdog")

class TimeoutPolicy:
    """
    Centralized timeout governance.
    Loads policies from runtime/kernel/policies/timeouts.json.
    """
    def __init__(self, policy_path: str = None):
        if not policy_path:
            # Default path relative to this file
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            policy_path = os.path.join(base_dir, "policies", "timeouts.json")
            
        self.policy_path = policy_path
        self.policies = self._load_policies()

    def _load_policies(self) -> Dict[str, int]:
        try:
            with open(self.policy_path, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to load timeout policies from {self.policy_path}: {e}")
            # Safe fallbacks if file is missing
            return {
                "command_execution_default": 60,
                "dependency_install": 180
            }

    def get_timeout(self, operation: str) -> int:
        timeout = self.policies.get(operation, self.policies.get("command_execution_default", 60))
        return timeout
