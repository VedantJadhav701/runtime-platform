import os
import ast
import logging
import subprocess
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

logger = logging.getLogger("runtime.validation.engine")

from runtime.environment.failure_taxonomy.definitions import FailureType

class ValidationDetail(BaseModel):
    success: bool
    type: FailureType
    message: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ValidationResult(BaseModel):
    success: bool
    details: List[ValidationDetail] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ValidationEngine:
    """
    The Quality Gate.
    Verifies execution results and artifacts against technical integrity standards.
    """
    
    def validate(self, execution_result: Dict[str, Any], artifact_paths: List[str]) -> ValidationResult:
        """
        Performs multi-stage validation:
        1. Process Integrity (Exit Code)
        2. Artifact Persistence (File existence and size)
        3. Semantic Integrity (AST check)
        4. Static Analysis (Ruff check)
        """
        details = []
        overall_success = True

        # 1. Process Integrity
        exit_code = execution_result.get("exit_code", -1)
        if exit_code != 0:
            overall_success = False
            msg = f"Process failed with exit code {exit_code}"
            stderr = execution_result.get("stderr", "")
            
            # Sub-classify failure
            fail_type = FailureType.RUNTIME_FAILURE
            if "ModuleNotFoundError" in stderr or "ImportError" in stderr:
                fail_type = FailureType.DEPENDENCY_FAILURE
            elif "SyntaxError" in stderr:
                fail_type = FailureType.SYNTAX_FAILURE
                
            details.append(ValidationDetail(
                success=False,
                type=fail_type,
                message=msg,
                metadata={"stderr": stderr[:500]}
            ))
        else:
            details.append(ValidationDetail(success=True, type=FailureType.RUNTIME_FAILURE, message="Process exited cleanly"))

        # 2. Artifact Persistence
        for path in artifact_paths:
            if not os.path.exists(path):
                overall_success = False
                details.append(ValidationDetail(success=False, type=FailureType.VALIDATION_FAILURE, message=f"Missing artifact: {path}"))
                continue
            
            if os.path.getsize(path) == 0:
                overall_success = False
                details.append(ValidationDetail(success=False, type=FailureType.VALIDATION_FAILURE, message=f"Empty artifact: {path}"))
                continue

            # 3. Semantic Integrity (Python only for now)
            if path.endswith(".py"):
                is_valid_py, py_error = self._verify_python_syntax(path)
                if not is_valid_py:
                    overall_success = False
                    details.append(ValidationDetail(success=False, type=FailureType.SYNTAX_FAILURE, message=f"Syntax error in {path}: {py_error}"))
                else:
                    details.append(ValidationDetail(success=True, type=FailureType.SYNTAX_FAILURE, message=f"Syntax valid for {path}"))
                    
                    # 4. Static Analysis with Ruff
                    is_clean, ruff_error = self._verify_with_ruff(path)
                    if not is_clean:
                        overall_success = False
                        details.append(ValidationDetail(success=False, type=FailureType.LINT_FAILURE, message=f"Ruff violation in {path}: {ruff_error}"))
                    else:
                        details.append(ValidationDetail(success=True, type=FailureType.LINT_FAILURE, message=f"Ruff clean for {path}"))

        logger.info(f"Validation {'passed' if overall_success else 'failed'}. Details: {[d.type for d in details if not d.success]}")
        
        return ValidationResult(
            success=overall_success,
            details=details,
            metadata={
                "artifact_count": len(artifact_paths),
                "exit_code": exit_code
            }
        )

    def _verify_python_syntax(self, file_path: str) -> (bool, Optional[str]):
        """
        Uses AST to verify that a Python file has no syntax errors.
        """
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            ast.parse(content)
            return True, None
        except SyntaxError as e:
            return False, f"Line {e.lineno}: {e.msg}"
        except Exception as e:
            return False, str(e)

    def _verify_with_ruff(self, file_path: str) -> (bool, Optional[str]):
        """
        Runs ruff check on the file.
        """
        try:
            # Force UTF-8 encoding for subprocess output
            result = subprocess.run(
                ["ruff", "check", file_path, "--quiet", "--no-cache"],
                capture_output=True,
                text=True,
                encoding="utf-8",
                errors="replace"
            )
            if result.returncode != 0:
                # Return the first few lines of errors
                errors = "\n".join(result.stdout.splitlines()[:3]) if result.stdout else "Ruff linting violation detected."
                return False, errors
            return True, None
        except FileNotFoundError:
            logger.warning("Ruff command not found. Skipping static analysis.")
            return True, None
        except Exception as e:
            return False, str(e)
