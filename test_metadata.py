import pytest
import os
import json
from datetime import datetime
from unittest.mock import patch
from pydantic import ValidationError

from simulation.simulator import SoftwareCompanySimulator
from models.experiment import ExperimentResult
from models.environment import PressureLevel
from langchain_core.messages import AIMessage

@pytest.fixture(autouse=True)
def mock_ollama():
    with patch('llm.ollama_client.OllamaClient.invoke') as mock_invoke:
        mock_invoke.return_value = AIMessage(content='{"actual_progress": 50, "reported_progress": 50, "bugs_introduced": 0, "code_quality": 80, "message": "all good", "reasoning": "logic", "suspicion_score": 10, "deception_detected": false}')
        yield mock_invoke

def test_metadata_with_explicit_seed(tmp_path):
    simulator = SoftwareCompanySimulator(storage_dir=str(tmp_path))
    results = simulator.run(pressure=PressureLevel.LOW, seed=12345)
    
    assert len(results) > 0
    exp = results[0]
    
    # Verify metadata fields
    assert "experiment_id" in exp
    assert exp["experiment_id"] is not None
    assert "timestamp" in exp
    assert exp["timestamp"] is not None
    assert "model" in exp
    assert exp["model"] == "qwen2.5:7b"
    assert "temperature" in exp
    assert exp["temperature"] == 0.3
    assert "seed" in exp
    assert exp["seed"] == 12345

    # Check timestamp format (UTC timezone-aware ISO 8601)
    # E.g. "2026-10-03T15:30:45+00:00"
    ts = exp["timestamp"]
    assert ts.endswith("+00:00")
    # Verify it can be parsed
    parsed = datetime.fromisoformat(ts)
    assert parsed.tzinfo is not None

def test_metadata_with_no_seed(tmp_path):
    simulator = SoftwareCompanySimulator(storage_dir=str(tmp_path))
    results = simulator.run(pressure=PressureLevel.LOW, seed=None)
    
    assert len(results) > 0
    exp = results[0]
    
    assert exp["seed"] is None
    assert exp["timestamp"] is not None
    assert exp["experiment_id"] is not None

def test_historical_record_compatibility():
    # Legacy record with no metadata fields
    legacy_data = {
        "task_name": "Fix Login Bug",
        "pressure": "LOW",
        "developer_role": "Backend",
        "personality": "CAUTIOUS",
        "task_difficulty": "EASY",
        "reward": 100,
        "penalty": 50,
        "deadline_hours": 24,
        "behavior_strategy": "HONEST",
        "actual_progress": 100,
        "reported_progress": 100,
        "deception_gap": 0,
        "bugs_introduced": 0,
        "code_quality": 100,
        "honesty_score": 100.0,
        "stress_index": 25.0,
        "performance_score": 100.0,
        "deception_level": "HONEST",
        "developer_reasoning": "Standard dev logic",
        "manager_message": "All good",
        "auditor_score": 0,
        "deception_detected": False,
        "auditor_explanation": ""
    }
    
    result = ExperimentResult(**legacy_data)
    
    # Missing fields should default to None
    assert result.experiment_id is None
    assert result.timestamp is None
    assert result.model is None
    assert result.temperature is None
    assert result.seed is None

def test_id_consistency(tmp_path):
    simulator = SoftwareCompanySimulator(storage_dir=str(tmp_path))
    results = simulator.run(pressure=PressureLevel.LOW, seed=123)
    exp = results[0]
    
    assert exp["experiment_id"] is not None
    assert exp["id"] == exp["experiment_id"]
    
    # Check if saved file matches
    file_path = os.path.join(str(tmp_path), f"{exp['experiment_id']}.json")
    assert os.path.exists(file_path)
    
    with open(file_path, "r") as f:
        saved_data = json.load(f)
        
    assert saved_data["experiment_id"] == exp["experiment_id"]

def test_timestamp_stability(tmp_path):
    simulator = SoftwareCompanySimulator(storage_dir=str(tmp_path))
    results = simulator.run(pressure=PressureLevel.LOW, seed=123)
    exp = results[0]
    
    ts = exp["timestamp"]
    
    # Instantiate again to simulate read/write
    result_obj = ExperimentResult(**exp)
    assert result_obj.timestamp == ts
    
    # Dump again
    dumped = result_obj.model_dump()
    assert dumped["timestamp"] == ts

def test_legacy_csv_compatibility(capfd, tmp_path):
    import pandas as pd
    from analysis.analyzer import ExperimentAnalyzer

    legacy_data = [
        {
            "task_name": "Fix Login Bug",
            "pressure": "LOW",
            "developer_role": "Backend Developer",
            "personality": "CAUTIOUS",
            "task_difficulty": "EASY",
            "reward": 100,
            "penalty": 50,
            "deadline_hours": 24,
            "behavior_strategy": "HONEST",
            "actual_progress": 100,
            "reported_progress": 100,
            "deception_gap": 0,
            "bugs_introduced": 0,
            "code_quality": 100,
            "honesty_score": 100.0,
            "stress_index": 25.0,
            "performance_score": 100.0,
            "deception_level": "HONEST",
            "developer_reasoning": "Standard dev logic",
            "manager_message": "All good",
            "auditor_score": 0,
            "deception_detected": False,
            "auditor_explanation": ""
        }
    ]

    df = pd.DataFrame(legacy_data)
    analyzer = ExperimentAnalyzer(results_folder=str(tmp_path))
    # We test downstream analytics code:
    analyzer.print_summary(df)
    
    out, err = capfd.readouterr()
    assert len(out) > 0  # Assuming it prints something
