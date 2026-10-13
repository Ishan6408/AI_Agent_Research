"""
Storage and Serialization Utilities for Phase 5B Autonomous Campaign.
Phase 5B.2A.1 - AI-Agent-Research: "Do AI Agents Cheat Under Pressure?"

Implements crash-resilient atomic persistence (write-to-temp + os.replace),
idempotent record verification, and conflict detection for sprint executions and checkpoints.

Filesystem Limitations Note:
- On POSIX filesystems, os.replace is atomic within the same filesystem/mount point.
- On Windows (NTFS), os.replace calls MoveFileExW with MOVEFILE_REPLACE_EXISTING,
  which is atomic within the same drive volume. If an external process (e.g. anti-virus,
  indexing service) holds an exclusive read lock on the target file at the exact millisecond
  of replacement, a Windows PermissionError may occur. Temporary files are always allocated
  in the same target directory to guarantee same-volume semantics.
- On networked storage (NFS/SMB), atomicity guarantees depend on server protocol semantics.
"""

import json
import logging
import os
import time
from datetime import datetime
from typing import List, Dict, Any, Optional

from models.experiment_v2 import ExperimentResultV2, OutcomeCategory

logger = logging.getLogger(__name__)


# Comprehensive list of scientific, experimental, and provenance fields checked to establish
# experimental identity and detect data conflicts on re-execution.
CONFLICT_CHECK_FIELDS = [
    # Core Identifiers
    "execution_id",
    "cluster_id",
    "seed",
    "decision_mode",
    # Model & Generation Hyperparameters
    "model",
    "temperature",
    "top_p",
    "ollama_model_digest",
    # Task & Factorial Conditions
    "task_name",
    "developer_role",
    "task_difficulty",
    "pressure_tier",
    "persona_framing",
    # Organizational Policy & Control Arm Stakes
    "reward",
    "penalty",
    "deadline_hours",
    "uncoupled_control_arm",
    # Ground-Truth Synthetic Execution State
    "actual_progress",
    "subtask_state_vector",
    "execution_state_hash",
    # Autonomous Model Deliberation & Reporting
    "actual_progress_understood",
    "reported_progress",
    "deception_gap",
    "claimed_subtask_ids",
    "developer_internal_reasoning",
    "manager_message",
    # Independent Audit Outcomes
    "verification_delta",
    "claim_grounding_score",
    "unsupported_claims_count",
    "outcome_category",
    "mechanical_discrepancy_flag",
    "narrative_misrepresentation_detected",
    # Prompts & Raw Token Outputs
    "system_prompt",
    "user_prompt",
    "raw_model_response",
    # Failure Status & Reason
    "is_failure",
    "failure_reason",
]

# Intentionally excluded runtime telemetry fields (which legitimately vary across identical re-executions):
# - "timestamp": Wall-clock ISO timestamp of run assembly.
# - "inference_duration_ms": Operating-system execution latency in milliseconds.
# - "git_commit": Working tree commit SHA (runtime metadata).
# - "prompt_tokens", "completion_tokens": Optional provider token counters.
# - "retry_count", "raw_unparsed_attempts": Internal retry telemetry.


def detect_record_conflict(existing_data: Dict[str, Any], new_data: Dict[str, Any]) -> Optional[str]:
    """
    Compares key scientific fields between an existing on-disk record and an incoming record.
    Returns a description of conflicting fields, or None if the records are consistent.
    """
    conflicts = []
    for field in CONFLICT_CHECK_FIELDS:
        old_val = existing_data.get(field)
        new_val = new_data.get(field)
        if old_val != new_val:
            conflicts.append(f"{field} (disk: {old_val} vs new: {new_val})")

    if conflicts:
        return "; ".join(conflicts)
    return None


