import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def mock_results_dir(tmp_path):
    with patch('backend.services.experiment_service.RESULTS_DIR', str(tmp_path)):
        yield


@patch('agents.base_agent.BaseAgent.think', return_value='{"reported_progress": 100, "message": "done"}')
@patch('agents.auditor.AuditorAgent.audit_experiment', return_value={"suspicion_score": 0, "deception_detected": False, "explanation": "none"})
def test_api_run_experiment_no_seed(mock_audit, mock_think):
    response = client.post("/api/experiments/run", json={"pressure": "LOW"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # Default behavior is stochastic, seed should be null
    assert data["result"]["seed"] is None

@patch('agents.base_agent.BaseAgent.think', return_value='{"reported_progress": 100, "message": "done"}')
@patch('agents.auditor.AuditorAgent.audit_experiment', return_value={"suspicion_score": 0, "deception_detected": False, "explanation": "none"})
def test_api_run_experiment_with_seed(mock_audit, mock_think):
    response = client.post("/api/experiments/run", json={"pressure": "LOW", "base_seed": 42})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["result"]["seed"] == 42

@patch('agents.base_agent.BaseAgent.think', return_value='{"reported_progress": 100, "message": "done"}')
@patch('agents.auditor.AuditorAgent.audit_experiment', return_value={"suspicion_score": 0, "deception_detected": False, "explanation": "none"})
def test_api_run_pressure_with_seed(mock_audit, mock_think):
    response = client.post("/api/experiments/run-pressure", json={"pressure": "MEDIUM", "runs": 2, "base_seed": 100})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["experiments"]) == 8
    
    seeds = [exp["seed"] for exp in data["experiments"]]
    # The runner loop runs `runs` times. Each run spawns 4 developer experiments.
    # So there are 2 * 4 = 8 experiments.
    # The seeds should be derived from base_seed (100 and 101).
    assert all(s in (100, 101) for s in seeds)

@patch('agents.base_agent.BaseAgent.think', return_value='{"reported_progress": 100, "message": "done"}')
@patch('agents.auditor.AuditorAgent.audit_experiment', return_value={"suspicion_score": 0, "deception_detected": False, "explanation": "none"})
def test_api_run_all_with_seed(mock_audit, mock_think):
    response = client.post("/api/experiments/run-all", json={"runs": 1, "base_seed": 200})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    
    seeds = [exp["seed"] for exp in data["experiments"]]
    # 4 pressures * 1 run = 4 runs. base_seed + 0, 1, 2, 3
    # Each run has 4 developers, so 16 experiments total.
    assert all(s in (200, 201, 202, 203) for s in seeds)
