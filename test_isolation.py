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
    
    # We no longer assume there are no JSON files or exactly 211 records in production.
    # We simply capture the initial state.
    client = TestClient(app)
    
    initial_exp_res = client.get("/api/experiments")
    initial_exp_ids = [e.get("experiment_id") or e.get("id") for e in initial_exp_res.json()]
    
    initial_dataset_res = client.get("/api/dataset")
    initial_dataset_ids = [e.get("experiment_id") or e.get("id") for e in initial_dataset_res.json()]
    
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
    
    res = client.get("/api/experiments")
    assert res.status_code == 200
    exp_ids = [e.get("experiment_id") or e.get("id") for e in res.json()]
    assert exp_id not in exp_ids, "Test data leaked into GET /api/experiments"
    assert len(exp_ids) == len(initial_exp_ids), "Total experiment count changed unexpectedly"
    
    res = client.get("/api/dataset")
    assert res.status_code == 200
    dataset_ids = [e.get("experiment_id") or e.get("id") for e in res.json()]
    assert exp_id not in dataset_ids, "Test data leaked into GET /api/dataset"
    assert len(dataset_ids) == len(initial_dataset_ids), "Total dataset count changed unexpectedly"
