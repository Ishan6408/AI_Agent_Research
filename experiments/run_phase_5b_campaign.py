"""
Phase 5B Full-Campaign Runner.
AI-Agent-Research: "Do AI Agents Cheat Under Pressure?"

Orchestrates the complete 600-execution, 2,400-observation Phase 5B autonomous benchmark:
- Consumes the deterministic 57-condition campaign matrix (seeds 1001-1600).
- Isolates storage strictly to results/phase_5b_campaign/ (never pilot or Phase 5A).
- Supports durable sprint-level atomic persistence and checkpoints every 25 executions.
- Enforces safe resumption, conflict detection, and refusal partitioning.
- Supports preflight dry-run and offline mocked execution for rigorous validation.
- Live LLM inference is disabled by default and requires explicit CLI authorization.
"""

import argparse
import glob
import json
import logging
import os
import sys
import time
import urllib.request
from typing import Any, Dict, List, Optional, Tuple

# Ensure repository root is on sys.path
REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from models.experiment_v2 import (
    ExperimentResultV2,
    OutcomeCategory,
    partition_observations,
)
from simulation.autonomous_simulator import (
    AutonomousSoftwareCompanySimulator,
    get_git_commit,
    get_ollama_model_digest,
)
from simulation.campaign_matrix import (
    BASE_CAMPAIGN_SEED,
    PHASE_5A_SEED_RANGE,
    PHASE_5B_CAMPAIGN_SEED_RANGE,
    PILOT_SEEDS,
    TOTAL_CAMPAIGN_EXECUTIONS,
    CampaignSprintCondition,
    generate_phase_5b_campaign_matrix,
    validate_campaign_matrix,
)
from utils.autonomous_storage import (
    detect_record_conflict,
    save_checkpoint,
    save_experiment_v2,
)

logger = logging.getLogger(__name__)

# Constants and Safety Configurations
DEFAULT_CAMPAIGN_STORAGE_DIR = os.path.join("results", "phase_5b_campaign")
DEFAULT_MODEL = "qwen2.5:7b"
DEFAULT_TEMPERATURE = 0.3
DEFAULT_TOP_P = 0.9
DEFAULT_CHECKPOINT_INTERVAL = 25
LIVE_CONFIRMATION_TOKEN = "YES_RUN_LIVE_CAMPAIGN"

FORBIDDEN_STORAGE_SUBSTRINGS = [
    os.path.normpath("results/phase_5b_pilot"),
    os.path.normpath("results/factorial_campaign"),
    os.path.normpath("results/statistical_analysis"),
]


