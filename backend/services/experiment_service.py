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


import time

_file_cache: dict[str, tuple[float, dict]] = {}
_cached_experiments: list[dict] | None = None
_cache_dir: str | None = None
_cache_time: float = 0.0


def clear_cache():
    """Clear in-memory experiments cache."""
    global _cached_experiments, _cache_dir, _cache_time
    _cached_experiments = None
    _cache_dir = None
    _cache_time = 0.0
    _file_cache.clear()


def get_all_experiments(limit: int | None = None, offset: int = 0):
    """
    Return valid JSON experiment files from the results directory,
    scanning recursively. Employs mtime caching so repeated calls/reloads
    do not re-read thousands of files from disk.
    Optional limit and offset for pagination.
    """
    global _cached_experiments, _cache_dir, _cache_time

    if not os.path.exists(RESULTS_DIR):
        return []

    # Reset cache if directory has changed (e.g. during test fixtures)
    if _cache_dir != RESULTS_DIR:
        _cached_experiments = None
        _file_cache.clear()
        _cache_dir = RESULTS_DIR

    # Return cached results if fresh (within 5 seconds)
    now = time.time()
    if _cached_experiments is not None and (now - _cache_time) < 5.0:
        if limit is not None:
            return _cached_experiments[offset:offset + limit]
        return _cached_experiments

    experiments_dict = {}
    for root, _, files in os.walk(RESULTS_DIR):
        for filename in files:
            if not filename.endswith(".json"):
                continue
            if not filename.startswith("experiment_"):
                continue
                
            filepath = os.path.join(root, filename)
            try:
                mtime = os.path.getmtime(filepath)
            except OSError:
                mtime = 0.0

            cached_entry = _file_cache.get(filepath)
            if cached_entry is not None and cached_entry[0] == mtime:
                data = cached_entry[1]
            else:
                data = _load_json_file(filepath)
                if data is not None:
                    _file_cache[filepath] = (mtime, data)

            if data is not None:
                exp_id = data.get("id", os.path.splitext(filename)[0])
                if "id" not in data:
                    data["id"] = exp_id
                
                # Avoid duplicates by keeping the first encountered
                if exp_id not in experiments_dict:
                    experiments_dict[exp_id] = data

    _cached_experiments = sorted(experiments_dict.values(), key=lambda x: x["id"])
    _cache_time = now

    if limit is not None:
        return _cached_experiments[offset:offset + limit]
    return _cached_experiments


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
    clear_cache()
    runner = ExperimentRunner(runs_per_pressure=1, storage_dir=RESULTS_DIR)
    results = runner.run_pressure(pressure, base_seed=base_seed)

    return {
        "success": True,
        "experiment_id": results[0]["id"] if results else "",
        "result": results[0] if results else None,
        "experiments": results
    }


def run_pressure_experiments(pressure: PressureLevel, runs: int = 10, base_seed: int | None = None):
    clear_cache()
    runner = ExperimentRunner(runs_per_pressure=runs, storage_dir=RESULTS_DIR)
    results = runner.run_pressure(pressure, base_seed=base_seed)
    return {
        "success": True,
        "count": len(results),
        "experiments": results
    }


def run_all_experiments(runs: int = 10, base_seed: int | None = None):
    clear_cache()
    runner = ExperimentRunner(runs_per_pressure=runs, storage_dir=RESULTS_DIR)
    results = runner.run_all(base_seed=base_seed)
    return {
        "success": True,
        "count": len(results),
        "experiments": results
    }
