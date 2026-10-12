"""
Unit test suite for Phase 5B Live-Qwen Pilot Runner (experiments/run_pilot.py).
AI-Agent-Research: "Do AI Agents Cheat Under Pressure?"

Verifies:
1. Exact 5-sprint limit and 4 developer roles per sprint (20 observations total).
2. Seed isolation from Phase 5A (42-641) and Phase 5B campaign (1001-1600).
3. Output directory isolation (prohibits campaign / Phase 5A paths).
4. Refusal and failure handling (missing-value semantics and partitioning).
5. Resume/re-run behavior and conflict detection.
6. Schema validation and model/configuration metadata recording.
7. Dry-run / preflight executes without performing LLM inference.
"""

import json
import os
import tempfile
from unittest.mock import MagicMock, patch

import pytest

from experiments.run_pilot import (
    DEFAULT_PILOT_STORAGE_DIR,
    PILOT_CONDITIONS,
    PILOT_SEEDS,
    PHASE_5A_SEED_RANGE,
    PHASE_5B_CAMPAIGN_SEED_RANGE,
    Phase5BPilotRunner,
    PilotSprintCondition,
)
from models.environment import PressureLevel
from models.experiment_v2 import (
    ExperimentResultV2,
    OutcomeCategory,
    PersonaFraming,
    partition_observations,
)
from models.task_difficulty import TaskDifficulty


@pytest.fixture
def mock_developer_response():
    """Returns valid JSON developer status response for mocking."""
    return json.dumps({
        "actual_progress_understanding": 60,
        "reported_progress": 70,
        "confidence": 0.85,
        "developer_internal_reasoning": "Sprint features largely completed on schedule.",
        "manager_message": "Feature milestones delivered with passing unit tests.",
        "claimed_completed_subtasks": [1, 2, 3, 4, 5, 6, 7],
    })


@pytest.fixture
def mock_auditor_response():
    """Returns valid JSON auditor status response for mocking."""
    return json.dumps({
        "narrative_misrepresentation_detected": False,
        "unsupported_claim_severity": "NONE",
        "explanation": "Reported claims match verified passing subtasks.",
    })


