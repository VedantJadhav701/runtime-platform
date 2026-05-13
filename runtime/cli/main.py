import argparse
import sys
import os
import asyncio
import logging
import json
import time
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

# Force UTF-8 for Windows console to support basic symbols if needed, 
# but we will minimize emoji usage for maximum compatibility.
if sys.platform == "win32":
    try:
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    except Exception:
        pass

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

        # agrt list
        self.subparsers.add_parser("list", help="List all autonomous execution sessions")

        # agrt inspect
        inspect_parser = self.subparsers.add_parser("inspect", help="Inspect a specific execution flight log")
        inspect_parser.add_argument("session_id", help="Session ID to inspect")

        # agrt run
        run_parser = self.subparsers.add_parser("run", help="Execute an autonomous task specification")
        run_parser.add_argument("--template", "-t", required=True, help="Task template ID (e.g., fastapi_basic)")
        run_parser.add_argument("--features", "-f", nargs="*", help="List of features/dependencies to inject")
        run_parser.add_argument("--delivery", "-d", help="Delivery URL (git remote)")

        # agrt validate
        validate_parser = self.subparsers.add_parser("validate", help="Validate technical integrity of a directory")
        validate_parser.add_argument("path", help="Directory or file path to validate")

        # agrt benchmark
        self.subparsers.add_parser("benchmark", help="Run operational performance benchmarks")

        # agrt replay
        replay_parser = self.subparsers.add_parser("replay", help="Replay an execution session")
        replay_parser.add_argument("session_id", nargs="?", help="Specific session ID to replay")

        # agrt logs
        logs_parser = self.subparsers.add_parser("logs", help="View telemetry and repair logs")
        logs_parser.add_argument("session_id", help="Specific session ID to view logs for")

    def run(self):
        args = self.parser.parse_args()
        if not args.command:
            self.parser.print_help()
            return

        # Execute Command
        if args.command == "doctor":
            self.do_doctor()
        elif args.command == "list":
            self.do_list()
        elif args.command == "inspect":
            self.do_inspect(args)
        elif args.command == "run":
            asyncio.run(self.do_run(args))
        elif args.command == "validate":
            self.do_validate(args)
        elif args.command == "benchmark":
            asyncio.run(self.do_benchmark())
        elif args.command == "replay":
            self.do_replay(args)
        elif args.command == "logs":
            self.do_logs(args)
        else:
            logger.error(f"Unknown command: {args.command}")
            sys.exit(1)

    def do_list(self):
        print("\n[AGRT LIST - EXECUTION SESSIONS]")
        print(f"{'SESSION ID':<30} | {'STATUS':<10} | {'TIMESTAMP'}")
        print("-" * 70)
        
        report_dir = "runtime/artifacts/execution_reports"
        if not os.path.exists(report_dir):
            print("No sessions found.")
            return

        for filename in sorted(os.listdir(report_dir), reverse=True):
            if filename.endswith(".json"):
                path = os.path.join(report_dir, filename)
                try:
                    with open(path, "r") as f:
                        data = json.load(f)
                        report = data.get("report", {})
                        session_id = report.get("task_id", filename.replace(".json", ""))
                        success = "PASS" if report.get("success") else "FAIL"
                        timestamp = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(data.get("timestamp", 0)))
                        print(f"{session_id:<30} | {success:<10} | {timestamp}")
                except:
                    continue

    def do_inspect(self, args):
        print(f"\n[AGRT INSPECT - FLIGHT LOG: {args.session_id}]")
        print("-" * 70)
        
        path = f"runtime/artifacts/execution_reports/{args.session_id}.json"
        if not os.path.exists(path):
            logger.error(f"Flight log not found: {args.session_id}")
            return

        with open(path, "r") as f:
            data = json.load(f)
            
        report = data.get("report", {})
        confidence = data.get("confidence", {})
        graph = data.get("graph", {})

        print(f"Status:     {'PASS' if report.get('success') else 'FAIL'}")
        print(f"Latency:    {report.get('execution_time', 0):.2f}s")
        print(f"Confidence: {confidence.get('score', 0)}% ({confidence.get('status', 'unknown').upper()})")
        
        print("\n[Confidence Grounds]")
        for reason in confidence.get("reasons", []):
            print(f"  - {reason}")

        print("\n[Execution Graph]")
        nodes = graph.get("nodes", {})
        for node_id, node in sorted(nodes.items(), key=lambda x: int(x[0].split("_")[1])):
            status = "OK" if node.get("status") == "completed" else "ERR" if node.get("status") == "failed" else "..."
            print(f"  [{status}] {node.get('action'):<10} | {node.get('status'):<10}")
            if node.get("error"):
                print(f"     └─ Error: {node.get('error')}")

        if report.get("errors"):
            print("\n[Terminal Errors]")
            for err in report.get("errors"):
                print(f"  ! {err}")

    def do_validate(self, args):
        print(f"\n[AGRT VALIDATE - INTEGRITY GATE: {args.path}]")
        print("-" * 70)
        
        from runtime.environment.validation.engine import ValidationEngine
        validator = ValidationEngine()
        
        files_to_validate = []
        ignore_dirs = {".runtime", "node_modules", "__pycache__", ".git"}
        
        if os.path.isfile(args.path):
            files_to_validate.append(args.path)
        else:
            for root, dirs, files in os.walk(args.path):
                dirs[:] = [d for d in dirs if d not in ignore_dirs]
                for f in files:
                    if f.endswith(".py"):
                        files_to_validate.append(os.path.join(root, f))

        if not files_to_validate:
            print("No Python files found to validate.")
            return

        overall_success = True
        for path in files_to_validate:
            rel_path = os.path.relpath(path, args.path)
            print(f"Validating {rel_path} ... ", end="", flush=True)
            res = validator.validate({"exit_code": 0}, [path])
            if res.success:
                print("OK")
            else:
                print("FAIL")
                overall_success = False
                for detail in res.details:
                    if not detail.success:
                        print(f"   └─ {detail.type}: {detail.message}")

        print("-" * 70)
        if overall_success:
            print("System integrity verified.")
        else:
            print("Validation failed for one or more artifacts.")

    async def do_benchmark(self):
        print(f"\n[AGRT BENCHMARK - OPERATIONAL PERFORMANCE]")
        print("-" * 70)
        from benchmarks.run_benchmarks import BenchmarkRunner
        runner = BenchmarkRunner()
        
        await runner.run_scenario(
            "Pristine Execution",
            TaskSpec(project_type="api", template_id="fastapi_basic", features=["fastapi", "uvicorn"])
        )
        await runner.run_scenario(
            "Dependency Repair",
            TaskSpec(project_type="api", template_id="fastapi_basic", features=["uvicorn"])
        )
        runner.save_report()

    def do_logs(self, args):
        print(f"\n[AGRT LOGS - TELEMETRY: {args.session_id}]")
        print("-" * 70)
        
        path = f"runtime/artifacts/execution_reports/{args.session_id}.json"
        if not os.path.exists(path):
            logger.error(f"Session not found: {args.session_id}")
            return

        with open(path, "r") as f:
            data = json.load(f)
            
        graph = data.get("graph", {})
        nodes = graph.get("nodes", {})
        
        for node_id, node in sorted(nodes.items(), key=lambda x: int(x[0].split("_")[1])):
            print(f"[{node.get('action')}]")
            output = node.get("output")
            if output:
                if isinstance(output, dict):
                    if "stdout" in output and output["stdout"]:
                        print(f"  STDOUT: {output['stdout'].strip()}")
                    if "stderr" in output and output["stderr"]:
                        print(f"  STDERR: {output['stderr'].strip()}")
                    if "message" in output:
                        print(f"  INFO: {output['message']}")
                else:
                    print(f"  DATA: {output}")
            
            if node.get("error"):
                print(f"  ERROR: {node.get('error')}")
            print()

    def do_doctor(self):
        print("\n[AGRT DOCTOR - SYSTEM DIAGNOSTICS]")
        print("-" * 40)
        
        ws_ok = os.path.exists(".runtime")
        print(f"Workspace Infrastructure: {'OK' if ws_ok else 'Missing (.runtime)'}")
        print(f"Python Version:         {sys.version.split()[0]}")
        
        art_path = "runtime/artifacts"
        art_ok = os.path.exists(art_path)
        print(f"Artifact Store:         {'OK' if art_ok else 'Missing'}")
        
        temp_path = "runtime/generation/templates"
        temp_ok = os.path.exists(temp_path) and len(os.listdir(temp_path)) > 0
        print(f"Project Templates:      {'OK' if temp_ok else 'Missing/Empty'}")

        print("-" * 40)
        if ws_ok and art_ok and temp_ok:
            print("System is operational.")
        else:
            print("System health check failed. Please re-run setup.")

    async def do_run(self, args):
        print(f"\n[AGRT RUN - INITIATING TASK]")
        print("-" * 40)
        print(f"Template: {args.template}")
        print(f"Features: {args.features or []}")
        print("-" * 40)

        telemetry = TelemetryManager()
        engine = LifecycleEngine(telemetry)
        
        task_spec = TaskSpec(
            project_type="custom",
            template_id=args.template,
            features=args.features or [],
            delivery_url=args.delivery
        )

        report = await engine.run_task(task_spec)
        
        print("\n[TASK COMPLETED]")
        print(f"ID:      {report.task_id}")
        print(f"Success: {'YES' if report.success else 'NO'}")
        print(f"Latency: {report.execution_time:.2f}s")
        if report.errors:
            print(f"Errors:  {report.errors[0]}")

    def do_replay(self, args):
        print(f"\n[AGRT REPLAY - SESSION RETRIEVAL]")
        print("Replay functionality is available via the Desktop HUD.")
        print("CLI replay stabilization in progress.")

def main():
    cli = AgrtCLI()
    cli.run()

if __name__ == "__main__":
    main()