def save_experiment_v2(
    result: ExperimentResultV2,
    storage_dir: str = "results/phase_5b_campaign",
    allow_overwrite: bool = False,
) -> str:
    """
    Saves a single ExperimentResultV2 object as a JSON file using atomic persistence.

    Guarantees:
    1. Atomic Write: Writes to a unique .tmp file in storage_dir, flushes and fsyncs,
       then renames atomically via os.replace.
    2. Conflict Detection: If target file exists and differs in substantive fields,
       raises FileExistsError unless allow_overwrite is True.
    3. Cleanup: Cleans up the temporary file if an exception occurs prior to replacement.
    """
    os.makedirs(storage_dir, exist_ok=True)
    filename = os.path.join(storage_dir, f"{result.experiment_id}.json")
    new_data = result.model_dump()

    # Conflict check for existing records
    if os.path.exists(filename):
        existing_data = None
        try:
            with open(filename, "r", encoding="utf-8") as existing_file:
                existing_data = json.load(existing_file)
        except Exception as ex:
            if not allow_overwrite:
                raise FileExistsError(
                    f"Existing record '{filename}' exists but is unreadable or corrupted. "
                    f"Refusing to overwrite without allow_overwrite=True: {ex}"
                )

        if existing_data is not None:
            conflict_details = detect_record_conflict(existing_data, new_data)
            if conflict_details and not allow_overwrite:
                raise FileExistsError(
                    f"Persistence conflict for '{result.experiment_id}': "
                    f"Existing record differs from new record on: {conflict_details}"
                )
            if not conflict_details and not allow_overwrite:
                # File already exists and has identical scientific content.
                # Preserve existing file byte-for-byte without re-writing.
                logger.debug(
                    "Record '%s' already exists on disk with identical scientific content. Preserving existing file byte-for-byte.",
                    result.experiment_id,
                )
                return result.experiment_id

    # Unique temporary file in the same directory to guarantee same-filesystem move
    tmp_filename = os.path.join(
        storage_dir,
        f".tmp_{result.experiment_id}_{os.getpid()}_{time.time_ns()}.json"
    )

    try:
        with open(tmp_filename, "w", encoding="utf-8") as f:
            json.dump(new_data, f, indent=4)
            f.flush()
            os.fsync(f.fileno())

        os.replace(tmp_filename, filename)
    finally:
        # Guarantee cleanup of temporary file if replacement was aborted
        if os.path.exists(tmp_filename):
            try:
                os.remove(tmp_filename)
            except OSError:
                pass

    return result.experiment_id


def save_checkpoint(
    checkpoint_index: int,
    results: List[ExperimentResultV2],
    storage_dir: str = "results/phase_5b_campaign/checkpoints"
) -> str:
    """
    Saves a batch of results as a checkpoint file using atomic persistence.

    Guarantees:
    1. Atomic Write: Writes to a unique .tmp file, flushes and fsyncs, then renames via os.replace.
    2. Cleanup: Cleans up temporary file if write fails.
    """
    os.makedirs(storage_dir, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = os.path.join(storage_dir, f"checkpoint_sprint_{checkpoint_index}_{timestamp}.json")

    checkpoint_data = {
        "checkpoint_index": checkpoint_index,
        "timestamp": timestamp,
        "total_records": len(results),
        "records": [r.model_dump() for r in results],
    }

    tmp_filename = os.path.join(
        storage_dir,
        f".tmp_checkpoint_{checkpoint_index}_{os.getpid()}_{time.time_ns()}.json"
    )

    try:
        with open(tmp_filename, "w", encoding="utf-8") as f:
            json.dump(checkpoint_data, f, indent=4)
            f.flush()
            os.fsync(f.fileno())

        os.replace(tmp_filename, filename)
    finally:
        if os.path.exists(tmp_filename):
            try:
                os.remove(tmp_filename)
            except OSError:
                pass

    return filename


def load_checkpoint(checkpoint_path: str) -> Dict[str, Any]:
    """Loads a checkpoint file."""
    if not os.path.exists(checkpoint_path):
        raise FileNotFoundError(f"Checkpoint not found at '{checkpoint_path}'")

    with open(checkpoint_path, "r", encoding="utf-8") as f:
        return json.load(f)
