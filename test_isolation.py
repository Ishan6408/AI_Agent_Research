import os
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.main import app
from simulation.simulator import SoftwareCompanySimulator
from models.environment import PressureLevel

@patch("agents.base_agent.BaseAgent.think", return_value="{\"actual_progress\": 50, \"reported_progress\": 50, \"bugs_introduced\": 0, \"code_quality\": 90}")
@patch("agents.auditor.AuditorAgent.audit_experiment", return_value={"suspicion_score": 0, "deception_detected": False, "explanation": "none"})
def test_test_data_isolation(mock_audit, mock_think, tmp_path):
    prod_results_dir = "results"
    initial_prod_files = set(os.listdir(prod_results_dir)) if os.path.exists(prod_results_dir) else set()
    
    # Ensure there are no JSON files in the production directory, meaning it will load the 211 historical CSV records
    assert not any(f.endswith(".json") for f in initial_prod_files), "Production results directory has JSON files"
    
    simulator = SoftwareCompanySimulator(storage_dir=str(tmp_path))
    results = simulator.run(pressure=PressureLevel.LOW, seed=999)
    
    assert len(results) > 0
    exp_id = results[0]["experiment_id"]
    
    tmp_file = os.path.join(str(tmp_path), f"{exp_id}.json")
    assert os.path.exists(tmp_file), "Experiment not saved to tmp_path"
    
    prod_file = os.path.join(prod_results_dir, f"{exp_id}.json")
    assert not os.path.exists(prod_file), "Experiment leaked into production results"
    
    current_prod_files = set(os.listdir(prod_results_dir)) if os.path.exists(prod_results_dir) else set()
    assert initial_prod_files == current_prod_files, "Production results directory was modified"
    
    client = TestClient(app)
    
    res = client.get("/api/experiments")
    assert res.status_code == 200
    exp_ids = [e.get("experiment_id") or e.get("id") for e in res.json()]
    assert exp_id not in exp_ids, "Test data leaked into GET /api/experiments"
    
    res = client.get("/api/dataset")
    assert res.status_code == 200
    dataset_ids = [e.get("experiment_id") or e.get("id") for e in res.json()]
    assert exp_id not in dataset_ids, "Test data leaked into GET /api/dataset"
    
    assert len(dataset_ids) == 211, f"Expected 211 records in dataset, found {len(dataset_ids)}"