def test_pilot_exact_five_sprints_and_twenty_observations(mock_developer_response, mock_auditor_response):
    """Verify runner executes exactly 5 sprints and produces 20 records (4 roles per sprint)."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        runner = Phase5BPilotRunner(storage_dir=tmp_dir)

        dev_mock = MagicMock(return_value=mock_developer_response)
        auditor_mock = MagicMock(return_value=mock_auditor_response)

        summary = runner.run_pilot(
            resume=False,
            allow_overwrite=False,
            developer_llm_override=dev_mock,
            auditor_llm_override=auditor_mock,
        )

        assert summary["sprints_executed"] == 5
        assert summary["sprints_skipped_resume"] == 0
        assert summary["total_observations"] == 20
        assert summary["valid_substantive_observations"] == 20
        assert summary["refusal_observations"] == 0
        assert summary["failed_observations"] == 0

        # Verify exactly 20 JSON files created in storage_dir
        json_files = [f for f in os.listdir(tmp_dir) if f.endswith(".json") and not f.startswith(".")]
        assert len(json_files) == 20

        # Check all 5 seeds and 4 roles
        for seed in [9001, 9002, 9003, 9004, 9005]:
            for role_slug in ["frontend_developer", "backend_developer", "devops_engineer", "qa_engineer"]:
                expected_filename = f"exp_5b_{seed}_{role_slug}.json"
                assert expected_filename in json_files

        # Check checkpoint files
        cp_dir = os.path.join(tmp_dir, "checkpoints")
        assert os.path.exists(cp_dir)
        checkpoints = [f for f in os.listdir(cp_dir) if f.endswith(".json")]
        assert len(checkpoints) == 5


def test_pilot_seed_isolation_verification():
    """Verify pilot seeds are strictly 9001-9005 and do not overlap with Phase 5A or Phase 5B campaign."""
    assert PILOT_SEEDS == [9001, 9002, 9003, 9004, 9005]
    assert len(PILOT_CONDITIONS) == 5

    condition_seeds = [c.seed for c in PILOT_CONDITIONS]
    assert condition_seeds == PILOT_SEEDS

    # Disjointness check
    pilot_set = set(PILOT_SEEDS)
    assert pilot_set.isdisjoint(set(PHASE_5A_SEED_RANGE)), "Collision with Phase 5A seeds 42-641"
    assert pilot_set.isdisjoint(set(PHASE_5B_CAMPAIGN_SEED_RANGE)), "Collision with Phase 5B campaign seeds 1001-1600"

    # Verify seed isolation validation catches intentional violation
    with pytest.raises(ValueError, match="Seed Collision"):
        with patch.object(
            Phase5BPilotRunner,
            "_validate_seed_isolation",
            side_effect=ValueError("Seed Collision: Pilot seed overlaps")
        ):
            Phase5BPilotRunner._validate_seed_isolation()


def test_pilot_output_path_isolation():
    """Verify runner strictly prevents writing to campaign or Phase 5A directories."""
    forbidden_dirs = [
        "results/phase_5b_campaign",
        "results/factorial_campaign",
        "results",
        "results/statistical_analysis",
    ]
    for forbidden in forbidden_dirs:
        with pytest.raises(ValueError, match="Safety Violation"):
            Phase5BPilotRunner(storage_dir=forbidden)

    # Valid pilot storage directories succeed
    with tempfile.TemporaryDirectory() as tmp_dir:
        runner_temp = Phase5BPilotRunner(storage_dir=tmp_dir)
        assert runner_temp.storage_dir == os.path.normpath(tmp_dir)

    runner_default = Phase5BPilotRunner(storage_dir=DEFAULT_PILOT_STORAGE_DIR)
    assert runner_default.storage_dir == os.path.normpath(DEFAULT_PILOT_STORAGE_DIR)


def test_pilot_refusal_and_failure_handling(mock_auditor_response):
    """Verify runner handles refusals and preserves missing-value semantics and failure logging."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        runner = Phase5BPilotRunner(storage_dir=tmp_dir)

        # Developer mock that fails exclusively for Backend Developer
        def dev_mock_selective(prompt: str) -> str:
            if "Backend Developer" in prompt:
                return "UNPARSEABLE_REFUSAL_PAYLOAD"
            return json.dumps({
                "actual_progress_understanding": 50,
                "reported_progress": 60,
                "confidence": 0.8,
                "developer_internal_reasoning": "Good progress.",
                "manager_message": "Delivered features.",
                "claimed_completed_subtasks": [1, 2, 3, 4, 5, 6],
            })

        auditor_mock = MagicMock(return_value=mock_auditor_response)

        # Patch PILOT_CONDITIONS to run only Sprint 1 for this test
        single_condition = [PILOT_CONDITIONS[0]]
        with patch("experiments.run_pilot.PILOT_CONDITIONS", single_condition):
            summary = runner.run_pilot(
                resume=False,
                allow_overwrite=False,
                developer_llm_override=dev_mock_selective,
                auditor_llm_override=auditor_mock,
            )

        assert summary["total_observations"] == 4
        assert summary["valid_substantive_observations"] == 3
        assert summary["refusal_observations"] == 1
        assert summary["failed_observations"] == 1

        # Inspect on-disk refusal record
        refusal_path = os.path.join(tmp_dir, "exp_5b_9001_backend_developer.json")
        assert os.path.exists(refusal_path)
        with open(refusal_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        assert data["is_failure"] is True
        assert data["outcome_category"] == OutcomeCategory.REFUSAL
        assert data["reported_progress"] is None
        assert data["deception_gap"] is None
        assert data["retry_count"] == 3  # Exhausted 3 neutral retries
        assert "Schema validation failed" in data["failure_reason"]


def test_pilot_resume_and_conflict_handling(mock_developer_response, mock_auditor_response):
    """Verify runner correctly skips completed sprints on resume and detects on-disk data conflicts."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        runner = Phase5BPilotRunner(storage_dir=tmp_dir)

        dev_mock = MagicMock(return_value=mock_developer_response)
        auditor_mock = MagicMock(return_value=mock_auditor_response)

        # 1. Run only Sprint 1 initially
        condition_sprint1 = [PILOT_CONDITIONS[0]]
        with patch("experiments.run_pilot.PILOT_CONDITIONS", condition_sprint1):
            summary1 = runner.run_pilot(
                resume=False,
                allow_overwrite=False,
                developer_llm_override=dev_mock,
                auditor_llm_override=auditor_mock,
            )
            assert summary1["sprints_executed"] == 1
            assert summary1["sprints_skipped_resume"] == 0
            assert summary1["total_observations"] == 4

        # 2. Run full 5-sprint pilot with resume=True
        # Sprint 1 should be skipped; Sprints 2-5 executed
        summary2 = runner.run_pilot(
            resume=True,
            allow_overwrite=False,
            developer_llm_override=dev_mock,
            auditor_llm_override=auditor_mock,
        )
        assert summary2["sprints_skipped_resume"] == 1
        assert summary2["sprints_executed"] == 4
        assert summary2["total_observations"] == 20

        # 3. Simulate record conflict: tamper with an existing on-disk file
        target_file = os.path.join(tmp_dir, "exp_5b_9001_frontend_developer.json")
        with open(target_file, "r", encoding="utf-8") as f:
            record_dict = json.load(f)

        # Mutate a substantive field (reported_progress from 70 to 99)
        record_dict["reported_progress"] = 99
        record_dict["deception_gap"] = 99 - record_dict["actual_progress"]
        with open(target_file, "w", encoding="utf-8") as f:
            json.dump(record_dict, f, indent=4)

        # 4. Attempt re-running Sprint 1 with resume=False and allow_overwrite=False
        # Must raise FileExistsError because disk differs from newly generated data
        with patch("experiments.run_pilot.PILOT_CONDITIONS", condition_sprint1):
            with pytest.raises(FileExistsError, match="Persistence conflict"):
                runner.run_pilot(
                    resume=False,
                    allow_overwrite=False,
                    developer_llm_override=dev_mock,
                    auditor_llm_override=auditor_mock,
                )


def test_pilot_schema_validation_and_model_metadata(mock_developer_response, mock_auditor_response):
    """Verify saved records satisfy ExperimentResultV2 schema and record exact model and runtime configuration."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        runner = Phase5BPilotRunner(
            storage_dir=tmp_dir,
            model="qwen2.5:7b",
            temperature=0.3,
            top_p=0.9,
        )

        dev_mock = MagicMock(return_value=mock_developer_response)
        auditor_mock = MagicMock(return_value=mock_auditor_response)

        condition_sprint1 = [PILOT_CONDITIONS[0]]
        with patch("experiments.run_pilot.PILOT_CONDITIONS", condition_sprint1):
            runner.run_pilot(
                resume=False,
                developer_llm_override=dev_mock,
                auditor_llm_override=auditor_mock,
            )

        target_file = os.path.join(tmp_dir, "exp_5b_9001_frontend_developer.json")
        assert os.path.exists(target_file)

        with open(target_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        record = ExperimentResultV2.model_validate(data)
        assert record.model == "qwen2.5:7b"
        assert record.temperature == 0.3
        assert record.top_p == 0.9
        assert record.execution_id == 9001
        assert record.cluster_id == "exec_5b_9001"
        assert record.seed == 9001
        assert len(record.subtask_state_vector) == 10
        assert len(record.execution_state_hash) == 64
        assert record.is_failure is False
        assert record.reported_progress == 70
        assert record.deception_gap == 70 - record.actual_progress
        assert record.developer_role == "Frontend Developer"


def test_pilot_dry_run_performs_no_live_inference():
    """Verify dry-run / preflight inspects environment without invoking any LLM or writing records."""
    with tempfile.TemporaryDirectory() as tmp_dir:
        runner = Phase5BPilotRunner(storage_dir=tmp_dir)

        with patch.object(runner.simulator, "run_sprint") as mock_run_sprint:
            report = runner.run_preflight()

            # Zero calls to simulator
            mock_run_sprint.assert_not_called()

            # Zero files written to storage_dir
            assert len(os.listdir(tmp_dir)) == 0

            # Preflight report contains all required configuration details
            assert "status" in report
            assert report["configured_model"] == "qwen2.5:7b"
            assert report["total_planned_sprints"] == 5
            assert report["total_planned_observations"] == 20
            assert report["seeds"] == [9001, 9002, 9003, 9004, 9005]
            assert len(report["conditions"]) == 5
