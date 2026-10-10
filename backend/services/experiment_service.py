"""
Experiment service — discovers, reads, and runs individual experiments.

GET  /api/experiments          → list of all stored experiment records
GET  /api/experiments/{id}     → single experiment by id
POST /api/experiments/run      → run one experiment at given pressure
POST /api/experiments/run-pressure → run N experiments at given pressure
POST /api/experiments/run-all  → run N experiments per pressure level
"""

import os
import json
import logging
from fastapi import HTTPException
from models.environment import PressureLevel
from experiments.runner import ExperimentRunner

logger = logging.getLogger(__name__)

RESULTS_DIR = "results"


def _load_json_file(filepath: str) -> dict | None:
    """
    Load a single JSON file.  Returns None (and logs a warning) on any
    read/parse error so one malformed file does not crash the whole list.
    """
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read().strip()
        if not content:
            logger.warning("Skipping empty file: %s", filepath)
            return None
        return json.loads(content)
    except json.JSONDecodeError as exc:
        logger.warning("Malformed JSON in %s: %s", filepath, exc)
        return None
    except OSError as exc:
        logger.warning("Cannot read %s: %s", filepath, exc)
        return None


def get_all_experiments():
    """
    Return all valid JSON experiment files from the results directory,
    scanning recursively. Malformed or unreadable files are skipped.
    """
    if not os.path.exists(RESULTS_DIR):
        return []

    experiments_dict = {}
    for root, _, files in os.walk(RESULTS_DIR):
        for filename in files:
            if not filename.endswith(".json"):
                continue
            if not filename.startswith("experiment_"):
                continue
                
            filepath = os.path.join(root, filename)
            data = _load_json_file(filepath)
            if data is not None:
                exp_id = data.get("id", os.path.splitext(filename)[0])
                if "id" not in data:
                    data["id"] = exp_id
                
                # Avoid duplicates by keeping the first encountered
                if exp_id not in experiments_dict:
                    experiments_dict[exp_id] = data

    return sorted(experiments_dict.values(), key=lambda x: x["id"])


def get_experiment_by_id(experiment_id: str):
    """
    Look up a single experiment by the filename stem (without .json).
    Returns 404 if not found, 500 if the file exists but cannot be parsed.
    """
    target_filename = f"{experiment_id}.json"
    target_filepath = None
    
    if os.path.exists(os.path.join(RESULTS_DIR, target_filename)):
        target_filepath = os.path.join(RESULTS_DIR, target_filename)
    else:
        for root, _, files in os.walk(RESULTS_DIR):
            if target_filename in files:
                target_filepath = os.path.join(root, target_filename)
                break
                
    if not target_filepath:
        raise HTTPException(status_code=404, detail="Experiment not found")

    data = _load_json_file(target_filepath)
    if data is None:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read or parse experiment file '{target_filename}'",
        )

    if "id" not in data:
        data["id"] = experiment_id
    return data


def run_experiment(pressure: PressureLevel, base_seed: int | None = None):
    runner = ExperimentRunner(runs_per_pressure=1, storage_dir=RESULTS_DIR)
    results = runner.run_pressure(pressure, base_seed=base_seed)

    return {
        "success": True,
        "experiment_id": results[0]["id"] if results else "",
        "result": results[0] if results else None,
        "experiments": results
    }


def run_pressure_experiments(pressure: PressureLevel, runs: int = 10, base_seed: int | None = None):
    runner = ExperimentRunner(runs_per_pressure=runs, storage_dir=RESULTS_DIR)
    results = runner.run_pressure(pressure, base_seed=base_seed)
    return {
        "success": True,
        "count": len(results),
        "experiments": results
    }


def run_all_experiments(runs: int = 10, base_seed: int | None = None):
    runner = ExperimentRunner(runs_per_pressure=runs, storage_dir=RESULTS_DIR)
    results = runner.run_all(base_seed=base_seed)
    return {
        "success": True,
        "count": len(results),
        "experiments": results
    }
