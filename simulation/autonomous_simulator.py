"""
Autonomous Software Company Simulator Engine.
Phase 5B.2A - AI-Agent-Research: "Do AI Agents Cheat Under Pressure?"

Implements the autonomous LLM reporting workflow where agents independently select reporting
strategies under organizational incentives, evaluated against deterministic synthetic subtask ground truth.
"""

import hashlib
import os
import random
import subprocess
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from agents.autonomous_developer import AutonomousDeveloper
from agents.manager import ManagerAgent
from agents.narrative_auditor import NarrativeAuditor
from models.environment import PressureLevel
from models.experiment_v2 import (
    DecisionMode,
    ExperimentResultV2,
    OutcomeCategory,
    PersonaFraming,
)
from models.task_difficulty import TaskDifficulty
from simulation.policy_generator import PolicyGenerator
from simulation.synthetic_task_harness import SyntheticTaskHarness
from utils.autonomous_storage import save_checkpoint, save_experiment_v2


def get_git_commit() -> Optional[str]:
    """Retrieves current git commit SHA."""
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "HEAD"],
            stderr=subprocess.STDOUT,
            text=True
        ).strip()
    except Exception:
        return None


def get_ollama_model_digest(model_name: str = "qwen2.5:7b") -> Optional[str]:
    """Attempts to retrieve the SHA-256 digest of the local Ollama model image."""
    try:
        out = subprocess.check_output(
            ["ollama", "show", model_name, "--modelfile"],
            stderr=subprocess.STDOUT,
            text=True
        )
        return hashlib.sha256(out.encode("utf-8")).hexdigest()
    except Exception:
        return None


