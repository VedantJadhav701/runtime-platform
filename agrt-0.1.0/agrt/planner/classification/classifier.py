import logging
import json
import os
from typing import Tuple, List, Optional
from agrt.planner.compiler.compiler import TaskSpecCompiler
from agrt.kernel.execution_graph.schemas import TaskSpec
from agrt.intelligence.providers.ollama.provider import OllamaProvider

logger = logging.getLogger("agrt.planner.classification")

class IntentClassifier:
    """
    Classifies natural language intent into structured parameters for TaskSpec compilation.
    """
    def __init__(self):
        self.compiler = TaskSpecCompiler()
        self.ollama = OllamaProvider()

    async def classify_and_compile(self, prompt: str) -> Optional[TaskSpec]:
        """
        1. Uses Ollama to extract template_id and features.
        2. Passes to TaskSpecCompiler.
        3. Handles validation errors and offline status.
        """
        logger.info(f"Classifying intent from prompt: '{prompt}'")

        try:
            # Read v1 prompt
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            prompt_path = os.path.join(base_dir, "intelligence", "prompts", "intent_extraction", "v1.txt")
            
            if not os.path.exists(prompt_path):
                raise FileNotFoundError(f"Intent extraction prompt not found at {prompt_path}")
                
            with open(prompt_path, "r") as f:
                v1_prompt = f.read()

            full_prompt = f"{v1_prompt}\n\nUSER_PROMPT: '{prompt}'"
            
            schema = {
                "type": "object",
                "properties": {
                    "project_type": {"type": "string"},
                    "template_id": {"type": "string"},
                    "features": {"type": "array", "items": {"type": "string"}},
                    "reasoning": {"type": "string"}
                },
                "required": ["project_type", "template_id", "features"]
            }

            try:
                extracted_data = await self.ollama.extract_json(full_prompt, schema)
            except Exception as e:
                logger.error(f"AI Planner offline or error: {e}")
                # Fallback to safe error message as per instructions
                raise ValueError("Orchestration Violation: AI Planner is offline. Please ensure Ollama is running.") from e
            
            project_type = extracted_data.get("project_type", "api")
            template_id = extracted_data.get("template_id", "fastapi_basic")
            features = extracted_data.get("features", [])

            # Compile into TaskSpec
            spec = self.compiler.compile(
                project_type=project_type,
                template_id=template_id,
                features=features
            )
            
            return spec

        except ValueError as e:
            logger.error(f"Orchestration Violation: {str(e)}")
            raise ValueError(f"Orchestration Violation: {str(e)}") from e
        except Exception as e:
            logger.error(f"Unexpected error in IntentClassifier: {str(e)}")
            raise