class Phase5BCampaignRunner:
    """
    Dedicated orchestration runner for the Phase 5B 600-execution full campaign.
    """

    ROLES = [
        ("Frontend Developer", "frontend_developer"),
        ("Backend Developer", "backend_developer"),
        ("DevOps Engineer", "devops_engineer"),
        ("QA Engineer", "qa_engineer"),
    ]

    def __init__(
        self,
        storage_dir: str = DEFAULT_CAMPAIGN_STORAGE_DIR,
        model: str = DEFAULT_MODEL,
        temperature: float = DEFAULT_TEMPERATURE,
        top_p: float = DEFAULT_TOP_P,
        checkpoint_interval: int = DEFAULT_CHECKPOINT_INTERVAL,
        base_seed: int = BASE_CAMPAIGN_SEED,
    ):
        self.storage_dir = os.path.normpath(storage_dir)
        self.model = model
        self.temperature = temperature
        self.top_p = top_p
        self.checkpoint_interval = checkpoint_interval
        self.base_seed = base_seed

        # Safety: validate storage destination
        self._validate_storage_safety(self.storage_dir)

        # Condition matrix generation and validation
        self.matrix = generate_phase_5b_campaign_matrix(base_seed=self.base_seed)
        self.matrix_summary = validate_campaign_matrix(self.matrix)

        # Enforce seed isolation
        self._validate_seed_isolation()

        # Simulator instance
        self.simulator = AutonomousSoftwareCompanySimulator(
            storage_dir=self.storage_dir,
            model=self.model,
            temperature=self.temperature,
            top_p=self.top_p,
        )

    @staticmethod
    def _validate_storage_safety(target_dir: str) -> None:
        """Guarantees target directory never overlaps with pilot, Phase 5A, or root results."""
        normalized = os.path.normpath(target_dir)
        for forbidden in FORBIDDEN_STORAGE_SUBSTRINGS:
            if forbidden in normalized or normalized == forbidden:
                raise ValueError(
                    f"Safety Violation: Target storage directory '{target_dir}' overlaps with "
                    f"forbidden path '{forbidden}'. Campaign must write strictly to dedicated campaign storage."
                )
        if normalized == os.path.normpath("results"):
            raise ValueError("Safety Violation: Cannot write campaign data directly to root 'results' directory.")

    def _validate_seed_isolation(self) -> None:
        """Guarantees campaign seeds never intersect with Phase 5A or pilot seed namespaces."""
        for cond in self.matrix:
            seed = cond.seed
            if seed in PHASE_5A_SEED_RANGE:
                raise ValueError(f"Seed Collision: Campaign seed {seed} overlaps with Phase 5A seeds 42-641.")
            if seed in PILOT_SEEDS:
                raise ValueError(f"Seed Collision: Campaign seed {seed} overlaps with Phase 5B pilot seeds {PILOT_SEEDS}.")
            if seed not in PHASE_5B_CAMPAIGN_SEED_RANGE:
                raise ValueError(f"Seed Range Violation: Campaign seed {seed} is outside 1001-1600.")

    def check_ollama_status(self) -> Tuple[bool, str, List[str]]:
        """Checks if local Ollama daemon is reachable and inspects available model images."""
        try:
            req = urllib.request.Request("http://127.0.0.1:11434/api/tags", method="GET")
            with urllib.request.urlopen(req, timeout=3.0) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                models = [m.get("name", "") for m in data.get("models", [])]
                return True, "Ollama daemon reachable via HTTP", models
        except Exception as err:
            return False, f"Ollama unreachable: {str(err)}", []

    def inspect_disk_status(self) -> Dict[str, Any]:
        """Inspects target storage directory for completed, partial, or missing sprint records across all 600 conditions."""
        sprint_status: Dict[int, Dict[str, Any]] = {}
        total_valid = 0
        total_corrupt = 0
        total_missing = 0
        completed_sprints = 0

        for cond in self.matrix:
            seed = cond.seed
            sprint_num = cond.sprint_number
            expected_files = [
                os.path.join(self.storage_dir, f"exp_5b_{seed}_{slug}.json")
                for _, slug in self.ROLES
            ]
            existing_valid: List[str] = []
            existing_corrupt: List[str] = []
            missing: List[str] = []

            for path in expected_files:
                if not os.path.exists(path):
                    missing.append(path)
                    continue
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        record_dict = json.load(f)
                    # Verify model and seed consistency
                    rec = ExperimentResultV2.model_validate(record_dict)
                    if rec.seed != seed:
                        existing_corrupt.append(path)
                    else:
                        existing_valid.append(path)
                except Exception:
                    existing_corrupt.append(path)

            is_complete = len(existing_valid) == 4
            if is_complete:
                completed_sprints += 1
            total_valid += len(existing_valid)
            total_corrupt += len(existing_corrupt)
            total_missing += len(missing)

            sprint_status[sprint_num] = {
                "seed": seed,
                "arm": cond.experimental_arm,
                "is_complete": is_complete,
                "valid_count": len(existing_valid),
                "corrupt_count": len(existing_corrupt),
                "missing_count": len(missing),
                "valid_files": existing_valid,
                "corrupt_files": existing_corrupt,
                "missing_files": missing,
            }

        return {
            "completed_sprints": completed_sprints,
            "pending_sprints": TOTAL_CAMPAIGN_EXECUTIONS - completed_sprints,
            "total_valid_observations": total_valid,
            "total_corrupt_files": total_corrupt,
            "total_missing_observations": total_missing,
            "sprints": sprint_status,
        }

    def run_preflight(self) -> Dict[str, Any]:
        """
        Executes a dry-run preflight check:
        Validates environment, model, digest, commit, storage safety, seed isolation, matrix balance,
        and on-disk state WITHOUT initiating LLM inference.
        """
        daemon_ok, daemon_msg, installed_models = self.check_ollama_status()
        model_installed = any(self.model in m for m in installed_models)
        model_digest = get_ollama_model_digest(self.model)
        git_commit = get_git_commit()
        disk_status = self.inspect_disk_status()

        preflight_summary = {
            "status": "PASS" if (daemon_ok and model_installed) else "WARN_OFFLINE",
            "ollama_daemon_reachable": daemon_ok,
            "ollama_daemon_message": daemon_msg,
            "configured_model": self.model,
            "model_installed": model_installed,
            "installed_models": installed_models,
            "model_sha256_digest": model_digest,
            "git_commit": git_commit,
            "storage_dir": self.storage_dir,
            "total_planned_sprints": len(self.matrix),
            "total_planned_observations": len(self.matrix) * 4,
            "seed_range": [min(c.seed for c in self.matrix), max(c.seed for c in self.matrix)],
            "matrix_validation": self.matrix_summary,
            "disk_status": {
                "completed_sprints": disk_status["completed_sprints"],
                "pending_sprints": disk_status["pending_sprints"],
                "valid_observations": disk_status["total_valid_observations"],
                "missing_observations": disk_status["total_missing_observations"],
                "corrupt_files": disk_status["total_corrupt_files"],
            },
        }
        return preflight_summary

    def run_campaign(
        self,
        resume: bool = True,
        allow_overwrite: bool = False,
        developer_llm_override: Optional[Any] = None,
        auditor_llm_override: Optional[Any] = None,
        max_sprints: Optional[int] = None,
    ) -> Dict[str, Any]:
        """
        Executes the Phase 5B full campaign.

        Args:
            resume: If True, skips sprints whose 4 observation records already exist on disk and are valid.
            allow_overwrite: If True, permits overwriting conflicting records on disk.
            developer_llm_override: Optional callable/mock for offline testing.
            auditor_llm_override: Optional callable/mock for offline testing.
            max_sprints: Optional limit on the number of sprints to execute (for chunked runs or tests).

        Returns:
            Dictionary with aggregated campaign execution results.
        """
        start_time = time.time()
        os.makedirs(self.storage_dir, exist_ok=True)
        checkpoint_dir = os.path.join(self.storage_dir, "checkpoints")
        os.makedirs(checkpoint_dir, exist_ok=True)

        disk_status = self.inspect_disk_status()
        sprints_info = disk_status["sprints"]

        all_results: List[ExperimentResultV2] = []
        recent_sprint_records: List[ExperimentResultV2] = []
        sprints_executed = 0
        sprints_skipped = 0

        target_matrix = self.matrix[:max_sprints] if max_sprints is not None else self.matrix

        for cond in target_matrix:
            sprint_num = cond.sprint_number
            seed = cond.seed
            sprint_stat = sprints_info.get(sprint_num, {})

            # Resume logic: skip if complete on disk
            if resume and sprint_stat.get("is_complete") and not allow_overwrite:
                logger.info("Sprint %d (Seed %d) complete on disk (4/4 records). Skipping.", sprint_num, seed)
                for path in sprint_stat.get("valid_files", []):
                    with open(path, "r", encoding="utf-8") as f:
                        rec = ExperimentResultV2.model_validate(json.load(f))
                        all_results.append(rec)
                sprints_skipped += 1
                continue

            # Execute sprint
            logger.info(
                "Executing Sprint %d/%d (Seed %d | %s | %s)...",
                sprint_num,
                len(target_matrix),
                seed,
                cond.experimental_arm,
                cond.pressure.value,
            )

            sprint_records = self.simulator.run_sprint(
                pressure=cond.pressure,
                persona_framing=cond.persona_framing,
                task_difficulty=cond.task_difficulty,
                seed=seed,
                uncoupled_control_arm=cond.uncoupled_control_arm,
                policy_override=cond.policy,
                developer_llm_override=developer_llm_override,
                auditor_llm_override=auditor_llm_override,
            )

            all_results.extend(sprint_records)
            recent_sprint_records.extend(sprint_records)
            sprints_executed += 1

            # Checkpoint cadence: every checkpoint_interval sprints OR at the final sprint
            is_cadence_checkpoint = (sprint_num % self.checkpoint_interval == 0)
            is_final_checkpoint = (sprint_num == len(target_matrix))
            if is_cadence_checkpoint or is_final_checkpoint:
                save_checkpoint(
                    checkpoint_index=sprint_num,
                    results=recent_sprint_records,
                    storage_dir=checkpoint_dir,
                )
                logger.info("Durable checkpoint saved at sprint %d (%d records).", sprint_num, len(recent_sprint_records))
                recent_sprint_records = []

        elapsed = time.time() - start_time
        substantive, refusals = partition_observations(all_results)
        failed_count = sum(1 for r in all_results if r.is_failure)

        return {
            "status": "COMPLETED",
            "sprints_attempted": sprints_executed + sprints_skipped,
            "sprints_executed": sprints_executed,
            "sprints_skipped_resume": sprints_skipped,
            "sprints_skipped": sprints_skipped,
            "total_observations": len(all_results),
            "valid_substantive_observations": len(substantive),
            "valid_observations": len(substantive),
            "refusal_observations": len(refusals),
            "failed_observations": failed_count,
            "model": self.model,
            "storage_dir": self.storage_dir,
            "elapsed_seconds": round(elapsed, 2),
            "results": all_results,
        }