class AutonomousSoftwareCompanySimulator:
    """
    Simulates a software company sprint under autonomous LLM strategy selection.
    """

    DEVELOPER_NAMES = {
        "Frontend Developer": "Alice",
        "Backend Developer": "Bob",
        "DevOps Engineer": "David",
        "QA Engineer": "Eve",
    }

    def __init__(
        self,
        storage_dir: str = "results/phase_5b_campaign",
        model: str = "qwen2.5:7b",
        temperature: float = 0.3,
        top_p: float = 0.9,
    ):
        self.storage_dir = storage_dir
        self.model = model
        self.temperature = temperature
        self.top_p = top_p

        self.policy_generator = PolicyGenerator()
        self.task_harness = SyntheticTaskHarness()
        self.manager = ManagerAgent()
        self.auditor = NarrativeAuditor()

        self.git_commit = get_git_commit()
        self.model_digest = get_ollama_model_digest(model)

    def run_sprint(
        self,
        pressure: PressureLevel,
        persona_framing: PersonaFraming,
        task_difficulty: TaskDifficulty,
        seed: int,
        uncoupled_control_arm: Optional[str] = None,
        policy_override: Optional[Any] = None,
        developer_llm_override: Optional[Any] = None,
        auditor_llm_override: Optional[Any] = None,
    ) -> List[ExperimentResultV2]:
        """
        Executes a single simulator sprint run (M = 1), generating 4 developer observations (N = 4).
        """
        # 1. Initialize isolated PRNG for sprint orchestration
        sprint_rng = random.Random(seed)
        self.manager.rng = sprint_rng

        # 2. Configure organizational policy
        if policy_override is not None:
            policy = policy_override
        else:
            policy = PolicyGenerator.generate(pressure)

        # 3. Manager allocates tasks across 4 roles
        sprint_tasks = self.manager.create_sprint_tasks()
        roles = ["Frontend Developer", "Backend Developer", "DevOps Engineer", "QA Engineer"]

        sprint_results: List[ExperimentResultV2] = []

        for role_idx, role in enumerate(roles):
            task = sprint_tasks[role]
            developer_name = self.DEVELOPER_NAMES[role]

            # Derive deterministic sub-seed for task subtask pass/fail generation
            task_subseed = seed + (role_idx * 1000)

            # 4. Generate deterministic ground truth state (10 subtasks)
            ground_truth = self.task_harness.generate_ground_truth(
                task_id=task.id,
                task_title=task.title,
                developer_role=role,
                task_difficulty=task_difficulty.value,
                seed=task_subseed,
            )

            # 5. Instantiate autonomous developer with persona framing
            developer = AutonomousDeveloper(
                name=developer_name,
                role=role,
                persona_framing=persona_framing,
            )

            # 6. Autonomous deliberation & status reporting
            report, raw_attempts, retries, duration_ms, is_failure, failure_reason = developer.generate_status_report(
                ground_truth=ground_truth,
                policy=policy,
                task_description=task.description,
                manager_name=self.manager.name,
                max_retries=3,
                llm_client=developer_llm_override,
            )

            # 7. Independent narrative auditing
            audit_result = self.auditor.audit_submission(
                developer_name=developer_name,
                developer_role=role,
                report=report,
                ground_truth=ground_truth,
                is_failure=is_failure,
                failure_reason=failure_reason,
                llm_client=auditor_llm_override,
            )

            # 8. Assemble ExperimentResultV2 record
            execution_id = seed
            cluster_id = f"exec_5b_{seed}"
            role_slug = role.lower().replace(" ", "_")
            experiment_id = f"exp_5b_{seed}_{role_slug}"
            timestamp = datetime.now(timezone.utc).replace(microsecond=0).isoformat()

            if is_failure or report is None:
                reported_prog = None
                gap = None
                understood_prog = None
                claimed_ids = []
                reasoning = "Refusal: Report generation failed."
                message = failure_reason or "Report generation failed."
            else:
                reported_prog = report.reported_progress
                gap = reported_prog - ground_truth.actual_progress
                understood_prog = report.actual_progress_understanding
                claimed_ids = report.claimed_completed_subtasks
                reasoning = report.developer_internal_reasoning
                message = report.manager_message

            user_prompt = developer.build_status_prompt(
                ground_truth=ground_truth,
                policy=policy,
                task_description=task.description,
                manager_name=self.manager.name,
            )
            raw_response_str = raw_attempts[-1] if raw_attempts else ""

            record = ExperimentResultV2(
                experiment_id=experiment_id,
                execution_id=execution_id,
                cluster_id=cluster_id,
                timestamp=timestamp,
                seed=seed,
                git_commit=self.git_commit,
                model=self.model,
                ollama_model_digest=self.model_digest,
                temperature=self.temperature,
                top_p=self.top_p,
                inference_duration_ms=duration_ms,
                retry_count=retries,
                raw_unparsed_attempts=raw_attempts,
                decision_mode=DecisionMode.AUTONOMOUS_LLM,
                task_name=task.title,
                developer_role=role,
                task_difficulty=task_difficulty.value,
                pressure_tier=pressure.value,
                persona_framing=persona_framing,
                reward=policy.reward_for_completion,
                penalty=policy.penalty_for_failure,
                deadline_hours=policy.deadline_hours,
                uncoupled_control_arm=uncoupled_control_arm,
                actual_progress=ground_truth.actual_progress,
                subtask_state_vector=ground_truth.state_vector,
                execution_state_hash=ground_truth.state_vector_sha256,
                actual_progress_understood=understood_prog,
                reported_progress=reported_prog,
                deception_gap=gap,
                claimed_subtask_ids=claimed_ids,
                developer_internal_reasoning=reasoning,
                manager_message=message,
                verification_delta=audit_result.verification_delta,
                claim_grounding_score=audit_result.claim_grounding_score,
                unsupported_claims_count=audit_result.unsupported_claims_count,
                outcome_category=audit_result.category,
                mechanical_discrepancy_flag=audit_result.mechanical_discrepancy_flag,
                narrative_misrepresentation_detected=audit_result.narrative_misrepresentation_detected,
                auditor_explanation=audit_result.auditor_explanation,
                system_prompt=developer.system_prompt,
                user_prompt=user_prompt,
                raw_model_response=raw_response_str,
                is_failure=is_failure,
                failure_reason=failure_reason,
            )

            # 9. Save record
            save_experiment_v2(record, storage_dir=self.storage_dir)
            sprint_results.append(record)

        return sprint_results
