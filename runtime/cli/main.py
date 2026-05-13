import argparse
import sys
import os
import asyncio
import logging
from typing import List

# Internal Imports
from runtime.kernel.lifecycle.engine import LifecycleEngine
from runtime.kernel.execution_graph.schemas import TaskSpec
from runtime.api.websocket.handler import TelemetryManager

# Configure Logging for CLI
logging.basicConfig(
    level=logging.INFO,
    format="%(message)s"
)
logger = logging.getLogger("agrt")

class AgrtCLI:
    def __init__(self):
        self.parser = argparse.ArgumentParser(
            description="Antigravity Runtime (agrt) - Autonomous Local Execution Infrastructure",
            formatter_class=argparse.RawDescriptionHelpFormatter
        )
        self.subparsers = self.parser.add_subparsers(dest="command", help="Operational commands")
        self._setup_commands()

    def _setup_commands(self):
        # agrt doctor
        self.subparsers.add_parser("doctor", help="Check workspace health and dependency status")

        # agrt run
        run_parser = self.subparsers.add_parser("run", help="Execute an autonomous task specification")
        run_parser.add_argument("--template", "-t", required=True, help="Task template ID (e.g., fastapi_basic)")
        run_parser.add_argument("--features", "-f", nargs="*", help="List of features/dependencies to inject")
        run_parser.add_argument("--delivery", "-d", help="Delivery URL (git remote)")

        # agrt replay
        replay_parser = self.subparsers.add_parser("replay", help="Replay an execution session")
        replay_parser.add_argument("session_id", nargs="?", help="Specific session ID to replay")

        # agrt logs
        logs_parser = self.subparsers.add_parser("logs", help="View telemetry and repair logs")
        logs_parser.add_argument("session_id", nargs="?", help="Specific session ID to view logs for")

    def run(self):
        args = self.parser.parse_args()
        if not args.command:
            self.parser.print_help()
            return

        # Execute Command
        if args.command == "doctor":
            self.do_doctor()
        elif args.command == "run":
            asyncio.run(self.do_run(args))
        elif args.command == "replay":
            self.do_replay(args)
        elif args.command == "logs":
            self.do_logs(args)
        else:
            logger.error(f"Unknown command: {args.command}")
            sys.exit(1)

    def do_doctor(self):
        print("\n[🩺  AGRT DOCTOR - SYSTEM DIAGNOSTICS]")
        print("-" * 40)
        
        # Check Workspace
        ws_ok = os.path.exists(".runtime")
        print(f"Workspace Infrastructure: {'✅ OK' if ws_ok else '⚠️  Missing (.runtime)'}")
        
        # Check Python
        print(f"Python Version:         {sys.version.split()[0]}")
        
        # Check Artifacts
        art_path = "runtime/artifacts"
        art_ok = os.path.exists(art_path)
        print(f"Artifact Store:         {'✅ OK' if art_ok else '❌ Missing'}")
        
        # Check templates
        temp_path = "runtime/generation/templates"
        temp_ok = os.path.exists(temp_path) and len(os.listdir(temp_path)) > 0
        print(f"Project Templates:      {'✅ OK' if temp_ok else '❌ Missing/Empty'}")

        print("-" * 40)
        if ws_ok and art_ok and temp_ok:
            print("✨ System is operational.")
        else:
            print("❌ System health check failed. Please re-run setup.")

    async def do_run(self, args):
        print(f"\n[🚀  AGRT RUN - INITIATING TASK]")
        print("-" * 40)
        print(f"Template: {args.template}")
        print(f"Features: {args.features or []}")
        print("-" * 40)

        telemetry = TelemetryManager()
        engine = LifecycleEngine(telemetry)
        
        task_spec = TaskSpec(
            project_type="custom", # Default to custom for CLI
            template_id=args.template,
            features=args.features or [],
            delivery_url=args.delivery
        )

        report = await engine.run_task(task_spec)
        
        print("\n[🏁  TASK COMPLETED]")
        print(f"ID:      {report.task_id}")
        print(f"Success: {'✅ YES' if report.success else '❌ NO'}")
        print(f"Latency: {report.execution_time:.2f}s")
        if report.errors:
            print(f"Errors:  {report.errors[0]}")

    def do_replay(self, args):
        print(f"\n[⏪  AGRT REPLAY - SESSION RETRIEVAL]")
        # Placeholder for replay logic
        print("Replay functionality is available via the Desktop HUD.")
        print("CLI replay stabilization in progress.")

    def do_logs(self, args):
        print(f"\n[📜  AGRT LOGS - TELEMETRY VIEW]")
        # Placeholder for logs logic
        print("Use 'agrt inspect <id>' for full flight log details.")

def main():
    cli = AgrtCLI()
    cli.run()

if __name__ == "__main__":
    main()
