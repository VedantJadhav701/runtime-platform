import asyncio
import os
import sys
import logging
from scripts.golden_workflow import run_golden_workflow

# Ensure we can import from the root
sys.path.append(os.getcwd())

async def main():
    """
    🚀 ANTIGRAVITY RUNTIME: DEMO MODE
    Paces the execution for visual clarity in the Desktop UI and Replay Engine.
    """
    # Set pacing via environment variable for the Golden Workflow
    os.environ["AG_DEMO_PACING"] = "1.5"
    
    print("\n" + "!"*70)
    print("!!! RUNNING IN DEMO MODE - PACED FOR VISUAL AUDIT !!!")
    print("!"*70 + "\n")
    
    # Run the hardened golden workflow with slower pacing
    await run_golden_workflow(pacing=1.5)

if __name__ == "__main__":
    asyncio.run(main())