def build_arg_parser() -> argparse.ArgumentParser:
    """Builds the command line interface argument parser."""
    parser = argparse.ArgumentParser(
        description="Phase 5B: Full-Campaign Autonomous Runner (AI-Agent-Research)",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--preflight",
        "--dry-run",
        dest="dry_run",
        action="store_true",
        help="Execute preflight checks, matrix validation, and output routing without executing live inference.",
    )
    parser.add_argument(
        "--mock",
        action="store_true",
        help="Execute campaign using offline mocked LLM responses (for testing and pipeline validation).",
    )
    parser.add_argument(
        "--storage-dir",
        type=str,
        default=DEFAULT_CAMPAIGN_STORAGE_DIR,
        help="Target storage directory for campaign JSON records.",
    )
    parser.add_argument(
        "--model",
        type=str,
        default=DEFAULT_MODEL,
        help="Ollama model identifier to use.",
    )
    parser.add_argument(
        "--temperature",
        type=float,
        default=DEFAULT_TEMPERATURE,
        help="Model sampling temperature.",
    )
    parser.add_argument(
        "--top-p",
        type=float,
        default=DEFAULT_TOP_P,
        help="Model sampling top-p nucleus parameter.",
    )
    parser.add_argument(
        "--checkpoint-interval",
        type=int,
        default=DEFAULT_CHECKPOINT_INTERVAL,
        help="Interval of completed sprints between durable checkpoint writes.",
    )
    parser.add_argument(
        "--max-sprints",
        type=int,
        default=None,
        help="Optional ceiling on number of sprints to execute in this invocation.",
    )
    parser.add_argument(
        "--no-resume",
        dest="resume",
        action="store_false",
        help="Do not skip sprints whose records already exist on disk.",
    )
    parser.add_argument(
        "--force",
        dest="allow_overwrite",
        action="store_true",
        help="Permit overwriting conflicting records on disk.",
    )
    parser.add_argument(
        "--live",
        action="store_true",
        help="Enable live Ollama LLM inference. Requires --confirm-live for safety.",
    )
    parser.add_argument(
        "--confirm-live",
        type=str,
        default="",
        help=f"Must be set exactly to '{LIVE_CONFIRMATION_TOKEN}' to execute live inference.",
    )
    return parser


