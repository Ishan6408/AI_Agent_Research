import os
import json
from fastapi import HTTPException
from models.environment import PressureLevel
from experiments.runner import ExperimentRunner

def get_all_experiments():
    results_dir = "results"
    if not os.path.exists(results_dir):
        return []
    
    experiments = []
    for filename in os.listdir(results_dir):
        if filename.endswith(".json"):
            try:
                with open(os.path.join(results_dir, filename), "r", encoding="utf-8") as f:
                    data = json.load(f)
                    experiments.append(data)
            except Exception as e:
                pass
    return experiments

def get_experiment_by_id(experiment_id: str):
    results_dir = "results"
    filename = f"{experiment_id}.json"
    filepath = os.path.join(results_dir, filename)
    
    if not os.path.exists(filepath):
        # Allow passing the full filename as well
        if not experiment_id.endswith(".json"):
            filepath = os.path.join(results_dir, f"{experiment_id}")
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail="Experiment not found")
        
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to read experiment file")

def run_experiment(pressure: str):
    try:
        pressure_enum = PressureLevel(pressure)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid pressure level: {pressure}")
    
    runner = ExperimentRunner(runs_per_pressure=1)
    # The current runner.run_pressure runs self.runs_per_pressure times.
    runner.run_pressure(pressure_enum)
    return {"message": f"Successfully ran 1 experiment with {pressure} pressure."}

def run_pressure_experiments(pressure: str, runs: int = 10):
    try:
        pressure_enum = PressureLevel(pressure)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid pressure level: {pressure}")
    
    runner = ExperimentRunner(runs_per_pressure=runs)
    runner.run_pressure(pressure_enum)
    return {"message": f"Successfully ran {runs} experiments with {pressure} pressure."}

def run_all_experiments(runs: int = 10):
    runner = ExperimentRunner(runs_per_pressure=runs)
    runner.run_all()
    return {"message": f"Successfully ran all experiments ({runs} per pressure)."}
