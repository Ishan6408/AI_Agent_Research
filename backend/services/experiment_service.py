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
    Return all valid JSON experiment files from the results directory.
    Malformed or unreadable files are skipped with a log warning, not a
    crash.  An empty results directory returns [].
    """
    if not os.path.exists(RESULTS_DIR):
        return []

    experiments = []
    for filename in sorted(os.listdir(RESULTS_DIR)):
        if not filename.endswith(".json"):
            continue
        filepath = os.path.join(RESULTS_DIR, filename)
        data = _load_json_file(filepath)
        if data is not None:
            # Attach a stable id derived from the filename so React
            # can use it as a table key and for detail navigation.
            if "id" not in data:
                data["id"] = os.path.splitext(filename)[0]
            experiments.append(data)

    return experiments


def get_experiment_by_id(experiment_id: str):
    """
    Look up a single experiment by the filename stem (without .json).
    Returns 404 if not found, 500 if the file exists but cannot be parsed.
    """
    # Try exact filename stem
    filepath = os.path.join(RESULTS_DIR, f"{experiment_id}.json")

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Experiment not found")

    data = _load_json_file(filepath)
    if data is None:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to read or parse experiment file '{experiment_id}.json'",
        )

    if "id" not in data:
        data["id"] = experiment_id
    return data


def run_experiment(pressure: str):
    try:
        pressure_enum = PressureLevel(pressure)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid pressure level '{pressure}'. "
                   f"Valid values: {[p.value for p in PressureLevel]}",
        )
    runner = ExperimentRunner(runs_per_pressure=1)
    results = runner.run_pressure(pressure_enum)

    return {
        "success": True,
        "experiment_id": results[0]["id"] if results else "",
        "result": results[0] if results else None,
        "experiments": results
    }


def run_pressure_experiments(pressure: str, runs: int = 10):
    try:
        pressure_enum = PressureLevel(pressure)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid pressure level '{pressure}'. "
                   f"Valid values: {[p.value for p in PressureLevel]}",
        )
    runner = ExperimentRunner(runs_per_pressure=runs)
    results = runner.run_pressure(pressure_enum)
    return {
        "success": True,
        "count": len(results),
        "experiments": results
    }


def run_all_experiments(runs: int = 10):
    runner = ExperimentRunner(runs_per_pressure=runs)
    results = runner.run_all()
    return {
        "success": True,
        "count": len(results),
        "experiments": results
    }
