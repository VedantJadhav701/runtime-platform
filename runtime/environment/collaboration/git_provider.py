import os
import subprocess
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("runtime.collaboration.git")

class GitProvider:
    """
    Autonomous Git Orchestrator (v5.5).
    Handles repository lifecycle: init, commit, and push.
    """
    def __init__(self, workspace_root: str):
        self.workspace_root = os.path.abspath(workspace_root)

    def init_repo(self, path: str) -> bool:
        """
        Initializes a git repository in the target path.
        """
        try:
            logger.info(f"Git: Initializing repo in {path}")
            subprocess.run(["git", "init"], cwd=path, check=True, capture_output=True)
            return True
        except Exception as e:
            logger.error(f"Git: Failed to init repo: {e}")
            return False

    def commit_all(self, path: str, message: str) -> bool:
        """
        Stages all changes and creates a commit.
        """
        try:
            logger.info(f"Git: Committing changes in {path}")
            subprocess.run(["git", "add", "."], cwd=path, check=True, capture_output=True)
            subprocess.run(["git", "commit", "-m", message], cwd=path, check=True, capture_output=True)
            return True
        except Exception as e:
            logger.error(f"Git: Failed to commit: {e}")
            return False

    def push(self, path: str, remote_url: str, branch: str = "main") -> bool:
        """
        Sets remote and pushes to the specified branch.
        """
        try:
            logger.info(f"Git: Pushing to {remote_url}")
            
            # Check if remote already exists
            remotes = subprocess.run(["git", "remote"], cwd=path, capture_output=True, text=True).stdout
            if "origin" in remotes:
                subprocess.run(["git", "remote", "remove", "origin"], cwd=path, check=True)
            
            subprocess.run(["git", "remote", "add", "origin", remote_url], cwd=path, check=True)
            
            # Ensure branch name is correct
            subprocess.run(["git", "branch", "-M", branch], cwd=path, check=True)
            
            # Push (Note: In a headless environment, this requires SSH keys or tokens configured)
            subprocess.run(["git", "push", "-u", "origin", branch], cwd=path, check=True, capture_output=True)
            return True
        except Exception as e:
            # We don't want to fail the entire task if push fails (e.g. auth issues),
            # but we'll log it as a delivery failure.
            logger.error(f"Git: Failed to push to {remote_url}: {e}")
            return False
