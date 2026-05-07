import os
import venv
import subprocess
import asyncio
import shutil
import logging
import sys
from typing import Optional, Dict, Any
from runtime.shared.interfaces.base import SandboxInterface

from runtime.kernel.watchdog.process_watchdog import ProcessWatchdog
from runtime.environment.sandbox.attestation import AttestationEngine

logger = logging.getLogger("runtime.environment.venv")

class VenvProvider(SandboxInterface):
    """
    Implementation of SandboxInterface using Python's native venv module.
    Provides isolation at the library level.
    """
    def __init__(self, session_id: str, workspace_root: str, watchdog: Optional[ProcessWatchdog] = None):
        self.session_id = session_id
        self.workspace_root = workspace_root
        self.venv_dir = os.path.join(workspace_root, ".runtime", "environments", session_id)
        self.watchdog = watchdog or ProcessWatchdog()
        self.integrity_file = os.path.join(self.venv_dir, ".integrity")
        
        # OS-specific paths
        if sys.platform == "win32":
            self.python_executable = os.path.join(self.venv_dir, "Scripts", "python.exe")
            self.pip_executable = os.path.join(self.venv_dir, "Scripts", "pip.exe")
        else:
            self.python_executable = os.path.join(self.venv_dir, "bin", "python")
            self.pip_executable = os.path.join(self.venv_dir, "bin", "pip")

    async def bootstrap(self, config: Optional[Dict[str, Any]] = None) -> bool:
        """
        CREATE: Initialize the venv.
        PROVISION: Install base requirements and generate attestation.
        """
        try:
            logger.info(f"Creating venv in {self.venv_dir}")
            os.makedirs(os.path.dirname(self.venv_dir), exist_ok=True)
            
            # Use --clear as per spec
            venv.create(self.venv_dir, with_pip=True, clear=True)
            
            # PROVISION: Update pip and setuptools
            await self.execute_command(
                f"{self.python_executable} -m pip install --upgrade pip setuptools",
                operation_type="dependency_install"
            )
            
            # ATTESTATION: Generate .integrity file (v5.3)
            await self._generate_attestation()
            
            return True
        except Exception as e:
            logger.error(f"Failed to bootstrap venv: {e}")
            return False

    async def _generate_attestation(self):
        """
        Captures the initial state of the environment.
        """
        result = await self.execute_command(f"{self.python_executable} -m pip freeze")
        manifest_hash = AttestationEngine.calculate_manifest_hash(result.get("stdout", ""))
        
        with open(self.integrity_file, "w") as f:
            f.write(manifest_hash)
        logger.info(f"Attestation generated: {self.integrity_file}")

    async def validate_integrity(self) -> bool:
        """
        Re-runs pip freeze and compares against the stored .integrity hash.
        """
        if not os.path.exists(self.integrity_file):
            logger.warning(f"Integrity check failed: .integrity file missing for {self.session_id}")
            return False

        with open(self.integrity_file, "r") as f:
            expected_hash = f.read().strip()

        result = await self.execute_command(f"{self.python_executable} -m pip freeze")
        current_hash = AttestationEngine.calculate_manifest_hash(result.get("stdout", ""))
        
        is_valid = AttestationEngine.verify(current_hash, expected_hash)
        if not is_valid:
            logger.error(f"Integrity violation detected in environment {self.session_id}")
            
        return is_valid

    async def execute_command(self, command: str, operation_type: str = "command_execution_default") -> Dict[str, Any]:
        """
        EXECUTE: Run commands via the venv's python or pip under watchdog governance.
        """
        logger.info(f"Executing in venv [{operation_type}]: {command}")
        
        env = os.environ.copy()
        # Add venv bin dir to PATH
        bin_dir = os.path.dirname(self.python_executable)
        env["PATH"] = bin_dir + os.pathsep + env.get("PATH", "")
        env["VIRTUAL_ENV"] = self.venv_dir
        
        process = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            env=env,
            cwd=self.workspace_root
        )
        
        # Use Watchdog for governed execution (v5.1 blueprint)
        result = await self.watchdog.watch_process(process, operation_type)
        
        return result

    async def upload_file(self, source: str, destination: str) -> bool:
        try:
            full_dest = os.path.join(self.workspace_root, destination)
            os.makedirs(os.path.dirname(full_dest), exist_ok=True)
            shutil.copy2(source, full_dest)
            return True
        except Exception as e:
            logger.error(f"Failed to upload file: {e}")
            return False

    async def download_file(self, source: str, destination: str) -> bool:
        try:
            full_source = os.path.join(self.workspace_root, source)
            shutil.copy2(full_source, destination)
            return True
        except Exception as e:
            logger.error(f"Failed to download file: {e}")
            return False

    async def create_snapshot(self) -> str:
        """
        SNAPSHOT: Store the current pip freeze state.
        """
        result = await self.execute_command(f"{self.pip_executable} freeze")
        snapshot_id = f"snapshot_{int(asyncio.get_event_loop().time())}"
        snapshot_path = os.path.join(self.venv_dir, f"{snapshot_id}.txt")
        
        with open(snapshot_path, "w") as f:
            f.write(result["stdout"])
            
        return snapshot_id

    async def restore_snapshot(self, snapshot_id: str) -> bool:
        """
        ROLLBACK: Revert to the previous pip freeze state.
        """
        snapshot_path = os.path.join(self.venv_dir, f"{snapshot_id}.txt")
        if not os.path.exists(snapshot_path):
            logger.error(f"Snapshot {snapshot_id} not found")
            return False
            
        # Uninstall everything first or just install -r with force?
        # A safer way is to clear and reinstall from snapshot, 
        # but spec says "revert to previous pip freeze state".
        # We'll use pip install -r snapshot.txt
        result = await self.execute_command(f"{self.pip_executable} install -r {snapshot_path}")
        return result["exit_code"] == 0

    async def cleanup(self) -> bool:
        """
        Delete the venv directory.
        """
        try:
            if os.path.exists(self.venv_dir):
                # On Windows, we might have issues deleting files in use
                # We'll try our best
                shutil.rmtree(self.venv_dir)
            return True
        except Exception as e:
            logger.error(f"Failed to cleanup venv: {e}")
            return False