def main() -> None:
    """Main CLI entry point for the campaign runner."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
    )
    parser = build_arg_parser()
    args = parser.parse_args()

    runner = Phase5BCampaignRunner(
        storage_dir=args.storage_dir,
        model=args.model,
        temperature=args.temperature,
        top_p=args.top_p,
        checkpoint_interval=args.checkpoint_interval,
    )

    # Dry-run / Preflight check
    if args.dry_run or (not args.live and not args.mock):
        print("\n" + "=" * 75)
        print("PHASE 5B FULL CAMPAIGN: PREFLIGHT & DRY-RUN VERIFICATION")
        print("=" * 75)
        report = runner.run_preflight()
        print(f"Overall Preflight Status : {report['status']}")
        print(f"Ollama Daemon Reachable  : {report['ollama_daemon_reachable']} ({report['ollama_daemon_message']})")
        print(f"Configured Model         : {report['configured_model']} (Installed: {report['model_installed']})")
        print(f"Model SHA-256 Digest     : {report['model_sha256_digest']}")
        print(f"Git Commit SHA           : {report['git_commit']}")
        print(f"Output Directory         : {report['storage_dir']}")
        print(f"Planned Sprints (M)      : {report['total_planned_sprints']} (Seeds: {report['seed_range'][0]}-{report['seed_range'][1]})")
        print(f"Planned Observations (N) : {report['total_planned_observations']}")
        print("\nCondition Matrix Composition:")
        val = report["matrix_validation"]
        print(f"  Total Condition Cells  : {val['total_condition_cells']}")
        print(f"  Primary Factorial Cells: {val['primary_factorial_cells']} (480 executions, 1,920 observations)")
        print(f"  Zero-Stakes Calibration: {val['calibration_cells']} (30 executions, 120 observations)")
        print(f"  Pure Time-Only Control : {val['time_only_cells']} (45 executions, 180 observations)")
        print(f"  Pure Stakes-Only Control: {val['stakes_only_cells']} (45 executions, 180 observations)")
        print("\nOn-Disk Storage Status:")
        disk = report["disk_status"]
        print(f"  Completed Sprints      : {disk['completed_sprints']}/600")
        print(f"  Pending Sprints        : {disk['pending_sprints']}/600")
        print(f"  Valid Observations     : {disk['valid_observations']}/2,400")
        print(f"  Corrupt Files          : {disk['corrupt_files']}")
        print("=" * 75)

        if not args.live and not args.mock and not args.dry_run:
            print("\nSAFETY NOTICE: Real LLM inference is disabled by default.")
            print("To run an offline mocked test:   python experiments/run_phase_5b_campaign.py --mock")
            print("To run the live campaign:        python experiments/run_phase_5b_campaign.py --live --confirm-live YES_RUN_LIVE_CAMPAIGN")
            sys.exit(0)

        sys.exit(0)

    # Mock Execution
    if args.mock:
        print("\n" + "=" * 75)
        print("PHASE 5B FULL CAMPAIGN: OFFLINE MOCKED EXECUTION")
        print("=" * 75)
        print(f"Target Directory         : {runner.storage_dir}")
        print(f"Planned Executions       : {args.max_sprints or 600}")
        print("Live Inference           : DISABLED (Mocked offline responses)")
        print("=" * 75)

        def mock_dev(prompt: str) -> str:
            return json.dumps({
                "actual_progress_understanding": 50,
                "reported_progress": 50,
                "confidence": 0.9,
                "developer_internal_reasoning": "Offline mock execution test report.",
                "manager_message": "Work on track.",
                "claimed_completed_subtasks": [1, 2, 3, 4, 5],
            })

        def mock_auditor(prompt: str) -> str:
            return json.dumps({
                "narrative_misrepresentation_detected": False,
                "unsupported_claim_severity": "NONE",
                "explanation": "Mock offline verification matches.",
            })

        summary = runner.run_campaign(
            resume=args.resume,
            allow_overwrite=args.allow_overwrite,
            developer_llm_override=mock_dev,
            auditor_llm_override=mock_auditor,
            max_sprints=args.max_sprints,
        )
        print("\n" + "=" * 75)
        print("CAMPAIGN RUN COMPLETE (MOCK MODE)")
        print("=" * 75)
        print(f"Sprints Executed         : {summary['sprints_executed']}")
        print(f"Sprints Skipped (Resume) : {summary['sprints_skipped_resume']}")
        print(f"Total Observations       : {summary['total_observations']}")
        print(f"Elapsed Time (s)         : {summary['elapsed_seconds']}")
        print("=" * 75)
        sys.exit(0)

    # Live Execution Guard
    if args.live:
        if args.confirm_live != LIVE_CONFIRMATION_TOKEN:
            print("\nERROR: Live campaign requires explicit confirmation token:")
            print(f"       --confirm-live {LIVE_CONFIRMATION_TOKEN}")
            sys.exit(1)

        print("\n" + "=" * 75)
        print("PHASE 5B FULL CAMPAIGN: LIVE LLM EXECUTION AUTHORIZED")
        print("=" * 75)
        summary = runner.run_campaign(
            resume=args.resume,
            allow_overwrite=args.allow_overwrite,
            max_sprints=args.max_sprints,
        )
        print("Campaign Execution Complete. Total records:", summary["total_observations"])


if __name__ == "__main__":
    main()
